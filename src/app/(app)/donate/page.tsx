'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import Image from 'next/image';

export default function DonatePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Apoya Nuestro Proyecto"
        description="Tu donación nos ayuda a mantener y mejorar esta herramienta para todos."
      />

      <div className="mx-auto max-w-2xl">
        <Card className="overflow-hidden">
          <CardHeader className="p-0">
            <div className="relative h-48 w-full">
                <Image
                    src="https://i.ibb.co/hK78YRL/support-banner.jpg"
                    alt="Imagen de apoyo al proyecto"
                    layout="fill"
                    objectFit="cover"
                />
            </div>
          </CardHeader>
          <CardContent className="p-6 text-center">
            <Heart className="mx-auto mb-4 h-12 w-12 text-primary" />
            <CardTitle className="text-2xl">¡Gracias por tu apoyo!</CardTitle>
            <CardDescription className="mt-2 text-lg">
              Si esta aplicación te ha sido de utilidad, considera hacer una donación.
            </CardDescription>

            <div className="mt-6 space-y-4 rounded-lg bg-muted p-4">
              <p className="font-semibold text-foreground">Puedes donar a través de Nequi:</p>
              <div className="flex flex-col items-center justify-center space-y-2">
                <p className="text-xl font-bold tracking-widest text-primary">311 256 0143</p>
                <p className="text-xl font-bold tracking-widest text-primary">3052562338</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Cualquier cantidad es bienvenida y muy apreciada.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
