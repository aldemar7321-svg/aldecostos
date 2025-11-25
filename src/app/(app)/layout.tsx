'use client';
import AppContainer from '../layout-client';

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AppContainer>{children}</AppContainer>;
}
