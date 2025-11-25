'use client';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/page-header";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { useAppData } from "@/app/(app)/layout";


// Helper to format currency
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

const DashboardContent = () => {
    const { inventory, packaging, products, laborSettings, overhead, transport, capital } = useAppData();
    
    const totalInventoryValue = inventory.reduce((sum, item) => sum + (item.value), 0);
    const totalPackagingValue = packaging.reduce((sum, item) => sum + (item.value), 0);
    const totalMonthlyLabor = laborSettings.monthlyCost;
    const totalMonthlyCIF = overhead.reduce((sum, item) => sum + (item.monthlyValue * item.productionPercentage), 0);
    const totalMonthlyTransport = transport.reduce((sum, item) => sum + (item.monthlyValue * item.productionPercentage), 0);
    const totalMonthlyCapital = capital.reduce((sum, item) => sum + (item.monthlyValue * item.productionPercentage), 0);

    const firstProduct = products[0];
    const inventoryMap = new Map(inventory.map(item => [item.id, item]));
    const packagingMap = new Map(packaging.map(item => [item.id, item]));

    const ingredientsCost = (firstProduct?.ingredients || []).reduce((sum, ing) => {
        const item = inventoryMap.get(ing.ingredientId);
        return sum + (item ? item.unitValue * ing.quantity : 0);
    }, 0);

    const packagingCost = (firstProduct?.packaging || []).reduce((sum, pkg) => {
        const item = packagingMap.get(pkg.packagingId);
        return sum + (item ? item.unitValue * pkg.quantity : 0);
    }, 0);

    const hourRate = laborSettings.totalMonthlyHours > 0 ? laborSettings.monthlyCost / laborSettings.totalMonthlyHours : 0;
    
    const totalLaborHoursForProduct = (firstProduct?.laborProcesses || []).reduce((acc, process) => {
      const timeInHours =
        process.timeUnit === 'minutos' ? process.time / 60 : process.time;
      return acc + timeInHours * process.operators;
    }, 0);

    const laborCost = totalLaborHoursForProduct * hourRate;

    const overheadRate = laborSettings.totalMonthlyHours > 0 ? totalMonthlyCIF / laborSettings.totalMonthlyHours : 0;
    const overheadCost = overheadRate * totalLaborHoursForProduct;

    const transportRate = laborSettings.totalMonthlyHours > 0 ? totalMonthlyTransport / laborSettings.totalMonthlyHours : 0;
    const transportCost = transportRate * totalLaborHoursForProduct;

    const capitalRate = laborSettings.totalMonthlyHours > 0 ? totalMonthlyCapital / laborSettings.totalMonthlyHours : 0;
    const capitalCost = capitalRate * totalLaborHoursForProduct;

    const chartData = [
        { name: "Materia Prima", cost: ingredientsCost, fill: "var(--color-inventory)" },
        { name: "Empaque", cost: packagingCost, fill: "var(--color-packaging)" },
        { name: "Mano de Obra", cost: laborCost, fill: "var(--color-labor)" },
        { name: "CIF", cost: overheadCost, fill: "var(--color-overhead)" },
        { name: "Transporte", cost: transportCost, fill: "var(--color-transport)" },
        { name: "Inversión", cost: capitalCost, fill: "var(--color-capital)" },
    ];

    const chartConfig = {
        cost: {
            label: "Costo",
        },
        inventory: {
            label: "Materia Prima",
            color: "hsl(var(--chart-1))",
        },
        packaging: {
            label: "Empaque",
            color: "hsl(var(--chart-5))",
        },
        labor: {
            label: "Mano de Obra",
            color: "hsl(var(--chart-2))",
        },
        overhead: {
            label: "CIF",
            color: "hsl(var(--chart-3))",
        },
        transport: {
            label: "Transporte",
            color: "hsl(var(--chart-4))",
        },
        capital: {
            label: "Inversión",
            color: "hsl(var(--chart-1))",
        },
    };

    return (
        <div className="flex flex-col gap-6">
            <PageHeader title="Dashboard" description="Bienvenido a ProdCost Pro. Aquí tienes un resumen de tu operación." />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Valor Total Materia Prima</CardTitle>
                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalInventoryValue)}</div>
                        <p className="text-xs text-muted-foreground">{inventory.length} items en inventario</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Valor Total Empaques</CardTitle>
                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground"><path d="M21 10V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10"/><path d="M14 15v6"/><path d="M17 21v-8.5a3.5 3.5 0 0 0-7 0V21"/><path d="M7 21h10"/></svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalPackagingValue)}</div>
                        <p className="text-xs text-muted-foreground">{packaging.length} items en stock</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Mano de Obra Mensual</CardTitle>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/></svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalMonthlyLabor)}</div>
                        <p className="text-xs text-muted-foreground">Costo total de salarios y prestaciones</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">CIF Total Mensual</CardTitle>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalMonthlyCIF)}</div>
                        <p className="text-xs text-muted-foreground">Costos indirectos asignados a producción</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Transporte Mensual</CardTitle>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground"><path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"/><path d="M14 9h4l4 4v4h-8v-4h-4V9Z"/><path d="M18 18h-1.5c-.8 0-1.5-.7-1.5-1.5v0c0-.8.7-1.5 1.5-1.5H18"/><path d="M7 18H5.5c-.8 0-1.5-.7-1.5-1.5v0c0-.8.7-1.5 1.5-1.5H7"/></svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalMonthlyTransport)}</div>
                        <p className="text-xs text-muted-foreground">Costos de transporte asignados</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Inversión Mensual</CardTitle>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground"><path d="M2 20v-6h2v6"/><path d="M6 20v-8h2v8"/><path d="M10 20v-10h2v10"/><path d="M14 20v-4h2v4"/><path d="M18 20v-2h2v2"/><path d="M22 4v2h-3"/><path d="M11.25 7.96 11 9h-1l-.25-1.04"/><path d="m5 10 3-3 3 3"/><path d="M18.02 12.53c.3-.2.5-.53.5-.93a1.5 1.5 0 0 0-1.5-1.5c-.2 0-.4.06-.58.17"/><path d="M19.5 10.5c.95 0 1.76.66 1.93 1.55"/><path d="M22 10h-1.05"/><path d="M15 10h-2.5"/></svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalMonthlyCapital)}</div>
                        <p className="text-xs text-muted-foreground">Depreciación de activos asignada</p>
                    </CardContent>
                </Card>
            </div>
            {firstProduct && (
                <Card>
                    <CardHeader>
                        <CardTitle>Desglose de Costos: {firstProduct.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">Ejemplo de cálculo de costos para un lote de {firstProduct.batchSize} {firstProduct.batchUnit}.</p>
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
            )}
        </div>
    );
}

export default function DashboardPage() {
    return <DashboardContent />;
}
