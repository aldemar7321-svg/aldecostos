
'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Boxes } from 'lucide-react';

export default function HomePage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [user, isUserLoading, router]);

  // Show a loader while checking for user authentication.
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Boxes className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
