'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Download, FileText, Edit } from 'lucide-react';
import type { Product, IndirectCostItem } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAppData } from '@/app/(app)/layout';
import Link from 'next/link';


const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 2,
  }).format(value);

const formatPercentage = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'percent',
    minimumFractionDigits: 2,
  }).format(value);

const ReportsContent = () => {
  const { products, inventory, packaging, laborSettings, overhead, transport, capital } = useAppData();
  const [selectedProductId, setSelectedProductId] = useState<string>(
    products[0]?.id || ''
  );
  const [profitPercentage, setProfitPercentage] = useState(0.3); // Default 30%
  const [controlNumber, setControlNumber] = useState('');
  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const inventoryMap = new Map(inventory.map((item) => [item.id, item]));
  const packagingMap = new Map(packaging.map((item) => [item.id, item]));

  const calculateCosts = (product: Product | undefined) => {
    if (!product) {
      return {
        ingredientsCost: 0,
        packagingCost: 0,
        laborCost: 0,
        overheadCost: 0,
        transportCost: 0,
        capitalCost: 0,
        totalCost: 0,
        unitCost: 0,
        salePrice: 0,
        profitPerUnit: 0,
      };
    }
    
    const ingredientsCost = (product.ingredients || []).reduce((acc, ing) => {
      const item = inventoryMap.get(ing.ingredientId);
      return acc + (item ? item.unitValue * ing.quantity : 0);
    }, 0);

    const packagingCost = (product.packaging || []).reduce((acc, pkg) => {
      const item = packagingMap.get(pkg.packagingId);
      return acc + (item ? item.unitValue * pkg.quantity : 0);
    }, 0);

    const totalLaborHours = (product.laborProcesses || []).reduce((acc, process) => {
      const timeInHours =
        process.timeUnit === 'minutos' ? process.time / 60 : process.time;
      return acc + timeInHours * process.operators;
    }, 0);

    const hourRate =
      laborSettings.totalMonthlyHours > 0
        ? laborSettings.monthlyCost / laborSettings.totalMonthlyHours
        : 0;
    const laborCost = totalLaborHours * hourRate;

    const calculateIndirectCost = (items: IndirectCostItem[], totalMaterialCostForProduct: number) => {
      const totalDirectCostsOfAllProducts = products.reduce((sum, p) => {
          const pIngredientsCost = (p.ingredients || []).reduce((acc, ing) => {
            const item = inventoryMap.get(ing.ingredientId);
            return acc + (item ? item.unitValue * ing.quantity : 0);
          }, 0);
          return sum + pIngredientsCost;
      }, 0);

      const totalUnitsOfAllProducts = products.reduce((sum, p) => sum + p.batchSize, 0) || 1;


      return items.reduce((acc, item) => {
        const productionCost = item.monthlyValue * item.productionPercentage;
        let itemCost = 0;
        switch(item.allocationBasis) {
          case 'labor':
            const rate = laborSettings.totalMonthlyHours > 0 ? productionCost / laborSettings.totalMonthlyHours : 0;
            itemCost = totalLaborHours * rate;
            break;
          case 'material':
            if (totalDirectCostsOfAllProducts > 0) {
                const materialRate = productionCost / totalDirectCostsOfAllProducts;
                itemCost = totalMaterialCostForProduct * materialRate;
            } else {
                itemCost = 0;
            }
            break;
          case 'units':
             const unitRate = productionCost / totalUnitsOfAllProducts;
             itemCost = product.batchSize * unitRate;
            break;
        }
        return acc + itemCost;
      }, 0);
    };

    const overheadCost = calculateIndirectCost(overhead, ingredientsCost);
    const transportCost = calculateIndirectCost(transport, ingredientsCost);
    const capitalCost = calculateIndirectCost(capital, ingredientsCost);
    
    const totalCost = ingredientsCost + packagingCost + laborCost + overheadCost + transportCost + capitalCost;
    const unitCost = product.batchSize > 0 ? totalCost / product.batchSize : 0;

    const salePrice = profitPercentage < 1 ? unitCost / (1 - profitPercentage) : unitCost;
    const profitPerUnit = salePrice - unitCost;

    return {
      ingredientsCost,
      packagingCost,
      laborCost,
      overheadCost,
      transportCost,
      capitalCost,
      totalCost,
      unitCost,
      salePrice,
      profitPerUnit,
    };
  };

  const {
    ingredientsCost,
    packagingCost,
    laborCost,
    overheadCost,
    transportCost,
    capitalCost,
    totalCost,
    unitCost,
    salePrice,
    profitPerUnit,
  } = calculateCosts(selectedProduct);

  const handleExportCsv = () => {
    if (!selectedProduct) return;
    const headers = ['Componente de Costo', 'Costo del Lote', 'Costo Unitario'];
    const data = [
      ['Materia Prima', ingredientsCost, ingredientsCost/selectedProduct.batchSize],
      ['Material de Empaque', packagingCost, packagingCost/selectedProduct.batchSize],
      ['Mano de Obra', laborCost, laborCost/selectedProduct.batchSize],
      ['Costos Indirectos de Fabricación (CIF)', overheadCost, overheadCost/selectedProduct.batchSize],
      ['Transporte', transportCost, transportCost/selectedProduct.batchSize],
      ['Inversión de Capital', capitalCost, capitalCost/selectedProduct.batchSize],
      ['Costo Total del Lote (CTP)', totalCost, ''],
      [`Costo Unitario de Producción (por ${selectedProduct.batchUnit})`, '', unitCost],
      ['Porcentaje de Rentabilidad', '', formatPercentage(profitPercentage)],
      [`Precio de Venta Sugerido (por ${selectedProduct.batchUnit})`, '', salePrice],
      [`Utilidad por Unidad (por ${selectedProduct.batchUnit})`, '', profitPerUnit],
    ];

    const csvContent = [
      headers.join(','),
      ...data.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    const fileName = `reporte_${selectedProduct.name.replace(/ /g, '_')}${controlNumber ? `_control_${controlNumber}` : ''}.csv`;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPdf = () => {
    if (!selectedProduct) return;

    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text('ProdCost Pro', 14, 22);
    doc.setFontSize(12);
    doc.text('Reporte de Costo de Producción', 14, 30);

    // Product Info
    doc.setFontSize(14);
    doc.text(`Producto: ${selectedProduct.name}`, 14, 45);
    doc.setFontSize(10);
    doc.text(`Tamaño del Lote: ${selectedProduct.batchSize} ${selectedProduct.batchUnit}`, 14, 52);
    if (controlNumber) {
        doc.text(`Número de Control: ${controlNumber}`, 14, 59);
    }

    // Cost Table
    autoTable(doc, {
      startY: 65,
      head: [['Componente de Costo', 'Costo del Lote']],
      body: [
        ['Materia Prima', formatCurrency(ingredientsCost)],
        ['Material de Empaque', formatCurrency(packagingCost)],
        ['Mano de Obra', formatCurrency(laborCost)],
        ['Costos Indirectos de Fabricación (CIF)', formatCurrency(overheadCost)],
        ['Transporte', formatCurrency(transportCost)],
        ['Inversión de Capital', formatCurrency(capitalCost)],
      ],
      foot: [
        [
          {
            content: 'Costo Total del Lote (CTP)',
            styles: { fontStyle: 'bold' },
          },
          { content: formatCurrency(totalCost), styles: { fontStyle: 'bold' } },
        ],
      ],
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] },
    });

    let finalY = (doc as any).lastAutoTable.finalY + 10;

    // Pricing Table
    autoTable(doc, {
      startY: finalY,
      head: [[`Precio y Rentabilidad`, `Valor por Unidad (${selectedProduct.batchUnit})`]],
      body: [
        ['Costo Unitario de Producción', formatCurrency(unitCost)],
        ['Margen de Rentabilidad Deseado', formatPercentage(profitPercentage)],
        ['Utilidad Estimada por Unidad', formatCurrency(profitPerUnit)],
      ],
      foot: [
        [
          {
            content: 'Precio de Venta Sugerido',
            styles: { fontStyle: 'bold' },
          },
          {
            content: formatCurrency(salePrice),
            styles: { fontStyle: 'bold' },
          },
        ],
      ],
      theme: 'striped',
      headStyles: { fillColor: [22, 163, 74] },
    });
    
    const fileName = `reporte_${selectedProduct.name.replace(/ /g, '_')}${controlNumber ? `_control_${controlNumber}` : ''}.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Resultados y Consolidación"
        description="Visualiza el costo total de producción y define tu precio de venta."
      >
        <Button variant="outline" size="sm" onClick={handleExportCsv}>
          <Download className="mr-2 h-4 w-4" />
          Guardar como CSV
        </Button>
        <Button size="sm" onClick={handleExportPdf}>
          <FileText className="mr-2 h-4 w-4" />
          Guardar como PDF
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="flex items-center gap-2">
          <Label htmlFor="product-select" className="shrink-0">
            Producto:
          </Label>
          <Select
            value={selectedProductId}
            onValueChange={setSelectedProductId}
          >
            <SelectTrigger id="product-select" className="w-full sm:w-[250px]">
              <SelectValue placeholder="Seleccionar producto" />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
            <Label htmlFor="control-number" className="shrink-0">
                N° de Control:
            </Label>
            <Input
                id="control-number"
                value={controlNumber}
                onChange={(e) => setControlNumber(e.target.value)}
                className="w-full sm:w-[200px]"
                placeholder="Ej: 001-A"
            />
        </div>
        <div className='flex md:justify-end'>
            <Button asChild variant="outline" size="sm">
                <Link href={`/recipes?product=${selectedProductId}`}>
                    <Edit className="mr-2 h-4 w-4" /> Editar Producto y Fórmula
                </Link>
            </Button>
        </div>
      </div>

      {selectedProduct && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>
                Costo Total de Producción (CTP): {selectedProduct.name}
              </CardTitle>
              <CardDescription>
                Costo consolidado para un lote de {selectedProduct.batchSize}{' '}
                {selectedProduct.batchUnit}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Componente de Costo</TableHead>
                    <TableHead className="text-right">Costo del Lote</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                   <TableRow>
                    <TableCell className="font-medium">Materia Prima</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(ingredientsCost)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Material de Empaque</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(packagingCost)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Mano de Obra</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(laborCost)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      Costos Indirectos de Fabricación (CIF)
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(overheadCost)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      Transporte
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(transportCost)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      Inversión de Capital
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(capitalCost)}
                    </TableCell>
                  </TableRow>
                  <TableRow className="bg-muted/50">
                    <TableHead>Costo Total del Lote (CTP)</TableHead>
                    <TableHead className="text-right font-bold text-lg">
                      {formatCurrency(totalCost)}
                    </TableHead>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="justify-end">
              <div className="flex flex-col items-end">
                <p className="text-muted-foreground">
                  Costo Unitario de Producción (por {selectedProduct.batchUnit}):
                </p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(unitCost)}
                </p>
              </div>
            </CardFooter>
          </Card>
          <Card className="border-accent">
            <CardHeader>
              <CardTitle className="text-accent-foreground">
                Precio de Venta Sugerido
              </CardTitle>
              <CardDescription>
                Cálculo del precio final basado en tu margen de rentabilidad.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Concepto</TableHead>
                    <TableHead className="text-right">
                      Valor por Unidad ({selectedProduct.batchUnit})
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Costo Unitario de Producción</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(unitCost)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      Margen de Rentabilidad Deseado
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Input
                          id="profit-percentage"
                          type="number"
                          value={profitPercentage * 100}
                          onChange={(e) =>
                            setProfitPercentage(
                              parseFloat(e.target.value) / 100
                            )
                          }
                          className="w-24 h-8 text-right"
                          placeholder="Ej: 30"
                        />
                        <span>%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Utilidad Estimada por Unidad</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(profitPerUnit)}
                    </TableCell>                  
                  </TableRow>
                </TableBody>
              </Table>
            </CardFooter>
            <CardFooter className="justify-end bg-accent/10 rounded-b-lg">
              <div className="flex flex-col items-end">
                <p className="text-muted-foreground">
                  Precio de Venta Sugerido (por {selectedProduct.batchUnit}):
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(salePrice)}
                </p>
              </div>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};


export default function ReportsPage() {
    return <ReportsContent />;
}
