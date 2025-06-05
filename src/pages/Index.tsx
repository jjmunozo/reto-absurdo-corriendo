
import React, { useState, useEffect } from 'react';
import { MapPin, TrendingUp, Clock, Flag, Activity, LogOut, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useStravaAuth } from '@/hooks/useStravaAuth';
import { useStravaActivities } from '@/hooks/useStravaActivities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  const { user, isLoading: authLoading, signOut } = useAuth();
  const { 
    stravaConnection, 
    isConnected, 
    isConnecting, 
    isLoading: stravaLoading,
    initiateStravaAuth,
    disconnectStrava 
  } = useStravaAuth();
  const { 
    activities, 
    isLoading: activitiesLoading, 
    isSyncing, 
    lastSync,
    syncActivities 
  } = useStravaActivities();

  // Redirigir a auth si no está autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/auth';
    }
  }, [user, authLoading]);

  const handleSync = async () => {
    try {
      await syncActivities();
      toast({
        title: "Sincronización completada",
        description: "Tus actividades han sido actualizadas",
      });
    } catch (error: any) {
      toast({
        title: "Error en sincronización",
        description: error.message || "No se pudieron sincronizar las actividades",
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectStrava();
      toast({
        title: "Strava desconectado",
        description: "Tu cuenta de Strava ha sido desconectada",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo desconectar Strava",
        variant: "destructive",
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-running-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Se redirigirá por el useEffect
  }

  // Si no está conectado a Strava, mostrar pantalla de conexión
  if (!stravaLoading && !isConnected) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-gradient-to-r from-running-primary to-running-dark text-white py-8 px-4">
          <div className="container mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">El reto más absurdo</h1>
              <p className="opacity-90">Bienvenido, {user.email}</p>
            </div>
            <Button variant="secondary" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar sesión
            </Button>
          </div>
        </header>

        {/* Conexión a Strava */}
        <main className="container mx-auto px-4 py-12">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle>Conecta tu cuenta de Strava</CardTitle>
              <CardDescription>
                Para ver tus datos de entrenamiento, necesitas conectar tu cuenta de Strava
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Button 
                onClick={initiateStravaAuth}
                disabled={isConnecting}
                className="w-full bg-[#FC4C02] hover:bg-[#E8440B] text-white"
              >
                {isConnecting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Conectando...
                  </div>
                ) : (
                  <>
                    <svg 
                      className="w-5 h-5 mr-2" 
                      viewBox="0 0 24 24" 
                      fill="currentColor"
                    >
                      <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.599h4.172L10.463 0l-7.008 13.828h4.172"/>
                    </svg>
                    Conectar con Strava
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

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
                Conectado a Strava como {stravaConnection?.athlete_data?.firstname} {stravaConnection?.athlete_data?.lastname}
                {lastSync && (
                  <span className="block text-sm mt-1">
                    Última sincronización: {lastSync.toLocaleString('es-ES')}
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
                {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDisconnect}
              >
                Desconectar Strava
              </Button>
              <Button variant="secondary" size="sm" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Loading State */}
        {activitiesLoading && (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-running-primary"></div>
          </div>
        )}

        {/* Stats Summary Section */}
        {!activitiesLoading && (
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
        {!activitiesLoading && activities.length > 0 && (
          <section className="mb-10">
            <RecentRuns 
              runs={recentRuns} 
              title="Carreras Recientes" 
              description="Tus últimas 5 carreras registradas"
            />
          </section>
        )}
        
        {/* Carreras por hora del día */}
        {!activitiesLoading && activities.length > 0 && (
          <section className="mb-10">
            <RunsPerHourChart 
              data={runsPerHourData}
              title="Distribución de Carreras por Hora"
              description="Cantidad de carreras iniciadas en cada hora del día"
            />
          </section>
        )}

        {/* GitHub-style Contribution Tracker */}
        {!activitiesLoading && activities.length > 0 && (
          <section className="mb-10">
            <GitHubContributionTracker
              runningData={activities}
              title="Actividad de Entrenamiento"
              description="Tu actividad de entrenamiento durante el año, similar al contribution tracker de GitHub"
            />
          </section>
        )}

        {/* Charts Section */}
        {!activitiesLoading && activities.length > 0 && (
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
        {!activitiesLoading && activities.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay carreras registradas</h3>
            <p className="text-gray-600 mb-4">Haz clic en "Sincronizar" para cargar tus actividades de Strava.</p>
            <Button onClick={handleSync} disabled={isSyncing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Sincronizando...' : 'Sincronizar actividades'}
            </Button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 py-6 px-4">
        <div className="container mx-auto text-center text-gray-600">
          <p className="text-sm">&copy; 2024 El reto más absurdo | Conectado de forma segura con Strava</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
