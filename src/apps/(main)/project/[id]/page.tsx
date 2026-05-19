import {
  Container,
  Stack,
  Title,
  Text,
  Button,
  Breadcrumbs,
  Badge,
  Card,
  Group,
  Anchor,
} from "@mantine/core";
import { Link, useParams } from "react-router";

/**
 * Project Detail Page - Display project details and tasks
 */
export default function ProjectDetailPage() {
  const { id } = useParams();
  // TODO: Fetch project and tasks using useQuery hook with project id

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        {/* Breadcrumb */}
        <Breadcrumbs>
          <Link to="/">
            <Anchor>Projects</Anchor>
          </Link>
          <Anchor component="span">Project Detail</Anchor>
        </Breadcrumbs>

        {/* Header */}
        <Group justify="space-between" align="center">
          <div>
            <Title order={1}>Project #{id}</Title>
            <Text c="dimmed" size="sm" mt={4}>
              Project Name Here
            </Text>
          </div>
          <Button>Create Task</Button>
        </Group>

        {/* Project Info */}
        <Card withBorder padding="lg" radius="md">
          <Stack gap="md">
            <Group justify="space-between">
              <div>
                <Text fw={500} mb={4}>
                  Status
                </Text>
                <Badge>Active</Badge>
              </div>
              <div>
                <Text fw={500} mb={4}>
                  Tasks
                </Text>
                <Text size="lg" fw={700}>
                  5
                </Text>
              </div>
              <div>
                <Text fw={500} mb={4}>
                  Created
                </Text>
                <Text>2024-01-15</Text>
              </div>
            </Group>
          </Stack>
        </Card>

        {/* Tasks List */}
        <div>
          <Title order={2} mb="md">
            Tasks
          </Title>
          <Stack gap="md">
            {/* Example Task Card - Replace with actual data */}
            <Card withBorder padding="lg" radius="md">
              <Group justify="space-between" mb="xs">
                <div>
                  <Link to={`/projects/${id}/tasks/1`}>
                    <Title
                      order={4}
                      style={{ cursor: "pointer", color: "#667eea" }}
                    >
                      Sample Task
                    </Title>
                  </Link>
                </div>
                <Badge color="blue">In Progress</Badge>
              </Group>
              <Text c="dimmed" size="sm" mb="md">
                This is a sample task. Click to view details.
              </Text>
              <Link to={`/projects/${id}/tasks/1`}>
                <Button variant="light" size="sm">
                  View Details
                </Button>
              </Link>
            </Card>
          </Stack>
        </div>
      </Stack>
    </Container>
  );
}
