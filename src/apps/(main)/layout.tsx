import { useState } from 'react'
import { Outlet } from 'react-router'
import { AppShell } from '@mantine/core'
import Header from '@/components/Header'
import Navbar from '@/components/Navbar'

export default function MainLayout() {
    const [header, setHeader] = useState(true)
    const [navbar, setNavbar] = useState(true)

    return (
        <AppShell
            header={{ height: 60, collapsed: !header }}
            navbar={{ width: 200, breakpoint: 'sm', collapsed: { mobile: true, desktop: !navbar } }}
            padding={0}
            styles={{
                header: {
                    zIndex: 49
                }
            }}
            classNames={{
                root: 'h-full'
            }}
        >
            <AppShell.Header>
                <Header />
            </AppShell.Header>
            <AppShell.Navbar>
                <Navbar />
            </AppShell.Navbar>
            <AppShell.Main className='h-full'>
                <Outlet />
            </AppShell.Main>
        </AppShell>
    )
}
