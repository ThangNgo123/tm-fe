import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useProjectById } from "@/service/hook/project.hook";
import {
  useDeleteTask,
  useTaskById,
  useUpdateTask,
} from "@/service/hook/task.hook";
import { TaskStatus } from "@/types/task";
import type { DatesRangeValue } from "@mantine/dates";
import {
  Alert,
  Badge,
  Box,
  Button,
  Center,
  Divider,
  Group,
  Loader,
  Paper,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { openConfirmModal } from "@mantine/modals";
import {
  IconAlertCircle,
  IconArrowLeft,
  IconCalendarEvent,
  IconCheck,
  IconFlag,
  IconInfoCircle,
  IconTrash,
} from "@tabler/icons-react";

const STATUS_OPTIONS = [
  { value: TaskStatus.BACKLOG, label: "Backlog" },
  { value: TaskStatus.TODO, label: "To Do" },
  { value: TaskStatus.IN_PROGRESS, label: "In Progress" },
  { value: TaskStatus.DONE, label: "Done" },
  { value: TaskStatus.CANCELLED, label: "Cancelled" },
];

const PRIORITY_OPTIONS = [
  { value: "", label: "None" },
  { value: "1", label: "Low" },
  { value: "2", label: "Medium" },
  { value: "3", label: "High" },
  { value: "4", label: "Urgent" },
];

const AUTOSAVE_DEBOUNCE_MS = 800;

type AutosaveState = "saved" | "saving" | "error";

const normalizeDateValue = (value: Date | string | null) => {
  if (!value) return null;

  const parsedDate = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const isTaskOverdue = (
  dueDateEnd: Date | string | null,
  now: Date,
  taskStatus?: TaskStatus,
) => {
  const parsedEndDate = normalizeDateValue(dueDateEnd);

  if (!parsedEndDate) return false;
  if (taskStatus === TaskStatus.DONE || taskStatus === TaskStatus.CANCELLED) {
    return false;
  }

  return now.getTime() > parsedEndDate.getTime();
};

const buildUpdatePayload = ({
  title,
  description,
  status,
  priority,
  dueDateRange,
}: {
  title: string;
  description: string;
  status: TaskStatus | null;
  priority: string | null;
  dueDateRange: DatesRangeValue;
}) => ({
  title: title.trim(),
  description: description.trim() || undefined,
  status: status || undefined,
  priority: priority ? Number(priority) : undefined,
  due_date_start: normalizeDateValue(dueDateRange[0])?.toISOString(),
  due_date_end: normalizeDateValue(dueDateRange[1])?.toISOString(),
});

const getAutosaveSignature = (payload: ReturnType<typeof buildUpdatePayload>) =>
  JSON.stringify(payload);

const getAutosaveStatusConfig = (status: AutosaveState) => {
  if (status === "saving") {
    return {
      color: "blue",
      label: "Saving...",
      icon: <Loader size={12} color="blue" />,
    };
  }

  if (status === "error") {
    return {
      color: "red",
      label: "Save failed",
      icon: <IconAlertCircle size={12} />,
    };
  }

  return { color: "green", label: "Saved", icon: <IconCheck size={12} /> };
};

export default function TaskDetailPage() {
  const navigate = useNavigate();
  const { id: projectId = "", taskId = "" } = useParams<{
    id: string;
    taskId: string;
  }>();

  const {
    data: project,
    isLoading: isProjectLoading,
    error: projectError,
  } = useProjectById(projectId);
  const {
    data: task,
    isLoading: isTaskLoading,
    error: taskError,
  } = useTaskById(taskId);
  const { mutateAsync: updateTask } = useUpdateTask(projectId, taskId);
  const { mutateAsync: deleteTask, isPending: isDeleting } =
    useDeleteTask(projectId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus | null>(null);
  const [priority, setPriority] = useState<string | null>(null);
  const [dueDateRange, setDueDateRange] = useState<DatesRangeValue>([
    null,
    null,
  ]);
  const [autosaveState, setAutosaveState] = useState<AutosaveState>("saved");
  const [now, setNow] = useState(() => new Date());

  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autosaveRevisionRef = useRef(0);
  const lastSavedSignatureRef = useRef("");

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (task) {
      autosaveRevisionRef.current += 1;
      setTitle(task.title);
      setDescription(task.description || "");
      setStatus(task.status);
      setPriority(task.priority ? String(task.priority) : null);
      setDueDateRange([
        task.due_date_start ? new Date(task.due_date_start) : null,
        task.due_date_end ? new Date(task.due_date_end) : null,
      ]);
      lastSavedSignatureRef.current = getAutosaveSignature(
        buildUpdatePayload({
          title: task.title,
          description: task.description || "",
          status: task.status,
          priority: task.priority ? String(task.priority) : null,
          dueDateRange: [
            task.due_date_start ? new Date(task.due_date_start) : null,
            task.due_date_end ? new Date(task.due_date_end) : null,
          ],
        }),
      );
      setAutosaveState("saved");
    }
  }, [task]);

  useEffect(() => {
    if (!task) return;

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }

    const payload = buildUpdatePayload({
      title,
      description,
      status,
      priority,
      dueDateRange,
    });
    const signature = getAutosaveSignature(payload);

    if (!title.trim()) {
      setAutosaveState("error");
      return;
    }

    if (signature === lastSavedSignatureRef.current) {
      setAutosaveState("saved");
      return;
    }

    setAutosaveState("saving");
    const revision = ++autosaveRevisionRef.current;

    autosaveTimerRef.current = setTimeout(async () => {
      try {
        await updateTask(payload);

        if (autosaveRevisionRef.current !== revision) return;

        lastSavedSignatureRef.current = signature;
        setAutosaveState("saved");
      } catch (error) {
        if (autosaveRevisionRef.current !== revision) return;

        setAutosaveState("error");
        notifications.show({
          color: "red",
          title: "Failed to update task",
          message:
            error instanceof Error
              ? error.message
              : "Something went wrong while updating the task.",
        });
      }
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
      }
    };
  }, [task, title, description, status, priority, dueDateRange, updateTask]);

  const handleDelete = async () => {
    if (!task) return;

    openConfirmModal({
      title: "Confirm delete task",
      centered: true,
      children: `Delete task "${task.title}"? This action cannot be undone.`,
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          await deleteTask(task.id);
          notifications.show({
            color: "green",
            title: "Task deleted",
            message: "Task has been deleted successfully.",
          });
          navigate(`/project/${projectId}`);
        } catch (error) {
          notifications.show({
            color: "red",
            title: "Failed to delete task",
            message:
              error instanceof Error
                ? error.message
                : "Something went wrong while deleting the task!.",
          });
        }
      },
    });
  };

  if (isProjectLoading || isTaskLoading) {
    return (
      <Center style={{ minHeight: "70vh" }}>
        <Loader />
      </Center>
    );
  }

  if (projectError) {
    return (
      <Alert
        icon={<IconAlertCircle size={16} />}
        title="Error loading project"
        color="red"
      >
        {projectError.message}
      </Alert>
    );
  }

  if (taskError) {
    return (
      <Alert
        icon={<IconAlertCircle size={16} />}
        title="Error loading task"
        color="red"
      >
        {taskError.message}
      </Alert>
    );
  }

  if (!project || !task) {
    return (
      <Alert
        icon={<IconAlertCircle size={16} />}
        title="Task not found"
        color="yellow"
      >
        The task you are looking for does not exist.
      </Alert>
    );
  }

  const autosaveStatusConfig = getAutosaveStatusConfig(autosaveState);
  const titleError = !title.trim() ? "Task name is required" : null;
  const startDate = normalizeDateValue(dueDateRange[0]);
  const endDate = normalizeDateValue(dueDateRange[1]);
  const overdue = isTaskOverdue(endDate, now, status || task.status);
  const dueDateLabel =
    startDate || endDate
      ? `${startDate ? startDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "Start unset"} - ${endDate ? endDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "End unset"}`
      : "No due date";

  return (
    <Stack gap="lg">
      <Paper p="md" radius="md" withBorder>
        <Group justify="space-between" align="center">
          <Box>
            <Button
              variant="subtle"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => navigate(`/project/${projectId}`)}
            >
              Back to project
            </Button>
            <Text fw={700} size="xl" mt="sm">
              {project.name}
            </Text>
            <Text size="sm" c="dimmed">
              Task detail
            </Text>
          </Box>
          <Group gap="sm">
            <Badge
              color={autosaveStatusConfig.color}
              variant="light"
              leftSection={autosaveStatusConfig.icon}
            >
              {autosaveStatusConfig.label}
            </Badge>
            <Button
              color="red"
              variant="light"
              leftSection={<IconTrash size={16} />}
              onClick={handleDelete}
              loading={isDeleting}
            >
              Delete Task
            </Button>
          </Group>
        </Group>
      </Paper>

      <Paper
        p="md"
        radius="md"
        withBorder
        style={{
          backgroundColor: overdue
            ? "var(--mantine-color-red-0)"
            : "var(--mantine-color-gray-0)",
        }}
      >
        <Group justify="space-between" align="flex-start" mb="sm">
          <Box>
            <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb={4}>
              Task Overview
            </Text>
            <Text fw={700} size="lg">
              {title || task.title}
            </Text>
          </Box>
          <ThemeIcon
            variant="light"
            color={
              overdue
                ? "red"
                : task.status === TaskStatus.DONE
                  ? "green"
                  : "indigo"
            }
            radius="xl"
            size="lg"
          >
            <IconInfoCircle size={18} />
          </ThemeIcon>
        </Group>

        <Group gap="xs" wrap="wrap">
          <Badge
            color={
              overdue
                ? "red"
                : status === TaskStatus.DONE
                  ? "green"
                  : status === TaskStatus.CANCELLED
                    ? "red"
                    : status === TaskStatus.IN_PROGRESS
                      ? "yellow"
                      : status === TaskStatus.TODO
                        ? "blue"
                        : "gray"
            }
            variant="light"
            leftSection={<IconInfoCircle size={12} />}
          >
            {STATUS_OPTIONS.find(
              (option) => option.value === (status || task.status),
            )?.label || task.status}
          </Badge>
          <Badge
            color="orange"
            variant="light"
            leftSection={<IconFlag size={12} />}
          >
            {priority && Number(priority)
              ? PRIORITY_OPTIONS.find((option) => option.value === priority)
                  ?.label || "None"
              : "None"}
          </Badge>
          <Badge
            color={overdue ? "red" : "teal"}
            variant="light"
            leftSection={<IconCalendarEvent size={12} />}
          >
            {overdue ? `Overdue · ${dueDateLabel}` : dueDateLabel}
          </Badge>
        </Group>
      </Paper>

      <Paper p="md" radius="md" withBorder>
        <Stack gap="sm">
          <Group gap="xs">
            <ThemeIcon variant="light" color="indigo" radius="md" size="sm">
              <IconInfoCircle size={14} />
            </ThemeIcon>
            <Text size="sm" fw={600}>
              Task Name
            </Text>
          </Group>
          <TextInput
            size="lg"
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
            required
            error={titleError}
          />
        </Stack>
      </Paper>

      <Paper p="md" radius="md" withBorder>
        <Stack gap="sm">
          <Group gap="xs">
            <ThemeIcon variant="light" color="blue" radius="md" size="sm">
              <IconInfoCircle size={14} />
            </ThemeIcon>
            <Text size="sm" fw={600}>
              Description
            </Text>
          </Group>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
            minRows={8}
            autosize
            maxRows={16}
            placeholder="Add task description..."
            radius="md"
          />
        </Stack>
      </Paper>

      <Paper p="md" radius="md" withBorder>
        <Stack gap="sm">
          <Group gap="xs">
            <ThemeIcon variant="light" color="green" radius="md" size="sm">
              <IconInfoCircle size={14} />
            </ThemeIcon>
            <Text size="sm" fw={600}>
              Status
            </Text>
          </Group>
          <Select
            value={status}
            onChange={(val) => setStatus((val as TaskStatus) || null)}
            data={STATUS_OPTIONS}
            searchable
          />
        </Stack>
      </Paper>

      <Paper p="md" radius="md" withBorder>
        <Stack gap="sm">
          <Group gap="xs">
            <ThemeIcon variant="light" color="orange" radius="md" size="sm">
              <IconFlag size={14} />
            </ThemeIcon>
            <Text size="sm" fw={600}>
              Priority
            </Text>
          </Group>
          <Select
            value={priority}
            onChange={setPriority}
            data={PRIORITY_OPTIONS}
            clearable
            placeholder="Select priority..."
          />
        </Stack>
      </Paper>

      <Paper p="md" radius="md" withBorder>
        <Stack gap="sm">
          <Group gap="xs">
            <ThemeIcon variant="light" color="teal" radius="md" size="sm">
              <IconCalendarEvent size={14} />
            </ThemeIcon>
            <Text size="sm" fw={600}>
              Due Date
            </Text>
          </Group>
          <DatePickerInput
            type="range"
            value={dueDateRange}
            onChange={setDueDateRange}
            clearable
            placeholder="Pick a date range"
          />
        </Stack>
      </Paper>

      <Paper p="md" radius="md" withBorder>
        <Stack gap="xs">
          <Text size="sm" fw={600}>
            Activity
          </Text>
          <Divider />
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Created
            </Text>
            <Text size="sm">{new Date(task.created_at).toLocaleString()}</Text>
          </Group>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Updated
            </Text>
            <Text size="sm">{new Date(task.updated_at).toLocaleString()}</Text>
          </Group>
        </Stack>
      </Paper>
    </Stack>
  );
}
