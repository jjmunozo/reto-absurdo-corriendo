
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Clock } from 'lucide-react';

interface WeeklyPaceData {
  week: string;
  avgPace: number;
}

interface WeeklyPaceChartProps {
  data: WeeklyPaceData[];
  title: string;
  description?: string;
}

const WeeklyPaceChart: React.FC<WeeklyPaceChartProps> = ({
  data,
  title,
  description
}) => {
  // Función para formatear el pace en el tooltip
  const formatPaceTooltip = (value: number) => {
    const minutes = Math.floor(value);
    const seconds = Math.round((value - minutes) * 60);
    return [`${minutes}'${seconds.toString().padStart(2, '0')}" /km`, 'Pace Promedio'];
  };

  // Función para formatear el eje Y
  const formatYAxisTick = (value: number) => {
    const minutes = Math.floor(value);
    const seconds = Math.round((value - minutes) * 60);
    return `${minutes}'${seconds.toString().padStart(2, '0')}"`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-500" />
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="week" 
                tick={{ fontSize: 12 }}
                interval={Math.ceil(data.length / 8)} // Mostrar cada 8va etiqueta aproximadamente
              />
              <YAxis 
                tickFormatter={formatYAxisTick}
                domain={['dataMin - 0.2', 'dataMax + 0.2']}
                tick={{ fontSize: 12 }}
              />
              <Tooltip formatter={formatPaceTooltip} />
              <Line 
                type="monotone" 
                dataKey="avgPace" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#1D4ED8' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyPaceChart;
