import { useState, useEffect } from "react";
import {
  Modal,
  TextInput,
  Textarea,
  Group,
  Button,
  Stack,
} from "@mantine/core";
import { TaskStatus } from "@/types/task";

interface CreateTaskModalProps {
  opened: boolean;
  onClose: () => void;
  onCreateTask: (title: string, description?: string) => Promise<void>;
  status?: TaskStatus | null;
}

export default function CreateTaskModal({
  opened,
  onClose,
  onCreateTask,
  status,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!opened) {
      setTitle("");
      setDescription("");
    }
  }, [opened]);

  const handleCreateTask = async () => {
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      await onCreateTask(title.trim(), description.trim() || undefined);
      setTitle("");
      setDescription("");
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Create Task" centered>
      <Stack>
        <TextInput
          label="Task title"
          placeholder="Enter task title"
          value={title}
          onChange={(event) => setTitle(event.currentTarget.value)}
          required
          autoFocus
        />

        <Textarea
          label="Description"
          placeholder="Optional description"
          value={description}
          onChange={(event) => setDescription(event.currentTarget.value)}
          minRows={3}
        />

        <Group justify="flex-end" mt="xs">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button color="indigo" onClick={handleCreateTask} loading={isLoading}>
            Create
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
