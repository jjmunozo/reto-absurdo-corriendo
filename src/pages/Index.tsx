
import React from 'react';
import { MapPin, TrendingUp, Clock, Flag, Activity, RefreshCw } from 'lucide-react';
import { useJuanStravaData } from '@/hooks/useJuanStravaData';
import { Button } from '@/components/ui/button';
import StatCard from '@/components/StatCard';
import RunningChart from '@/components/RunningChart';
import RecentRuns from '@/components/RecentRuns';
import RunsPerHourChart from '@/components/RunsPerHourChart';
import GitHubContributionTracker from '@/components/GitHubContributionTracker';
import { 
  calculateTotalStats,
  calculateMonthlyStats,
  prepareChartData,
  calculateRunsPerHour
} from '@/utils/stravaAdapter';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const { 
    activities, 
    isLoading, 
    isSyncing, 
    lastSync,
    error,
    syncActivities 
  } = useJuanStravaData();

  const handleSync = async () => {
    try {
      await syncActivities();
      toast({
        title: "Sincronización completada",
        description: "Los datos han sido actualizados",
      });
    } catch (error: any) {
      toast({
        title: "Error en sincronización",
        description: error.message || "No se pudieron sincronizar las actividades",
        variant: "destructive",
      });
    }
  };

  // Calcular estadísticas
  const totalStats = calculateTotalStats(activities);
  const monthlyStats = calculateMonthlyStats(activities);
  const chartData = prepareChartData(monthlyStats);
  const recentRuns = activities.slice(0, 5);
  const runsPerHourData = calculateRunsPerHour(activities);

  // Formatear funciones
  const formatPace = (pace: number) => {
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}'${seconds.toString().padStart(2, '0')}"`;
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-running-primary to-running-dark text-white py-12 px-4 md:px-8">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">El reto más absurdo</h1>
              <p className="text-lg opacity-90">
                Datos de entrenamiento de Juan
                {lastSync && (
                  <span className="block text-sm mt-1">
                    Última actualización: {lastSync.toLocaleString('es-ES')}
                  </span>
                )}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex gap-2">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={handleSync}
                disabled={isSyncing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Sincronizando...' : 'Actualizar datos'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-running-primary"></div>
          </div>
        )}

        {/* Stats Summary Section */}
        {!isLoading && (
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
                title="Ritmo Promedio" 
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
        )}

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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay carreras registradas</h3>
            <p className="text-gray-600 mb-4">Haz clic en "Actualizar datos" para cargar las actividades más recientes.</p>
            <Button onClick={handleSync} disabled={isSyncing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Sincronizando...' : 'Actualizar datos'}
            </Button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 py-6 px-4">
        <div className="container mx-auto text-center text-gray-600">
          <p className="text-sm">&copy; 2024 El reto más absurdo | Datos actualizados automáticamente desde Strava</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
