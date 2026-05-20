import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import {
  Drawer,
  Stack,
  TextInput,
  Textarea,
  Select,
  Button,
  Group,
  Text,
  Box,
  Loader,
  Badge,
  Divider,
  Paper,
  ThemeIcon,
  Tooltip,
  ActionIcon,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";

import { notifications } from "@mantine/notifications";
import { openConfirmModal } from "@mantine/modals";
import { useUpdateTask, useDeleteTask } from "@/service/hook/task.hook";
import { TaskStatus } from "@/types/task";
import type { Task } from "@/types/task";
import {
  IconAlertCircle,
  IconCalendarEvent,
  IconCheck,
  IconFlag,
  IconInfoCircle,
  IconTrash,
  IconArrowUpRight,
} from "@tabler/icons-react";
import type { DatesRangeValue } from "@mantine/dates";

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
  if (!value) {
    return null;
  }

  const parsedDate = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const isTaskOverdue = (
  dueDateEnd: Date | string | null,
  now: Date,
  taskStatus?: TaskStatus,
) => {
  const parsedEndDate = normalizeDateValue(dueDateEnd);

  if (!parsedEndDate) {
    return false;
  }

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

  return {
    color: "green",
    label: "Saved",
    icon: <IconCheck size={12} />,
  };
};

interface TaskDetailDrawerProps {
  opened: boolean;
  onClose: () => void;
  task: Task | null;
  projectId: string;
}

export default function TaskDetailDrawer({
  opened,
  onClose,
  task,
  projectId,
}: TaskDetailDrawerProps) {
  const { mutateAsync: updateTask } = useUpdateTask(projectId, task?.id || "");
  const { mutateAsync: deleteTask, isPending: isDeleting } =
    useDeleteTask(projectId);
  const navigate = useNavigate();

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
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (opened && task) {
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
  }, [opened, task]);

  useEffect(() => {
    if (!opened || !task) return;

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
  }, [
    opened,
    task,
    title,
    description,
    status,
    priority,
    dueDateRange,
    updateTask,
  ]);

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

          onClose();
        } catch (error) {
          notifications.show({
            color: "red",
            title: "Failed to delete task",
            message:
              error instanceof Error
                ? error.message
                : "Something went wrong while deleting the task.",
          });
        }
      },
    });
  };

  if (!task) return null;

  const statusBadgeColor =
    (status || task.status) === TaskStatus.DONE
      ? "green"
      : (status || task.status) === TaskStatus.CANCELLED
        ? "red"
        : (status || task.status) === TaskStatus.IN_PROGRESS
          ? "yellow"
          : (status || task.status) === TaskStatus.TODO
            ? "blue"
            : "gray";
  const priorityLabel =
    priority && Number(priority)
      ? PRIORITY_OPTIONS.find((option) => option.value === priority)?.label ||
        "None"
      : "None";

  const startDate = normalizeDateValue(dueDateRange[0]);
  const endDate = normalizeDateValue(dueDateRange[1]);
  const overdue = isTaskOverdue(endDate, now, status || task.status);

  const dueDateLabel =
    startDate || endDate
      ? `${
          startDate
            ? startDate.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "Start unset"
        } - ${
          endDate
            ? endDate.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "End unset"
        }`
      : "No due date";

  const dueDateBadgeColor = overdue ? "red" : "teal";
  const dueDateBadgeLabel = overdue
    ? `Overdue · ${dueDateLabel}`
    : dueDateLabel;

  const autosaveStatusConfig = getAutosaveStatusConfig(autosaveState);
  const titleError = !title.trim() ? "Task name is required" : null;

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={
        <Group justify="space-between" align="center" wrap="nowrap" gap="md">
          <Box style={{ minWidth: 0 }}>
            <Text fw={700} size="lg" truncate>
              {title.trim() || task.title}
            </Text>
            <Text size="xs" c="dimmed">
              Auto save enabled
            </Text>
          </Box>
          <Badge
            size="lg"
            color={autosaveStatusConfig.color}
            variant="light"
            leftSection={autosaveStatusConfig.icon}
          >
            {autosaveStatusConfig.label}
          </Badge>
          <Tooltip label="Open detail page" position="left">
            <ActionIcon
              size="lg"
              variant="light"
              color="blue"
              onClick={() => navigate(`/project/${projectId}/task/${task.id}`)}
              aria-label="Open detail page"
            >
              <IconArrowUpRight size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      }
      position="right"
      size="50%"
    >
      <Stack gap="lg">
        <Paper
          p="md"
          radius="md"
          withBorder
          style={{ backgroundColor: "var(--mantine-color-gray-0)" }}
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
              color={task.status === TaskStatus.DONE ? "green" : "indigo"}
              radius="xl"
              size="lg"
            >
              <IconInfoCircle size={18} />
            </ThemeIcon>
          </Group>

          <Group gap="xs" wrap="wrap">
            <Badge
              color={statusBadgeColor}
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
              {priorityLabel}
            </Badge>
            <Badge
              color={dueDateBadgeColor}
              variant="light"
              leftSection={<IconCalendarEvent size={12} />}
            >
              {dueDateBadgeLabel}
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
              <Group gap="xs">
                <ThemeIcon variant="light" color="blue" radius="md" size="sm">
                  <IconInfoCircle size={14} />
                </ThemeIcon>
                <Text size="sm" fw={600}>
                  Description
                </Text>
              </Group>
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
              <Text size="sm">
                {new Date(task.created_at).toLocaleString()}
              </Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Updated
              </Text>
              <Text size="sm">
                {new Date(task.updated_at).toLocaleString()}
              </Text>
            </Group>
          </Stack>
        </Paper>

        <Button
          color="red"
          variant="light"
          onClick={handleDelete}
          loading={isDeleting}
          fullWidth
          leftSection={<IconTrash size={16} />}
        >
          Delete Task
        </Button>
      </Stack>
    </Drawer>
  );
}
