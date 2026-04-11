'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppData } from '@/app/layout';
import { PlusCircle, Trash2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function RecipeDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { products, updateProduct, inventory, packaging, laborSettings } = useAppData();
  const { toast } = useToast();

  const product = products.find((p) => p.id === id);

  const [newIngredientId, setNewIngredientId] = useState('');
  const [newIngredientQuantity, setNewIngredientQuantity] = useState('');

  const [newPackagingId, setNewPackagingId] = useState('');
  const [newPackagingQuantity, setNewPackagingQuantity] = useState('');

  const [newLaborName, setNewLaborName] = useState('');
  const [newLaborTime, setNewLaborTime] = useState('');
  const [newLaborOperators, setNewLaborOperators] = useState('1');

  if (!product) {
    return (
      <div className="space-y-6">
        <PageHeader title="Receta No Encontrada" description="La receta que buscas no existe." />
        <Button onClick={() => router.push('/recipes')}>Volver a Recetas</Button>
      </div>
    );
  }

  const handleAddIngredient = () => {
    if (!newIngredientId || !newIngredientQuantity) return;
    const updatedIngredients = [
      ...product.ingredients,
      { ingredientId: newIngredientId, quantity: parseFloat(newIngredientQuantity) },
    ];
    updateProduct({ ...product, ingredients: updatedIngredients });
    setNewIngredientId('');
    setNewIngredientQuantity('');
    toast({ title: 'Ingrediente agregado' });
  };

  const handleRemoveIngredient = (index: number) => {
    const updated = [...product.ingredients];
    updated.splice(index, 1);
    updateProduct({ ...product, ingredients: updated });
    toast({ title: 'Ingrediente eliminado' });
  };

  const handleAddPackaging = () => {
    if (!newPackagingId || !newPackagingQuantity) return;
    const updatedPackaging = [
      ...product.packaging,
      { packagingId: newPackagingId, quantity: parseFloat(newPackagingQuantity) },
    ];
    updateProduct({ ...product, packaging: updatedPackaging });
    setNewPackagingId('');
    setNewPackagingQuantity('');
    toast({ title: 'Empaque agregado' });
  };

  const handleRemovePackaging = (index: number) => {
    const updated = [...product.packaging];
    updated.splice(index, 1);
    updateProduct({ ...product, packaging: updated });
    toast({ title: 'Empaque eliminado' });
  };

  const handleAddLabor = () => {
    if (!newLaborName || !newLaborTime || !newLaborOperators) return;
    const updatedLabor = [
      ...product.laborProcesses,
      {
        id: `labor-${Date.now()}`,
        name: newLaborName,
        time: parseFloat(newLaborTime),
        timeUnit: 'minutos' as const,
        operators: parseInt(newLaborOperators, 10),
      },
    ];
    updateProduct({ ...product, laborProcesses: updatedLabor });
    setNewLaborName('');
    setNewLaborTime('');
    setNewLaborOperators('1');
    toast({ title: 'Proceso agregado' });
  };

  const handleRemoveLabor = (index: number) => {
    const updated = [...product.laborProcesses];
    updated.splice(index, 1);
    updateProduct({ ...product, laborProcesses: updated });
    toast({ title: 'Proceso eliminado' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/recipes')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <PageHeader
          title={`Gestionar: ${product.name}`}
          description={`Lote: ${product.batchSize} ${product.batchUnit}`}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Materia Prima (Ingredientes)</CardTitle>
            <CardDescription>Añade los ingredientes requeridos para este lote.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-6">
                <Select value={newIngredientId} onValueChange={setNewIngredientId}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>
                    {inventory.map(inv => (
                      <SelectItem key={inv.id} value={inv.id}>{inv.product}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-4">
                <Input
                  type="number"
                  placeholder={`Cant (${newIngredientId ? inventory.find(i=>i.id===newIngredientId)?.measure : '-'})`}
                  value={newIngredientQuantity}
                  onChange={(e) => setNewIngredientQuantity(e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <Button className="w-full" onClick={handleAddIngredient} disabled={!newIngredientId || !newIngredientQuantity}>
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {product.ingredients.map((ing, idx) => {
                const itemDef = inventory.find(i => i.id === ing.ingredientId);
                return (
                  <div key={idx} className="flex items-center justify-between bg-muted/50 p-2 rounded text-sm">
                    <span>{itemDef ? itemDef.product : 'Desconocido'}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">{ing.quantity} {itemDef?.measure}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleRemoveIngredient(idx)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Empaques</CardTitle>
            <CardDescription>Añade los materiales de empaque para el lote.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-6">
                <Select value={newPackagingId} onValueChange={setNewPackagingId}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>
                    {packaging.map(pkg => (
                      <SelectItem key={pkg.id} value={pkg.id}>{pkg.product}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-4">
                <Input
                  type="number"
                  placeholder="Cantidad"
                  value={newPackagingQuantity}
                  onChange={(e) => setNewPackagingQuantity(e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <Button className="w-full" onClick={handleAddPackaging} disabled={!newPackagingId || !newPackagingQuantity}>
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {product.packaging.map((pkg, idx) => {
                const itemDef = packaging.find(p => p.id === pkg.packagingId);
                return (
                  <div key={idx} className="flex items-center justify-between bg-muted/50 p-2 rounded text-sm">
                    <span>{itemDef ? itemDef.product : 'Desconocido'}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">{pkg.quantity} {itemDef?.measure}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleRemovePackaging(idx)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Procesos y Mano de Obra</CardTitle>
            <CardDescription>Define los tiempos de operación requeridos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-4">
                <Input
                  placeholder="Ej. Mezclado, Horneado"
                  value={newLaborName}
                  onChange={(e) => setNewLaborName(e.target.value)}
                />
              </div>
              <div className="col-span-3">
                <Input
                  type="number"
                  placeholder="Minutos"
                  value={newLaborTime}
                  onChange={(e) => setNewLaborTime(e.target.value)}
                />
              </div>
              <div className="col-span-3">
                <Input
                  type="number"
                  placeholder="Operarios"
                  value={newLaborOperators}
                  onChange={(e) => setNewLaborOperators(e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <Button className="w-full" onClick={handleAddLabor} disabled={!newLaborName || !newLaborTime || !newLaborOperators}>
                  Añadir Proceso
                </Button>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {product.laborProcesses.map((lp, idx) => (
                <div key={idx} className="flex items-center justify-between bg-muted/50 p-2 rounded text-sm">
                  <span>{lp.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">{lp.time} minutos - {lp.operators} Operario(s)</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleRemoveLabor(idx)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
