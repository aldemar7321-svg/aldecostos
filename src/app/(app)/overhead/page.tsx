import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { overheadData, laborSettingsData } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 2 }).format(value);

const formatPercentage = (value: number) =>
  new Intl.NumberFormat('es-CO', { style: 'percent', minimumFractionDigits: 0 }).format(value);


export default function OverheadPage() {
  const totalCIF = overheadData.reduce((acc, item) => acc + item.monthlyValue * item.productionPercentage, 0);
  const cifRate = laborSettingsData.totalMonthlyHours > 0 ? totalCIF / laborSettingsData.totalMonthlyHours : 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Costos Indirectos de Fabricación (CIF)"
        description="Gestiona los gastos indirectos y su asignación a producción."
      >
        <Button size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Concepto
        </Button>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Gastos Mensuales</CardTitle>
          <CardDescription>
            El CIF Total se calcula aplicando el '% Producción' al valor mensual de cada concepto.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Concepto</TableHead>
                <TableHead className="text-right">Valor Mensual</TableHead>
                <TableHead className="text-right">% Producción</TableHead>
                <TableHead className="text-right">CIF Totales</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overheadData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.concept}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.monthlyValue)}</TableCell>
                  <TableCell className="text-right">{formatPercentage(item.productionPercentage)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.monthlyValue * item.productionPercentage)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex-col items-end gap-2 sm:flex-row sm:justify-end">
          <div className="flex flex-col items-end">
            <p className="text-muted-foreground">CIF Total de Producción:</p>
            <p className="text-xl font-bold">{formatCurrency(totalCIF)}</p>
          </div>
          <div className="h-12 w-px bg-border hidden sm:block mx-4"></div>
          <div className="flex flex-col items-end">
            <p className="text-muted-foreground">Tasa CIF de Producción:</p>
            <p className="text-xl font-bold">{formatCurrency(cifRate)} / hora</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
