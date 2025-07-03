
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Line, LineChart, ComposedChart } from 'recharts';
import { RunData } from '@/data/runningData';
import { 
  calculatePaceDistanceCorrelation, 
  getDistanceRangeColor, 
  getDistanceRangeLabel,
  formatPaceForChart
} from '@/utils/paceDistanceAnalysis';
import { formatPace } from '@/utils/statsCalculations';

interface PaceDistanceCorrelationProps {
  runs: RunData[];
  title: string;
  description: string;
}

const PaceDistanceCorrelation: React.FC<PaceDistanceCorrelationProps> = ({ 
  runs, 
  title, 
  description 
}) => {
  const analysis = calculatePaceDistanceCorrelation(runs);

  // Preparar datos para el scatter plot
  const chartData = runs.map(run => ({
    distance: run.distance,
    pace: run.avgPace,
    location: run.location,
    date: run.date,
    fill: getDistanceRangeColor(run.distance),
    rangeLabel: getDistanceRangeLabel(run.distance)
  }));

  // Datos para la línea de tendencia combinados con scatter data
  const combinedData = chartData.map(point => ({
    ...point,
    trendPace: analysis.slope * point.distance + analysis.intercept
  }));

  const chartConfig = {
    pace: {
      label: "Pace (min/km)",
    },
    distance: {
      label: "Distancia (km)",
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.location}</p>
          <p className="text-sm text-gray-600">{data.date}</p>
          <p className="text-sm">
            <span className="font-medium">Distancia:</span> {data.distance}km
          </p>
          <p className="text-sm">
            <span className="font-medium">Pace:</span> {formatPace(data.pace)}
          </p>
          <p className="text-xs text-gray-500">{data.rangeLabel}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">{title}</CardTitle>
          <CardDescription className="text-gray-600">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 w-full overflow-hidden">
            <ChartContainer 
              config={chartConfig} 
              className="w-full h-full [&_.recharts-wrapper]:!w-full [&_.recharts-wrapper]:!h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart 
                  data={combinedData} 
                  margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    dataKey="distance" 
                    name="Distancia"
                    unit="km"
                    domain={['dataMin - 1', 'dataMax + 2']}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="pace" 
                    name="Pace"
                    unit="min/km"
                    domain={['dataMin - 0.1', 'dataMax + 0.1']}
                    tickFormatter={formatPaceForChart}
                  />
                  <Scatter 
                    dataKey="pace"
                    fill="#8884d8"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="trendPace" 
                    stroke="#FF6B6B" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    connectNulls={false}
                  />
                  <ChartTooltip content={<CustomTooltip />} />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas de Correlación */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Correlación (R)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {analysis.correlation.toFixed(3)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {Math.abs(analysis.correlation) > 0.7 ? 'Fuerte' : 
               Math.abs(analysis.correlation) > 0.5 ? 'Moderada' : 'Débil'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">R² (Ajuste)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {(analysis.rSquared * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Varianza explicada
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Mejor Pace</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatPace(analysis.bestPaceRun.avgPace)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {analysis.bestPaceRun.distance}km - {analysis.bestPaceRun.location}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Proyección 100km</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-coral">
              {formatPace(analysis.projectedPace100km)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Basado en tendencia actual
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Análisis por Rangos de Distancia */}
      <Card className="relative z-10">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Pace Promedio por Rango de Distancia</CardTitle>
          <CardDescription>Análisis detallado de tu rendimiento según la distancia</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(analysis.averagePaceByRange).map(([key, range]) => (
              <div key={key} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{range.range}</h4>
                  <span className="text-sm text-gray-500">{range.count} carreras</span>
                </div>
                <div className="text-xl font-bold text-gray-900">
                  {range.count > 0 ? formatPace(range.avgPace) : 'N/A'}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Información Adicional */}
      <Card className="relative z-10">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Análisis de Tendencia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Interpretación:</h4>
              <p className="text-sm text-gray-600">
                {analysis.correlation > 0 
                  ? 'Tu pace tiende a aumentar (ser más lento) con distancias más largas, lo cual es normal.'
                  : 'Tu pace tiende a mejorar con distancias más largas, lo cual es inusual pero positivo.'}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Con una correlación de {analysis.correlation.toFixed(3)}, la relación es{' '}
                {Math.abs(analysis.correlation) > 0.7 ? 'fuerte' : 
                 Math.abs(analysis.correlation) > 0.5 ? 'moderada' : 'débil'}.
              </p>
            </div>
            
            {analysis.outliers.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Carreras Atípicas:</h4>
                <div className="space-y-1">
                  {analysis.outliers.slice(0, 3).map(run => (
                    <p key={run.id} className="text-sm text-gray-600">
                      {run.date} - {run.location}: {run.distance}km en {formatPace(run.avgPace)}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaceDistanceCorrelation;
