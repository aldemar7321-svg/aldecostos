
'use client';

import { useUser, useAuth, initiateAnonymousSignIn } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Boxes, LogIn } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If the user is logged in, redirect them away from auth pages to the dashboard.
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const handleSignIn = () => {
    if (auth) {
      initiateAnonymousSignIn(auth);
    }
  };

  // While checking for user or if the user is already logged in and redirecting, show a loader.
  if (isUserLoading || user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Boxes className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Boxes className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Bienvenido a ProdCost Pro</CardTitle>
          <CardDescription>
            Ingresa para empezar a gestionar tus costos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSignIn} className="w-full">
            <LogIn className="mr-2 h-4 w-4" />
            Ingresar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
