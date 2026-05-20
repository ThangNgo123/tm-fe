import { getCurrentUser } from "@/stores/auth";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useProjects } from "@/service/hook/project.hook";

export default function MainsPage() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const { data: projects, isLoading } = useProjects();

  useEffect(() => {
    // If not logged in, send to login
    if (!user) {
      navigate("/auth/login", { replace: true });
      return;
    }

    // Wait for projects to finish loading
    if (isLoading) return;

    // Only redirect if there is at least one project
    if (projects && projects.length > 0) {
      const projectId = projects[0].id;
      navigate(`/project/${projectId}`, { replace: true });
    }
    // If no projects, stay on this page (or show a create-project CTA)
  }, [user, projects, isLoading, navigate]);

  if (!user) return null;
  if (isLoading) return <div>Loading projects...</div>;
  if (!projects || projects.length === 0) return <div>No projects found</div>;

  return null;
}
