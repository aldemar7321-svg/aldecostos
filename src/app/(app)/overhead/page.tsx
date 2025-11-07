'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { overheadData, laborSettingsData } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { OverheadItem } from '@/lib/types';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 2 }).format(value);

const formatPercentage = (value: number) =>
  new Intl.NumberFormat('es-CO', { style: 'percent', minimumFractionDigits: 0 }).format(value);

const formSchema = z.object({
  concept: z.string().min(1, "El concepto es requerido."),
  monthlyValue: z.coerce.number().positive("El valor debe ser un número positivo."),
  productionPercentage: z.coerce.number().min(0).max(1, "El porcentaje debe estar entre 0 y 1 (ej: 0.7 para 70%)."),
});


export default function OverheadPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [cifItems, setCifItems] = useState<OverheadItem[]>(overheadData);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      concept: '',
      monthlyValue: 0,
      productionPercentage: 0,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newItem: OverheadItem = {
        id: `cif-${Date.now()}`,
        ...values
    }
    setCifItems(prev => [...prev, newItem]);
    form.reset();
    setIsSheetOpen(false);
  }

  const totalCIF = cifItems.reduce((acc, item) => acc + item.monthlyValue * item.productionPercentage, 0);
  const cifRate = laborSettingsData.totalMonthlyHours > 0 ? totalCIF / laborSettingsData.totalMonthlyHours : 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Costos Indirectos de Fabricación (CIF)"
        description="Gestiona los gastos indirectos y su asignación a producción."
      >
        <Button size="sm" onClick={() => setIsSheetOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Concepto
        </Button>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Gastos Mensuales</CardTitle>
          <CardDescription>
            El CIF Total se calcula aplicando el '% Producción' al valor mensual de cada concepto.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Concepto</TableHead>
                <TableHead className="text-right">Valor Mensual</TableHead>
                <TableHead className="text-right">% Producción</TableHead>
                <TableHead className="text-right">CIF Totales</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cifItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.concept}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.monthlyValue)}</TableCell>
                  <TableCell className="text-right">{formatPercentage(item.productionPercentage)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.monthlyValue * item.productionPercentage)}</TableCell>
                </TableRow>
              ))}
               {cifItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No has añadido ningún concepto.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex-col items-end gap-2 sm:flex-row sm:justify-end">
          <div className="flex flex-col items-end">
            <p className="text-muted-foreground">CIF Total de Producción:</p>
            <p className="text-xl font-bold">{formatCurrency(totalCIF)}</p>
          </div>
          <div className="h-12 w-px bg-border hidden sm:block mx-4"></div>
          <div className="flex flex-col items-end">
            <p className="text-muted-foreground">Tasa CIF de Producción:</p>
            <p className="text-xl font-bold">{formatCurrency(cifRate)} / hora</p>
          </div>
        </CardFooter>
      </Card>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Añadir Nuevo Concepto CIF</SheetTitle>
            <SheetDescription>
              Completa los detalles del nuevo costo indirecto.
            </SheetDescription>
          </SheetHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-6">
              <FormField
                control={form.control}
                name="concept"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Concepto</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Arriendo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="monthlyValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Mensual</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="productionPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>% Afectación a Producción</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="Ej: 0.7" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <SheetFooter className="pt-6">
                <SheetClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </SheetClose>
                <Button type="submit">Guardar Concepto</Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
