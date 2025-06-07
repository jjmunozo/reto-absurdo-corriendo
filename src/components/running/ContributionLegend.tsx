
import React from 'react';

/**
 * Legend component showing the intensity scale (coral style)
 */
const ContributionLegend: React.FC = () => {
  const levels = [
    { level: 0, label: 'Sin actividad' },
    { level: 1, label: 'Poca actividad' },
    { level: 2, label: 'Actividad moderada' },
    { level: 3, label: 'Alta actividad' },
    { level: 4, label: 'Muy alta actividad' }
  ];

  const getColorClass = (level: number): string => {
    switch (level) {
      case 0: return 'bg-gray-100 dark:bg-gray-800';
      case 1: return 'bg-red-100'; // Lightest coral tone
      case 2: return 'bg-red-200'; // Light coral tone
      case 3: return 'bg-red-300'; // Medium coral tone
      case 4: return 'bg-brand-coral'; // Full coral color
      default: return 'bg-gray-100 dark:bg-gray-800';
    }
  };

  return (
    <div className="flex items-center justify-between text-sm text-gray-600">
      <span>Actividad de entrenamiento</span>
      
      <div className="flex items-center gap-2">
        <span className="text-xs">Menos</span>
        <div className="flex gap-1">
          {levels.map(({ level }) => (
            <div
              key={level}
              className={`w-3 h-3 rounded-sm border border-gray-200 dark:border-gray-700 ${getColorClass(level)}`}
              title={levels[level].label}
            />
          ))}
        </div>
        <span className="text-xs">Más</span>
      </div>
    </div>
  );
};

export default ContributionLegend;
