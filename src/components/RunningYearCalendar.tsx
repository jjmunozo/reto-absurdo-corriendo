import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CalendarIcon, BookOpen } from 'lucide-react';
import { RunData } from '@/data/runningData';
import { Badge } from '@/components/ui/badge';

interface RunningYearCalendarProps {
  runningData: RunData[];
  title: string;
  description?: string;
}

const RunningYearCalendar: React.FC<RunningYearCalendarProps> = ({
  runningData,
  title,
  description
}) => {
  const [year, setYear] = useState(new Date().getFullYear());
  
  // Obtener todos los días con actividad de carrera
  const runDates = React.useMemo(() => {
    return runningData.reduce((dates: Record<string, number>, run) => {
      // Solo considerar fechas del año seleccionado
      if (new Date(run.date).getFullYear() === year) {
        dates[run.date] = run.distance;
      }
      return dates;
    }, {});
  }, [runningData, year]);
  
  // Calcular estadísticas mensuales
  const monthlyStats = React.useMemo(() => {
    const stats: { [month: number]: { days: number, distance: number } } = {};
    
    // Inicializar todos los meses
    for (let i = 0; i < 12; i++) {
      stats[i] = { days: 0, distance: 0 };
    }
    
    // Contar días y distancia por mes
    Object.entries(runDates).forEach(([dateStr, distance]) => {
      const date = new Date(dateStr);
      if (date.getFullYear() === year) {
        const month = date.getMonth();
        stats[month].days += 1;
        stats[month].distance += distance;
      }
    });
    
    return stats;
  }, [runDates, year]);
  
  // Función para personalizar la apariencia de los días
  const modifiers = {
    runDay: Object.keys(runDates).map(date => new Date(date)),
  };
  
  const modifiersStyles = {
    runDay: (date: Date) => {
      const dateStr = date.toISOString().split('T')[0];
      const distance = runDates[dateStr] || 0;
      
      if (!distance) return {};
      
      // Nuevos rangos de distancia con colores correspondientes
      if (distance >= 50) {
        return { backgroundColor: '', className: 'bg-orange-500' }; // 50km+ naranja intenso
      } else if (distance >= 42) {
        return { backgroundColor: '', className: 'bg-running-secondary' }; // 42-50km verde intenso
      } else if (distance >= 30) {
        return { backgroundColor: '', className: 'bg-running-secondary opacity-70' }; // 30-42km verde
      } else if (distance >= 20) {
        return { backgroundColor: '', className: 'bg-running-primary' }; // 20-30km azul intenso
      } else if (distance >= 15) {
        return { backgroundColor: '', className: 'bg-running-primary opacity-80' }; // 15-20km azul estándar
      } else if (distance >= 10) {
        return { backgroundColor: '', className: 'bg-running-primary opacity-60' }; // 10-15km azul medio
      } else {
        return { backgroundColor: '', className: 'bg-running-light opacity-50' }; // <10km azul claro
      }
    }
  };
  
  // Cambiar al año anterior
  const prevYear = () => setYear(year - 1);
  
  // Cambiar al año siguiente
  const nextYear = () => setYear(year + 1);
  
  // Formatear el nombre del mes en español
  const getMonthName = (monthIndex: number): string => {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return months[monthIndex];
  };

  // Componente de leyenda para las distancias
  const DistanceLegend = () => {
    return (
      <div className="mt-2 pb-1 px-2 border-b">
        <div className="flex items-center gap-1.5 mb-2">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Distancias (km)</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 bg-running-light opacity-50 rounded"></div>
            <span className="text-muted-foreground">&lt;10km</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 bg-running-primary opacity-60 rounded"></div>
            <span className="text-muted-foreground">10-15km</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 bg-running-primary opacity-80 rounded"></div>
            <span className="text-muted-foreground">15-20km</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 bg-running-primary rounded"></div>
            <span className="text-muted-foreground">20-30km</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 bg-running-secondary opacity-70 rounded"></div>
            <span className="text-muted-foreground">30-42km</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 bg-running-secondary rounded"></div>
            <span className="text-muted-foreground">42-50km</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 bg-orange-500 rounded"></div>
            <span className="text-muted-foreground">50km+</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-running-primary" />
            {title}
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={prevYear}
            className="p-2 hover:bg-gray-100 rounded"
          >
            &lt;
          </button>
          <span className="font-medium">{year}</span>
          <button 
            onClick={nextYear}
            className="p-2 hover:bg-gray-100 rounded"
          >
            &gt;
          </button>
        </div>
      </CardHeader>
      
      {/* Leyenda de colores */}
      <DistanceLegend />
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, monthIndex) => (
            <div key={monthIndex} className="border rounded-lg p-2">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-medium">{getMonthName(monthIndex)}</h3>
                <div className="text-sm text-muted-foreground">
                  {monthlyStats[monthIndex].days} días • {monthlyStats[monthIndex].distance.toFixed(1)}km
                </div>
              </div>
              <Calendar
                mode="multiple"
                selected={modifiers.runDay.filter(date => date.getMonth() === monthIndex)}
                month={new Date(year, monthIndex)}
                className="p-0"
                classNames={{
                  day: cn(
                    "h-7 w-7 p-0 font-normal text-[0.8rem]"
                  ),
                  day_selected: cn(
                    "bg-running-primary text-primary-foreground hover:bg-running-primary hover:text-primary-foreground focus:bg-running-primary focus:text-primary-foreground"
                  ),
                  head_cell: cn(
                    "text-muted-foreground rounded-md w-7 font-normal text-[0.7rem]"
                  ),
                  cell: cn(
                    "h-7 w-7 text-center text-sm p-0",
                  ),
                  month: "space-y-2"
                }}
                disabled={{
                  before: new Date(year, 0, 1),
                  after: new Date(year, 11, 31)
                }}
                fixedWeeks
                ISOWeek
                captionLayout="buttons"
                fromMonth={new Date(year, 0)}
                toMonth={new Date(year, 11)}
                modifiers={modifiers}
                modifiersStyles={modifiersStyles}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RunningYearCalendar;
