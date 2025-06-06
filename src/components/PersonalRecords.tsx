
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, ChevronDown, ChevronUp } from 'lucide-react';
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

  if (prsRuns.length === 0) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {displayedRuns.map((run) => (
            <div key={run.id} className="aspect-square border border-yellow-200 rounded-lg p-4 bg-yellow-50 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                  <h4 className="font-semibold text-yellow-800 text-sm leading-tight">
                    {run.prType || 'Récord Personal'}
                  </h4>
                </div>
                <p className="text-xs text-gray-700 mb-3 line-clamp-3">
                  {run.prDescription}
                </p>
              </div>
              
              <div className="text-xs text-gray-600 space-y-1">
                <div className="flex items-center gap-1">
                  <span>📅</span>
                  <span>{formatDate(run.date)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>📍</span>
                  <span className="truncate">{run.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>📏</span>
                  <span>{run.distance.toFixed(1)}km</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>⏱️</span>
                  <span>{Math.floor(run.duration / 60)}h {run.duration % 60}m</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {hasMore && (
          <div className="flex justify-center">
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
