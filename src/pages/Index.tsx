
import React, { useState, useEffect } from 'react';
import { MapPin, TrendingUp, Clock, Flag, Activity } from 'lucide-react';
import StatCard from '@/components/StatCard';
import RunningChart from '@/components/RunningChart';
import RunningHeatmap from '@/components/RunningHeatmap';
import RecentRuns from '@/components/RecentRuns';
import StravaConnectButton from '@/components/StravaConnectButton';
import { 
  runningData as defaultRunningData, 
  RunData 
} from '@/data/runningData';
import { 
  isAuthenticated,
  getRunningData 
} from '@/services/stravaService';
import { 
  calculateTotalStats,
  calculateMonthlyStats,
  generateHeatmapData,
  prepareChartData,
  fetchStravaRunningData
} from '@/utils/stravaAdapter';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [runningData, setRunningData] = useState<RunData[]>(defaultRunningData);
  const [usingStravaData, setUsingStravaData] = useState<boolean>(false);

  // Cargar datos de Strava si el usuario está autenticado
  useEffect(() => {
    const loadStravaData = async () => {
      if (isAuthenticated()) {
        try {
          setLoading(true);
          const data = await fetchStravaRunningData();
          if (data.length > 0) {
            setRunningData(data);
            setUsingStravaData(true);
            toast({
              title: "Datos cargados",
              description: `Se cargaron ${data.length} actividades de tu cuenta de Strava`,
            });
          }
        } catch (error) {
          console.error("Error cargando datos de Strava:", error);
          toast({
            title: "Error",
            description: "No se pudieron cargar los datos de Strava",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      }
    };

    loadStravaData();
  }, []);

  const totalStats = calculateTotalStats(runningData);
  const monthlyStats = calculateMonthlyStats(runningData);
  const chartData = prepareChartData(monthlyStats);
  const heatmapData = generateHeatmapData(runningData);
  const recentRuns = runningData.slice(0, 5);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-running-primary to-running-dark text-white py-12 px-4 md:px-8">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">El reto más absurdo</h1>
              <p className="text-lg opacity-90">
                Seguimiento de mis estadísticas de correr
                {usingStravaData && <span className="ml-2 text-sm bg-white bg-opacity-20 px-2 py-1 rounded">Datos de Strava</span>}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <StravaConnectButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-running-primary"></div>
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

        {/* Heatmap Section */}
        <section className="mb-10">
          <RunningHeatmap 
            data={heatmapData} 
            title="Calendario de Carreras" 
            description="Actividad de carreras por mes en todo el año"
          />
        </section>

        {/* Charts Section */}
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

        {/* Recent Runs Table */}
        <section className="mb-10">
          <RecentRuns 
            runs={recentRuns} 
            title="Carreras Recientes" 
            description="Tus últimas 5 carreras registradas"
          />
        </section>

        {!usingStravaData && !isAuthenticated() && (
          <section className="mb-10 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Conecta con Strava para ver tus datos reales</h3>
              <p className="text-gray-600 mb-4">
                Actualmente estás viendo datos de ejemplo. Conecta tu cuenta de Strava para ver tus propias estadísticas de carrera.
              </p>
              <div className="flex justify-center">
                <StravaConnectButton />
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 py-6 px-4">
        <div className="container mx-auto text-center text-gray-600">
          <p className="text-sm">&copy; 2025 El reto más absurdo | Inspirado por <a href="https://www.surferdiary.com/stats" className="underline hover:text-running-primary">SurferDiary.com</a></p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
