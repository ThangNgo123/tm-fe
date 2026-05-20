import { Outlet, NavLink, useLocation, useNavigate } from "react-router";
import { useState } from "react";
import { useProjects } from "@/service/hook/project.hook";
import { useAuth } from "@/stores/auth";
import {
  AppShell,
  ScrollArea,
  UnstyledButton,
  Group,
  Avatar,
  Text,
  Stack,
  Box,
  ThemeIcon,
  useMantineTheme,
  ActionIcon,
  Tooltip,
  Divider,
  Menu,
} from "@mantine/core";
import {
  IconClipboardList,
  IconEdit,
  IconLogout,
  IconMail,
} from "@tabler/icons-react";
import CreateProjectModal from "@/components/project/create-project-modal";
import EditProjectModal from "@/components/project/edit-project-modal";
import type { Project } from "@/types/project";

export default function ProjectLayout() {
  const { data: projects, isLoading } = useProjects();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useMantineTheme();

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editModalOpened, setEditModalOpened] = useState(false);

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setEditModalOpened(true);
  };

  const handleLogout = () => {
    logout();
    navigate("/auth/login", { replace: true });
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
                const to = `/project/${p.id}`;
                const isActive = location.pathname === to;
                return (
                  <Box
                    key={p.id}
                    style={{
                      borderRadius: theme.radius.md,
                      background: isActive
                        ? "linear-gradient(90deg, #667eea 0%, #764ba2 100%)"
                        : theme.colors.gray[0],
                      transition: "all 0.2s ease",
                      overflow: "hidden",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background =
                          "linear-gradient(90deg, #7f8fff 0%, #8e6bd6 100%)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = theme.colors.gray[0];
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
                        <Group align="center" gap="sm">
                          <ThemeIcon
                            size={28}
                            radius="md"
                            variant={isActive ? "gradient" : "light"}
                            gradient={{ from: "blue", to: "purple", deg: 45 }}
                          >
                            <IconClipboardList size={16} />
                          </ThemeIcon>
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
                        </Group>
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
          <Group align="center" gap="sm">
            <ThemeIcon
              size={45}
              radius="lg"
              variant="gradient"
              gradient={{ from: "blue", to: "purple", deg: 45 }}
            >
              <IconClipboardList size={32} />
            </ThemeIcon>
            <Box>
              <Text fw={700} size="lg">
                Task Management
              </Text>
              <Text size="xs" c="dimmed">
                Manage your projects and tasks
              </Text>
            </Box>
          </Group>

          <Menu position="bottom-end" shadow="md" width={260} withinPortal>
            <Menu.Target>
              <UnstyledButton>
                <Avatar src={user?.avatar_url} color="cyan" radius="xl" />
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>User information</Menu.Label>
              <Box px="sm" pb="sm">
                <Group gap="sm" align="flex-start" wrap="nowrap">
                  <Avatar src={user?.avatar_url} color="cyan" radius="xl" />
                  <Stack gap={2} style={{ minWidth: 0 }}>
                    <Text fw={700} size="sm" truncate>
                      {user?.full_name || "Unknown user"}
                    </Text>
                    <Group gap={6} wrap="nowrap">
                      <IconMail size={14} />
                      <Text size="xs" c="dimmed" truncate>
                        {user?.email || "No email"}
                      </Text>
                    </Group>
                  </Stack>
                </Group>
              </Box>

              <Menu.Divider />

              <Menu.Item
                color="red"
                leftSection={<IconLogout size={16} />}
                onClick={handleLogout}
              >
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
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
