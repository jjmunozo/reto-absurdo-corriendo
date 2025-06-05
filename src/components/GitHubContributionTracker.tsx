
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';
import { RunData } from '@/data/runningData';
import ContributionGrid from '@/components/running/ContributionGrid';
import ContributionLegend from '@/components/running/ContributionLegend';
import YearNavigation from '@/components/running/YearNavigation';
import { createContributionData } from '@/utils/contributionUtils';

interface GitHubContributionTrackerProps {
  runningData: RunData[];
  title: string;
  description?: string;
}

/**
 * GitHub-style contribution tracker for running activities
 */
const GitHubContributionTracker: React.FC<GitHubContributionTrackerProps> = ({
  runningData,
  title,
  description
}) => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  // Create contribution data for the selected year
  const contributionData = useMemo(() => {
    console.log(`Creating contribution data for year ${year} with ${runningData.length} runs`);
    return createContributionData(runningData, year);
  }, [runningData, year]);

  // Calculate stats for the year
  const yearStats = useMemo(() => {
    const runsInYear = runningData.filter(run => {
      const runYear = new Date(run.date).getFullYear();
      return runYear === year;
    });

    return {
      totalRuns: runsInYear.length,
      totalDistance: runsInYear.reduce((sum, run) => sum + run.distance, 0),
      activeDays: contributionData.filter(day => day.level > 0).length
    };
  }, [runningData, year, contributionData]);

  const prevYear = () => setYear(year - 1);
  const nextYear = () => setYear(Math.min(currentYear, year + 1));

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-running-primary" />
            {title}
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
          <div className="text-sm text-muted-foreground mt-2">
            {yearStats.totalRuns} entrenamientos en {yearStats.activeDays} días diferentes • {yearStats.totalDistance.toFixed(1)}km totales
          </div>
        </div>
        <YearNavigation 
          year={year} 
          onPrevYear={prevYear} 
          onNextYear={nextYear} 
        />
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Contribution Grid */}
          <ContributionGrid data={contributionData} year={year} />
          
          {/* Legend */}
          <ContributionLegend />
        </div>
      </CardContent>
    </Card>
  );
};

export default GitHubContributionTracker;
