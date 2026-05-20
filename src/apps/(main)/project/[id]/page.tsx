import { useProjectById } from "@/service/hook/project.hook";
import { useParams } from "react-router";
import { Box, Loader, Center, Alert } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import KanbanBoard from "@/components/project/kanban-board";

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading, error } = useProjectById(id || "");

  if (isLoading) {
    return (
      <Center style={{ minHeight: "70vh" }}>
        <Loader />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert
        icon={<IconAlertCircle size={16} />}
        title="Error loading project"
        color="red"
      >
        {error.message}
      </Alert>
    );
  }

  if (!project) {
    return (
      <Alert
        icon={<IconAlertCircle size={16} />}
        title="Project not found"
        color="yellow"
      >
        The project you are looking for does not exist.
      </Alert>
    );
  }

  return (
    <Box>
      <KanbanBoard projectId={id || ""} />
    </Box>
  );
}
