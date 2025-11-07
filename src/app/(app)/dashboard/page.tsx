
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { inventoryData, productsData, laborSettingsData, overheadData } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

// Helper to format currency
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

const totalInventoryValue = inventoryData.reduce((sum, item) => sum + (item.value), 0);
const totalMonthlyLabor = laborSettingsData.monthlyCost;
const totalMonthlyCIF = overheadData.reduce((sum, item) => sum + (item.monthlyValue * item.productionPercentage), 0);
const firstProduct = productsData[0];
const inventoryMap = new Map(inventoryData.map(item => [item.id, item]));

const materialCost = firstProduct.recipe.reduce((sum, ing) => {
  const item = inventoryMap.get(ing.inventoryId);
  return sum + (item ? item.unitValue * ing.quantity : 0);
}, 0);

const hourRate = laborSettingsData.monthlyCost / laborSettingsData.totalMonthlyHours;
const laborCost = firstProduct.laborProcesses.reduce((sum, proc) => {
  const timeInHours = proc.timeUnit === 'minutos' ? proc.time / 60 : proc.time;
  return sum + (timeInHours * hourRate * proc.operators);
}, 0);

const overheadRate = totalMonthlyCIF / laborSettingsData.totalMonthlyHours;
const totalLaborHours = firstProduct.laborProcesses.reduce((sum, proc) => {
    const timeInHours = proc.timeUnit === 'minutos' ? proc.time / 60 : proc.time;
    return sum + timeInHours;
}, 0);
const overheadCost = overheadRate * totalLaborHours;

const chartData = [
  { name: "Materia Prima", cost: materialCost, fill: "var(--color-material)" },
  { name: "Mano de Obra", cost: laborCost, fill: "var(--color-labor)" },
  { name: "CIF", cost: overheadCost, fill: "var(--color-overhead)" },
];

const chartConfig = {
  cost: {
    label: "Costo",
  },
  material: {
    label: "Materia Prima",
    color: "hsl(var(--chart-1))",
  },
  labor: {
    label: "Mano de Obra",
    color: "hsl(var(--chart-2))",
  },
  overhead: {
    label: "CIF",
    color: "hsl(var(--chart-3))",
  },
};

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Dashboard" description="Bienvenido a ProdCost Pro. Aquí tienes un resumen de tu operación." />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total Inventario</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><rect width="20" height="14" x="2" y="7" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalInventoryValue)}</div>
            <p className="text-xs text-muted-foreground">{inventoryData.length} items en stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recetas Definidas</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productsData.length}</div>
            <p className="text-xs text-muted-foreground">Productos configurados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mano de Obra Mensual</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/></svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalMonthlyLabor)}</div>
            <p className="text-xs text-muted-foreground">Costo total de salarios y prestaciones</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CIF Total Mensual</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalMonthlyCIF)}</div>
            <p className="text-xs text-muted-foreground">Costos indirectos asignados a producción</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Desglose de Costos: {firstProduct.name}</CardTitle>
          <p className="text-sm text-muted-foreground">Ejemplo de cálculo de costos para un lote de {firstProduct.batchSize} lbs.</p>
        </CardHeader>
        <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                <BarChart accessibilityLayer data={chartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                    <YAxis tickFormatter={(value) => formatCurrency(Number(value))} />
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />}
                    />
                    <Bar dataKey="cost" radius={8} />
                </BarChart>
            </ChartContainer>
        </CardContent>
         <CardFooter className="flex-row-reverse">
          <Button asChild variant="ghost" size="sm">
            <Link href="/reports">
              Ver Reporte Detallado <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
