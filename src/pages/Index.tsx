import React, { useState, useEffect } from 'react';
import { MapPin, TrendingUp, Clock, Flag, Activity } from 'lucide-react';
import StatCard from '@/components/StatCard';
import RunningChart from '@/components/RunningChart';
import RunningYearCalendar from '@/components/RunningYearCalendar';
import RecentRuns from '@/components/RecentRuns';
import RunsPerHourChart from '@/components/RunsPerHourChart';
import AdminPanel from '@/components/AdminPanel';
import { RunData } from '@/data/runningData';
import { useStravaRuns } from '@/hooks/useStravaRuns';
import { 
  calculateTotalStats,
  calculateMonthlyStats,
  generateHeatmapData,
  prepareChartData,
  calculateRunsPerHour
} from '@/utils/stravaAdapter';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [showAdmin, setShowAdmin] = useState<boolean>(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  
  // Usar el nuevo hook para obtener datos de Strava
  const { runs, isLoading, isError, error, refresh } = useStravaRuns();

  // Función para verificar si estamos en la ruta admin
  useEffect(() => {
    const checkAdminRoute = () => {
      const hashParams = window.location.hash.substring(1);
      if (hashParams === 'admin') {
        setShowAdmin(true);
      } else {
        setShowAdmin(false);
      }
    };

    checkAdminRoute();
    window.addEventListener('hashchange', checkAdminRoute);
    
    return () => {
      window.removeEventListener('hashchange', checkAdminRoute);
    };
  }, []);

  // Actualizar la fecha de última actualización cuando los datos cambian
  useEffect(() => {
    if (runs.length > 0 && !isLoading) {
      setLastUpdateTime(new Date());
    }
  }, [runs, isLoading]);

  // Mostrar toast si hay error
  useEffect(() => {
    if (isError && error) {
      toast({
        title: "Error cargando datos",
        description: "No se pudieron cargar los datos de Strava",
        variant: "destructive",
      });
    }
  }, [isError, error]);

  // Si estamos en la ruta admin, mostrar el panel de administración
  if (showAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="container mx-auto">
          <AdminPanel />
        </div>
      </div>
    );
  }

  const totalStats = calculateTotalStats(runs);
  const monthlyStats = calculateMonthlyStats(runs);
  const chartData = prepareChartData(monthlyStats);
  const heatmapData = generateHeatmapData(runs);
  const recentRuns = runs.slice(0, 5);
  const runsPerHourData = calculateRunsPerHour(runs);

  // Formatear ritmo
  const formatPace = (pace: number) => {
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}'${seconds.toString().padStart(2, '0')}"`;
  };

  // Formatear tiempo
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Formatear fecha de última actualización
  const formatLastUpdate = (date: Date) => {
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
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
                Datos en tiempo real desde Strava
                <span className="ml-2 inline-flex items-center bg-[#FC4C02] text-white px-3 py-1 rounded-full text-sm font-medium">
                  <svg 
                    className="w-4 h-4 mr-2" 
                    viewBox="0 0 24 24" 
                    fill="currentColor"
                  >
                    <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.599h4.172L10.463 0l-7.008 13.828h4.172"/>
                  </svg>
                  Juan J. Muñoz
                </span>
                {isLoading && (
                  <span className="block text-sm mt-1">
                    Cargando datos...
                  </span>
                )}
                {!isLoading && runs.length > 0 && (
                  <span className="block text-sm mt-1">
                    Última actualización: {formatLastUpdate(lastUpdateTime)}
                  </span>
                )}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div 
                className="text-xs opacity-30 hover:opacity-100 cursor-default transition-opacity mt-2 text-right"
                onDoubleClick={() => window.location.href = "#admin"}
              >
                v2.0.0
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-running-primary"></div>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <p className="font-medium">Error cargando datos de Strava</p>
            <p className="text-sm">Intentando reconectar automáticamente...</p>
          </div>
        )}

        {/* Stats Summary Section */}
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

        {/* Recent Runs Table */}
        {!isLoading && runs.length > 0 && (
          <section className="mb-10">
            <RecentRuns 
              runs={recentRuns} 
              title="Carreras Recientes" 
              description="Tus últimas 5 carreras registradas"
            />
          </section>
        )}
        
        {/* Carreras por hora del día */}
        {!isLoading && runs.length > 0 && (
          <section className="mb-10">
            <RunsPerHourChart 
              data={runsPerHourData}
              title="Distribución de Carreras por Hora"
              description="Cantidad de carreras iniciadas en cada hora del día"
            />
          </section>
        )}

        {/* Calendar Section */}
        {!isLoading && runs.length > 0 && (
          <section className="mb-10">
            <RunningYearCalendar
              runningData={runs}
              title="Calendario Detallado de Carreras"
              description="Vista detallada por mes con leyenda de colores mejorada"
            />
          </section>
        )}

        {/* Charts Section */}
        {!isLoading && runs.length > 0 && (
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
        {!isLoading && !isError && runs.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay carreras registradas</h3>
            <p className="text-gray-600">Los datos se actualizarán automáticamente cuando estén disponibles.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 py-6 px-4">
        <div className="container mx-auto text-center text-gray-600">
          <p className="text-sm">&copy; 2024 El reto más absurdo | Inspirado por <a href="https://www.surferdiary.com/stats" className="underline hover:text-running-primary">SurferDiary.com</a></p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
