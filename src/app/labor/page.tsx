'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAppData } from '@/app/layout';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { useEffect, useMemo } from 'react';

const formSchema = z.object({
  monthlyCost: z.coerce.number().positive({ message: 'El costo debe ser positivo.' }),
  totalMonthlyHours: z.coerce.number().positive({ message: 'Las horas deben ser un número positivo.' }),
  workHoursPerDay: z.coerce.number().positive({ message: 'Las horas por día deben ser un número positivo.' }),
});

type FormData = z.infer<typeof formSchema>;

export default function LaborPage() {
  const { laborSettings, setLaborSettings } = useAppData();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      monthlyCost: 0,
      totalMonthlyHours: 0,
      workHoursPerDay: 0,
    },
  });
  
  useEffect(() => {
    if (laborSettings) {
      form.reset(laborSettings);
    }
  }, [laborSettings, form]);

  const onSubmit = (data: FormData) => {
    setLaborSettings(data);
    toast({
      title: 'Configuración guardada',
      description: 'Los costos de mano de obra han sido actualizados.',
    });
  };
  
  const costPerHour = useMemo(() => {
    const { monthlyCost, totalMonthlyHours } = form.watch();
    if (monthlyCost > 0 && totalMonthlyHours > 0) {
      return monthlyCost / totalMonthlyHours;
    }
    return 0;
  }, [form.watch()]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mano de Obra"
        description="Configura los costos asociados a la mano de obra para tus cálculos."
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Parámetros de Costo</CardTitle>
                  <CardDescription>
                    Define los valores base para calcular el costo de la mano de obra.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="monthlyCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Costo Mensual Total de Nómina</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Ej: 2500000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="totalMonthlyHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Horas Laboradas en el Mes</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Ej: 192" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="workHoursPerDay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horas de Trabajo por Día</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Ej: 8" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button type="submit">Guardar Cambios</Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </div>

        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Costo por Hora</CardTitle>
              <CardDescription>
                Este es el valor que se usará para costear las operaciones.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold tracking-tight">
                {formatCurrency(costPerHour)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Calculado a partir del costo mensual y las horas totales.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
