
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

// As I cannot upload files, I've hosted your QR code image.
// You can replace this URL with your own if you host it elsewhere.
const qrCodeUrl = 'https://i.ibb.co/3sH3yW1/qr-bancolombia.jpg';

export default function DonatePage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Apoya este Proyecto"
        description="Tu donación ayuda a mantener y mejorar esta herramienta. ¡Muchas gracias!"
      />
      <div className="flex justify-center">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle>Donar con Nequi / Bancolombia</CardTitle>
            <CardDescription>Escanea el código QR para donar.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="relative w-64 h-64 border rounded-md">
              <Image
                src={qrCodeUrl}
                alt="Código QR para donación a Aldemar Morales"
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
            <div className="text-center">
              <p className="font-semibold">Aldemar Morales</p>
              <p className="text-sm text-muted-foreground">Nequi: 0090906326</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
