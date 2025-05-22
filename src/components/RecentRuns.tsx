
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
  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  // Formatear hora usando la zona horaria correcta de Costa Rica
  const formatTime = (dateTimeString: string) => {
    if (!dateTimeString) return "-";
    
    // Crear un objeto Date a partir del string ISO
    const date = new Date(dateTimeString);
    
    // Formatear usando opciones específicas para Costa Rica (es-CR)
    // Note: La configuración regional es-CR incluirá ajustes específicos para Costa Rica
    return date.toLocaleTimeString('es-CR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true // Formato de 12 horas con AM/PM, común en Costa Rica
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
        <CardTitle>{title}</CardTitle>
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

