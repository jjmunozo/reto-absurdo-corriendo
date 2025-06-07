import React from 'react';
import { useManualRunData } from '@/hooks/useManualRunData';
import { toast } from '@/hooks/use-toast';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import HeroSection from '@/components/HeroSection';
import StatsSummary from '@/components/StatsSummary';
import RecentRuns from '@/components/RecentRuns';
import RunsPerHourChart from '@/components/RunsPerHourChart';
import PersonalRecords from '@/components/PersonalRecords';
import GitHubContributionTracker from '@/components/GitHubContributionTracker';
import WeeklyPaceChart from '@/components/WeeklyPaceChart';
import RunningChart from '@/components/RunningChart';
import { 
  calculateMonthlyStats,
  prepareChartData,
  calculateRunsPerHour,
  calculateWeeklyPaceStats
} from '@/utils/stravaAdapter';

const Index = () => {
  const { 
    activities, 
    isLoading, 
    lastSync,
    error,
    syncActivities 
  } = useManualRunData();

  const handleRefresh = async () => {
    try {
      await syncActivities();
      toast({
        title: "Datos actualizados",
        description: "Las carreras han sido recargadas",
      });
    } catch (error: any) {
      toast({
        title: "Error al actualizar",
        description: error.message || "No se pudieron cargar las carreras",
        variant: "destructive",
      });
    }
  };

  // Calcular estadísticas
  const monthlyStats = calculateMonthlyStats(activities);
  const chartData = prepareChartData(monthlyStats);
  const recentRuns = activities.slice(0, 5);
  const runsPerHourData = calculateRunsPerHour(activities);
  const weeklyPaceData = calculateWeeklyPaceStats(activities);

  return (
    <div className="min-h-screen bg-logo-cream">
      <HeroSection lastSync={lastSync} />

      {/* Challenge Description Dropdown */}
      <section className="container mx-auto px-4 py-6">
        <Collapsible>
          <CollapsibleTrigger className="w-full bg-logo-orange hover:bg-logo-yellow text-white hover:text-logo-gray-purple rounded-lg p-4 transition-colors group">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-left">¿Cuál es el reto más absurdo?</h2>
              <ChevronDown className="h-5 w-5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="bg-logo-cream border-x-2 border-b-2 border-logo-orange rounded-b-lg p-6">
            <div className="space-y-4 text-logo-gray-purple leading-relaxed">
              <p>
                ¡Hola, soy Juan! Me puse un reto épico este año porque creo en el valor de hacer <strong className="text-logo-red">Cosas Difíciles</strong>.
              </p>
              
              <p>
                Yo "odiaba" correr entonces no corría pero hay algo que odio más que correr: odiar hacer cosas y que me obstaculicen.
              </p>
              
              <p>
                Decidí ponerme un reto que me diera miedo — un <strong className="text-logo-red">misogi</strong>: correr 100km en un tiempo de 24hrs.
              </p>
              
              <p>
                Este es el resumen de mi entrenamiento que comencé el 7 de enero.
              </p>
              
              <p className="text-sm text-logo-gray-purple italic">
                Mi programación la hace{' '}
                <a 
                  href="https://www.instagram.com/marioperezcoaching/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-logo-coral hover:text-logo-red underline"
                >
                  Mario Perez
                </a>
                {' '}y mi nutrición{' '}
                <a 
                  href="https://www.instagram.com/midietanoesdieta/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-logo-coral hover:text-logo-red underline"
                >
                  Natalia Villalobos
                </a>
                {' '}— ¡gracias a ambos!
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Error State */}
        {error && (
          <div className="bg-logo-coral/10 border border-logo-coral rounded-lg p-4 mb-6">
            <p className="text-logo-red">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-logo-coral"></div>
          </div>
        )}

        <StatsSummary activities={activities} isLoading={isLoading} />

        {/* Recent Runs Table */}
        {!isLoading && activities.length > 0 && (
          <section className="mb-10">
            <RecentRuns 
              runs={recentRuns} 
              title="Carreras Recientes" 
              description="Las últimas 5 carreras registradas"
            />
          </section>
        )}

        {/* Carreras por hora del día */}
        {!isLoading && activities.length > 0 && (
          <section className="mb-10">
            <RunsPerHourChart 
              data={runsPerHourData}
              title="Distribución de Carreras por Hora"
              description="Cantidad de carreras iniciadas en cada hora del día"
            />
          </section>
        )}

        {/* Personal Records Section */}
        {!isLoading && activities.length > 0 && (
          <section className="mb-10">
            <PersonalRecords 
              runs={activities} 
              title="Récords Personales" 
              description="Tus mejores logros y récords personales"
            />
          </section>
        )}

        {/* GitHub-style Contribution Tracker */}
        {!isLoading && activities.length > 0 && (
          <section className="mb-10">
            <GitHubContributionTracker
              runningData={activities}
              title="Actividad de Entrenamiento"
              description="Actividad de entrenamiento durante el año, similar al contribution tracker de GitHub"
            />
          </section>
        )}

        {/* Weekly Pace Evolution Chart */}
        {!isLoading && activities.length > 0 && weeklyPaceData.length > 0 && (
          <section className="mb-10">
            <WeeklyPaceChart 
              data={weeklyPaceData}
              title="Evolución del Pace Semanal"
              description="Cambios en el pace promedio por semana"
            />
          </section>
        )}

        {/* Charts Section */}
        {!isLoading && activities.length > 0 && (
          <section className="mb-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RunningChart 
              data={chartData} 
              title="Distancia Mensual" 
              description="Kilómetros recorridos por mes"
              dataKey="distance"
              yAxisLabel="Distancia (km)"
            />
            <RunningChart 
              data={chartData} 
              title="Número de Carreras" 
              description="Carreras completadas por mes"
              dataKey="runs"
              yAxisLabel="Carreras"
            />
          </section>
        )}

        {/* Empty State */}
        {!isLoading && activities.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-logo-gray-purple mb-2">No hay carreras registradas</h3>
            <p className="text-logo-gray-purple/70 mb-4">No se han encontrado carreras en el sistema.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-logo-gray-purple/10 py-6 px-4">
        <div className="container mx-auto text-center text-logo-gray-purple">
          <p className="text-sm">&copy; 2025 El reto más absurdo | Datos verificados por Strava</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
