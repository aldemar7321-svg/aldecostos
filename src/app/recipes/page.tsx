'use client';
import { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppData } from '@/app/layout';
import type { Product } from '@/lib/types';
import { MoreHorizontal, PlusCircle, Trash2, Edit, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function RecipesPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useAppData();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({ name: '', batchSize: 1, batchUnit: 'unidades' });

  const { toast } = useToast();

  const handleCreate = () => {
    setEditingProduct(null);
    setFormData({ name: '', batchSize: 1, batchUnit: 'unidades' });
    setIsDialogOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({ name: product.name, batchSize: product.batchSize, batchUnit: product.batchUnit });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({ title: 'Error', description: 'El nombre es requerido.', variant: 'destructive' });
      return;
    }
    if (editingProduct) {
      updateProduct({ ...editingProduct, ...formData });
      toast({ title: 'Receta actualizada', description: 'La receta se ha actualizado correctamente.' });
    } else {
      addProduct({
        name: formData.name,
        batchSize: formData.batchSize,
        batchUnit: formData.batchUnit,
        ingredients: [],
        packaging: [],
        laborProcesses: []
      });
      toast({ title: 'Receta creada', description: 'La receta se ha creado correctamente.' });
    }
    setIsDialogOpen(false);
  };
  
  const openDeleteConfirm = (id: string) => {
    setDeletingItemId(id);
    setIsAlertOpen(true);
  };

  const handleDelete = () => {
    if (deletingItemId) {
      const itemToDelete = products.find((item) => item.id === deletingItemId);
      deleteProduct(deletingItemId);
      setIsAlertOpen(false);
      setDeletingItemId(null);
      toast({
        title: 'Receta eliminada',
        description: `"${itemToDelete?.name}" ha sido eliminada.`,
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recetas"
        description="Define y gestiona las recetas de tus productos."
      >
        <Button onClick={handleCreate}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Crear Receta
        </Button>
      </PageHeader>

      {products.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl">{product.name}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(product)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive hover:!text-destructive focus:!text-destructive"
                        onClick={() => openDeleteConfirm(product.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription>
                  Lote de producción: {product.batchSize} {product.batchUnit}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <p>{product.ingredients?.length || 0} ingredientes</p>
                  <p>{product.packaging?.length || 0} empaques</p>
                  <p>{product.laborProcesses?.length || 0} procesos de mano de obra</p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/recipes/${product.id}`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Gestionar
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/reports?productId=${product.id}`}>
                    <FileText className="mr-2 h-4 w-4" />
                    Costo
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-12 text-center">
          <h3 className="text-xl font-semibold tracking-tight text-muted-foreground">
            No tienes recetas definidas
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Comienza creando tu primera receta para calcular tus costos de
            producción.
          </p>
          <Button className="mt-4" onClick={handleCreate}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Crear Primera Receta
          </Button>
        </div>
      )}

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente la
              receta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Editar Receta' : 'Crear Receta'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Modifica los detalles de la receta.' : 'Ingresa los detalles básicos para tu nueva receta.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre de Producto / Receta</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej. Galletas de Chocolate"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="batchSize">Tamaño de Lote</Label>
                <Input
                  id="batchSize"
                  type="number"
                  min="0.1"
                  step="any"
                  value={formData.batchSize}
                  onChange={(e) => setFormData({ ...formData, batchSize: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="batchUnit">Unidad Lote</Label>
                <Input
                  id="batchUnit"
                  value={formData.batchUnit}
                  onChange={(e) => setFormData({ ...formData, batchUnit: e.target.value })}
                  placeholder="Ej. unidades, kg, litros"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
