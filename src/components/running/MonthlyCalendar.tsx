
import React, { useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { getMonthName, getDistanceColorClass } from '@/utils/calendarUtils';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { RunData } from '@/data/runningData';

interface MonthlyCalendarProps {
  year: number;
  monthIndex: number;
  runDates: Record<string, number>;
  stats: { days: number; distance: number };
  runningData: RunData[];
}

/**
 * Component for displaying a single month's calendar with run data
 */
const MonthlyCalendar: React.FC<MonthlyCalendarProps> = ({
  year,
  monthIndex,
  runDates,
  stats,
  runningData
}) => {
  console.log(`Rendering calendar for ${getMonthName(monthIndex)} ${year}`);
  console.log(`Available runDates:`, Object.keys(runDates));
  
  // Function to get the ISO date string format (YYYY-MM-DD) from a Date object
  const getDateString = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };
  
  // Filter run days for this specific month and year
  const runDaysForMonth = useMemo(() => {
    const days = Object.entries(runDates)
      .filter(([dateStr]) => {
        const date = new Date(dateStr);
        const isMatchingYear = date.getFullYear() === year;
        const isMatchingMonth = date.getMonth() === monthIndex;
        
        console.log(`Date check: ${dateStr} - Year match: ${isMatchingYear}, Month match: ${isMatchingMonth}`);
        return isMatchingYear && isMatchingMonth;
      })
      .map(([dateStr]) => new Date(dateStr));
    
    console.log(`Run days for ${getMonthName(monthIndex)} ${year}:`, days.length);
    console.log(`Run days dates:`, days.map(d => getDateString(d)));
    
    return days;
  }, [runDates, year, monthIndex]);
  
  // Function to personalize the appearance of days
  const modifiers = useMemo(() => ({
    runDay: runDaysForMonth,
  }), [runDaysForMonth]);
  
  // Find run by date
  const getRunByDate = (dateStr: string): RunData | undefined => {
    const run = runningData.find(run => run.date === dateStr);
    if (run) {
      console.log(`Found run for ${dateStr}:`, run);
    }
    return run;
  };
  
  // Format pace for display
  const formatPace = (pace: number) => {
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}'${seconds.toString().padStart(2, '0')}"`;
  };
  
  // Format time
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const modifiersStyles = {
    runDay: (date: Date) => {
      const dateStr = getDateString(date);
      const distance = runDates[dateStr] || 0;
      
      if (!distance) return {};
      
      console.log(`Styling day ${dateStr} with distance ${distance}`);
      return { 
        backgroundColor: '', 
        className: cn(getDistanceColorClass(distance), "rounded-md")
      };
    }
  };
  
  const renderDayContents = (day: Date) => {
    const dateStr = getDateString(day);
    const distance = runDates[dateStr] || 0;
    
    if (!distance) {
      return <span>{day.getDate()}</span>;
    }
    
    const run = getRunByDate(dateStr);
    
    if (!run) {
      return <span>{day.getDate()}</span>;
    }
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="w-full h-full flex items-center justify-center cursor-pointer">
              {day.getDate()}
            </span>
          </TooltipTrigger>
          <TooltipContent className="bg-white p-2 max-w-xs w-[240px]">
            <div className="space-y-1">
              <div className="font-semibold border-b pb-1">{run.date}</div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm">
                <span className="text-muted-foreground">Distancia:</span>
                <span>{run.distance.toFixed(1)}km</span>
                <span className="text-muted-foreground">Tiempo:</span>
                <span>{formatTime(run.duration)}</span>
                <span className="text-muted-foreground">Ritmo:</span>
                <span>{formatPace(run.avgPace)}</span>
                <span className="text-muted-foreground">Elevación:</span>
                <span>{run.elevation}m</span>
                <span className="text-muted-foreground">Ubicación:</span>
                <span className="truncate">{run.location}</span>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className="border rounded-lg p-2 shadow-sm">
      <div className="flex justify-between items-center mb-1">
        <h3 className="font-medium">{getMonthName(monthIndex)}</h3>
        <div className="text-sm text-muted-foreground">
          {stats.days} días • {stats.distance.toFixed(1)}km
        </div>
      </div>
      <Calendar
        mode="multiple"
        selected={modifiers.runDay}
        month={new Date(year, monthIndex)}
        className="p-0"
        classNames={{
          day: cn(
            "h-7 w-7 p-0 font-normal text-[0.8rem] rounded-md transition-colors"
          ),
          day_selected: cn(
            "bg-running-primary text-primary-foreground hover:bg-running-primary hover:text-primary-foreground focus:bg-running-primary focus:text-primary-foreground rounded-md"
          ),
          head_cell: cn(
            "text-muted-foreground rounded-md w-7 font-normal text-[0.7rem]"
          ),
          cell: cn(
            "h-7 w-7 text-center text-sm p-0 rounded-md",
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
        components={{
          Day: ({ date, ...props }) => {
            return (
              <div {...props}>
                {renderDayContents(date)}
              </div>
            );
          }
        }}
      />
    </div>
  );
};

export default MonthlyCalendar;
