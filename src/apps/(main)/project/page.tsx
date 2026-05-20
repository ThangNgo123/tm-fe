import { useProjects } from "@/service/hook/project.hook";
import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function ProjectPage() {
  const navigate = useNavigate();
  const { data: projects, isLoading } = useProjects();

  useEffect(() => {
    if (isLoading) return;

    if (projects && projects.length > 0) {
      navigate(`/project/${projects[0].id}`, { replace: true });
    }
  }, [isLoading, navigate, projects]);

  if (isLoading) {
    return <div>Loading projects...</div>;
  }

  if (!projects || projects.length === 0) {
    return <div>No projects found</div>;
  }

  return null;
}
