
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { ChartBarIcon } from 'lucide-react';

interface RunsPerHourChartProps {
  data: { hour: string; runs: number }[];
  title: string;
  description?: string;
}

const RunsPerHourChart: React.FC<RunsPerHourChartProps> = ({ data, title, description }) => {
  // Función para formatear el tooltip
  const formatTooltip = (value: number) => {
    return [`${value}`, 'Carreras'];
  };

  // Función para mostrar solo algunas horas en el eje X para evitar sobrecarga visual
  const formatXAxis = (hour: string) => {
    // Mostrar cada 3 horas para evitar sobrecarga visual
    const hourNum = parseInt(hour.split(':')[0]);
    if (hourNum % 3 === 0) {
      return hour;
    }
    return '';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChartBarIcon className="h-5 w-5 text-brand-coral" />
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="hour" 
                tickFormatter={formatXAxis}
                label={{ 
                  value: 'Hora del día (Costa Rica UTC-6)', 
                  position: 'insideBottom',
                  offset: -5
                }}
              />
              <YAxis 
                label={{ 
                  value: 'Cantidad de carreras', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' } 
                }} 
              />
              <Tooltip formatter={formatTooltip} />
              <Bar 
                dataKey="runs" 
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

export default RunsPerHourChart;
