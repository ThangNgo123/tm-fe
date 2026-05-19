import { Container, Stack, Title, Text, Button, Group } from "@mantine/core";
import { Link } from "react-router";

export default function HomePage() {
  return (
    <Container size="lg" py="xl">
      <Stack
        gap="lg"
        align="center"
        justify="center"
        style={{ minHeight: "60vh" }}
      >
        <div style={{ textAlign: "center" }}>
          <Title order={1}>Welcome to Task Manager</Title>
          <Text c="dimmed" size="lg" mt="md">
            Manage your projects and tasks efficiently
          </Text>
        </div>

        <Group>
          <Link to="/projects">
            <Button size="lg">Go to Projects</Button>
          </Link>
        </Group>
      </Stack>
    </Container>
  );
}
