'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
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
import type { CapitalItem } from '@/lib/types';
import { useAppData } from '@/app/(app)/layout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 2,
  }).format(value);

const formatPercentage = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'percent',
    minimumFractionDigits: 0,
  }).format(value);

const formSchema = z.object({
  concept: z.string().min(1, 'El concepto es requerido.'),
  monthlyValue: z.coerce
    .number()
    .positive('El valor debe ser un número positivo.'),
  productionPercentage: z.coerce
    .number()
    .min(0, 'El porcentaje debe ser como mínimo 0.')
    .max(1, 'El porcentaje debe ser como máximo 1 (ej: 0.7 para 70%).'),
  allocationBasis: z.enum(['labor', 'material', 'units']),
});

const CapitalInvestmentContent = () => {
  const { capital, addCapitalItem, updateCapitalItem, deleteCapitalItem, laborSettings } = useAppData();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CapitalItem | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      concept: '',
      monthlyValue: 0,
      productionPercentage: 0,
      allocationBasis: 'labor',
    },
  });

  const handleAddNew = () => {
    setEditingItem(null);
    form.reset({ concept: '', monthlyValue: 0, productionPercentage: 0, allocationBasis: 'labor' });
    setIsSheetOpen(true);
  };
  
  const handleEdit = (item: CapitalItem) => {
    setEditingItem(item);
    form.reset(item);
    setIsSheetOpen(true);
  };

  const handleDeleteConfirmation = (id: string) => {
    setItemToDelete(id);
    setIsAlertOpen(true);
  };

  const handleDelete = () => {
    if (itemToDelete) {
      deleteCapitalItem(itemToDelete);
      setItemToDelete(null);
    }
    setIsAlertOpen(false);
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (editingItem) {
      updateCapitalItem({ ...editingItem, ...values });
    } else {
      const newItem: CapitalItem = {
        id: `cap-${Date.now()}`,
        ...values,
      };
      addCapitalItem(newItem);
    }
    form.reset();
    setIsSheetOpen(false);
    setEditingItem(null);
  }

  const totalCapitalCost = capital.reduce(
    (acc, item) => acc + item.monthlyValue * item.productionPercentage,
    0
  );
  const capitalRate =
    laborSettings.totalMonthlyHours > 0
      ? totalCapitalCost / laborSettings.totalMonthlyHours
      : 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Inversión de Capital (Depreciación)"
        description="Gestiona la depreciación de tus activos y su asignación a producción."
      >
        <Button size="sm" onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Activo
        </Button>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Depreciación Mensual de Activos</CardTitle>
          <CardDescription>
            El costo total se calcula aplicando el '% Producción' al valor de depreciación mensual de cada activo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Concepto (Activo)</TableHead>
                <TableHead className="text-right">Valor Mensual</TableHead>
                <TableHead className="text-right">% Producción</TableHead>
                <TableHead className="text-right">Costo Total Asignado</TableHead>
                <TableHead className="w-[50px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {capital.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.concept}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.monthlyValue)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPercentage(item.productionPercentage)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.monthlyValue * item.productionPercentage)}
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
              {capital.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground py-8"
                  >
                    No has añadido ningún activo.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex-col items-end gap-2 sm:flex-row sm:justify-end sm:items-center">
          <div className="flex flex-col items-end">
            <p className="text-muted-foreground">Costo Total de Inversión:</p>
            <p className="text-xl font-bold">{formatCurrency(totalCapitalCost)}</p>
          </div>
          <div className="h-12 w-px bg-border hidden sm:block mx-4"></div>
          <div className="flex flex-col items-end">
            <p className="text-muted-foreground">Tasa de Inversión (por hora de M.O.):</p>
            <p className="text-xl font-bold">{formatCurrency(capitalRate)} / hora</p>
          </div>
        </CardFooter>
      </Card>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{editingItem ? 'Editar Activo' : 'Añadir Nuevo Activo'}</SheetTitle>
            <SheetDescription>
            {editingItem ? 'Modifica los detalles del activo.' : 'Completa los detalles de la depreciación del nuevo activo.'}
            </SheetDescription>
          </SheetHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 py-6"
            >
              <FormField
                control={form.control}
                name="concept"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Activo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Horno Industrial" {...field} />
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
                    <FormLabel>Depreciación Mensual</FormLabel>
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
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Ej: 0.9"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="allocationBasis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base de Asignación</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una base" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="labor">Horas de Mano de Obra</SelectItem>
                        <SelectItem value="material">Costo de Materia Prima</SelectItem>
                        <SelectItem value="units">Unidades Producidas</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <SheetFooter className="pt-6">
                <SheetClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </SheetClose>
                <Button type="submit">{editingItem ? 'Guardar Cambios' : 'Guardar Activo'}</Button>
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
              el activo.
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


export default function CapitalInvestmentPage() {
    return <CapitalInvestmentContent />;
}
