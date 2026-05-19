import { Suspense } from "react";
import { createBrowserRouter, Outlet } from "react-router";
import { TanstackQueryProvider } from "../tanstack-query";
import { BaseMantineProvider } from "../mantine";
import HomePage from "@/apps/(main)/page";
import MainLayout from "@/apps/(main)/layout";
import { GoogleOAuthProvider } from "@react-oauth/google";
import LoginPage from "@/apps/auth/page";
import { nonAuthLoader, authLoader } from "@/utils/loader";
import ProjectPage from "@/apps/(main)/project/page";
import ProjectDetailPage from "@/apps/(main)/project/[id]/page";
import TaskDetailPage from "@/apps/(main)/project/[id]/task/[taskId]/page";

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
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <HomePage />,
          },
          {
            path: "projects",
            element: <Outlet />,
            children: [
              {
                index: true,
                element: <ProjectPage />,
              },
              {
                path: ":id",
                element: <ProjectDetailPage />,
              },
              {
                path: ":id/tasks/:taskId",
                element: <TaskDetailPage />,
              },
            ],
          },
        ],
      },
    ],
  },
]);
