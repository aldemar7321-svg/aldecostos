'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { inventoryData, productsData } from "@/lib/data";
import type { Ingredient, Product } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 2 }).format(value);

const inventoryMap = new Map(inventoryData.map(item => [item.id, item]));

const calculateRecipeCost = (recipe: Ingredient[]) => {
  return recipe.reduce((acc, ingredient) => {
    const item = inventoryMap.get(ingredient.inventoryId);
    const itemCost = item ? item.unitValue * ingredient.quantity : 0;
    return acc + itemCost;
  }, 0);
};

export default function RecipesPage() {
  const [products, setProducts] = useState<Product[]>(productsData);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductBatchSize, setNewProductBatchSize] = useState(0);

  const handleAddProduct = () => {
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: newProductName,
      batchSize: newProductBatchSize,
      recipe: [],
      laborProcesses: []
    };
    setProducts(prev => [...prev, newProduct]);
    setNewProductName('');
    setNewProductBatchSize(0);
    setIsSheetOpen(false);
  };
  
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Fórmulas y Costeo de Materia Prima"
        description="Define las recetas para cada uno de tus productos."
      >
        <Button size="sm" onClick={() => setIsSheetOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Producto
        </Button>
      </PageHeader>
      
      {products.length > 0 ? (
        <Tabs defaultValue={products[0]?.id || ''}>
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:w-fit">
            {products.map(product => (
              <TabsTrigger key={product.id} value={product.id}>{product.name}</TabsTrigger>
            ))}
          </TabsList>
          {products.map(product => {
            const totalRecipeCost = calculateRecipeCost(product.recipe);
            const unitCost = product.batchSize > 0 ? totalRecipeCost / product.batchSize : 0;
            
            return (
              <TabsContent key={product.id} value={product.id}>
                <Card>
                  <CardHeader>
                    <CardTitle>{product.name}</CardTitle>
                    <CardDescription>
                      Costeo de materia prima para un lote de producción de {product.batchSize} lbs.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ingrediente</TableHead>
                          <TableHead className="text-right">Fórmula (Cantidad)</TableHead>
                          <TableHead className="text-right">Valor Unitario</TableHead>
                          <TableHead className="text-right">Valor Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {product.recipe.length > 0 ? product.recipe.map((ingredient, index) => {
                          const item = inventoryMap.get(ingredient.inventoryId);
                          const totalValue = item ? item.unitValue * ingredient.quantity : 0;
                          return (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{item?.product || 'N/A'}</TableCell>
                              <TableCell className="text-right">{ingredient.quantity.toFixed(2)} {item?.measure}</TableCell>
                              <TableCell className="text-right">{formatCurrency(item?.unitValue || 0)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(totalValue)}</TableCell>
                            </TableRow>
                          );
                        }) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                              Esta receta aún no tiene ingredientes.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                  <CardFooter className="flex-col items-end gap-2 sm:flex-row sm:justify-end">
                      <div className="flex flex-col items-end">
                        <p className="text-muted-foreground">Costo MP del Lote:</p>
                        <p className="text-xl font-bold">{formatCurrency(totalRecipeCost)}</p>
                      </div>
                      <div className="h-12 w-px bg-border hidden sm:block mx-4"></div>
                      <div className="flex flex-col items-end">
                        <p className="text-muted-foreground">Costo MP Unitario (por lb):</p>
                        <p className="text-xl font-bold">{formatCurrency(unitCost)}</p>
                      </div>
                  </CardFooter>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No has añadido ningún producto todavía.
          </CardContent>
        </Card>
      )}

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Añadir Nuevo Producto</SheetTitle>
            <SheetDescription>
              Define un nuevo producto para empezar a costearlo.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <Label htmlFor="product-name">Nombre del Producto</Label>
              <Input 
                id="product-name"
                placeholder="Ej: Pan de Queso" 
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="batch-size">Tamaño del Lote (lbs)</Label>
              <Input 
                id="batch-size"
                type="number"
                value={newProductBatchSize}
                onChange={(e) => setNewProductBatchSize(parseFloat(e.target.value))}
              />
            </div>
          </div>
          <SheetFooter className="pt-6">
            <SheetClose asChild>
              <Button variant="outline">Cancelar</Button>
            </SheetClose>
            <Button onClick={handleAddProduct}>Guardar Producto</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
