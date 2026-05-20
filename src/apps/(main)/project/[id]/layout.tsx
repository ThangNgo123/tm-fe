import { Outlet, NavLink, useLocation } from "react-router";
import { useState } from "react";
import { useProjects } from "@/service/hook/project.hook";
import { getCurrentUser } from "@/stores/auth";
import {
  AppShell,
  ScrollArea,
  UnstyledButton,
  Group,
  Avatar,
  Text,
  Stack,
  Box,
  useMantineTheme,
  ActionIcon,
  Tooltip,
  Divider,
} from "@mantine/core";
import { IconClipboardList, IconEdit } from "@tabler/icons-react";
import CreateProjectModal from "@/components/project/create-project-modal";
import EditProjectModal from "@/components/project/edit-project-modal";
import type { Project } from "@/types/project";

export default function ProjectLayout() {
  console.log("[ProjectLayout] Component rendering");
  const { data: projects, isLoading } = useProjects();
  console.log("[ProjectLayout] isLoading:", isLoading);
  console.log("[ProjectLayout] projects:", projects);
  const user = getCurrentUser();
  const location = useLocation();
  const theme = useMantineTheme();

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editModalOpened, setEditModalOpened] = useState(false);

  if (isLoading) {
    console.log("[ProjectLayout] Currently loading projects...");
  }

  const handleEditProject = (project: Project) => {
    console.log("Edit project:", project.id);
    setSelectedProject(project);
    setEditModalOpened(true);
  };

  return (
    <AppShell
      padding={0}
      navbar={{ width: 300, breakpoint: "sm" }}
      header={{ height: 72 }}
    >
      <AppShell.Navbar
        p="md"
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
        <Box>
          <Text fw={700} size="lg" mb="xs">
            Projects
          </Text>
          <Divider />
        </Box>

        <ScrollArea type="always" style={{ flex: 1 }}>
          <Stack gap="sm">
            {isLoading && (
              <Text c="dimmed" ta="center">
                Loading projects...
              </Text>
            )}
            {!isLoading && projects && projects.length === 0 && (
              <Text c="dimmed" ta="center">
                No projects yet
              </Text>
            )}

            {!isLoading &&
              projects &&
              projects.map((p) => {
                console.log("[ProjectLayout] Rendering project:", p);
                const to = `/project/${p.id}`;
                const isActive = location.pathname === to;
                return (
                  <Box
                    key={p.id}
                    style={{
                      borderRadius: theme.radius.md,
                      backgroundColor: isActive
                        ? theme.colors.indigo[6]
                        : theme.colors.gray[0],
                      transition: "all 0.2s ease",
                      overflow: "hidden",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor =
                          theme.colors.gray[1];
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor =
                          theme.colors.gray[0];
                      }
                    }}
                  >
                    <Group
                      justify="space-between"
                      align="center"
                      style={{
                        padding: theme.spacing.sm,
                      }}
                    >
                      <UnstyledButton
                        component={NavLink}
                        to={to}
                        style={{
                          flex: 1,
                          padding: 0,
                        }}
                      >
                        <Box>
                          <Text
                            fw={600}
                            size="sm"
                            color={isActive ? "white" : undefined}
                            truncate
                          >
                            {p.name}
                          </Text>
                        </Box>
                      </UnstyledButton>

                      <Tooltip label="Edit project name" position="left">
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          color={isActive ? "white" : "gray"}
                          onClick={() => handleEditProject(p)}
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Box>
                );
              })}
          </Stack>
        </ScrollArea>

        <Box>
          <Divider mb="md" />
          <CreateProjectModal />
        </Box>
      </AppShell.Navbar>

      <AppShell.Header p="sm">
        <Group
          justify="space-between"
          align="center"
          style={{ height: "100%" }}
        >
          <Group>
            <IconClipboardList size={28} />
            <Text fw={600}>Task Management</Text>
          </Group>

          <Group>
            <Avatar src={user?.avatar_url} color="cyan" radius="xl">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </Avatar>
            <div>
              <Text fw={600}>{user?.name || user?.email}</Text>
            </div>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <Box
          p="md"
          style={{ minHeight: "calc(100vh - 72px)", overflow: "auto" }}
        >
          <Outlet />
        </Box>
      </AppShell.Main>

      <EditProjectModal
        opened={editModalOpened}
        onClose={() => setEditModalOpened(false)}
        project={selectedProject}
      />
    </AppShell>
  );
}
