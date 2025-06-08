
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronDown, ChevronUp, MapPin, Clock, Calendar, Route } from 'lucide-react';
import { RunData } from '@/data/runningData';

interface PersonalRecordsProps {
  runs: RunData[];
  title: string;
  description?: string;
}

const PersonalRecords: React.FC<PersonalRecordsProps> = ({
  runs,
  title,
  description
}) => {
  const [showAll, setShowAll] = useState(false);
  
  // Filtrar carreras que tienen PRs
  const prsRuns = runs.filter(run => run.hasPR && (run.prType || run.prDescription));
  
  // Mostrar solo 6 o todos según el estado
  const displayedRuns = showAll ? prsRuns : prsRuns.slice(0, 6);
  const hasMore = prsRuns.length > 6;

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
  };

  // Formatear tiempo
  const formatTime = (duration: number) => {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  if (prsRuns.length === 0) {
    return null;
  }

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
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-gray-100">
              <TableRow>
                <TableHead className="w-[200px] text-black">
                  <div className="flex items-center gap-2">
                    <img 
                      src="https://cdn.prod.website-files.com/61a2c8c4fb992469753cd087/6844d632972b1e36f8fe4229_logo_reto_rojo_transp.png" 
                      alt="Logo" 
                      className="h-10 w-10 object-contain"
                    />
                    Tipo de Récord
                  </div>
                </TableHead>
                <TableHead className="text-black">Descripción</TableHead>
                <TableHead className="w-[120px] text-black">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Fecha
                  </div>
                </TableHead>
                <TableHead className="w-[150px] text-black">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Ubicación
                  </div>
                </TableHead>
                <TableHead className="w-[100px] text-black">
                  <div className="flex items-center gap-2">
                    <Route className="h-4 w-4" />
                    Distancia
                  </div>
                </TableHead>
                <TableHead className="w-[100px] text-black">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Tiempo
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedRuns.map((run) => (
                <TableRow key={run.id} className="hover:bg-yellow-50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <img 
                        src="https://cdn.prod.website-files.com/61a2c8c4fb992469753cd087/6844d632972b1e36f8fe4229_logo_reto_rojo_transp.png" 
                        alt="Logo" 
                        className="h-10 w-10 object-contain"
                      />
                      <span className="text-brand-coral">{run.prType || 'Récord Personal'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[300px]">
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {run.prDescription}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(run.date)}
                  </TableCell>
                  <TableCell className="text-sm">
                    <span className="truncate block max-w-[130px]" title={run.location}>
                      {run.location}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {run.distance.toFixed(1)}km
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {formatTime(run.duration)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {hasMore && (
          <div className="flex justify-center mt-4">
            <Button
              variant="outline"
              onClick={() => setShowAll(!showAll)}
              className="flex items-center gap-2"
            >
              {showAll ? (
                <>
                  Ver menos
                  <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  Ver más récords ({prsRuns.length - 6} más)
                  <ChevronDown className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PersonalRecords;
