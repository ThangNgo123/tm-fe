import { Suspense } from 'react';
import { createBrowserRouter, Outlet } from 'react-router'
import { TanstackQueryProvider } from '../tanstack-query';
import { BaseMantineProvider } from '../mantine';
import HomePage from '@/apps/(main)/page';
import MainLayout from '@/apps/(main)/layout';
import { GoogleOAuthProvider } from '@react-oauth/google';

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
    )
}

export const router = createBrowserRouter([
    {
        path: '/',
        element: (
            <RootLayout>
                <Outlet/>
            </RootLayout>
        ),
        errorElement: <div>Error</div>,
        children: [
            {
                path: '/',
                element: <MainLayout />,
                children: [
                    {
                        index: true,
                        element: <HomePage />
                    }
                ]
            }
        ]
    }
])
