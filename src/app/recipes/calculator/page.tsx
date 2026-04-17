"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, Save, BarChart3, Settings2, Package, TrendingUp, Printer, FileText } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { exportRecipeToDisk, getSavedCalculations } from "@/app/actions/export";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export default function CalculatorPage() {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [scenarioName, setScenarioName] = useState("Mi-Experimento");
  const [history, setHistory] = useState<{id: string, name: string, date: string}[]>([]);

  const loadHistory = async () => {
    try {
      const data = await getSavedCalculations();
      setHistory(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // Batch Settings
  const [numBags, setNumBags] = useState<number>(60);
  const [targetMargin, setTargetMargin] = useState<number>(40);

  // Editable Prices (por unidad mínima: gramo/ml/und)
  const [prices, setPrices] = useState({
    harinaRoca: 1.34,
    terrabono: 0.84,
    micorrizas: 1.60,
    n30: 30.00,
    sulfatoZinc: 30.00,
    sulfatoCobre: 30.00,
    acidoBorico: 25.00,
    flos: 10.00, // Estimado temporal
    bolsa: 1400.00,
    etiqueta: 500.00
  });

  // Base Formula (per bag)
  const [formula, setFormula] = useState({
    harinaRoca: 200,
    terrabono: 150,
    micorrizas: 80,
    n30: 20,
    sulfatoZinc: 15,
    sulfatoCobre: 10,
    acidoBorico: 10,
    flos: 15,
    bolsa: 1,
    etiqueta: 1
  });

  const handlePriceChange = (key: keyof typeof prices, value: string) => {
    setPrices(prev => ({ ...prev, [key]: Number(value) || 0 }));
  };

  const handleFormulaChange = (key: keyof typeof formula, value: string) => {
    setFormula(prev => ({ ...prev, [key]: Number(value) || 0 }));
  };

  const totals = useMemo(() => {
    const rawMaterialPerBag = 
      (formula.harinaRoca * prices.harinaRoca) +
      (formula.terrabono * prices.terrabono) +
      (formula.micorrizas * prices.micorrizas) +
      (formula.n30 * prices.n30) +
      (formula.sulfatoZinc * prices.sulfatoZinc) +
      (formula.sulfatoCobre * prices.sulfatoCobre) +
      (formula.acidoBorico * prices.acidoBorico) +
      (formula.flos * prices.flos);

    const packagingPerBag = 
      (formula.bolsa * prices.bolsa) + 
      (formula.etiqueta * prices.etiqueta);

    const costPerBag = rawMaterialPerBag + packagingPerBag;
    const batchCost = costPerBag * numBags;
    const batchRawMaterialCost = rawMaterialPerBag * numBags;
    const batchPackagingCost = packagingPerBag * numBags;

    const suggestedRetailPrice = costPerBag / (1 - (targetMargin / 100));
    const profitPerBag = suggestedRetailPrice - costPerBag;

    // Total grams per bag
    const totalGramsPerBag = formula.harinaRoca + formula.terrabono + formula.micorrizas + 
                             formula.n30 + formula.sulfatoZinc + formula.sulfatoCobre + formula.acidoBorico;

    return {
      rawMaterialPerBag,
      packagingPerBag,
      costPerBag,
      batchCost,
      batchRawMaterialCost,
      batchPackagingCost,
      suggestedRetailPrice,
      profitPerBag,
      totalWeight: totalGramsPerBag,
      totalLitersFlos: formula.flos * numBags / 1000,
      totalKilosSolid: (totalGramsPerBag * numBags) / 1000
    };
  }, [prices, formula, numBags, targetMargin]);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text("Reporte: Calculadora Dinámica de Costos BIO-GENESIS", 14, 20);
      
      doc.setFontSize(11);
      doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 30);
      doc.text(`Lote de Producción: ${numBags} Bolsas`, 14, 36);
      doc.text(`Margen Deseado: ${targetMargin}%`, 140, 36);
      doc.text(`Total Volumen del Lote: ${totals.totalKilosSolid.toLocaleString('es-CO')} Kg sólidos + ${totals.totalLitersFlos.toLocaleString('es-CO')} L Flos`, 14, 42);

      const rawMaterialData = [
        ["Harina Roca", `${formula.harinaRoca} g`, `$${prices.harinaRoca}`],
        ["Terrabono", `${formula.terrabono} g`, `$${prices.terrabono}`],
        ["Micorrizas", `${formula.micorrizas} g`, `$${prices.micorrizas}`],
        ["N30", `${formula.n30} g`, `$${prices.n30}`],
        ["Sulfato Zinc", `${formula.sulfatoZinc} g`, `$${prices.sulfatoZinc}`],
        ["Sulfato Cobre", `${formula.sulfatoCobre} g`, `$${prices.sulfatoCobre}`],
        ["Ácido Bórico", `${formula.acidoBorico} g`, `$${prices.acidoBorico}`],
        ["Flos", `${formula.flos} ml`, `$${prices.flos}`],
        ["Bolsa", `${formula.bolsa} und`, `$${prices.bolsa}`],
        ["Etiqueta", `${formula.etiqueta} und`, `$${prices.etiqueta}`]
      ];

      autoTable(doc, {
        startY: 50,
        head: [["Insumo", "Cantidad (por bolsa)", "Costo Unitario ($)"]],
        body: rawMaterialData,
        theme: 'striped',
      });

      const finalY = (doc as any).lastAutoTable.finalY || 50;

      const resultsData = [
        ["Costo Producción 1 Bolsa", `$${totals.costPerBag.toLocaleString('es-CO', {maximumFractionDigits:2})}`],
        [`Costo Total x ${numBags} Bolsas`, `$${totals.batchCost.toLocaleString('es-CO', {maximumFractionDigits:2})}`],
        ["Precio Sugerido Venta", `$${totals.suggestedRetailPrice.toLocaleString('es-CO', {maximumFractionDigits:2})}`],
        ["Ganancia por Bolsa", `$${totals.profitPerBag.toLocaleString('es-CO', {maximumFractionDigits:2})}`]
      ];

      autoTable(doc, {
        startY: finalY + 10,
        head: [["Métrica de Resultado", "Valor"]],
        body: resultsData,
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129] }
      });

      doc.save(`Calculadora_${scenarioName}_${new Date().toISOString().split('T')[0]}.pdf`);

      const pdfBase64 = doc.output('datauristring');
      
      let csvData = "Insumo,Cantidad (por bolsa),Costo Unitario ($)\n";
      rawMaterialData.forEach(row => {
        csvData += `${row[0]},${row[1]},${row[2].replace('$', '')}\n`;
      });
      csvData += "\nMétrica de Resultado,Valor\n";
      resultsData.forEach(row => {
        csvData += `${row[0]},${row[1].replace('$', '').replace(/\\./g, '')}\n`;
      });

      const safeFolder = scenarioName.trim() === "" ? "calculadora-dinamica" : `calculadora-${scenarioName.replace(/\\s+/g, '-')}`;
      const result = await exportRecipeToDisk(safeFolder, csvData, pdfBase64);
      
      if (result.success) {
        toast({
          title: "Reporte Exportado Localmente",
          description: "La calculadora dinámica ha guardado los datos localmente en formato CSV y PDF.",
          variant: "default",
        });
        loadHistory();
      } else {
        throw new Error(result.error);
      }
    } catch(err: any) {
      console.error("Error al exportar a disco", err);
      toast({
        title: "Error al exportar",
        description: err.message || "No se pudo guardar el archivo en el servidor local.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-emerald-700 dark:text-emerald-500 flex items-center gap-2">
            <Calculator className="h-8 w-8" />
            Calculadora Dinámica de Costos
          </h1>
          <p className="text-muted-foreground mt-1">
            Simulador de costos y márgenes para BIO-GENESIS
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="scenarioName" className="text-sm font-medium text-emerald-800 dark:text-emerald-400">Nombre Variante:</Label>
            <Input 
              id="scenarioName"
              value={scenarioName} 
              onChange={(e) => setScenarioName(e.target.value)} 
              placeholder="Ej. Con-Mas-Micorrizas"
              className="w-48 h-9 border-emerald-200"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportPDF} disabled={isExporting} className="text-emerald-700 border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950">
              <Printer className="h-4 w-4 mr-2" /> {isExporting ? "Exportando..." : "Imprimir PDF"}
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Save className="h-4 w-4 mr-2" /> Guardar Escenario
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* PARÁMETROS MACRO */}
        <Card className="col-span-1 md:col-span-3 border-emerald-100 shadow-sm bg-emerald-50/30 dark:bg-emerald-950/20 dark:border-emerald-900">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-emerald-800 dark:text-emerald-400 font-semibold">Bolsas a Producir (Lote)</Label>
                <Input 
                  type="number" 
                  value={numBags} 
                  onChange={(e) => setNumBags(Number(e.target.value) || 0)}
                  className="mt-1 text-lg font-bold border-emerald-200"
                />
              </div>
              <div>
                <Label className="text-emerald-800 dark:text-emerald-400 font-semibold">Margen Deseado (%)</Label>
                <Input 
                  type="number" 
                  value={targetMargin} 
                  onChange={(e) => setTargetMargin(Number(e.target.value) || 0)}
                  className="mt-1 text-lg font-bold border-emerald-200"
                />
              </div>
              <div className="md:col-span-2 flex flex-col justify-center pl-4 border-l border-emerald-200 dark:border-emerald-800">
                <p className="text-sm text-emerald-600 dark:text-emerald-400">Total Volumen del Lote</p>
                <p className="text-2xl font-black text-emerald-900 dark:text-emerald-100">
                  {totals.totalKilosSolid.toLocaleString('es-CO')} Kg sólidos + {totals.totalLitersFlos.toLocaleString('es-CO')} L Flos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* COLUMNA 1: FORMULACIÓN (Receta base) */}
        <Card className="shadow-sm">
          <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings2 className="h-5 w-5 text-blue-500" />
              Receta (X Bolsa)
            </CardTitle>
            <CardDescription>Gramos o ml por unidad terminada</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {[
              { key: 'harinaRoca', label: 'Harina Roca (g)' },
              { key: 'terrabono', label: 'Terrabono (g)' },
              { key: 'micorrizas', label: 'Micorrizas (g)' },
              { key: 'n30', label: 'N30 (g)' },
              { key: 'sulfatoZinc', label: 'Sulfato Zinc (g)' },
              { key: 'sulfatoCobre', label: 'Sulfato Cobre (g)' },
              { key: 'acidoBorico', label: 'Ácido Bórico (g)' },
              { key: 'flos', label: 'Flos (ml)' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between gap-2">
                <Label className="w-1/2 text-xs">{item.label}</Label>
                <Input 
                  type="number" 
                  value={formula[item.key as keyof typeof formula]} 
                  onChange={(e) => handleFormulaChange(item.key as keyof typeof formula, e.target.value)}
                  className="w-1/2 h-8 text-right"
                />
              </div>
            ))}
            <Separator className="my-2" />
            <div className="flex items-center justify-between text-sm font-bold">
              <span>Peso Polvos:</span>
              <span>{totals.totalWeight} g</span>
            </div>
          </CardContent>
        </Card>

        {/* COLUMNA 2: COSTOS UNITARIOS */}
        <Card className="shadow-sm">
          <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-amber-500" />
              Costos Insumos ($)
            </CardTitle>
            <CardDescription>Costo estándar por gramo / Und</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {[
              { key: 'harinaRoca', label: 'Costo Harina (1g)' },
              { key: 'terrabono', label: 'Costo Terrabono (1g)' },
              { key: 'micorrizas', label: 'Costo Micorrizas (1g)' },
              { key: 'n30', label: 'Costo N30 (1g)' },
              { key: 'sulfatoZinc', label: 'Costo Sulf. Zinc (1g)' },
              { key: 'sulfatoCobre', label: 'Costo Sulf. Cobre (1g)' },
              { key: 'acidoBorico', label: 'Costo Ác. Bórico (1g)' },
              { key: 'flos', label: 'Costo Flos (1ml)' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between gap-2">
                <Label className="w-1/2 text-xs text-muted-foreground">{item.label}</Label>
                <Input 
                  type="number" 
                  step="0.01"
                  value={prices[item.key as keyof typeof prices]} 
                  onChange={(e) => handlePriceChange(item.key as keyof typeof prices, e.target.value)}
                  className="w-1/2 h-8 text-right"
                />
              </div>
            ))}
            <Separator className="my-2" />
            <div className="space-y-2 mt-2">
              <div className="flex items-center justify-between gap-2">
                <Label className="w-1/2 text-xs font-semibold text-orange-600">Bolsa Vacía (Und)</Label>
                <Input 
                  type="number" 
                  value={prices.bolsa} 
                  onChange={(e) => handlePriceChange('bolsa', e.target.value)}
                  className="w-1/2 h-8 text-right border-orange-200"
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <Label className="w-1/2 text-xs font-semibold text-orange-600">Etiqueta (Und)</Label>
                <Input 
                  type="number" 
                  value={prices.etiqueta} 
                  onChange={(e) => handlePriceChange('etiqueta', e.target.value)}
                  className="w-1/2 h-8 text-right border-orange-200"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* COLUMNA 3: RESULTADOS EN TIEMPO REAL */}
        <Card className="shadow-sm border-2 border-emerald-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp className="h-32 w-32" />
          </div>
          <CardHeader className="bg-emerald-600 text-white">
            <CardTitle className="text-xl">Resultados del Lote</CardTitle>
            <CardDescription className="text-emerald-100">Actualizado en tiempo real</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6 relative z-10">
            
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Costo Producción 1 Bolsa</p>
              <div className="text-3xl font-bold font-mono">
                $ {totals.costPerBag.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 1 })}
              </div>
              <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                <span>MP: ${totals.rawMaterialPerBag.toLocaleString('es-CO', {maximumFractionDigits:0})}</span>
                <span>Empaque: ${totals.packagingPerBag.toLocaleString('es-CO', {maximumFractionDigits:0})}</span>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-1">Costo Total x {numBags} Bolsas</p>
              <div className="text-4xl font-black text-emerald-700 dark:text-emerald-500 tracking-tight font-mono">
                $ {totals.batchCost.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </div>
            </div>

            <Card className="bg-slate-50 dark:bg-slate-900 border-dashed">
              <CardContent className="p-4 space-y-3">
                <div>
                  <p className="text-xs uppercase font-bold text-muted-foreground mb-1">Precio Sugerido Venta</p>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    $ {totals.suggestedRetailPrice.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                  <p className="text-[10px] text-muted-foreground">Para obtener un {targetMargin}% de ganancia real</p>
                </div>
                <div>
                  <p className="text-xs uppercase font-bold text-muted-foreground mb-1">Ganancia por Bolsa</p>
                  <div className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">
                    $ {totals.profitPerBag.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                </div>
              </CardContent>
            </Card>

          </CardContent>
        </Card>
      </div>

      {/* HISTORIAL DE SIMULACIONES */}
      {history.length > 0 && (
        <Card className="shadow-sm border-emerald-100">
          <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-600" />
              Historial de Simulaciones
            </CardTitle>
            <CardDescription>Escenarios guardados previamente en tu equipo local</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 p-0">
            <div className="divide-y">
              {history.map((record) => (
                <div key={record.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  <div>
                    <h4 className="font-semibold text-emerald-900 dark:text-emerald-100">{record.name}</h4>
                    <p className="text-xs text-muted-foreground">Guardado: {new Date(record.date).toLocaleDateString()} a las {new Date(record.date).toLocaleTimeString(undefined, {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-8" disabled>
                      <Printer className="h-3 w-3 mr-1" /> PDF Generado
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
