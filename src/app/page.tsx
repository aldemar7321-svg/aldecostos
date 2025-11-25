'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Boxes } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth, useFirestore } from '@/firebase';
import { useEffect } from 'react';
import { signInAnonymously } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { data: user, isLoading } = useUser();

  const handleSignIn = async () => {
    if (!auth || !firestore) return;
    try {
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;
      if (user) {
        const userDocRef = doc(firestore, 'users', user.uid);
        await setDoc(userDocRef, {
          uid: user.uid,
          isAnonymous: user.isAnonymous,
        }, { merge: true });
      }
      router.push('/dashboard');
    } catch (error) {
      console.error('Error signing in anonymously:', error);
    }
  };

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (isLoading || user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex w-fit items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground">
            <Boxes className="h-6 w-6" />
            <span className="text-xl font-semibold">ProdCost Pro</span>
          </div>
          <CardTitle>Bienvenido</CardTitle>
          <CardDescription>
            Ingresa a la aplicación para empezar a gestionar tus costos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSignIn} className="w-full">
            Ingresar
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
