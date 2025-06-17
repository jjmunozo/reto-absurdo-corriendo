
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { MapPin } from 'lucide-react';
import { WeeklyDistanceData } from '@/utils/weeklyDistanceCalculations';

interface WeeklyDistanceChartProps {
  data: WeeklyDistanceData[];
  title: string;
  description?: string;
}

const WeeklyDistanceChart: React.FC<WeeklyDistanceChartProps> = ({
  data,
  title,
  description
}) => {
  // Función para formatear el tooltip
  const formatTooltip = (value: number, name: string) => {
    if (name === 'distance') return [`${value} km`, 'Distancia'];
    if (name === 'runs') return [`${value}`, 'Carreras'];
    return [value, name];
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-brand-coral" />
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="week" 
                tick={{ fontSize: 12 }}
                interval={Math.ceil(data.length / 12)} // Mostrar cada 12va etiqueta aproximadamente
              />
              <YAxis 
                label={{ 
                  value: 'Distancia (km)', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' } 
                }} 
                tick={{ fontSize: 12 }}
              />
              <Tooltip formatter={formatTooltip} />
              <Bar 
                dataKey="distance" 
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

export default WeeklyDistanceChart;
