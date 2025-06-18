
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RunData } from '@/data/runningData';
import { toZonedTime, format } from 'date-fns-tz';

interface RecentRunsProps {
  runs: RunData[];
  title: string;
  description?: string;
}

const COSTA_RICA_TIMEZONE = 'America/Costa_Rica';

const RecentRuns: React.FC<RecentRunsProps> = ({
  runs,
  title,
  description
}) => {
  // Formatear fecha - CORRECCIÓN: detectar si es dato manual o de Strava
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    
    console.log('🔧 FORMATEANDO FECHA:', {
      original: dateString,
      esTimestamp: dateString.includes('T'),
      fechaParseada: date.toISOString()
    });
    
    // Si la fecha parece ser solo una fecha (YYYY-MM-DD) o es un dato manual, tratarla como local
    if (!dateString.includes('T') || dateString.endsWith('T00:00:00')) {
      // Es una fecha local (datos manuales), no convertir zona horaria
      return date.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short' 
      });
    } else {
      // Es un timestamp completo de Strava, convertir a zona horaria de Costa Rica
      const costaRicaDate = toZonedTime(date, COSTA_RICA_TIMEZONE);
      return format(costaRicaDate, 'dd MMM', { timeZone: COSTA_RICA_TIMEZONE, locale: require('date-fns/locale/es') });
    }
  };

  // Formatear hora - CORRECCIÓN: para datos manuales usar la hora tal como se guardó
  const formatTime = (dateTimeString: string) => {
    if (!dateTimeString) return "-";
    
    const date = new Date(dateTimeString);
    
    console.log('🔧 FORMATEANDO HORA:', {
      original: dateTimeString,
      fechaParseada: date.toISOString(),
      horaLocal: date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true })
    });
    
    // Para datos manuales y de Strava, usar la hora local sin conversiones adicionales
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
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
