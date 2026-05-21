import { useState, useEffect } from "react";
import { Modal, TextInput, Group, Button, Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useUpdateProject } from "@/service/hook/project.hook";
import type { Project } from "@/types/project";

interface EditProjectModalProps {
  opened: boolean;
  onClose: () => void;
  project: Project | null;
}

export default function EditProjectModal({
  opened,
  onClose,
  project,
}: EditProjectModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { mutateAsync: updateProject, isPending } = useUpdateProject(
    project?.id || "",
  );

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || "");
    }
  }, [project]);

  const handleSave = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      notifications.show({
        color: "red",
        title: "Project name is required",
        message: "Please enter a name before saving.",
      });
      return;
    }

    if (!project) return;

    try {
      await updateProject({
        name: trimmedName,
        description: description.trim() || undefined,
      });

      notifications.show({
        color: "green",
        title: "Project updated",
        message: `${trimmedName} was updated successfully.`,
      });

      onClose();
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Failed to update project",
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong while updating the project.",
      });
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Edit project" centered>
      <Stack>
        <TextInput
          label="Project name"
          placeholder="Enter project name"
          value={name}
          onChange={(event) => setName(event.currentTarget.value)}
          required
        />

        <Group justify="flex-end" mt="xs">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={isPending} color="indigo" onClick={handleSave}>
            Save
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
