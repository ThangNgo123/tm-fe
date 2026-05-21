import { useState } from "react";
import { useNavigate } from "react-router";
import { notifications } from "@mantine/notifications";
import { Button, Group, Modal, Stack, TextInput } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { useCreateProject } from "@/service/hook/project.hook";

export default function CreateProjectModal() {
  const [opened, setOpened] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();
  const { mutateAsync: createProject, isPending } = useCreateProject();

  const openConfirmSave = () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      notifications.show({
        color: "red",
        title: "Project name is required",
        message: "Please enter a name before saving.",
      });
      return;
    }

    openConfirmModal({
      title: "Confirm create project",
      centered: true,
      children: `Create project \"${trimmedName}\"?`,
      labels: { confirm: "Save", cancel: "Cancel" },
      confirmProps: { color: "indigo" },
      onConfirm: async () => {
        try {
          const project = await createProject({
            name: trimmedName,
            description: description.trim() || undefined,
          });

          notifications.show({
            color: "green",
            title: "Project created",
            message: `${project.name} was created successfully.`,
          });

          setOpened(false);
          setName("");
          setDescription("");
          navigate(`/project/${project.id}`);
        } catch (error) {
          notifications.show({
            color: "red",
            title: "Failed to create project",
            message:
              error instanceof Error
                ? error.message
                : "Something went wrong while creating the project.",
          });
        }
      },
    });
  };

  return (
    <>
      <Button fullWidth color="indigo" onClick={() => setOpened(true)}>
        Create project
      </Button>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Create project"
        centered
      >
        <Stack>
          <TextInput
            label="Project name"
            placeholder="Enter project name"
            value={name}
            onChange={(event) => setName(event.currentTarget.value)}
            required
          />

          <Group justify="flex-end" mt="xs">
            <Button variant="default" onClick={() => setOpened(false)}>
              Cancel
            </Button>
            <Button
              loading={isPending}
              color="indigo"
              onClick={openConfirmSave}
            >
              Save
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
