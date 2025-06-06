
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
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
  // Filtrar carreras que tienen PRs
  const prsRuns = runs.filter(run => run.hasPR && (run.prType || run.prDescription));

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
        <div className="space-y-4">
          {prsRuns.map((run) => (
            <div key={run.id} className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="h-4 w-4 text-yellow-600" />
                    <h4 className="font-semibold text-yellow-800">
                      {run.prType || 'Récord Personal'}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    {run.prDescription}
                  </p>
                  <div className="text-xs text-gray-600 grid grid-cols-2 gap-2">
                    <span>📅 {formatDate(run.date)}</span>
                    <span>📍 {run.location}</span>
                    <span>📏 {run.distance.toFixed(1)}km</span>
                    <span>⏱️ {Math.floor(run.duration / 60)}h {run.duration % 60}m</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalRecords;
