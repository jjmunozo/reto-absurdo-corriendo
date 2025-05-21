
import React from 'react';
import { BookOpen } from 'lucide-react';

/**
 * Legend component showing distance ranges and their corresponding colors
 */
const DistanceLegend: React.FC = () => {
  return (
    <div className="mt-2 pb-3 px-4 border-b">
      <div className="flex items-center gap-1.5 mb-2">
        <BookOpen className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Leyenda de colores</span>
      </div>
      <p className="text-xs text-muted-foreground mb-2">
        Cada día con actividad de carrera está marcado con un color que representa la distancia recorrida:
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 bg-running-light opacity-50 rounded"></div>
          <span className="text-muted-foreground">&lt;10km (Corta)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 bg-running-primary opacity-60 rounded"></div>
          <span className="text-muted-foreground">10-15km (Media)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 bg-running-primary opacity-80 rounded"></div>
          <span className="text-muted-foreground">15-20km (Media-larga)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 bg-running-primary rounded"></div>
          <span className="text-muted-foreground">20-30km (Larga)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 bg-running-secondary opacity-70 rounded"></div>
          <span className="text-muted-foreground">30-42km (Maratón)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 bg-running-secondary rounded"></div>
          <span className="text-muted-foreground">42-50km (Ultra corta)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 bg-orange-500 rounded"></div>
          <span className="text-muted-foreground">50km+ (Ultra)</span>
        </div>
      </div>
    </div>
  );
};

export default DistanceLegend;
