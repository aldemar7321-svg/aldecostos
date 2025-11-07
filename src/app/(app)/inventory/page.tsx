"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, PlusCircle } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { inventoryData } from '@/lib/data';
import type { PriceList } from '@/lib/types';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 2 }).format(value);

const formSchema = z.object({
  product: z.string().min(1, "El nombre del producto es requerido."),
  measure: z.string().min(1, "La unidad de medida es requerida."),
  value: z.coerce.number().positive("El valor debe ser un número positivo."),
  unitValue: z.coerce.number().positive("El valor unitario debe ser un número positivo."),
});

export default function InventoryPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [priceLists, setPriceLists] = useState<PriceList[]>(inventoryData);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      product: '',
      measure: '',
      value: 0,
      unitValue: 0,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newPriceList: PriceList = {
        id: `pl-${Date.now()}`,
        ...values
    }
    setPriceLists(prev => [...prev, newPriceList]);
    form.reset();
    setIsSheetOpen(false);
  }

  const handleExport = () => {
    const headers = ["Producto", "Medida de Compra", "Valor de Compra", "Valor Unitario"];
    const csvContent = [
      headers.join(','),
      ...priceLists.map(item => 
        [item.product, item.measure, item.value, item.unitValue].join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'inventario.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Inventario de Materia Prima"
        description="Gestiona la lista de precios de tus ingredientes."
      >
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
        <Button size="sm" onClick={() => setIsSheetOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Ingrediente
        </Button>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Lista de Precios</CardTitle>
          <CardDescription>
            El 'Valor Unitario' es el costo real utilizado en todos los cálculos de recetas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead className="text-center">Medida de Compra</TableHead>
                <TableHead className="text-right">Valor de Compra</TableHead>
                <TableHead className="text-right font-medium text-primary">Valor Unitario</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {priceLists?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.product}</TableCell>
                  <TableCell className="text-center">{item.measure}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.value)}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(item.unitValue)}</TableCell>
                </TableRow>
              ))}
               {priceLists?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No has añadido ningún ingrediente todavía.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
       <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Añadir Nuevo Ingrediente</SheetTitle>
            <SheetDescription>
              Completa los detalles del nuevo ingrediente o materia prima.
            </SheetDescription>
          </SheetHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-6">
              <FormField
                control={form.control}
                name="product"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Producto</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Harina de trigo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="measure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medida de Compra</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: lb, kg, unid." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor de Compra</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unitValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Unitario</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <SheetFooter className="pt-6">
                <SheetClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </SheetClose>
                <Button type="submit">Guardar Ingrediente</Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
