'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PageHeader } from '@/components/page-header';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Product, LaborSettings } from '@/lib/types';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 2,
  }).format(value);

const LaborContent = ({
    products,
    laborSettings,
    setLaborSettings
}: {
    products: Product[];
    laborSettings: LaborSettings;
    setLaborSettings: (settings: LaborSettings) => void;
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(
    products[0]?.id || ''
  );
  
  const handleSettingsChange = (field: keyof LaborSettings, value: number) => {
    setLaborSettings({ ...laborSettings, [field]: value });
  };

  const hourRate =
    laborSettings.totalMonthlyHours > 0
      ? laborSettings.monthlyCost / laborSettings.totalMonthlyHours
      : 0;
  const minuteRate = hourRate / 60;
  const dayRate = laborSettings.workHoursPerDay * hourRate;

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const totalLaborCost =
    selectedProduct?.laborProcesses.reduce((acc, process) => {
      const rate = process.timeUnit === 'minutos' ? minuteRate : hourRate;
      const processCost = process.time * rate * process.operators;
      return acc + processCost;
    }, 0) || 0;

  const totalTimeInMinutes =
    selectedProduct?.laborProcesses.reduce((acc, process) => {
      const timeInMinutes =
        process.timeUnit === 'horas' ? process.time * 60 : process.time;
      return acc + timeInMinutes;
    }, 0) || 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Costeo de Mano de Obra"
        description="Configura salarios y define los procesos de producción."
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Configuración de Costos</CardTitle>
            <CardDescription>
              Define los costos base para el cálculo de mano de obra.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="monthlyCost">Costo Mensual M.O.</Label>
              <Input
                id="monthlyCost"
                type="number"
                value={laborSettings.monthlyCost}
                onChange={(e) => handleSettingsChange('monthlyCost', +e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthlyHours">Total Horas Laboradas/Mes</Label>
              <Input
                id="monthlyHours"
                type="number"
                value={laborSettings.totalMonthlyHours}
                onChange={(e) => handleSettingsChange('totalMonthlyHours', +e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dailyHours">Horas de Trabajo/Día</Label>
              <Input
                id="dailyHours"
                type="number"
                value={laborSettings.workHoursPerDay}
                onChange={(e) => handleSettingsChange('workHoursPerDay', +e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-2 text-sm">
            <div className="font-medium">Tarifas Calculadas:</div>
            <p>
              <span className="text-muted-foreground">Día:</span>{' '}
              {formatCurrency(dayRate)}
            </p>
            <p>
              <span className="text-muted-foreground">Hora:</span>{' '}
              {formatCurrency(hourRate)}
            </p>
            <p>
              <span className="text-muted-foreground">Minuto:</span>{' '}
              {formatCurrency(minuteRate)}
            </p>
          </CardFooter>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Procesos de Producción</CardTitle>
                <CardDescription>
                  Pasos de producción para el producto seleccionado.
                </CardDescription>
              </div>
              <Select
                value={selectedProductId}
                onValueChange={setSelectedProductId}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
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
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proceso</TableHead>
                  <TableHead className="text-center">Tiempo</TableHead>
                  <TableHead className="text-center">N° Operarios</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedProduct?.laborProcesses.map((process) => {
                  const rate =
                    process.timeUnit === 'minutos' ? minuteRate : hourRate;
                  const value = process.time * rate * process.operators;
                  return (
                    <TableRow key={process.id}>
                      <TableCell className="font-medium">
                        {process.name}
                      </TableCell>
                      <TableCell className="text-center">
                        {process.time} {process.timeUnit}
                      </TableCell>
                      <TableCell className="text-center">
                        {process.operators}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(value)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex-col items-end gap-2 text-right">
            <div>
              <p className="text-muted-foreground">
                Tiempo Total del Lote: {totalTimeInMinutes} minutos
              </p>
              <p className="text-muted-foreground">
                Costo M.O. Total del Lote:
              </p>
            </div>
            <p className="text-xl font-bold">{formatCurrency(totalLaborCost)}</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};


export default function LaborPage() {
    return (props: any) => <LaborContent {...props} />;
}
