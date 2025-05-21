
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface HeatmapDay {
  date: string;
  value: number;
}

interface RunningHeatmapProps {
  data: HeatmapDay[];
  title: string;
  description?: string;
}

const RunningHeatmap: React.FC<RunningHeatmapProps> = ({
  data,
  title,
  description
}) => {
  // Agrupar datos por semana
  const groupedByWeek: HeatmapDay[][] = [];
  let week: HeatmapDay[] = [];
  
  // Determinar el día de la semana (0-6, Domingo-Sábado)
  const getDayOfWeek = (dateString: string) => {
    return new Date(dateString).getDay();
  };
  
  // Función para formatear los días cortos en español
  const formatDayLabel = (day: number) => {
    const days = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
    return days[day];
  };

  // Rellenar los días faltantes para la primera semana
  const firstDayOfWeek = getDayOfWeek(data[0].date);
  for (let i = 0; i < firstDayOfWeek; i++) {
    week.push({ date: '', value: -1 }); // -1 indica un día vacío
  }

  // Agrupar los días en semanas
  data.forEach(day => {
    const dayOfWeek = getDayOfWeek(day.date);
    if (dayOfWeek === 0 && week.length > 0) {
      groupedByWeek.push([...week]);
      week = [];
    }
    week.push(day);
    
    // Si es el último día de la semana, añadir la semana actual
    if (dayOfWeek === 6) {
      groupedByWeek.push([...week]);
      week = [];
    }
  });
  
  // Añadir la última semana si no está completa
  if (week.length > 0) {
    groupedByWeek.push([...week]);
  }

  // Determinar intensidad del color basado en el valor
  const getHeatColor = (value: number) => {
    if (value < 0) return 'bg-transparent'; // Día vacío
    if (value === 0) return 'bg-gray-100';
    if (value < 5) return 'bg-running-light opacity-30';
    if (value < 10) return 'bg-running-light opacity-70';
    if (value < 15) return 'bg-running-primary opacity-70';
    return 'bg-running-primary';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="flex">
          {/* Etiquetas de días de la semana */}
          <div className="flex flex-col pr-2 pt-6">
            {[0, 1, 2, 3, 4, 5, 6].map(day => (
              <div key={day} className="h-6 flex items-center justify-center text-xs text-muted-foreground">
                {formatDayLabel(day)}
              </div>
            ))}
          </div>
          
          {/* Mapa de calor */}
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-1">
              {groupedByWeek.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((day, dayIndex) => (
                    <div
                      key={dayIndex}
                      className={cn(
                        'w-6 h-6 rounded',
                        getHeatColor(day.value)
                      )}
                      title={day.date ? `${new Date(day.date).toLocaleDateString('es-ES')}: ${day.value}km` : ''}
                    ></div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RunningHeatmap;
