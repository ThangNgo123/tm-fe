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
  Textarea,
} from "@mantine/core";
import { Link, useParams } from "react-router";

/**
 * Task Detail Page - Display task details
 */
export default function TaskDetailPage() {
  const { id, taskId } = useParams();
  // TODO: Fetch task details using useQuery hook with task id

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        {/* Breadcrumb */}
        <Breadcrumbs>
          <Link to="/">
            <Anchor>Projects</Anchor>
          </Link>
          <Link to={`/projects/${id}`}>
            <Anchor>Project #{id}</Anchor>
          </Link>
          <Anchor component="span">Task Detail</Anchor>
        </Breadcrumbs>

        {/* Header */}
        <Group justify="space-between" align="center">
          <div>
            <Title order={1}>Task #{taskId}</Title>
            <Text c="dimmed" size="sm" mt={4}>
              Task Name Here
            </Text>
          </div>
          <Button>Edit Task</Button>
        </Group>

        {/* Task Details */}
        <Card withBorder padding="lg" radius="md">
          <Stack gap="md">
            {/* Status and Priority */}
            <Group justify="space-between">
              <div>
                <Text fw={500} mb={4}>
                  Status
                </Text>
                <Badge>In Progress</Badge>
              </div>
              <div>
                <Text fw={500} mb={4}>
                  Priority
                </Text>
                <Badge color="red">High</Badge>
              </div>
              <div>
                <Text fw={500} mb={4}>
                  Due Date
                </Text>
                <Text>2024-02-15</Text>
              </div>
            </Group>

            {/* Description */}
            <div>
              <Text fw={500} mb={8}>
                Description
              </Text>
              <Text c="dimmed">
                This is the task description. Add more details here.
              </Text>
            </div>

            {/* Assigned To */}
            <div>
              <Text fw={500} mb={4}>
                Assigned To
              </Text>
              <Text>John Doe</Text>
            </div>
          </Stack>
        </Card>

        {/* Comments Section */}
        <div>
          <Title order={2} mb="md">
            Comments
          </Title>
          <Card withBorder padding="lg" radius="md">
            <Stack gap="md">
              <Textarea placeholder="Add a comment..." minRows={4} />
              <Button type="submit">Post Comment</Button>
            </Stack>
          </Card>
        </div>
      </Stack>
    </Container>
  );
}
