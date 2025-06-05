
import React from 'react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from '@/components/ui/tooltip';

interface ContributionDay {
  date: string;
  level: number;
  distance: number;
  runs: number;
}

interface ContributionGridProps {
  data: ContributionDay[];
  year: number;
}

/**
 * Grid component that displays the contribution squares for the entire year
 */
const ContributionGrid: React.FC<ContributionGridProps> = ({ data, year }) => {
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Get the color class based on the level (0-4)
  const getColorClass = (level: number): string => {
    switch (level) {
      case 0: return 'bg-gray-100 dark:bg-gray-800';
      case 1: return 'bg-green-200 dark:bg-green-900';
      case 2: return 'bg-green-300 dark:bg-green-700';
      case 3: return 'bg-green-400 dark:bg-green-600';
      case 4: return 'bg-green-600 dark:bg-green-500';
      default: return 'bg-gray-100 dark:bg-gray-800';
    }
  };

  // Format date for tooltip
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Format time
  const formatTime = (minutes: number) => {
    if (minutes === 0) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Group data by weeks
  const weeks: ContributionDay[][] = [];
  let currentWeek: ContributionDay[] = [];
  
  // Get the first day of the year and adjust to start on Sunday
  const firstDay = new Date(year, 0, 1);
  const startDay = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Add empty days at the beginning if the year doesn't start on Sunday
  for (let i = 0; i < startDay; i++) {
    currentWeek.push({
      date: '',
      level: 0,
      distance: 0,
      runs: 0
    });
  }

  // Add all days of the year
  data.forEach((day, index) => {
    currentWeek.push(day);
    
    // If we have 7 days or it's the last day, complete the week
    if (currentWeek.length === 7) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  });

  // If there are remaining days, add them to the last week
  if (currentWeek.length > 0) {
    // Fill remaining days with empty
    while (currentWeek.length < 7) {
      currentWeek.push({
        date: '',
        level: 0,
        distance: 0,
        runs: 0
      });
    }
    weeks.push(currentWeek);
  }

  // Get month labels for the header
  const getMonthLabels = () => {
    const labels: { month: string; week: number }[] = [];
    let currentMonth = -1;
    
    weeks.forEach((week, weekIndex) => {
      const firstDayWithDate = week.find(day => day.date !== '');
      if (firstDayWithDate) {
        const date = new Date(firstDayWithDate.date);
        const month = date.getMonth();
        
        if (month !== currentMonth) {
          labels.push({ month: monthNames[month], week: weekIndex });
          currentMonth = month;
        }
      }
    });
    
    return labels;
  };

  const monthLabels = getMonthLabels();

  return (
    <div className="overflow-x-auto">
      <div className="min-w-fit">
        {/* Month labels */}
        <div className="flex mb-2">
          <div className="w-8"></div> {/* Space for day labels */}
          <div className="flex relative" style={{ width: weeks.length * 14 }}>
            {monthLabels.map(({ month, week }) => (
              <div
                key={`${month}-${week}`}
                className="absolute text-xs text-gray-600 font-medium"
                style={{ left: week * 14 }}
              >
                {month}
              </div>
            ))}
          </div>
        </div>

        {/* Main grid */}
        <div className="flex">
          {/* Day labels */}
          <div className="flex flex-col mr-2">
            {dayNames.map((day, index) => (
              <div
                key={day}
                className={`h-3 flex items-center text-xs text-gray-600 ${
                  index % 2 === 1 ? '' : 'opacity-0'
                }`}
                style={{ fontSize: '10px' }}
              >
                {index % 2 === 1 ? day : ''}
              </div>
            ))}
          </div>

          {/* Contribution squares */}
          <div className="flex gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => (
                  <TooltipProvider key={`${weekIndex}-${dayIndex}`}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`w-3 h-3 rounded-sm border border-gray-200 dark:border-gray-700 ${
                            day.date ? getColorClass(day.level) : 'bg-transparent border-transparent'
                          } transition-colors cursor-pointer hover:ring-1 hover:ring-gray-400`}
                        />
                      </TooltipTrigger>
                      {day.date && (
                        <TooltipContent className="bg-white p-2 max-w-xs">
                          <div className="space-y-1">
                            <div className="font-semibold">{formatDate(day.date)}</div>
                            {day.runs > 0 ? (
                              <div className="text-sm">
                                <div>{day.runs} entrenamiento{day.runs > 1 ? 's' : ''}</div>
                                <div>{day.distance.toFixed(1)}km totales</div>
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500">Sin entrenamientos</div>
                            )}
                          </div>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContributionGrid;
