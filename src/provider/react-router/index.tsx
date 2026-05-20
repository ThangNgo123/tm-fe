import { Suspense } from "react";
import { createBrowserRouter, Outlet } from "react-router";
import { TanstackQueryProvider } from "../tanstack-query";
import { BaseMantineProvider } from "../mantine";
import { GoogleOAuthProvider } from "@react-oauth/google";
import LoginPage from "@/apps/auth/page";
import MainsLayout from "@/apps/(main)/layout";
import MainsPage from "@/apps/(main)/page";
import { nonAuthLoader, authLoader } from "@/utils/loader";
import ProjectLayout from "@/apps/(main)/project/[id]/layout";
import ProjectPage from "@/apps/(main)/project/[id]/page";
import TaskDetailPage from "@/apps/(main)/project/[id]/task/[taskId]/page";
import ProjectIndex from "@/apps/(main)/project/page";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Suspense fallback={null}>
      <TanstackQueryProvider>
        <BaseMantineProvider>
          <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            {children}
          </GoogleOAuthProvider>
        </BaseMantineProvider>
      </TanstackQueryProvider>
    </Suspense>
  );
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <RootLayout>
        <Outlet />
      </RootLayout>
    ),
    errorElement: <div>Error</div>,
    children: [
      // Auth routes - public
      {
        loader: nonAuthLoader,
        path: "/auth",
        element: <Outlet />,
        children: [
          {
            path: "login",
            element: <LoginPage />,
          },
        ],
      },
      // Protected routes - require authentication
      {
        loader: authLoader,
        path: "/",
        element: <MainsLayout />,
        children: [
          {
            index: true,
            element: <MainsPage />,
          },
          {
            path: "project",
            element: <ProjectIndex />,
          },
          {
            path: "project/:id",
            element: <ProjectLayout />,
            children: [
              {
                index: true,
                element: <ProjectPage />,
              },
              {
                path: "task/:taskId",
                element: <TaskDetailPage />,
              },
            ],
          },
        ],
      },
    ],
  },
]);
