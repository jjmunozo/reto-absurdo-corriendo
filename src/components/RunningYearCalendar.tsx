
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon } from 'lucide-react';
import { RunData } from '@/data/runningData';

import DistanceLegend from '@/components/running/DistanceLegend';
import MonthlyCalendar from '@/components/running/MonthlyCalendar';
import YearNavigation from '@/components/running/YearNavigation';
import { createRunDatesMap, calculateMonthlyStats } from '@/utils/calendarUtils';

interface RunningYearCalendarProps {
  runningData: RunData[];
  title: string;
  description?: string;
}

/**
 * A calendar component showing running activity throughout the year
 */
const RunningYearCalendar: React.FC<RunningYearCalendarProps> = ({
  runningData,
  title,
  description
}) => {
  const [year, setYear] = useState(new Date().getFullYear());
  
  // Get all days with running activity
  const runDates = useMemo(() => 
    createRunDatesMap(runningData, year), 
    [runningData, year]
  );
  
  // Calculate monthly statistics
  const monthlyStats = useMemo(() => 
    calculateMonthlyStats(runDates, year), 
    [runDates, year]
  );
  
  // Change to previous year
  const prevYear = () => setYear(year - 1);
  
  // Change to next year
  const nextYear = () => setYear(year + 1);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-running-primary" />
            {title}
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        <YearNavigation 
          year={year} 
          onPrevYear={prevYear} 
          onNextYear={nextYear} 
        />
      </CardHeader>
      
      {/* Color legend */}
      <DistanceLegend />
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, monthIndex) => (
            <MonthlyCalendar
              key={monthIndex}
              year={year}
              monthIndex={monthIndex}
              runDates={runDates}
              stats={monthlyStats[monthIndex]}
              runningData={runningData}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RunningYearCalendar;
