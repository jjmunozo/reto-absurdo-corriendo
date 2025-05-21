
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [year, setYear] = useState(new Date().getFullYear());
  
  // Función para formatear los días cortos en español
  const formatDayLabel = (day: number) => {
    const days = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
    return days[day];
  };
  
  // Obtener los datos del año seleccionado
  const yearData = React.useMemo(() => {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    const days: HeatmapDay[] = [];
    
    // Crear un array con todos los días del año
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Buscar si hay una carrera en este día
      const dayRun = data.find(d => d.date === dateStr);
      
      days.push({
        date: dateStr,
        value: dayRun ? dayRun.value : 0
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  }, [data, year]);
  
  // Agrupar los datos por meses
  const monthsData = React.useMemo(() => {
    const months: Array<{
      name: string;
      days: HeatmapDay[];
      totalDays: number;
      totalDistance: number;
    }> = [];
    
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    // Para cada mes
    for (let i = 0; i < 12; i++) {
      const monthFirstDay = new Date(year, i, 1);
      const monthLastDay = new Date(year, i + 1, 0);
      const monthDays = yearData.filter(d => {
        const date = new Date(d.date);
        return date >= monthFirstDay && date <= monthLastDay;
      });
      
      // Contar días de actividad y distancia total
      const activeDays = monthDays.filter(d => d.value > 0);
      const totalDistance = monthDays.reduce((sum, day) => sum + day.value, 0);
      
      months.push({
        name: monthNames[i],
        days: monthDays,
        totalDays: activeDays.length,
        totalDistance
      });
    }
    
    return months;
  }, [yearData, year]);
  
  // Cambiar al año anterior
  const prevYear = () => setYear(year - 1);
  
  // Cambiar al año siguiente
  const nextYear = () => setYear(year + 1);
  
  // Determinar intensidad del color basado en el valor
  const getHeatColor = (value: number) => {
    if (value === 0) return 'bg-gray-100';
    if (value < 5) return 'bg-running-light opacity-30';
    if (value < 10) return 'bg-running-light opacity-70';
    if (value < 15) return 'bg-running-primary opacity-70';
    return 'bg-running-primary';
  };

  // Organizar los días en filas (7 días) y columnas (semanas)
  const calendarGrids = React.useMemo(() => {
    return monthsData.map(month => {
      // Encontrar el primer día del mes
      const firstDay = new Date(month.days[0].date);
      const firstDayOfWeek = firstDay.getDay(); // 0 para Domingo, 6 para Sábado
      
      // Organizar días en semanas
      const weeks: HeatmapDay[][] = [];
      let currentWeek: HeatmapDay[] = [];
      
      // Añadir días vacíos al principio del mes
      for (let i = 0; i < firstDayOfWeek; i++) {
        currentWeek.push({ date: '', value: -1 });
      }
      
      // Añadir todos los días del mes
      month.days.forEach(day => {
        const date = new Date(day.date);
        const dayOfWeek = date.getDay();
        
        if (dayOfWeek === 0 && currentWeek.length > 0) {
          weeks.push([...currentWeek]);
          currentWeek = [];
        }
        
        currentWeek.push(day);
        
        if (dayOfWeek === 6) {
          weeks.push([...currentWeek]);
          currentWeek = [];
        }
      });
      
      // Añadir la última semana si no está completa
      if (currentWeek.length > 0) {
        // Rellenar el resto de la semana con días vacíos
        while (currentWeek.length < 7) {
          currentWeek.push({ date: '', value: -1 });
        }
        weeks.push(currentWeek);
      }
      
      return {
        ...month,
        weeks
      };
    });
  }, [monthsData]);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-running-primary" />
            {title}
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={prevYear}
            className="p-2 hover:bg-gray-100 rounded-full"
            aria-label="Año anterior"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="font-medium">{year}</span>
          <button 
            onClick={nextYear}
            className="p-2 hover:bg-gray-100 rounded-full"
            aria-label="Año siguiente"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {calendarGrids.map((month, monthIndex) => (
            <div key={monthIndex} className="border rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">{month.name}</h3>
                <div className="text-sm text-muted-foreground">
                  {month.totalDays} días • {month.totalDistance.toFixed(1)}km
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {/* Cabecera de días de la semana */}
                {[0, 1, 2, 3, 4, 5, 6].map(day => (
                  <div key={day} className="text-center text-xs text-muted-foreground">
                    {formatDayLabel(day)}
                  </div>
                ))}
                
                {/* Cuadrícula del mes */}
                {month.weeks.flatMap((week, weekIndex) => 
                  week.map((day, dayIndex) => (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className={cn(
                        'w-full aspect-square rounded-sm',
                        day.value < 0 ? 'bg-transparent' : getHeatColor(day.value)
                      )}
                      title={day.date ? `${new Date(day.date).toLocaleDateString('es-ES')}: ${day.value > 0 ? `${day.value}km` : 'No hay actividad'}` : ''}
                    />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RunningHeatmap;
