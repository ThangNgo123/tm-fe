import { useState } from "react";
import { useTasksByProjectId, useCreateTask } from "@/service/hook/task.hook";
import { TaskStatus } from "@/types/task";
import type { Task } from "@/types/task";
import {
  Container,
  Grid,
  Paper,
  Text,
  Stack,
  Button,
  Group,
  Badge,
  Box,
  useMantineTheme,
  Loader,
  Center,
  TextInput,
  ActionIcon,
} from "@mantine/core";
import {
  IconPlus,
  IconCheck,
  IconX,
  IconCalendarEvent,
  IconFlag,
  IconInfoCircle,
} from "@tabler/icons-react";
import TaskDetailDrawer from "./task-detail-drawer";

const STATUS_CONFIG = {
  [TaskStatus.BACKLOG]: {
    label: "Backlog",
    color: "gray",
    description: "Future tasks",
  },
  [TaskStatus.TODO]: {
    label: "To Do",
    color: "blue",
    description: "Ready to start",
  },
  [TaskStatus.IN_PROGRESS]: {
    label: "In Progress",
    color: "yellow",
    description: "Currently working",
  },
  [TaskStatus.DONE]: {
    label: "Done",
    color: "green",
    description: "Completed",
  },
  [TaskStatus.CANCELLED]: {
    label: "Cancelled",
    color: "red",
    description: "Not needed",
  },
};

const PRIORITY_LABELS: Record<number, string> = {
  1: "Low",
  2: "Medium",
  3: "High",
  4: "Urgent",
};

const formatDueDate = (dueDate?: string) => {
  if (!dueDate) return "No due date";

  const parsedDate = new Date(dueDate);
  if (Number.isNaN(parsedDate.getTime())) return "No due date";

  return parsedDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

interface KanbanBoardProps {
  projectId: string;
}

export default function KanbanBoard({ projectId }: KanbanBoardProps) {
  const { data: tasks, isLoading } = useTasksByProjectId(projectId);
  const { mutateAsync: createTask, isPending } = useCreateTask(projectId);
  const theme = useMantineTheme();

  const [addingStatus, setAddingStatus] = useState<TaskStatus | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailDrawerOpened, setDetailDrawerOpened] = useState(false);

  const handleAddClick = (status: TaskStatus) => {
    setAddingStatus(status);
    setNewTaskTitle("");
  };

  const handleCancel = () => {
    setAddingStatus(null);
    setNewTaskTitle("");
  };

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim() || !addingStatus) return;

    try {
      await createTask({
        title: newTaskTitle.trim(),
        status: addingStatus,
        project_id: projectId,
      });
      setNewTaskTitle("");
      setAddingStatus(null);
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isPending) {
      handleCreateTask();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isLoading) {
    return (
      <Center style={{ minHeight: "70vh" }}>
        <Loader />
      </Center>
    );
  }

  // Group tasks by status
  const tasksByStatus = Object.values(TaskStatus).reduce(
    (acc, status) => {
      acc[status] = tasks?.filter((task) => task.status === status) || [];
      return acc;
    },
    {} as Record<TaskStatus, typeof tasks>,
  );

  return (
    <Container fluid p="md">
      <Grid gap="lg" align="stretch">
        {Object.values(TaskStatus).map((status) => (
          <Grid.Col key={status} span={{ base: 12, sm: 6, md: 4, lg: 2.4 }}>
            <Paper
              p="md"
              radius="md"
              style={{
                backgroundColor: theme.colors.gray[0],
                border: `2px solid ${theme.colors[STATUS_CONFIG[status].color][3]}`,
                minHeight: "70vh",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Column Header */}
              <Box mb="md">
                <Group justify="space-between" align="flex-start" mb="xs">
                  <Stack gap="xs" style={{ flex: 1 }}>
                    <Badge color={STATUS_CONFIG[status].color} size="lg">
                      {STATUS_CONFIG[status].label}
                    </Badge>
                    <Text size="sm" c="dimmed">
                      {tasksByStatus[status]?.length || 0} tasks
                    </Text>
                  </Stack>
                </Group>
              </Box>

              {/* Tasks Container */}
              <Stack
                gap="sm"
                style={{ flex: 1, minHeight: "650px", overflow: "auto" }}
              >
                {tasksByStatus[status] && tasksByStatus[status].length > 0 ? (
                  tasksByStatus[status].map((task) => (
                    <Paper
                      key={task.id}
                      p="sm"
                      radius="md"
                      style={{
                        backgroundColor: "white",
                        border: `1px solid ${theme.colors.gray[2]}`,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                      onClick={() => {
                        setSelectedTask(task);
                        setDetailDrawerOpened(true);
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = theme.shadows.md;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <Text fw={600} size="sm" mb="xs" truncate>
                        {task.title}
                      </Text>
                      <Group gap="xs" wrap="wrap" align="center">
                        <Badge
                          variant="light"
                          color={STATUS_CONFIG[task.status].color}
                          size="sm"
                          leftSection={<IconInfoCircle size={12} />}
                        >
                          {STATUS_CONFIG[task.status].label}
                        </Badge>
                        <Badge
                          variant="light"
                          color="orange"
                          size="sm"
                          leftSection={<IconFlag size={12} />}
                        >
                          {task.priority
                            ? (PRIORITY_LABELS[task.priority] ?? "None")
                            : "None"}
                        </Badge>
                        <Group gap={4} wrap="nowrap" align="center">
                          <IconCalendarEvent
                            size={14}
                            stroke={1.8}
                            color={theme.colors.gray[6]}
                          />
                          <Text size="xs" c="dimmed">
                            {formatDueDate(task.due_date)}
                          </Text>
                        </Group>
                      </Group>
                    </Paper>
                  ))
                ) : (
                  <Box
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flex: 1,
                      minHeight: "200px",
                    }}
                  >
                    {addingStatus !== status && (
                      <Text c="dimmed" ta="center" size="sm">
                        No tasks
                      </Text>
                    )}
                  </Box>
                )}

                {/* Add Task Input */}
                {addingStatus === status ? (
                  <Paper
                    p="sm"
                    radius="md"
                    style={{
                      backgroundColor: "white",
                      border: `2px solid ${theme.colors[STATUS_CONFIG[status].color][4]}`,
                    }}
                  >
                    <Stack gap="xs">
                      <TextInput
                        placeholder="Task name..."
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.currentTarget.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        disabled={isPending}
                      />
                      <Group justify="flex-end" gap="xs">
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          color="gray"
                          onClick={handleCancel}
                          disabled={isPending}
                        >
                          <IconX size={16} />
                        </ActionIcon>
                        <ActionIcon
                          size="sm"
                          color={STATUS_CONFIG[status].color}
                          onClick={handleCreateTask}
                          loading={isPending}
                        >
                          <IconCheck size={16} />
                        </ActionIcon>
                      </Group>
                    </Stack>
                  </Paper>
                ) : (
                  <Button
                    variant="light"
                    color={STATUS_CONFIG[status].color}
                    leftSection={<IconPlus size={16} />}
                    onClick={() => handleAddClick(status)}
                    fullWidth
                  >
                    Add Task
                  </Button>
                )}
              </Stack>
            </Paper>
          </Grid.Col>
        ))}
      </Grid>

      <TaskDetailDrawer
        opened={detailDrawerOpened}
        onClose={() => setDetailDrawerOpened(false)}
        task={selectedTask}
        projectId={projectId}
      />
    </Container>
  );
}
