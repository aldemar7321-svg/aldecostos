'use client';
import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { useAppData } from '@/app/layout';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { FinishedProduct } from '@/lib/types';
import { MoreHorizontal, PlusCircle, Trash2, Edit } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';

const formSchema = z.object({
  productId: z.string({ required_error: 'Debes seleccionar un producto.' }),
  quantity: z.coerce.number().positive({ message: 'La cantidad debe ser positiva.' }),
  unitCost: z.coerce.number().positive({ message: 'El costo debe ser positivo.' }),
  productionDate: z.string().min(1, { message: 'La fecha es requerida.' }),
  lotNumber: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function FinishedProductsPage() {
  const { finishedProducts, products, addFinishedProduct, updateFinishedProduct, deleteFinishedProduct } = useAppData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FinishedProduct | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const productNames = useMemo(() => {
    return products.reduce((acc, product) => {
      acc[product.id] = product.name;
      return acc;
    }, {} as Record<string, string>);
  }, [products]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productId: '',
      quantity: 0,
      unitCost: 0,
      productionDate: format(new Date(), 'yyyy-MM-dd'),
      lotNumber: '',
    },
  });

  const handleDialogOpen = (item: FinishedProduct | null = null) => {
    setEditingItem(item);
    if (item) {
      form.reset({
        ...item,
        productionDate: format(new Date(item.productionDate), 'yyyy-MM-dd'),
      });
    } else {
      form.reset({
        productId: '',
        quantity: 0,
        unitCost: 0,
        productionDate: format(new Date(), 'yyyy-MM-dd'),
        lotNumber: '',
      });
    }
    setIsDialogOpen(true);
  };
  
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    form.reset();
  }

  const onSubmit = (data: FormData) => {
    const submissionData = {
      ...data,
      productionDate: new Date(data.productionDate).toISOString()
    };
    if (editingItem) {
      updateFinishedProduct({ ...editingItem, ...submissionData });
      toast({ title: "Lote de producción actualizado", description: `El lote ha sido actualizado.` });
    } else {
      addFinishedProduct(submissionData);
      toast({ title: "Lote de producción añadido", description: `Se ha registrado la producción.` });
    }
    handleDialogClose();
  };

  const openDeleteConfirm = (id: string) => {
    setDeletingItemId(id);
    setIsAlertOpen(true);
  }
  
  const handleDelete = () => {
    if (deletingItemId) {
      deleteFinishedProduct(deletingItemId);
      setIsAlertOpen(false);
      setDeletingItemId(null);
      toast({ title: "Lote de producción eliminado", description: `El lote ha sido eliminado del inventario.` });
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Productos Terminados"
        description="Gestiona tu inventario de productos listos para la venta."
      >
        <Button onClick={() => handleDialogOpen()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Registrar Producción
        </Button>
      </PageHeader>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead className="w-[180px]">Fecha Producción</TableHead>
              <TableHead className="text-right w-[150px]">Cantidad</TableHead>
              <TableHead className="text-right w-[180px]">Costo Unitario</TableHead>
              <TableHead className="w-[180px]">Lote</TableHead>
              <TableHead className="w-[40px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {finishedProducts.length > 0 ? (
              finishedProducts.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{productNames[item.productId] || 'Producto no encontrado'}</TableCell>
                  <TableCell>{format(new Date(item.productionDate), 'dd/MM/yyyy')}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.unitCost)}</TableCell>
                  <TableCell>{item.lotNumber}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDialogOpen(item)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive hover:!text-destructive focus:!text-destructive" onClick={() => openDeleteConfirm(item.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  No hay productos terminados en inventario.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]" onInteractOutside={handleDialogClose}>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Editar Lote' : 'Registrar Producción'}</DialogTitle>
            <DialogDescription>
              {editingItem
                ? 'Actualiza los detalles del lote de producción.'
                : 'Añade un nuevo lote de producto terminado al inventario.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
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
                        {products.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
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
                  <FormItem>
                    <FormLabel>Fecha de Producción</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
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
                      <Input type="number" placeholder="Ej: 100" {...field} />
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
                    <FormLabel>Costo Unitario</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ej: 15000" {...field} />
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
                      <Input placeholder="Ej: LOTE-001A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={handleDialogClose}>Cancelar</Button>
                <Button type="submit">{editingItem ? 'Guardar Cambios' : 'Añadir'}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el lote de producción.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

    