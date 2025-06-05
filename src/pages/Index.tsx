import React, { useState, useEffect } from 'react';
import { MapPin, TrendingUp, Clock, Flag, Activity } from 'lucide-react';
import StatCard from '@/components/StatCard';
import RunningChart from '@/components/RunningChart';
import RunningYearCalendar from '@/components/RunningYearCalendar';
import RecentRuns from '@/components/RecentRuns';
import StravaTroubleshooting from '@/components/StravaTroubleshooting';
import AdminPanel from '@/components/AdminPanel';
import RunsPerHourChart from '@/components/RunsPerHourChart';
import { 
  runningData as defaultRunningData, 
  RunData 
} from '@/data/runningData';
import { 
  isAuthenticated,
  getAthleteInfo,
  forcePerpetualConnection
} from '@/services/stravaService';
import {
  isAdminMode,
  formatLastUpdateTime,
  setupAutoUpdater
} from '@/services/dataExportService';
import { 
  calculateTotalStats,
  calculateMonthlyStats,
  generateHeatmapData,
  prepareChartData,
  fetchStravaRunningData,
  calculateRunsPerHour
} from '@/utils/stravaAdapter';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [runningData, setRunningData] = useState<RunData[]>(defaultRunningData);
  const [usingStravaData, setUsingStravaData] = useState<boolean>(false);
  const [showAdmin, setShowAdmin] = useState<boolean>(false);
  
  // Inicializar conexión perpetua inmediatamente
  useEffect(() => {
    if (!isAdminMode()) {
      console.log('🔄 Inicializando conexión perpetua para visitantes...');
      forcePerpetualConnection();
    }
  }, []);

  const athlete = getAthleteInfo();
  const adminMode = isAdminMode();

  // Función para verificar si estamos en la ruta admin
  useEffect(() => {
    const checkAdminRoute = () => {
      const hashParams = window.location.hash.substring(1);
      if (hashParams === 'admin') {
        setShowAdmin(true);
      }
    };

    // Verificar al cargar y también al cambiar el hash
    checkAdminRoute();
    window.addEventListener('hashchange', checkAdminRoute);
    
    return () => {
      window.removeEventListener('hashchange', checkAdminRoute);
    };
  }, []);

  // Cargar datos (de caché o de Strava según el caso)
  useEffect(() => {
    const loadStravaData = async () => {
      try {
        console.log('🏠 Index: Iniciando carga de datos...');
        console.log('🔧 Admin mode:', adminMode);
        console.log('🔐 Authenticated:', isAuthenticated());
        
        setLoading(true);
        const data = await fetchStravaRunningData();
        
        console.log('🏠 Index: Datos recibidos:', data.length, 'actividades');
        
        if (data.length > 0) {
          console.log('🏠 Index: Actualizando estado con datos de Strava');
          setRunningData(data);
          setUsingStravaData(true);
          
          // Solo mostrar toast en modo administrador
          if (adminMode) {
            toast({
              title: "Datos cargados",
              description: `Se cargaron ${data.length} actividades de carrera`,
            });
          }
        } else {
          console.log('🏠 Index: Sin datos, usando datos por defecto');
          
          // En modo no-admin, aún mostrar como conectado aunque use datos por defecto
          if (!adminMode) {
            setUsingStravaData(true);
          } else {
            // Solo mostrar error en modo administrador
            toast({
              title: "Sin actividades",
              description: "No se encontraron actividades de carrera. Usando datos por defecto.",
              variant: "default",
            });
          }
        }
      } catch (error) {
        console.error("🏠 Index: Error cargando datos:", error);
        
        // En modo no-admin, aún mostrar como conectado
        if (!adminMode) {
          setUsingStravaData(true);
        } else if (adminMode) {
          toast({
            title: "Error",
            description: "No se pudieron cargar los datos",
            variant: "destructive",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    loadStravaData();
    
    // Configurar actualizador automático si estamos en modo admin
    if (adminMode && isAuthenticated()) {
      setupAutoUpdater();
    }
  }, [adminMode]);

  // Si estamos en la ruta admin, mostrar el panel de administración
  if (showAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="container mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Panel de Administración</h1>
            <p className="text-gray-600">
              <a href="#" className="text-running-primary hover:underline">
                &larr; Volver a la página principal
              </a>
            </p>
          </div>
          <AdminPanel />
        </div>
      </div>
    );
  }

  const totalStats = calculateTotalStats(runningData);
  const monthlyStats = calculateMonthlyStats(runningData);
  const chartData = prepareChartData(monthlyStats);
  const heatmapData = generateHeatmapData(runningData);
  const recentRuns = runningData.slice(0, 5);
  const runsPerHourData = calculateRunsPerHour(runningData);

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
                {usingStravaData && athlete ? (
                  <>
                    Datos verificados jalados del Strava de
                    <span className="ml-2 inline-flex items-center bg-[#FC4C02] text-white px-3 py-1 rounded-full text-sm font-medium">
                      <svg 
                        className="w-4 h-4 mr-2" 
                        viewBox="0 0 24 24" 
                        fill="currentColor"
                      >
                        <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.599h4.172L10.463 0l-7.008 13.828h4.172"/>
                      </svg>
                      {athlete.firstname} {athlete.lastname}
                    </span>
                  </>
                ) : (
                  "Seguimiento de mis estadísticas de carrera"
                )}
                {usingStravaData && (
                  <span className="block text-sm mt-1">
                    Última actualización: {formatLastUpdateTime()}
                  </span>
                )}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              {/* Link al panel de administración - visible con doble clic o pasando el mouse */}
              {!adminMode && (
                <div 
                  className="text-xs opacity-30 hover:opacity-100 cursor-default transition-opacity mt-2 text-right"
                  onDoubleClick={() => window.location.href = "#admin"}
                >
                  v1.0.1
                </div>
              )}
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

        {/* Mostrar StravaTroubleshooting solo en modo admin */}
        {adminMode && !isAuthenticated() && <StravaTroubleshooting />}

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
        <section className="mb-10">
          <RecentRuns 
            runs={recentRuns} 
            title="Carreras Recientes" 
            description="Tus últimas 5 carreras registradas"
          />
        </section>
        
        {/* Nuevo componente - Carreras por hora del día - MOVED HERE */}
        <section className="mb-10">
          <RunsPerHourChart 
            data={runsPerHourData}
            title="Distribución de Carreras por Hora"
            description="Cantidad de carreras iniciadas en cada hora del día"
          />
        </section>

        {/* Calendar Section - RunningYearCalendar */}
        <section className="mb-10">
          <RunningYearCalendar
            runningData={runningData}
            title="Calendario Detallado de Carreras"
            description="Vista detallada por mes con leyenda de colores mejorada"
          />
        </section>

        {/* Charts Section - STILL AT BOTTOM */}
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
