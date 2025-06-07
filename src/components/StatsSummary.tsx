
import React from 'react';
import { MapPin, TrendingUp, Clock, Flag, Activity } from 'lucide-react';
import StatCard from '@/components/StatCard';
import { RunData } from '@/data/runningData';
import { calculateTotalStats, formatPace, formatTime } from '@/utils/statsCalculations';

interface StatsSummaryProps {
  activities: RunData[];
  isLoading: boolean;
}

const StatsSummary: React.FC<StatsSummaryProps> = ({ activities, isLoading }) => {
  if (isLoading) return null;

  const totalStats = calculateTotalStats(activities);

  return (
    <section className="mb-10 animate-fade-in">
      <h2 className="text-2xl font-bold mb-6">Resumen Total</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard 
          title="Distancia Total" 
          value={`${totalStats.totalDistance.toFixed(1)}km`} 
          icon={<MapPin size={24} />}
        />
        <StatCard 
          title="Carrera Más Larga" 
          value={`${totalStats.longestRun.toFixed(1)}km`}
          icon={<TrendingUp size={24} />}
        />
        <StatCard 
          title="Tiempo Total" 
          value={formatTime(totalStats.totalTime)} 
          icon={<Clock size={24} />}
        />
        <StatCard 
          title="Total Carreras" 
          value={totalStats.totalRuns} 
          icon={<Activity size={24} />}
        />
        <StatCard 
          title="Pace Promedio" 
          value={formatPace(totalStats.avgPace)}
          subtitle="min/km" 
          icon={<Clock size={24} />}
        />
        <StatCard 
          title="Elevación Total" 
          value={`${totalStats.totalElevation}m`} 
          icon={<Flag size={24} />}
        />
      </div>
    </section>
  );
};

export default StatsSummary;
