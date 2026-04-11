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
import type { CapitalItem, AllocationBasis } from '@/lib/types';
import { MoreHorizontal, PlusCircle, Trash2, Edit } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';

const formSchema = z.object({
  concept: z.string().min(2, { message: 'El concepto debe tener al menos 2 caracteres.' }),
  monthlyValue: z.coerce.number().positive({ message: 'El valor debe ser positivo.' }),
  productionPercentage: z.coerce.number().min(0, { message: 'Debe ser al menos 0' }).max(1, { message: 'No puede ser mayor a 1 (100%)' }),
  allocationBasis: z.enum(['labor', 'material', 'units'], { required_error: 'Debes seleccionar una base de asignación.' }),
});

type FormData = z.infer<typeof formSchema>;

export default function CapitalInvestmentPage() {
  const { capital, addCapitalItem, updateCapitalItem, deleteCapitalItem } = useAppData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CapitalItem | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      concept: '',
      monthlyValue: 0,
      productionPercentage: 1,
      allocationBasis: 'labor',
    },
  });

  const handleDialogOpen = (item: CapitalItem | null = null) => {
    setEditingItem(item);
    if (item) {
      form.reset({
        concept: item.concept,
        monthlyValue: item.monthlyValue,
        productionPercentage: item.productionPercentage,
        allocationBasis: item.allocationBasis,
      });
    } else {
      form.reset({
        concept: '',
        monthlyValue: 0,
        productionPercentage: 1,
        allocationBasis: 'labor',
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
    if (editingItem) {
      updateCapitalItem({ ...editingItem, ...data });
       toast({ title: "Costo de inversión actualizado", description: `"${data.concept}" ha sido actualizado.` });
    } else {
      addCapitalItem(data);
      toast({ title: "Costo de inversión añadido", description: `"${data.concept}" ha sido añadido.` });
    }
    handleDialogClose();
  };

  const openDeleteConfirm = (id: string) => {
    setDeletingItemId(id);
    setIsAlertOpen(true);
  }
  
  const handleDelete = () => {
    if (deletingItemId) {
      const itemToDelete = capital.find(item => item.id === deletingItemId);
      deleteCapitalItem(deletingItemId);
      setIsAlertOpen(false);
      setDeletingItemId(null);
      toast({ title: "Costo de inversión eliminado", description: `"${itemToDelete?.concept}" ha sido eliminado.` });
    }
  }

  const allocationBasisLabels: Record<AllocationBasis, string> = {
    labor: 'Mano de Obra',
    material: 'Materiales',
    units: 'Unidades Producidas'
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inversión"
        description="Gestiona los costos de capital y depreciación."
      >
        <Button onClick={() => handleDialogOpen()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Costo
        </Button>
      </PageHeader>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Concepto</TableHead>
              <TableHead className="text-right w-[180px]">Valor Mensual</TableHead>
              <TableHead className="text-right w-[150px]">% Producción</TableHead>
              <TableHead className="w-[180px]">Base Asignación</TableHead>
              <TableHead className="text-right w-[180px]">Valor Asignado</TableHead>
              <TableHead className="w-[40px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {capital.length > 0 ? (
              capital.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.concept}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.monthlyValue)}</TableCell>
                  <TableCell className="text-right">{(item.productionPercentage * 100).toFixed(0)}%</TableCell>
                  <TableCell>{allocationBasisLabels[item.allocationBasis]}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.monthlyValue * item.productionPercentage)}</TableCell>
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
                  No hay costos de inversión definidos.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]" onInteractOutside={handleDialogClose}>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Editar Costo' : 'Añadir Costo de Inversión'}</DialogTitle>
            <DialogDescription>
              {editingItem
                ? 'Actualiza los detalles del costo.'
                : 'Añade un nuevo costo a tu lista de inversiones.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="concept"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Concepto</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Depreciación maquinaria" {...field} />
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
                      <Input type="number" placeholder="Ej: 200000" {...field} />
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
                    <FormLabel>% Asignado a Producción</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" max="1" placeholder="Ej: 1 (para 100%)" {...field} />
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
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una base" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="labor">Mano de Obra</SelectItem>
                        <SelectItem value="material">Costo de Materiales</SelectItem>
                        <SelectItem value="units">Unidades Producidas</SelectItem>
                      </SelectContent>
                    </Select>
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
              Esta acción no se puede deshacer. Esto eliminará permanentemente el costo de inversión.
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
