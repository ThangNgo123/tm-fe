import {
  Container,
  Stack,
  Title,
  Text,
  Button,
  Card,
  Group,
  Badge,
} from "@mantine/core";
import { Link } from "react-router";

/**
 * Project List Page - Display all projects for the user
 */
export default function ProjectPage() {
  // TODO: Fetch projects using useQuery hook

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="center">
          <div>
            <Title order={1}>My Projects</Title>
            <Text c="dimmed" size="sm" mt={4}>
              Manage your projects and tasks
            </Text>
          </div>
          <Button>Create Project</Button>
        </Group>

        {/* Projects Grid */}
        <Stack gap="md">
          {/* Example Project Card - Replace with actual data */}
          <Card withBorder padding="lg" radius="md">
            <Group justify="space-between" mb="xs">
              <div>
                <Link to="/projects/1">
                  <Title
                    order={3}
                    style={{ cursor: "pointer", color: "#667eea" }}
                  >
                    Sample Project
                  </Title>
                </Link>
              </div>
              <Badge>Active</Badge>
            </Group>
            <Text c="dimmed" size="sm" mb="md">
              This is a sample project. Click to view tasks.
            </Text>
            <Link to="/projects/1">
              <Button variant="light">View Tasks</Button>
            </Link>
          </Card>
        </Stack>
      </Stack>
    </Container>
  );
}
