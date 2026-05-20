import { useState, useEffect } from "react";
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
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";

import { notifications } from "@mantine/notifications";
import { useUpdateTask, useDeleteTask } from "@/service/hook/task.hook";
import { TaskStatus } from "@/types/task";
import type { Task } from "@/types/task";
import {
  IconCalendarEvent,
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
  const { mutateAsync: updateTask, isPending: isUpdating } = useUpdateTask(
    projectId,
    task?.id || "",
  );
  const { mutateAsync: deleteTask, isPending: isDeleting } =
    useDeleteTask(projectId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus | undefined>(undefined);
  const [priority, setPriority] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // initialize fields when drawer opens or task changes; open in edit mode
    if (opened && task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setStatus(task.status);
      setPriority(task.priority ? String(task.priority) : null);
      setDueDate(task.due_date ? new Date(task.due_date) : null);
      setIsEditing(true);
    }
    // when drawer closed, stop editing
    if (!opened) {
      setIsEditing(false);
    }
  }, [opened, task]);

  const handleSave = async () => {
    if (!task || !title.trim()) return;

    try {
      await updateTask({
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority: priority ? Number(priority) : undefined,
        due_date: dueDate ? dueDate.toISOString().split("T")[0] : undefined,
      });

      notifications.show({
        color: "green",
        title: "Task updated",
        message: "Task has been updated successfully.",
      });

      setIsEditing(false);
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Failed to update task",
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong while updating the task.",
      });
    }
  };

  const handleDelete = async () => {
    if (!task) return;

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

  const dueDateLabel = dueDate
    ? dueDate.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "No due date";

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={isEditing ? "Edit Task" : task.title}
      position="right"
      size="50%"
    >
      {isUpdating || isDeleting ? (
        <Box style={{ display: "flex", justifyContent: "center", padding: 40 }}>
          <Loader />
        </Box>
      ) : (
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
                color="teal"
                variant="light"
                leftSection={<IconCalendarEvent size={12} />}
              >
                {dueDateLabel}
              </Badge>
            </Group>
          </Paper>

          {/* Title */}
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
                disabled={!isEditing}
                required
              />
            </Stack>
          </Paper>

          {/* Description (Rich Text) */}
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
                disabled={!isEditing}
                minRows={8}
                autosize
                maxRows={16}
                placeholder="Add task description..."
                radius="md"
              />
            </Stack>
          </Paper>

          {/* Status */}
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
                value={status || null}
                onChange={(val) => setStatus((val as TaskStatus) || undefined)}
                data={STATUS_OPTIONS}
                disabled={!isEditing}
                searchable
              />
            </Stack>
          </Paper>

          {/* Priority */}
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
                disabled={!isEditing}
                clearable
                placeholder="Select priority..."
              />
            </Stack>
          </Paper>

          {/* Due Date */}
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
                value={dueDate}
                onChange={(val) => {
                  if (typeof val === "string") {
                    setDueDate(val ? new Date(val) : null);
                  } else {
                    setDueDate(val);
                  }
                }}
                disabled={!isEditing}
                clearable
                placeholder="Pick a date"
              />
            </Stack>
          </Paper>

          {/* Metadata */}
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

          {/* Actions: always editable when opened */}
          <Group style={{ justifyContent: "space-between" }}>
            <Button variant="default" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="default"
              onClick={() => {
                // reset fields to original task values
                if (task) {
                  setTitle(task.title);
                  const nextDescription = task.description || "";
                  setDescription(nextDescription);
                  setStatus(task.status);
                  setPriority(task.priority ? String(task.priority) : null);
                  setDueDate(task.due_date ? new Date(task.due_date) : null);
                }
              }}
            >
              Cancel
            </Button>
            <Button color="indigo" onClick={handleSave} loading={isUpdating}>
              Save Changes
            </Button>
          </Group>

          {/* Delete Button */}
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
      )}
    </Drawer>
  );
}
