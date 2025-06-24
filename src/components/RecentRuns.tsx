
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RunData } from '@/data/runningData';

interface RecentRunsProps {
  runs: RunData[];
  title: string;
  description?: string;
}

const RecentRuns: React.FC<RecentRunsProps> = ({
  runs,
  title,
  description
}) => {
  // Formatear fecha directamente del string de fecha SIN conversiones
  const formatDate = (dateString: string) => {
    console.log('🔧 FORMATEANDO FECHA SIN CONVERSIONES:', {
      original: dateString
    });
    
    // Usar directamente el string de fecha (YYYY-MM-DD) y convertir a formato legible
    const [year, month, day] = dateString.split('-');
    const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 
                       'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    
    const formattedDate = `${parseInt(day)} ${monthNames[parseInt(month) - 1]}`;
    
    console.log('✅ Fecha formateada final:', formattedDate);
    return formattedDate;
  };

  // Formatear hora directamente del timestamp SIN conversiones de zona horaria
  const formatTime = (dateTimeString: string) => {
    if (!dateTimeString) return "-";
    
    console.log('🔧 FORMATEANDO HORA SIN CONVERSIONES:', {
      original: dateTimeString
    });
    
    // Extraer la hora directamente del string (formato: YYYY-MM-DDTHH:MM:SS)
    const timePart = dateTimeString.includes('T') 
      ? dateTimeString.split('T')[1] 
      : dateTimeString.split(' ')[1];
    
    if (!timePart) return "-";
    
    // Extraer hora y minuto
    const [hour, minute] = timePart.split(':');
    const hourNum = parseInt(hour);
    
    // Convertir a formato 12 horas
    const period = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
    
    const horaFormateada = `${displayHour}:${minute} ${period}`;
    
    console.log('✅ Hora formateada final:', horaFormateada);
    return horaFormateada;
  };

  // Formatear ritmo
  const formatPace = (pace: number) => {
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}'${seconds.toString().padStart(2, '0')}"`;
  };

  // Formatear duración
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <img 
            src="https://cdn.prod.website-files.com/61a2c8c4fb992469753cd087/6844d632972b1e36f8fe4229_logo_reto_rojo_transp.png" 
            alt="Logo" 
            className="h-12 w-12 object-contain"
          />
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Hora</TableHead>
              <TableHead>Distancia</TableHead>
              <TableHead>Tiempo</TableHead>
              <TableHead>Ritmo</TableHead>
              <TableHead>Elevación</TableHead>
              <TableHead>Descripción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {runs.map((run) => (
              <TableRow key={run.id}>
                <TableCell>{formatDate(run.date)}</TableCell>
                <TableCell>{formatTime(run.startTimeLocal)}</TableCell>
                <TableCell>{run.distance.toFixed(1)}km</TableCell>
                <TableCell>{formatDuration(run.duration)}</TableCell>
                <TableCell>{formatPace(run.avgPace)}/km</TableCell>
                <TableCell>{run.elevation}m</TableCell>
                <TableCell className="max-w-[150px] truncate">{run.location}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default RecentRuns;
