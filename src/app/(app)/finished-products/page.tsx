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
import type { FinishedProduct } from '@/lib/types';
import { useAppData } from '@/app/(app)/layout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 2,
  }).format(value);

const formSchema = z.object({
  productId: z.string().min(1, 'Debe seleccionar un producto.'),
  quantity: z.coerce.number().positive('La cantidad debe ser un número positivo.'),
  unitCost: z.coerce.number().positive('El costo unitario debe ser positivo.'),
  productionDate: z.date({
    required_error: "La fecha de producción es requerida.",
  }),
  lotNumber: z.string().optional(),
});

const FinishedProductsContent = () => {
  const { 
    finishedProducts, 
    addFinishedProduct, 
    updateFinishedProduct, 
    deleteFinishedProduct,
    products,
  } = useAppData();
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FinishedProduct | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  
  const productsMap = new Map(products.map(p => [p.id, p]));

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productId: '',
      quantity: 0,
      unitCost: 0,
      lotNumber: '',
    },
  });

  const handleAddNew = () => {
    setEditingItem(null);
    form.reset({
      productId: '',
      quantity: 0,
      unitCost: 0,
      productionDate: new Date(),
      lotNumber: '',
    });
    setIsSheetOpen(true);
  };
  
  const handleEdit = (item: FinishedProduct) => {
    setEditingItem(item);
    form.reset({
      ...item,
      productionDate: new Date(item.productionDate),
    });
    setIsSheetOpen(true);
  };

  const handleDeleteConfirmation = (id: string) => {
    setItemToDelete(id);
    setIsAlertOpen(true);
  };

  const handleDelete = () => {
    if (itemToDelete) {
      deleteFinishedProduct(itemToDelete);
      setItemToDelete(null);
    }
    setIsAlertOpen(false);
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    const data = { ...values, productionDate: values.productionDate.toISOString() };
    if (editingItem) {
      updateFinishedProduct({ ...editingItem, ...data });
    } else {
      const newItem: FinishedProduct = {
        id: `fp-${Date.now()}`,
        ...data,
      };
      addFinishedProduct(newItem);
    }
    form.reset();
    setIsSheetOpen(false);
    setEditingItem(null);
  }
  
  const totalInventoryValue = finishedProducts.reduce(
    (acc, item) => acc + item.unitCost * item.quantity,
    0
  );
  
  const totalUnits = finishedProducts.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Inventario de Productos Terminados"
        description="Gestiona el stock de tus productos listos para la venta."
      >
        <Button size="sm" onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Registrar Lote de Producción
        </Button>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Stock Actual</CardTitle>
          <CardDescription>
            Listado de todos los lotes de producción terminados disponibles en inventario.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Lote</TableHead>
                <TableHead>Fecha de Producción</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-right">Costo Unitario</TableHead>
                <TableHead className="text-right">Valor Total del Lote</TableHead>
                <TableHead className="w-[50px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {finishedProducts.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{productsMap.get(item.productId)?.name || 'N/A'}</TableCell>
                  <TableCell>{item.lotNumber}</TableCell>
                  <TableCell>{format(new Date(item.productionDate), 'PPP', { locale: es })}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.unitCost)}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(item.quantity * item.unitCost)}</TableCell>
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
              {finishedProducts.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground py-8"
                  >
                    No has registrado ningún lote de producción.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex-col items-end gap-2 sm:flex-row sm:justify-end sm:items-center">
          <div className="flex flex-col items-end">
            <p className="text-muted-foreground">Total Unidades en Inventario:</p>
            <p className="text-xl font-bold">{totalUnits}</p>
          </div>
          <div className="h-12 w-px bg-border hidden sm:block mx-4"></div>
          <div className="flex flex-col items-end">
            <p className="text-muted-foreground">Valor Total del Inventario:</p>
            <p className="text-xl font-bold">{formatCurrency(totalInventoryValue)}</p>
          </div>
        </CardFooter>
      </Card>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{editingItem ? 'Editar Lote' : 'Registrar Nuevo Lote'}</SheetTitle>
            <SheetDescription>
            {editingItem ? 'Modifica los detalles del lote de producción.' : 'Completa los detalles del nuevo lote de producción.'}
            </SheetDescription>
          </SheetHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 py-6"
            >
              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Producto</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un producto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products.map(product => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="productionDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Producción</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: es })
                            ) : (
                              <span>Elige una fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cantidad Producida</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unitCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Costo Unitario de Producción</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lotNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Lote (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: LOTE-002" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <SheetFooter className="pt-6">
                <SheetClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </SheetClose>
                <Button type="submit">{editingItem ? 'Guardar Cambios' : 'Guardar Lote'}</Button>
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
              el lote de producción del inventario.
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

export default function FinishedProductsPage() {
    return <FinishedProductsContent />;
}
