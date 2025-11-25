'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Boxes } from 'lucide-react';
import { useAuth, initiateEmailSignIn, useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const formSchema = z.object({
  email: z.string().email('Por favor, introduce un correo electrónico válido.'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.'),
});

export default function LoginPage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If the user is logged in, redirect them away from auth pages to the dashboard.
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    initiateEmailSignIn(auth, values.email, values.password);
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
    <div className="w-full max-w-sm">
    <Card>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
            <Boxes className="h-8 w-8 text-primary" />
        </div>
        <CardTitle>Bienvenido de Nuevo</CardTitle>
        <CardDescription>Inicia sesión para acceder a tu cuenta.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input placeholder="tu@correo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Iniciar Sesión
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          ¿No tienes una cuenta?{' '}
          <Link href="/signup" className="underline">
            Regístrate
          </Link>
        </div>
      </CardContent>
    </Card>
    </div>
    </div>
  );
}
