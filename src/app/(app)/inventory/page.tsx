import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { inventoryData } from "@/lib/data";
import { Download, PlusCircle } from "lucide-react";
import { PageHeader } from "@/components/page-header";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 2 }).format(value);


export default function InventoryPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Inventario de Materia Prima"
        description="Gestiona la lista de precios de tus ingredientes."
      >
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
        <Button size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Ingrediente
        </Button>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Lista de Precios</CardTitle>
          <CardDescription>
            El 'Valor Unitario' es el costo real utilizado en todos los cálculos de recetas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-center">Medida de Compra</TableHead>
                  <TableHead className="text-right">Valor de Compra</TableHead>
                  <TableHead className="text-right font-medium text-primary">Valor Unitario</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventoryData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-center">{item.unit}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.purchaseValue)}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(item.unitValue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
