
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { inventoryData as initialInventoryData, productsData as initialProductsData } from "@/lib/data";
import type { Ingredient, Product, PriceList } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, Edit } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 2 }).format(value);

const productFormSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "El nombre es requerido."),
  batchSize: z.coerce.number().positive("El tamaño del lote debe ser positivo."),
  recipe: z.array(z.object({
    inventoryId: z.string().min(1, "Debes seleccionar un ingrediente."),
    quantity: z.coerce.number().positive("La cantidad debe ser positiva."),
  })),
  laborProcesses: z.any(),
});

export default function RecipesPage() {
  const [products, setProducts] = useState<Product[]>(initialProductsData);
  const [inventoryData] = useState<PriceList[]>(initialInventoryData);
  const [isAddProductSheetOpen, setIsAddProductSheetOpen] = useState(false);
  const [isEditProductSheetOpen, setIsEditProductSheetOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [newProductName, setNewProductName] = useState('');
  const [newProductBatchSize, setNewProductBatchSize] = useState(0);

  const inventoryMap = new Map(inventoryData.map(item => [item.id, item]));

  const calculateRecipeCost = (recipe: Ingredient[]) => {
    return recipe.reduce((acc, ingredient) => {
      const item = inventoryMap.get(ingredient.inventoryId);
      const itemCost = item ? item.unitValue * ingredient.quantity : 0;
      return acc + itemCost;
    }, 0);
  };

  const form = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "recipe"
  });

  const handleAddProduct = () => {
    if(!newProductName || newProductBatchSize <= 0) return;
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
    setIsAddProductSheetOpen(false);
  };
  
  const handleEditProductClick = (product: Product) => {
    setEditingProduct(product);
    form.reset({
        ...product,
        recipe: product.recipe || [],
    });
    setIsEditProductSheetOpen(true);
  };

  const onProductSubmit = (values: z.infer<typeof productFormSchema>) => {
    setProducts(prev => prev.map(p => p.id === values.id ? { ...p, ...values } : p));
    setIsEditProductSheetOpen(false);
    setEditingProduct(null);
  };
  
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Fórmulas y Costeo de Materia Prima"
        description="Define las recetas para cada uno de tus productos."
      >
        <Button size="sm" onClick={() => setIsAddProductSheetOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Producto
        </Button>
      </PageHeader>
      
      {products.length > 0 ? (
        <Tabs defaultValue={products[0]?.id || ''} className="w-full">
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
                  <CardHeader className="flex-row items-start justify-between">
                    <div>
                      <CardTitle>{product.name}</CardTitle>
                      <CardDescription>
                        Costeo de materia prima para un lote de producción de {product.batchSize} lbs.
                      </CardDescription>
                    </div>
                     <Button variant="outline" size="sm" onClick={() => handleEditProductClick(product)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar Producto
                      </Button>
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
                            <TableRow key={`${ingredient.inventoryId}-${index}`}>
                              <TableCell className="font-medium">{item?.product || 'N/A'}</TableCell>
                              <TableCell className="text-right">{ingredient.quantity.toFixed(2)} {item?.measure}</TableCell>
                              <TableCell className="text-right">{formatCurrency(item?.unitValue || 0)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(totalValue)}</TableCell>
                            </TableRow>
                          );
                        }) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                              Esta receta aún no tiene ingredientes. Añade el primero.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                  <CardFooter className="flex-col items-end gap-4 sm:flex-row sm:justify-between">
                      <div className="flex-1">
                      </div>
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

      {/* Add Product Sheet */}
      <Sheet open={isAddProductSheetOpen} onOpenChange={setIsAddProductSheetOpen}>
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
                onChange={(e) => setNewProductBatchSize(parseFloat(e.target.value) || 0)}
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

      {/* Edit Product Sheet */}
      <Sheet open={isEditProductSheetOpen} onOpenChange={setIsEditProductSheetOpen}>
        <SheetContent className="sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>Editar Producto y Receta</SheetTitle>
            <SheetDescription>
             Modifica los detalles del producto y gestiona los ingredientes de su receta.
            </SheetDescription>
          </SheetHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onProductSubmit)} className="flex h-[calc(100vh-8rem)] flex-col">
              <div className="space-y-6 py-6 flex-1 overflow-y-auto pr-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Producto</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="batchSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tamaño del Lote (lbs)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div>
                  <h4 className="font-medium mb-2">Ingredientes de la Receta</h4>
                  <div className="space-y-4">
                    {fields.map((field, index) => {
                      const selectedInventoryItem = inventoryData.find(i => i.id === form.watch(`recipe.${index}.inventoryId`));
                      return (
                        <div key={field.id} className="flex items-end gap-2 p-3 border rounded-lg bg-muted/50">
                          <FormField
                            control={form.control}
                            name={`recipe.${index}.inventoryId`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel>Ingrediente</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecciona un ingrediente" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {inventoryData.map(item => (
                                      <SelectItem key={item.id} value={item.id}>
                                        {item.product}
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
                            name={`recipe.${index}.quantity`}
                            render={({ field }) => (
                              <FormItem className="w-32">
                                <FormLabel>Cantidad <span className="text-muted-foreground text-xs">({selectedInventoryItem?.measure})</span></FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.01" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => append({ inventoryId: '', quantity: 1 })}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Añadir Ingrediente
                  </Button>
                </div>
              </div>

              <SheetFooter className="pt-6 border-t mt-auto">
                <SheetClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </SheetClose>
                <Button type="submit">Guardar Cambios</Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>
    </div>
  );
}

    