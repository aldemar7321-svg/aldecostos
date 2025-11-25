'use client';
import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { useAppData } from '@/app/layout';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { PriceList } from '@/lib/types';
import { MoreHorizontal, PlusCircle, Trash2, Edit } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  product: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }),
  measure: z.string().min(1, { message: 'La medida es requerida.' }),
  purchaseQuantity: z.coerce.number().positive({ message: 'La cantidad debe ser positiva.' }),
  value: z.coerce.number().positive({ message: 'El valor debe ser positivo.' }),
});

type FormData = z.infer<typeof formSchema>;

export default function InventoryPage() {
  const { inventory, addIngredient, updateIngredient, deleteIngredient } = useAppData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PriceList | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      product: '',
      measure: '',
      purchaseQuantity: 1,
      value: 0,
    },
  });

  const handleDialogOpen = (item: PriceList | null = null) => {
    setEditingItem(item);
    if (item) {
      form.reset({
        product: item.product,
        measure: item.measure,
        purchaseQuantity: item.purchaseQuantity,
        value: item.value,
      });
    } else {
      form.reset({
        product: '',
        measure: '',
        purchaseQuantity: 1,
        value: 0,
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
    const unitValue = data.value / (data.purchaseQuantity || 1);
    
    if (editingItem) {
      updateIngredient({ ...editingItem, ...data, unitValue });
       toast({ title: "Ingrediente actualizado", description: `"${data.product}" ha sido actualizado.` });
    } else {
      addIngredient({ ...data, unitValue });
      toast({ title: "Ingrediente añadido", description: `"${data.product}" ha sido añadido al inventario.` });
    }
    handleDialogClose();
  };

  const openDeleteConfirm = (id: string) => {
    setDeletingItemId(id);
    setIsAlertOpen(true);
  }
  
  const handleDelete = () => {
    if (deletingItemId) {
      deleteIngredient(deletingItemId);
      setIsAlertOpen(false);
      setDeletingItemId(null);
      toast({ title: "Ingrediente eliminado", description: "El ingrediente ha sido eliminado." });
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Materia Prima"
        description="Gestiona tu inventario de materia prima y sus costos."
      >
        <Button onClick={() => handleDialogOpen()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Ingrediente
        </Button>
      </PageHeader>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead className="w-[100px]">Medida</TableHead>
              <TableHead className="text-right w-[180px]">Cant. Compra</TableHead>
              <TableHead className="text-right w-[150px]">Valor</TableHead>
              <TableHead className="text-right w-[150px]">Valor Unitario</TableHead>
              <TableHead className="w-[40px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.length > 0 ? (
              inventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.product}</TableCell>
                  <TableCell>{item.measure}</TableCell>
                  <TableCell className="text-right">{item.purchaseQuantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.value)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.unitValue)}</TableCell>
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
                        <DropdownMenuItem className="text-red-500" onClick={() => openDeleteConfirm(item.id)}>
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
                  No hay ingredientes en el inventario.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]" onInteractOutside={handleDialogClose}>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Editar Ingrediente' : 'Añadir Ingrediente'}</DialogTitle>
            <DialogDescription>
              {editingItem
                ? 'Actualiza los detalles de tu ingrediente.'
                : 'Añade un nuevo ingrediente a tu inventario.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="product"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Producto</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Harina de trigo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="purchaseQuantity"
                  render={({ field }) => (
                    <FormItem className="col-span-1">
                      <FormLabel>Cantidad</FormLabel>
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
                    <FormItem className="col-span-2">
                      <FormLabel>Medida</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: kg, l, unid." {...field} />
                      </FormControl>
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
                      <Input type="number" placeholder="Ej: 50000" {...field} />
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
              Esta acción no se puede deshacer. Esto eliminará permanentemente el ingrediente de tu inventario.
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

// Re-export Card component to be used locally
const Card = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`bg-card text-card-foreground border rounded-lg shadow-sm ${className}`}
    {...props}
  />
);
