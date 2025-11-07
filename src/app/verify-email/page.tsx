'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth, useUser } from '@/firebase';
import { sendEmailVerification } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader } from 'lucide-react';

export default function VerifyEmailPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    // Si el usuario ya está verificado, redirige al dashboard.
    if (user && user.emailVerified) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleResendVerification = async () => {
    if (user) {
      setIsSending(true);
      try {
        await sendEmailVerification(user);
        toast({
          title: 'Correo enviado',
          description: 'Se ha enviado un nuevo correo de verificación a tu bandeja de entrada.',
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudo enviar el correo. Inténtalo de nuevo más tarde.',
        });
        console.error('Error resending verification email:', error);
      } finally {
        setIsSending(false);
      }
    }
  };

  const handleCheckVerification = () => {
     if (user) {
      user.reload().then(() => {
        if (user.emailVerified) {
          router.push('/dashboard');
        } else {
           toast({
            variant: 'destructive',
            title: 'Correo no verificado',
            description: 'Por favor, revisa tu bandeja de entrada y haz clic en el enlace de verificación.',
          });
        }
      });
    }
  }

  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  if (user && user.emailVerified) {
    return null; // O un loader mientras redirige
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Verifica tu Correo Electrónico</CardTitle>
          <CardDescription>
            Hemos enviado un enlace de verificación a{' '}
            <span className="font-medium text-foreground">{user.email}</span>.
            Por favor, haz clic en el enlace para continuar.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button onClick={handleCheckVerification}>
            Ya verifiqué mi correo
          </Button>
          <p className="text-xs text-muted-foreground">
            ¿No recibiste el correo?
          </p>
          <Button
            variant="outline"
            onClick={handleResendVerification}
            disabled={isSending}
          >
            {isSending ? 'Enviando...' : 'Reenviar correo de verificación'}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
