'use client';

import { useUser } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import AppShell from '@/components/app-shell';
import { Loader } from 'lucide-react';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isUserLoading) {
      return; // Espera a que termine la carga
    }
    if (!user) {
      router.push('/login');
    } else if (!user.emailVerified && pathname !== '/verify-email') {
      router.push('/verify-email');
    }
  }, [user, isUserLoading, router, pathname]);

  if (isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  if (!user || (!user.emailVerified && pathname !== '/verify-email')) {
    // Renderiza un loader o null mientras se redirige
    return (
        <div className="flex h-screen items-center justify-center">
            <Loader className="h-10 w-10 animate-spin" />
        </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
