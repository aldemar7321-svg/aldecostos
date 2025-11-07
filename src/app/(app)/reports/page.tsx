'use client';

import { useState } from 'react';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { inventoryData, productsData, laborSettingsData, overheadData } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import type { Product } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 2 }).format(value);

const formatPercentage = (value: number) =>
  new Intl.NumberFormat('es-CO', { style: 'percent', minimumFractionDigits: 2 }).format(value);


const inventoryMap = new Map(inventoryData.map(item => [item.id, item]));

// Pre-calculate rates
const hourRate = laborSettingsData.totalMonthlyHours > 0 ? laborSettingsData.monthlyCost / laborSettingsData.totalMonthlyHours : 0;
const totalCIF = overheadData.reduce((acc, item) => acc + item.monthlyValue * item.productionPercentage, 0);
const cifRate = laborSettingsData.totalMonthlyHours > 0 ? totalCIF / laborSettingsData.totalMonthlyHours : 0;

export default function ReportsPage() {
  const [selectedProductId, setSelectedProductId] = useState<string>(productsData[0]?.id || '');
  const [profitPercentage, setProfitPercentage] = useState(0.3); // Default 30%
  const selectedProduct = productsData.find(p => p.id === selectedProductId);

  const calculateCosts = (product: Product | undefined) => {
    if (!product) {
      return { rawMaterialCost: 0, laborCost: 0, overheadCost: 0, totalCost: 0, unitCost: 0, salePrice: 0, profitPerUnit: 0 };
    }

    const rawMaterialCost = product.recipe.reduce((acc, ingredient) => {
      const item = inventoryMap.get(ingredient.inventoryId);
      return acc + (item ? item.unitValue * ingredient.quantity : 0);
    }, 0);

    const totalLaborHours = product.laborProcesses.reduce((acc, process) => {
      const timeInHours = process.timeUnit === 'minutos' ? process.time / 60 : process.time;
      return acc + timeInHours * process.operators;
    }, 0);
    const laborCost = totalLaborHours * hourRate;

    const overheadCost = totalLaborHours * cifRate;

    const totalCost = rawMaterialCost + laborCost + overheadCost;
    const unitCost = product.batchSize > 0 ? totalCost / product.batchSize : 0;

    const salePrice = profitPercentage < 1 ? unitCost / (1 - profitPercentage) : unitCost;
    const profitPerUnit = salePrice - unitCost;

    return { rawMaterialCost, laborCost, overheadCost, totalCost, unitCost, salePrice, profitPerUnit };
  };

  const { rawMaterialCost, laborCost, overheadCost, totalCost, unitCost, salePrice, profitPerUnit } = calculateCosts(selectedProduct);
  
  const handleExportCsv = () => {
    const headers = ["Componente de Costo", "Costo del Lote", "Costo Unitario"];
    const data = [
      ["Materia Prima", rawMaterialCost],
      ["Mano de Obra", laborCost],
      ["Costos Indirectos de Fabricación (CIF)", overheadCost],
      ["Costo Total del Lote (CTP)", totalCost],
      ["Costo Unitario de Producción (por lb)", unitCost],
      ["Porcentaje de Rentabilidad", formatPercentage(profitPercentage)],
      ["Precio de Venta Sugerido (por lb)", salePrice],
      ["Utilidad por Unidad (por lb)", profitPerUnit],
    ];

    const csvContent = [
      headers.join(','),
      ...data.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `reporte_${selectedProduct?.name.replace(/ /g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleExportPdf = () => {
    if(!selectedProduct) return;

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text("ProdCost Pro", 14, 22);
    doc.setFontSize(12);
    doc.text("Reporte de Costo de Producción", 14, 30);

    // Product Info
    doc.setFontSize(14);
    doc.text(`Producto: ${selectedProduct.name}`, 14, 45);
    doc.setFontSize(10);
    doc.text(`Tamaño del Lote: ${selectedProduct.batchSize} lbs`, 14, 52);

    // Cost Table
    autoTable(doc, {
      startY: 60,
      head: [['Componente de Costo', 'Costo del Lote']],
      body: [
        ['Materia Prima', formatCurrency(rawMaterialCost)],
        ['Mano de Obra', formatCurrency(laborCost)],
        ['Costos Indirectos de Fabricación (CIF)', formatCurrency(overheadCost)],
      ],
      foot: [
        [{ content: 'Costo Total del Lote (CTP)', styles: { fontStyle: 'bold' } }, { content: formatCurrency(totalCost), styles: { fontStyle: 'bold' } }],
      ],
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    let finalY = (doc as any).lastAutoTable.finalY + 10;

    // Pricing Table
    autoTable(doc, {
      startY: finalY,
      head: [['Precio y Rentabilidad', 'Valor por Unidad (lb)']],
      body: [
          ['Costo Unitario de Producción', formatCurrency(unitCost)],
          ['Margen de Rentabilidad Deseado', formatPercentage(profitPercentage)],
          ['Utilidad Estimada por Unidad', formatCurrency(profitPerUnit)],
      ],
       foot: [
        [{ content: 'Precio de Venta Sugerido', styles: { fontStyle: 'bold' } }, { content: formatCurrency(salePrice), styles: { fontStyle: 'bold' } }],
      ],
      theme: 'striped',
      headStyles: { fillColor: [22, 163, 74] }
    });


    doc.save(`reporte_${selectedProduct.name.replace(/ /g, '_')}.pdf`);
  };


  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Resultados y Consolidación"
        description="Visualiza el costo total de producción y define tu precio de venta."
      >
        <Button variant="outline" size="sm" onClick={handleExportCsv}>
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
         <Button size="sm" onClick={handleExportPdf}>
          <FileText className="mr-2 h-4 w-4" />
          Generar PDF
        </Button>
      </PageHeader>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="product-select" className="shrink-0">Seleccionar Producto:</Label>
          <Select value={selectedProductId} onValueChange={setSelectedProductId}>
            <SelectTrigger id="product-select" className="w-full sm:w-[250px]">
              <SelectValue placeholder="Seleccionar producto" />
            </SelectTrigger>
            <SelectContent>
              {productsData.map(product => (
                <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedProduct && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
              <CardHeader>
              <CardTitle>Costo Total de Producción (CTP): {selectedProduct.name}</CardTitle>
              <CardDescription>
                  Costo consolidado para un lote de {selectedProduct.batchSize} lbs.
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
                      <TableCell className="text-right">{formatCurrency(rawMaterialCost)}</TableCell>
                  </TableRow>
                  <TableRow>
                      <TableCell className="font-medium">Mano de Obra</TableCell>
                      <TableCell className="text-right">{formatCurrency(laborCost)}</TableCell>
                  </TableRow>
                  <TableRow>
                      <TableCell className="font-medium">Costos Indirectos de Fabricación (CIF)</TableCell>
                      <TableCell className="text-right">{formatCurrency(overheadCost)}</TableCell>
                  </TableRow>
                  <TableRow className="bg-muted/50">
                      <TableHead>Costo Total del Lote (CTP)</TableHead>
                      <TableHead className="text-right font-bold text-lg">{formatCurrency(totalCost)}</TableHead>
                  </TableRow>
                  </TableBody>
              </Table>
              </CardContent>
              <CardFooter className="justify-end">
              <div className="flex flex-col items-end">
                  <p className="text-muted-foreground">Costo Unitario de Producción (por lb):</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(unitCost)}</p>
              </div>
              </CardFooter>
          </Card>
           <Card className="border-green-600">
              <CardHeader>
                <CardTitle className="text-green-700">Precio de Venta Sugerido</CardTitle>
                <CardDescription>
                    Cálculo del precio final basado en tu margen de rentabilidad.
                </CardDescription>
              </Header>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Concepto</TableHead>
                      <TableHead className="text-right">Valor por Unidad (lb)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Costo Unitario de Producción</TableCell>
                      <TableCell className="text-right">{formatCurrency(unitCost)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Margen de Rentabilidad Deseado</TableCell>
                      <TableCell className="text-right">
                         <div className="flex items-center justify-end gap-2">
                            <Input 
                              id="profit-percentage"
                              type="number"
                              value={profitPercentage * 100}
                              onChange={e => setProfitPercentage(parseFloat(e.target.value) / 100)}
                              className="w-20 h-8 text-right"
                              placeholder="Ej: 30"
                            />
                            <span>%</span>
                         </div>
                      </TableCell>
                    </TableRow>
                     <TableRow>
                      <TableCell>Utilidad Estimada por Unidad</TableCell>
                      <TableCell className="text-right">{formatCurrency(profitPerUnit)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="justify-end bg-green-50/50 rounded-b-lg">
                <div className="flex flex-col items-end">
                  <p className="text-muted-foreground">Precio de Venta Sugerido (por lb):</p>
                  <p className="text-2xl font-bold text-green-700">{formatCurrency(salePrice)}</p>
                </div>
              </CardFooter>
            </Card>
        </div>
      )}
    </div>
  );
}
