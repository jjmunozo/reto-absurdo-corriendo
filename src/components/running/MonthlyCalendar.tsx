
import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { getMonthName, getDistanceColorClass } from '@/utils/calendarUtils';

interface MonthlyCalendarProps {
  year: number;
  monthIndex: number;
  runDates: Record<string, number>;
  stats: { days: number; distance: number };
}

/**
 * Component for displaying a single month's calendar with run data
 */
const MonthlyCalendar: React.FC<MonthlyCalendarProps> = ({
  year,
  monthIndex,
  runDates,
  stats
}) => {
  // Function to personalize the appearance of days
  const modifiers = {
    runDay: Object.keys(runDates)
      .map(date => new Date(date))
      .filter(date => date.getMonth() === monthIndex),
  };
  
  const modifiersStyles = {
    runDay: (date: Date) => {
      const dateStr = date.toISOString().split('T')[0];
      const distance = runDates[dateStr] || 0;
      
      if (!distance) return {};
      
      return { backgroundColor: '', className: getDistanceColorClass(distance) };
    }
  };

  return (
    <div className="border rounded-lg p-2">
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
            "h-7 w-7 p-0 font-normal text-[0.8rem]"
          ),
          day_selected: cn(
            "bg-running-primary text-primary-foreground hover:bg-running-primary hover:text-primary-foreground focus:bg-running-primary focus:text-primary-foreground"
          ),
          head_cell: cn(
            "text-muted-foreground rounded-md w-7 font-normal text-[0.7rem]"
          ),
          cell: cn(
            "h-7 w-7 text-center text-sm p-0",
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
      />
    </div>
  );
};

export default MonthlyCalendar;
