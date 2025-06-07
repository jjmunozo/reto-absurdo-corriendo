
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { MonthlyStats } from '@/data/runningData';

interface RunningChartProps {
  data: MonthlyStats[];
  title: string;
  description?: string;
  dataKey: 'distance' | 'runs' | 'time';
  yAxisLabel?: string;
}

const RunningChart: React.FC<RunningChartProps> = ({
  data,
  title,
  description,
  dataKey,
  yAxisLabel
}) => {
  // Mapping para etiquetas de datos
  const dataLabels = {
    distance: 'Distancia (km)',
    runs: 'Carreras',
    time: 'Tiempo (min)'
  };

  // Función para formatear el tooltip
  const formatTooltip = (value: number, name: string) => {
    if (name === 'distance') return [`${value} km`, 'Distancia'];
    if (name === 'runs') return [`${value}`, 'Carreras'];
    if (name === 'time') return [`${Math.floor(value / 60)}h ${value % 60}min`, 'Tiempo'];
    return [value, name];
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="month" />
              <YAxis 
                label={{ 
                  value: yAxisLabel || dataLabels[dataKey], 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' } 
                }} 
              />
              <Tooltip formatter={formatTooltip} />
              <Bar 
                dataKey={dataKey} 
                fill="#ff5a5a" 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default RunningChart;
