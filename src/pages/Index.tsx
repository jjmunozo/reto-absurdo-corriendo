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
import WeeklyDistanceChart from '@/components/WeeklyDistanceChart';
import SectionNavigation from '@/components/SectionNavigation';
import PaceDistanceCorrelation from '@/components/PaceDistanceCorrelation';
import { 
  calculateRunsPerHour,
  calculateWeeklyPaceStats,
  calculateWeeklyDistanceStats
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
  const recentRuns = activities.slice(0, 5);
  const runsPerHourData = calculateRunsPerHour(activities);
  const weeklyPaceData = calculateWeeklyPaceStats(activities);
  const weeklyDistanceData = calculateWeeklyDistanceStats(activities);

  const navigationSections = [
    { id: 'stats-summary', label: 'Estadísticas' },
    { id: 'recent-runs', label: 'Carreras Recientes' },
    { id: 'runs-per-hour', label: 'Distribución por Hora' },
    { id: 'personal-records', label: 'Récords Personales' },
    { id: 'activity-tracker', label: 'Actividad de Entrenamiento' },
    { id: 'pace-distance-correlation', label: 'Correlación Pace vs Distancia' },
    { id: 'weekly-pace', label: 'Evolución del Pace' },
    { id: 'weekly-distance', label: 'Distancia Semanal' }
  ];

  return (
    <div className="min-h-screen bg-brand-cream">
      <HeroSection lastSync={lastSync} />

      {/* Challenge Description Section */}
      <section className="container mx-auto px-4 py-3">
        <div className="bg-brand-coral text-white rounded-t-lg p-4">
          <h2 className="text-xl font-bold">¿Cuál es el reto más absurdo?</h2>
        </div>
        <div className="bg-white border-x-2 border-b-2 border-brand-coral/20 rounded-b-lg p-6">
          <div className="space-y-4 text-gray-800 leading-relaxed">
            <p>
              ¡Hola, soy Juan! Me puse un reto épico este año porque creo en el valor de hacer <strong className="text-brand-coral">Cosas Difíciles</strong>.
            </p>
            
            <p>
              Yo "odiaba" correr entonces no corría pero hay algo que odio más que correr: odiar hacer cosas y que me obstaculicen.
            </p>
            
            <p>
              Decidí ponerme un reto que me diera miedo — un <strong className="text-brand-coral">misogi</strong>: correr 100km en un tiempo de 24hrs.
            </p>
            
            <p>
              No voy a correr 24hrs continuas, voy a hacerlo en estilo "Back Yard Ultra" o "Last Man Standing", pero solo yo.
            </p>
            
            <div className="space-y-2 text-sm">
              <p>🏃‍♂️ Voy a correr una vuelta de 4.5 - 5km cada hora por 24 horas.</p>
              <p>🕐 Tengo máximo 1 hora para terminar cada vuelta.</p>
              <p>🔁 Cada hora empieza otra vuelta.</p>
              <p>💆‍♂️ Si termino antes de que se cumpla la hora, puedo descansar hasta que empiece la próxima vuelta.</p>
              <p>🚫 Si no termino la vuelta dentro de 1 hora o no empiezo la vuelta a tiempo, termina mi reto.</p>
              <p>🧍‍♂️ La meta es terminar 24hrs.</p>
            </div>
            
            <p>
              Este es el resumen de mi entrenamiento que comencé el 7 de enero.
            </p>
            
            <p className="text-sm text-gray-600 italic">
              Mi programación la hace{' '}
              <a 
                href="https://www.instagram.com/marioperezcoaching/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-brand-coral hover:text-brand-red underline"
              >
                Mario Perez
              </a>
              {' '}y mi nutrición{' '}
              <a 
                href="https://www.instagram.com/midietanoesdieta/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-brand-coral hover:text-brand-red underline"
              >
                Natalia Villalobos
              </a>
              {' '}— ¡gracias a ambos!
            </p>
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="container mx-auto px-4 py-3">
        <div className="bg-brand-coral text-white rounded-t-lg p-4">
          <h2 className="text-xl font-bold">¡Sería épico verlos durante mi reto!</h2>
        </div>
        <div className="bg-white border-x-2 border-b-2 border-brand-coral/20 rounded-b-lg p-6">
          <div className="space-y-4 text-gray-800 leading-relaxed">
            <p>
              Vengan a apoyar el 6 de diciembre 2025 en Santa Ana. Pueden llegar a ver y aplaudir en cualquier punto de las 24hrs — hasta pueden llegar a tomarse una birra tardeada (o a media noche) o a verme alucinar a las 3am por no dormir 👻😂
            </p>
            
            <p>
              ¡Pero también se pueden apuntar a correr algunos tramos conmigo!
            </p>
          </div>
        </div>
      </section>

      {/* Section Navigation */}
      <SectionNavigation sections={navigationSections} />

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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-coral"></div>
          </div>
        )}

        <div id="stats-summary">
          <StatsSummary activities={activities} isLoading={isLoading} />
        </div>

        {/* Recent Runs Table */}
        {!isLoading && activities.length > 0 && (
          <section id="recent-runs" className="mb-10">
            <RecentRuns 
              runs={recentRuns} 
              title="Carreras Recientes" 
              description="Las últimas 5 carreras registradas"
            />
          </section>
        )}

        {/* Carreras por hora del día */}
        {!isLoading && activities.length > 0 && (
          <section id="runs-per-hour" className="mb-10">
            <RunsPerHourChart 
              data={runsPerHourData}
              title="Distribución de Carreras por Hora"
              description="Cantidad de carreras iniciadas en cada hora del día"
            />
          </section>
        )}

        {/* Personal Records Section */}
        {!isLoading && activities.length > 0 && (
          <section id="personal-records" className="mb-10">
            <PersonalRecords 
              runs={activities} 
              title="Récords Personales" 
              description="Tus mejores logros y récords personales"
            />
          </section>
        )}

        {/* GitHub-style Contribution Tracker */}
        {!isLoading && activities.length > 0 && (
          <section id="activity-tracker" className="mb-10">
            <GitHubContributionTracker
              runningData={activities}
              title="Actividad de Entrenamiento"
              description="Actividad de entrenamiento durante el año, similar al contribution tracker de GitHub"
            />
          </section>
        )}

        {/* Pace vs Distance Correlation */}
        {!isLoading && activities.length > 0 && (
          <section id="pace-distance-correlation" className="mb-10">
            <PaceDistanceCorrelation 
              runs={activities}
              title="Correlación Pace vs Distancia"
              description="Análisis de cómo tu pace cambia según la distancia de la carrera y predicción para 100km"
            />
          </section>
        )}

        {/* Weekly Pace Evolution Chart */}
        {!isLoading && activities.length > 0 && weeklyPaceData.length > 0 && (
          <section id="weekly-pace" className="mb-10">
            <WeeklyPaceChart 
              data={weeklyPaceData}
              title="Evolución del Pace Semanal"
              description="Cambios en el pace promedio por semana"
            />
          </section>
        )}

        {/* Weekly Distance Chart - Full Width */}
        {!isLoading && activities.length > 0 && weeklyDistanceData.length > 0 && (
          <section id="weekly-distance" className="mb-10">
            <WeeklyDistanceChart 
              data={weeklyDistanceData}
              title="Distancia Semanal"
              description="Kilómetros recorridos por semana durante el entrenamiento"
            />
          </section>
        )}

        {/* Empty State */}
        {!isLoading && activities.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay carreras registradas</h3>
            <p className="text-gray-600 mb-4">No se han encontrado carreras en el sistema.</p>
            <p className="text-sm text-gray-500">
              Accede a <code className="bg-gray-100 px-2 py-1 rounded">/add-run</code> para agregar una carrera o <code className="bg-gray-100 px-2 py-1 rounded">/import-runs</code> para importar datos históricos.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white py-6 px-4">
        <div className="container mx-auto text-center text-brand-gray-purple">
          <p className="text-sm">&copy; 2025 El reto más absurdo | Datos verificados por Strava</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
