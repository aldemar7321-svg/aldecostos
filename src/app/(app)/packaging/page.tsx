
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Download, PlusCircle, MoreHorizontal, Trash2, Edit } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import type { PriceList } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAppData } from '@/app/(app)/layout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';


const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 2,
  }).format(value);

const formSchema = z.object({
  product: z.string().min(1, 'El nombre del material es requerido.'),
  purchaseQuantity: z.coerce.number().positive('La cantidad debe ser un número positivo.'),
  measure: z.string().min(1, 'La unidad de medida es requerida.'),
  value: z.coerce.number().positive('El valor debe ser un número positivo.'),
  unitValue: z.coerce.number(),
});

const PackagingContent = () => {
  const { packaging, addPackagingItem, updatePackagingItem, deletePackagingItem } = useAppData();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PriceList | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      product: '',
      purchaseQuantity: 1,
      measure: 'unid.',
      value: 0,
      unitValue: 0,
    },
  });

  const purchaseValue = form.watch('value');
  const purchaseQuantity = form.watch('purchaseQuantity');
  const unitValue = form.watch('unitValue');

  useEffect(() => {
    if (purchaseQuantity > 0) {
      form.setValue('unitValue', purchaseValue / purchaseQuantity);
    } else {
      form.setValue('unitValue', 0);
    }
  }, [purchaseValue, purchaseQuantity, form]);

  const handleAddNew = () => {
    setEditingItem(null);
    form.reset({ product: '', purchaseQuantity: 1, measure: 'unid.', value: 0, unitValue: 0 });
    setIsSheetOpen(true);
  };

  const handleEdit = (item: PriceList) => {
    setEditingItem(item);
    form.reset({
      ...item,
      purchaseQuantity: item.purchaseQuantity || 1,
    });
    setIsSheetOpen(true);
  };

  const handleDeleteConfirmation = (id: string) => {
    setItemToDelete(id);
    setIsAlertOpen(true);
  };

  const handleDelete = () => {
    if (itemToDelete) {
      deletePackagingItem(itemToDelete);
      setItemToDelete(null);
    }
    setIsAlertOpen(false);
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (editingItem) {
      updatePackagingItem({ ...editingItem, ...values });
    } else {
      const newPackagingItem: PriceList = {
        id: `pkg-${Date.now()}`,
        ...values,
      };
      addPackagingItem(newPackagingItem);
    }
    form.reset();
    setIsSheetOpen(false);
    setEditingItem(null);
  }

  const handleExport = () => {
    const headers = [
      'Material',
      'Cantidad Compra',
      'Medida de Compra',
      'Valor de Compra',
      'Valor Unitario',
    ];
    const csvContent = [
      headers.join(','),
      ...packaging.map((item) =>
        [item.product, item.purchaseQuantity, item.measure, item.value, item.unitValue].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'empaques.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const units = ['kg', 'g', 'lb', 'oz', 'unid.', 'l', 'ml', 'cc'];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Inventario de Material de Empaque"
        description="Gestiona la lista de precios de tus empaques y envases."
      >
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
        <Button size="sm" onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Empaque
        </Button>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Lista de Precios de Empaques</CardTitle>
          <CardDescription>
            El 'Valor Unitario' es el costo real utilizado en todos los cálculos
            de costeo de producto.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead className="text-center">Medida de Compra</TableHead>
                <TableHead className="text-right">Valor de Compra</TableHead>
                <TableHead className="text-right font-medium text-primary">
                  Valor Unitario
                </TableHead>
                <TableHead className="w-[50px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packaging?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.product}</TableCell>
                  <TableCell className="text-center">{item.purchaseQuantity ? `${item.purchaseQuantity} ${item.measure}` : item.measure}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.value)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(item.unitValue)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(item)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteConfirmation(item.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {packaging?.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground py-8"
                  >
                    No has añadido ningún empaque todavía.
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
            <SheetTitle>
              {editingItem ? 'Editar Empaque' : 'Añadir Nuevo Empaque'}
            </SheetTitle>
            <SheetDescription>
              {editingItem
                ? 'Modifica los detalles del material de empaque.'
                : 'Completa los detalles del nuevo material de empaque.'}
            </SheetDescription>
          </SheetHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 py-6"
            >
              <FormField
                control={form.control}
                name="product"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Material</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Bolsa plástica" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="purchaseQuantity"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Cantidad de Compra</FormLabel>
                        <FormControl>
                            <Input type="number" {...field} />
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
                      <FormLabel>Unidad de Medida</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una unidad" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {units.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
              <div className="space-y-2">
                <Label>Valor Unitario (Calculado)</Label>
                <p className="flex h-10 w-full items-center rounded-md border border-input bg-muted/50 px-3 py-2 text-sm font-semibold">
                  {formatCurrency(unitValue)}
                </p>
              </div>
              <SheetFooter className="pt-6">
                <SheetClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </SheetClose>
                <Button type="submit">
                  {editingItem ? 'Guardar Cambios' : 'Guardar Empaque'}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              el material de empaque.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};


export default function PackagingPage() {
    return <PackagingContent />;
}
