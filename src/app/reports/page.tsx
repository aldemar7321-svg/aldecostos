'use client';
import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { useAppData } from '@/app/layout';
import { exportRecipeToDisk } from '@/app/actions/export';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type {
  Product,
  PriceList,
  IngredientItem,
  PackagingItem,
  LaborProcess,
  OverheadItem,
  TransportItem,
  CapitalItem,
} from '@/lib/types';


// Extend the jsPDF interface to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

function ReportsContent() {
  const {
    products,
    inventory,
    packaging,
    laborSettings,
    overhead,
    transport,
    capital,
  } = useAppData();
  
  const searchParams = useSearchParams();
  const queryProductId = searchParams.get('productId');

  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    queryProductId || (products.length > 0 ? products[0].id : null)
  );

  useEffect(() => {
    if (queryProductId) setSelectedProductId(queryProductId);
  }, [queryProductId]);

  const dataMap = <T extends { id: string }>(arr: T[]): Map<string, T> => {
    return new Map(arr.map((item) => [item.id, item]));
  };

  const inventoryMap = useMemo(() => dataMap(inventory), [inventory]);
  const packagingMap = useMemo(() => dataMap(packaging), [packaging]);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId),
    [products, selectedProductId]
  );

  const costSheet = useMemo(() => {
    if (!selectedProduct) return null;

    const safeLaborSettings = laborSettings || { monthlyCost: 0, totalMonthlyHours: 1, workHoursPerDay: 8 };

    const {
      batchSize,
      ingredients,
      packaging,
      laborProcesses,
    } = selectedProduct;

    // 1. Material Cost
    const materialDetails = (ingredients || []).map((item: IngredientItem) => {
      const material = inventoryMap.get(item.ingredientId);
      const cost = material ? material.unitValue * item.quantity : 0;
      return {
        name: material?.product || 'Desconocido',
        quantity: item.quantity,
        unit: material?.measure || '',
        unitCost: material?.unitValue || 0,
        totalCost: cost,
      };
    });
    const totalMaterialCost = materialDetails.reduce(
      (sum, item) => sum + item.totalCost,
      0
    );

    // 2. Packaging Cost
    const packagingDetails = (packaging || []).map((item: PackagingItem) => {
      const pkg = packagingMap.get(item.packagingId);
      const cost = pkg ? pkg.unitValue * item.quantity : 0;
      return {
        name: pkg?.product || 'Desconocido',
        quantity: item.quantity,
        unit: pkg?.measure || '',
        unitCost: pkg?.unitValue || 0,
        totalCost: cost,
      };
    });
    const totalPackagingCost = packagingDetails.reduce(
      (sum, item) => sum + item.totalCost,
      0
    );

    // 3. Labor Cost
    const costPerHour = safeLaborSettings.monthlyCost / safeLaborSettings.totalMonthlyHours;
    const laborDetails = (laborProcesses || []).map((proc: LaborProcess) => {
      const timeInHours = proc.timeUnit === 'minutos' ? proc.time / 60 : proc.time;
      const cost = timeInHours * proc.operators * costPerHour;
      return {
        name: proc.name,
        time: proc.time,
        unit: proc.timeUnit,
        operators: proc.operators,
        totalCost: cost,
      };
    });
    const totalLaborCost = laborDetails.reduce(
      (sum, item) => sum + item.totalCost,
      0
    );

    // 4. Indirect Costs (CIF)
    const calculateIndirectCost = (
      items: (OverheadItem | TransportItem | CapitalItem)[]
    ) => {
      return items.reduce((sum, item) => {
        const assignedValue = item.monthlyValue * item.productionPercentage;
        // This is a simplification. A real scenario would require more complex allocation logic.
        // For now, we allocate based on this product's labor cost relative to total direct cost.
        const totalDirectCost = totalMaterialCost + totalLaborCost + totalPackagingCost;
        if (totalDirectCost === 0) return sum;

        let allocationFactor = 0;
        if (item.allocationBasis === 'labor' && totalLaborCost > 0) {
            // A simplified model: assume this batch's labor is a proxy for total labor this month
             allocationFactor = totalLaborCost / (safeLaborSettings.monthlyCost || 1);
        } else if (item.allocationBasis === 'material' && totalMaterialCost > 0) {
            // Simplified: assume this batch's material cost is a fraction of total
            allocationFactor = totalMaterialCost / 10000000; // Assume total monthly material cost
        } else { // units
            // Simplified
             allocationFactor = batchSize / 10000; // Assume total monthly units
        }
        
        return sum + (assignedValue * allocationFactor);

      }, 0);
    };

    const totalOverhead = calculateIndirectCost(overhead);
    const totalTransport = calculateIndirectCost(transport);
    const totalCapital = calculateIndirectCost(capital);
    const totalIndirectCost = totalOverhead + totalTransport + totalCapital;

    const totalBatchCost =
      totalMaterialCost +
      totalPackagingCost +
      totalLaborCost +
      totalIndirectCost;
    const unitCost = totalBatchCost / batchSize;
    const profitMargin = 0.3; // 30%
    const suggestedPrice = unitCost / (1 - profitMargin);

    return {
      productName: selectedProduct.name,
      batchSize: selectedProduct.batchSize,
      batchUnit: selectedProduct.batchUnit,
      materialDetails,
      totalMaterialCost,
      packagingDetails,
      totalPackagingCost,
      laborDetails,
      totalLaborCost,
      indirectCosts: {
        overhead: totalOverhead,
        transport: totalTransport,
        capital: totalCapital,
        total: totalIndirectCost,
      },
      totalBatchCost,
      unitCost,
      suggestedPrice,
    };
  }, [
    selectedProduct,
    inventoryMap,
    packagingMap,
    laborSettings,
    overhead,
    transport,
    capital,
  ]);

  const handleExportPDF = async () => {
    if (!costSheet) return;
    
    const jsPDFModule = await import('jspdf');
    const jsPDF = jsPDFModule.default;
    await import('jspdf-autotable');

    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text(`Ficha de Costo: ${costSheet.productName}`, 14, 22);
    doc.setFontSize(11);
    doc.text(`Lote de Producción: ${costSheet.batchSize} ${costSheet.batchUnit}`, 14, 30);
    
    doc.autoTable({
        startY: 40,
        head: [['Concepto', 'Costo Total Lote', 'Costo Unitario']],
        body: [
            ['Materiales Directos', formatCurrency(costSheet.totalMaterialCost), formatCurrency(costSheet.totalMaterialCost / costSheet.batchSize)],
            ['Empaques', formatCurrency(costSheet.totalPackagingCost), formatCurrency(costSheet.totalPackagingCost / costSheet.batchSize)],
            ['Mano de Obra Directa', formatCurrency(costSheet.totalLaborCost), formatCurrency(costSheet.totalLaborCost / costSheet.batchSize)],
            ['Costos Indirectos (CIF)', formatCurrency(costSheet.indirectCosts.total), formatCurrency(costSheet.indirectCosts.total / costSheet.batchSize)],
        ],
        foot: [
            [{ content: 'COSTO TOTAL', styles: { fontStyle: 'bold' } }, { content: formatCurrency(costSheet.totalBatchCost), styles: { fontStyle: 'bold' } }, { content: formatCurrency(costSheet.unitCost), styles: { fontStyle: 'bold' } }]
        ],
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185] }
    });

    let finalY = (doc as any).lastAutoTable.finalY || 10;
    
    doc.setFontSize(14);
    doc.text('Resumen Final', 14, finalY + 15);
    doc.setFontSize(11);
    doc.autoTable({
      startY: finalY + 20,
      body: [
        ['Costo Unitario de Producción:', formatCurrency(costSheet.unitCost)],
        ['Precio de Venta Sugerido (30% Margen):', formatCurrency(costSheet.suggestedPrice)],
      ],
      theme: 'plain'
    });

    doc.save(`Ficha_Costo_${costSheet.productName.replace(/ /g, '_')}.pdf`);
    
    // Guardar en sistema de archivos local
    try {
      const pdfBase64 = doc.output('datauristring');
      const csvData = [
        ['Concepto', 'Costo Total Lote', 'Costo Unitario'],
        ['Materiales Directos', costSheet.totalMaterialCost, costSheet.totalMaterialCost / costSheet.batchSize],
        ['Empaques', costSheet.totalPackagingCost, costSheet.totalPackagingCost / costSheet.batchSize],
        ['Mano de Obra Directa', costSheet.totalLaborCost, costSheet.totalLaborCost / costSheet.batchSize],
        ['Costos Indirectos (CIF)', costSheet.indirectCosts.total, costSheet.indirectCosts.total / costSheet.batchSize],
        ['COSTO TOTAL', costSheet.totalBatchCost, costSheet.unitCost]
      ].map(e => e.join(',')).join('\n');
      
      await exportRecipeToDisk(costSheet.productName, csvData, pdfBase64);
    } catch(err) {
      console.error("Error al exportar carpeta", err);
    }
};


  return (
    <div className="space-y-6">
      <PageHeader
        title="Reportes de Costos"
        description="Selecciona un producto para ver su ficha de costo detallada."
      >
        <Button onClick={handleExportPDF} disabled={!costSheet}>
          <FileDown className="mr-2 h-4 w-4" />
          Exportar a PDF
        </Button>
      </PageHeader>

      <div className="w-full max-w-xs">
        <Select
          onValueChange={setSelectedProductId}
          value={selectedProductId ?? undefined}
          defaultValue={selectedProductId ?? undefined}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un producto" />
          </SelectTrigger>
          <SelectContent>
            {products.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {costSheet ? (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Costo - {costSheet.productName}</CardTitle>
              <CardDescription>
                Costo total para un lote de {costSheet.batchSize} {costSheet.batchUnit}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col space-y-1.5 rounded-lg bg-muted p-4">
                <span className="text-sm text-muted-foreground">Costo Total del Lote</span>
                <span className="text-2xl font-bold">{formatCurrency(costSheet.totalBatchCost)}</span>
              </div>
              <div className="flex flex-col space-y-1.5 rounded-lg bg-muted p-4">
                <span className="text-sm text-muted-foreground">Costo Unitario</span>
                <span className="text-2xl font-bold">{formatCurrency(costSheet.unitCost)}</span>
              </div>
              <div className="flex flex-col space-y-1.5 rounded-lg bg-green-100 dark:bg-green-900/50 p-4">
                 <span className="text-sm text-green-700 dark:text-green-400">Precio Venta Sugerido</span>
                <span className="text-2xl font-bold text-green-800 dark:text-green-300">{formatCurrency(costSheet.suggestedPrice)}</span>
              </div>
               <div className="flex flex-col space-y-1.5 rounded-lg bg-sky-100 dark:bg-sky-900/50 p-4">
                <span className="text-sm text-sky-700 dark:text-sky-400">Margen de Ganancia</span>
                <span className="text-2xl font-bold text-sky-800 dark:text-sky-300">
                  {costSheet.suggestedPrice > 0 
                    ? (( (costSheet.suggestedPrice - costSheet.unitCost) / costSheet.suggestedPrice ) * 100).toFixed(0) 
                    : 0}%
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Breakdown sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Materiales Directos</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ingrediente</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead className="text-right">Costo Unit.</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {costSheet.materialDetails.map(item => (
                      <TableRow key={item.name}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell className="text-right">{item.quantity} {item.unit}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unitCost)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.totalCost)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mano de Obra Directa</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Proceso</TableHead>
                      <TableHead className="text-right">Tiempo</TableHead>
                       <TableHead className="text-right">Operarios</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {costSheet.laborDetails.map(item => (
                      <TableRow key={item.name}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell className="text-right">{item.time} {item.unit}</TableCell>
                         <TableCell className="text-right">{item.operators}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.totalCost)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Empaques</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                   <TableHeader>
                    <TableRow>
                      <TableHead>Empaque</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead className="text-right">Costo Unit.</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {costSheet.packagingDetails.map(item => (
                      <TableRow key={item.name}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell className="text-right">{item.quantity} {item.unit}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unitCost)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.totalCost)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Costos Indirectos (CIF) Asignados</CardTitle>
              </CardHeader>
              <CardContent>
                 <Table>
                   <TableHeader>
                    <TableRow>
                      <TableHead>Categoría</TableHead>
                      <TableHead className="text-right">Costo Asignado al Lote</TableHead>
                    </TableRow>
                  </TableHeader>
                   <TableBody>
                      <TableRow>
                        <TableCell>Costos Generales (Overhead)</TableCell>
                        <TableCell className="text-right">{formatCurrency(costSheet.indirectCosts.overhead)}</TableCell>
                      </TableRow>
                       <TableRow>
                        <TableCell>Transporte</TableCell>
                        <TableCell className="text-right">{formatCurrency(costSheet.indirectCosts.transport)}</TableCell>
                      </TableRow>
                       <TableRow>
                        <TableCell>Inversión / Depreciación</TableCell>
                        <TableCell className="text-right">{formatCurrency(costSheet.indirectCosts.capital)}</TableCell>
                      </TableRow>
                        <TableRow className="font-bold border-t">
                        <TableCell>Total CIF</TableCell>
                        <TableCell className="text-right">{formatCurrency(costSheet.indirectCosts.total)}</TableCell>
                      </TableRow>
                   </TableBody>
                 </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-12 text-center">
          <h3 className="text-xl font-semibold tracking-tight text-muted-foreground">
            No hay productos para mostrar
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Crea una receta en la sección "Recetas" para poder generar un reporte
            de costos.
          </p>
        </div>
      )}
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Cargando reportes...</div>}>
      <ReportsContent />
    </Suspense>
  );
}
