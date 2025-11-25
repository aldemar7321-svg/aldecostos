'use client';
import { useState } from 'react';
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
import { useAppData } from '@/app/layout';
import type { Product } from '@/lib/types';
import { MoreHorizontal, PlusCircle, Trash2, Edit, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function RecipesPage() {
  const { products, deleteProduct } = useAppData();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCreate = () => {
    // TODO: Implement create/edit dialog
    toast({ title: 'Función no implementada', description: 'La creación y edición de recetas se añadirá pronto.' });
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
                      <DropdownMenuItem onClick={handleCreate}>
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
              <CardFooter>
                <Button variant="outline" className="w-full">
                  <FileText className="mr-2 h-4 w-4" />
                  Ver Ficha de Costo
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
    </div>
  );
}
