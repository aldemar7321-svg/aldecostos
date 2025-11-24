
'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Ingredient, Product, PackagingItem } from '@/lib/types';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, Edit } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
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
} from '@/components/ui/select';
import { useAppData } from '@/app/(app)/layout';
import { useSearchParams } from 'next/navigation';


const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 2,
  }).format(value);

const productFormSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'El nombre es requerido.'),
  batchSize: z.coerce
    .number()
    .positive('El tamaño del lote debe ser positivo.'),
  batchUnit: z.string().min(1, 'La unidad del lote es requerida.'),
  recipe: z.array(
    z.object({
      inventoryId: z.string().min(1, 'Debes seleccionar un ingrediente.'),
      quantity: z.coerce.number().positive('La cantidad debe ser positiva.'),
    })
  ),
  packaging: z.array(
    z.object({
      packagingId: z.string().min(1, 'Debes seleccionar un empaque.'),
      quantity: z.coerce.number().positive('La cantidad debe ser positiva.'),
    })
  ),
  laborProcesses: z.array(
    z.object({
      id: z.string(),
      name: z.string().min(1, 'El nombre del proceso es requerido.'),
      time: z.coerce.number().positive('El tiempo debe ser positivo.'),
      timeUnit: z.enum(['minutos', 'horas']),
      operators: z.coerce.number().int().positive('Debe haber al menos un operario.'),
    })
  ),
});

const RecipesContent = () => {
  const { products, inventory, packaging, addProduct, updateProduct } = useAppData();
  const [isAddProductSheetOpen, setIsAddProductSheetOpen] = useState(false);
  const [isEditProductSheetOpen, setIsEditProductSheetOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const searchParams = useSearchParams();
  const productIdFromQuery = searchParams.get('product');

  const [activeTab, setActiveTab] = useState(productIdFromQuery || products[0]?.id || '');
  
  useEffect(() => {
    if (productIdFromQuery && products.some(p => p.id === productIdFromQuery)) {
        setActiveTab(productIdFromQuery);
        const productToEdit = products.find(p => p.id === productIdFromQuery);
        if (productToEdit && !isEditProductSheetOpen) {
            handleEditProductClick(productToEdit);
        }
    }
  }, [productIdFromQuery, products]);

  useEffect(() => {
    if(!activeTab && products.length > 0) {
      setActiveTab(products[0].id);
    }
  }, [products, activeTab]);

  const [newProductName, setNewProductName] = useState('');
  const [newProductBatchSize, setNewProductBatchSize] = useState(0);
  const [newProductBatchUnit, setNewProductBatchUnit] = useState('unid.');


  const inventoryMap = new Map(inventory.map((item) => [item.id, item]));
  const packagingMap = new Map(packaging.map((item) => [item.id, item]));
  const batchUnits = ['kg', 'g', 'lb', 'oz', 'unid.', 'l', 'ml', 'cc'];


  const calculateRecipeCost = (recipe: Ingredient[]) => {
    return recipe.reduce((acc, ingredient) => {
      const item = inventoryMap.get(ingredient.inventoryId);
      const itemCost = item ? item.unitValue * ingredient.quantity : 0;
      return acc + itemCost;
    }, 0);
  };
  
  const calculatePackagingCost = (packagingItems: PackagingItem[]) => {
    return (packagingItems || []).reduce((acc, packagingItem) => {
      const item = packagingMap.get(packagingItem.packagingId);
      const itemCost = item ? item.unitValue * packagingItem.quantity : 0;
      return acc + itemCost;
    }, 0);
  };

  const form = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
  });

  const { fields: recipeFields, append: appendRecipe, remove: removeRecipe } = useFieldArray({
    control: form.control,
    name: 'recipe',
  });

  const { fields: packagingFields, append: appendPackaging, remove: removePackaging } = useFieldArray({
    control: form.control,
    name: 'packaging',
  });
  
  const { fields: laborFields, append: appendLabor, remove: removeLabor } = useFieldArray({
    control: form.control,
    name: 'laborProcesses',
  });

  const handleAddProduct = () => {
    if (!newProductName || newProductBatchSize <= 0 || !newProductBatchUnit) return;
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: newProductName,
      batchSize: newProductBatchSize,
      batchUnit: newProductBatchUnit,
      recipe: [],
      packaging: [],
      laborProcesses: [],
    };
    addProduct(newProduct);
    setNewProductName('');
    setNewProductBatchSize(0);
    setNewProductBatchUnit('unid.');
    setIsAddProductSheetOpen(false);
    setActiveTab(newProduct.id);
  };

  const handleEditProductClick = (product: Product) => {
    setEditingProduct(product);
    form.reset({
      ...product,
      recipe: product.recipe || [],
      packaging: product.packaging || [],
      laborProcesses: product.laborProcesses || [],
    });
    setIsEditProductSheetOpen(true);
  };

  const onProductSubmit = (values: z.infer<typeof productFormSchema>) => {
    if (editingProduct) {
        const updatedProductData: Product = {
            ...editingProduct,
            name: values.name,
            batchSize: values.batchSize,
            batchUnit: values.batchUnit,
            recipe: values.recipe,
            packaging: values.packaging,
            laborProcesses: values.laborProcesses,
          };
        updateProduct(updatedProductData);
    }
    setIsEditProductSheetOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Fórmulas y Costeo de Materia Prima y Empaques"
        description="Define las recetas y empaques para cada uno de tus productos."
      >
        <Button size="sm" onClick={() => setIsAddProductSheetOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Producto
        </Button>
      </PageHeader>

      {products.length > 0 ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:w-fit">
            {products.map((product) => (
              <TabsTrigger key={product.id} value={product.id}>
                {product.name}
              </TabsTrigger>
            ))}
          </TabsList>
          {products.map((product) => {
            const totalRecipeCost = calculateRecipeCost(product.recipe);
            const totalPackagingCost = calculatePackagingCost(product.packaging);
            const totalDirectCost = totalRecipeCost + totalPackagingCost;
            const unitCost =
              product.batchSize > 0 ? totalDirectCost / product.batchSize : 0;

            return (
              <TabsContent key={product.id} value={product.id}>
                <Card>
                  <CardHeader className="flex-row items-start justify-between">
                    <div>
                      <CardTitle>{product.name}</CardTitle>
                      <CardDescription>
                        Costeo de materia prima y empaque para un lote de producción de{' '}
                        {product.batchSize} {product.batchUnit}.
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditProductClick(product)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Editar Producto
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-medium text-lg mb-2">Materia Prima</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Ingrediente</TableHead>
                            <TableHead className="text-right">
                              Cantidad
                            </TableHead>
                            <TableHead className="text-right">
                              Valor Unitario
                            </TableHead>
                            <TableHead className="text-right">
                              Valor Total
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {product.recipe.length > 0 ? (
                            product.recipe.map((ingredient, index) => {
                              const item = inventoryMap.get(
                                ingredient.inventoryId
                              );
                              const totalValue = item
                                ? item.unitValue * ingredient.quantity
                                : 0;
                              return (
                                <TableRow
                                  key={`${ingredient.inventoryId}-${index}`}
                                >
                                  <TableCell className="font-medium">
                                    {item?.product || 'N/A'}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {ingredient.quantity.toFixed(2)}{' '}
                                    {item?.measure}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {formatCurrency(item?.unitValue || 0)}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {formatCurrency(totalValue)}
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={4}
                                className="text-center text-muted-foreground py-8"
                              >
                                Esta receta aún no tiene ingredientes. Edita el producto para añadirlos.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    <div>
                      <h4 className="font-medium text-lg mb-2">Material de Empaque</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Material</TableHead>
                            <TableHead className="text-right">
                              Cantidad
                            </TableHead>
                            <TableHead className="text-right">
                              Valor Unitario
                            </TableHead>
                            <TableHead className="text-right">
                              Valor Total
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {product.packaging && product.packaging.length > 0 ? (
                            product.packaging.map((pkgItem, index) => {
                              const item = packagingMap.get(
                                pkgItem.packagingId
                              );
                              const totalValue = item
                                ? item.unitValue * pkgItem.quantity
                                : 0;
                              return (
                                <TableRow
                                  key={`${pkgItem.packagingId}-${index}`}
                                >
                                  <TableCell className="font-medium">
                                    {item?.product || 'N/A'}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {pkgItem.quantity.toFixed(2)}{' '}
                                    {item?.measure}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {formatCurrency(item?.unitValue || 0)}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {formatCurrency(totalValue)}
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={4}
                                className="text-center text-muted-foreground py-8"
                              >
                                Este producto no tiene empaques asignados.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                  <CardFooter className="flex-col items-end gap-4 sm:flex-row sm:justify-between">
                    <div className="flex-1"></div>
                    <div className="flex flex-col items-end">
                      <p className="text-muted-foreground">
                        Costo Directo Total del Lote:
                      </p>
                      <p className="text-xl font-bold">
                        {formatCurrency(totalDirectCost)}
                      </p>
                    </div>
                    <div className="h-12 w-px bg-border hidden sm:block mx-4"></div>
                    <div className="flex flex-col items-end">
                      <p className="text-muted-foreground">
                        Costo Directo Unitario (por {product.batchUnit}):
                      </p>
                      <p className="text-xl font-bold">
                        {formatCurrency(unitCost)}
                      </p>
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
      <Sheet
        open={isAddProductSheetOpen}
        onOpenChange={setIsAddProductSheetOpen}
      >
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
            <div className='grid grid-cols-2 gap-4'>
                <div className="space-y-2">
                <Label htmlFor="batch-size">Tamaño del Lote</Label>
                <Input
                    id="batch-size"
                    type="number"
                    value={newProductBatchSize}
                    onChange={(e) =>
                    setNewProductBatchSize(parseFloat(e.target.value) || 0)
                    }
                />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="batch-unit">Unidad</Label>
                    <Select value={newProductBatchUnit} onValueChange={setNewProductBatchUnit}>
                        <SelectTrigger id="batch-unit">
                            <SelectValue placeholder="Selecciona" />
                        </SelectTrigger>
                        <SelectContent>
                            {batchUnits.map((unit) => (
                                <SelectItem key={unit} value={unit}>
                                    {unit}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
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
      <Sheet
        open={isEditProductSheetOpen}
        onOpenChange={setIsEditProductSheetOpen}
      >
        <SheetContent className="sm:max-w-3xl">
          <SheetHeader>
            <SheetTitle>Editar Producto y Receta</SheetTitle>
            <SheetDescription>
              Modifica los detalles del producto y gestiona los ingredientes y empaques.
            </SheetDescription>
          </SheetHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onProductSubmit)}
              className="flex h-[calc(100vh-8rem)] flex-col"
            >
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
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="batchSize"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Tamaño del Lote</FormLabel>
                        <FormControl>
                            <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                        control={form.control}
                        name="batchUnit"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Unidad</FormLabel>
                                <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                >
                                <FormControl>
                                    <SelectTrigger>
                                    <SelectValue placeholder="Selecciona una unidad" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {batchUnits.map((unit) => (
                                    <SelectItem key={unit} value={unit}>
                                        {unit}
                                    </SelectItem>
                                    ))}
                                </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div>
                  <h4 className="font-medium mb-2">
                    Ingredientes de la Receta
                  </h4>
                  <div className="space-y-4">
                    {recipeFields.map((field, index) => {
                      const selectedInventoryItem = inventory.find(
                        (i) => i.id === form.watch(`recipe.${index}.inventoryId`)
                      );
                      return (
                        <div
                          key={field.id}
                          className="flex items-end gap-2 p-3 border rounded-lg bg-muted/50"
                        >
                          <FormField
                            control={form.control}
                            name={`recipe.${index}.inventoryId`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel>Ingrediente</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecciona un ingrediente" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {inventory.map((item) => (
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
                                <FormLabel>
                                  Cantidad{' '}
                                  <span className="text-muted-foreground text-xs">
                                    ({selectedInventoryItem?.measure})
                                  </span>
                                </FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.01" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeRecipe(index)}
                          >
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
                    onClick={() => appendRecipe({ inventoryId: '', quantity: 1 })}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Añadir Ingrediente
                  </Button>
                </div>

                <div className='mt-6'>
                  <h4 className="font-medium mb-2">
                    Material de Empaque
                  </h4>
                  <div className="space-y-4">
                    {packagingFields.map((field, index) => {
                      const selectedPackagingItem = packaging.find(
                        (i) => i.id === form.watch(`packaging.${index}.packagingId`)
                      );
                      return (
                        <div
                          key={field.id}
                          className="flex items-end gap-2 p-3 border rounded-lg bg-muted/50"
                        >
                          <FormField
                            control={form.control}
                            name={`packaging.${index}.packagingId`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel>Empaque</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecciona un empaque" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {packaging.map((item) => (
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
                            name={`packaging.${index}.quantity`}
                            render={({ field }) => (
                              <FormItem className="w-32">
                                <FormLabel>
                                  Cantidad{' '}
                                  <span className="text-muted-foreground text-xs">
                                    ({selectedPackagingItem?.measure})
                                  </span>
                                </FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.01" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removePackaging(index)}
                          >
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
                    onClick={() => appendPackaging({ packagingId: '', quantity: 1 })}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Añadir Empaque
                  </Button>
                </div>
                
                <div className='mt-6'>
                  <h4 className="font-medium mb-2">
                    Procesos de Producción (Mano de Obra)
                  </h4>
                  <div className="space-y-4">
                    {laborFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="grid grid-cols-12 items-end gap-2 p-3 border rounded-lg bg-muted/50"
                      >
                        <FormField
                          control={form.control}
                          name={`laborProcesses.${index}.name`}
                          render={({ field }) => (
                            <FormItem className="col-span-12 sm:col-span-5">
                              <FormLabel>Proceso</FormLabel>
                              <FormControl>
                                <Input placeholder="Ej: Mezcla" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`laborProcesses.${index}.time`}
                          render={({ field }) => (
                            <FormItem className="col-span-4 sm:col-span-2">
                              <FormLabel>Tiempo</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`laborProcesses.${index}.timeUnit`}
                          render={({ field }) => (
                            <FormItem className="col-span-4 sm:col-span-2">
                              <FormLabel>Unidad</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                <SelectContent>
                                  <SelectItem value="minutos">minutos</SelectItem>
                                  <SelectItem value="horas">horas</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`laborProcesses.${index}.operators`}
                          render={({ field }) => (
                            <FormItem className="col-span-3 sm:col-span-2">
                              <FormLabel>Operarios</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="col-span-1 flex justify-end">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeLabor(index)}
                            >
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => appendLabor({ id: `lp-${Date.now()}`, name: '', time: 0, timeUnit: 'minutos', operators: 1 })}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Añadir Proceso
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
};

export default function RecipesPage() {
    return <RecipesContent />;
}
