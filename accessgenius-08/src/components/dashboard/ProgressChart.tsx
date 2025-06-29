
import React from 'react';
import { cn } from '@/lib/utils';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ChartData {
  name: string;
  [key: string]: string | number;
}

interface ProgressChartProps {
  className?: string;
  title?: string;
  description?: string;
  data: ChartData[];
  type?: 'line' | 'bar';
  series: Array<{
    name: string;
    dataKey: string;
    color: string;
  }>;
  showLegend?: boolean;
}

const ProgressChart: React.FC<ProgressChartProps> = ({
  className,
  title = "Performance Overview",
  description = "Assessment results over time",
  data,
  type = 'line',
  series,
  showLegend = true,
}) => {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-0 pt-4">
        <div className="h-80 w-full px-4 pb-4">
          <ResponsiveContainer width="100%" height="100%">
            {type === 'line' ? (
              <LineChart
                data={data}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }} 
                  tickLine={false} 
                  axisLine={{ stroke: '#ddd', strokeWidth: 1 }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: '#ddd', strokeWidth: 1 }}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }} 
                />
                {showLegend && <Legend />}
                {series.map((s) => (
                  <Line
                    key={s.dataKey}
                    type="monotone"
                    dataKey={s.dataKey}
                    name={s.name}
                    stroke={s.color}
                    strokeWidth={2}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6, strokeWidth: 0, fill: s.color }}
                  />
                ))}
              </LineChart>
            ) : (
              <BarChart
                data={data}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }} 
                  tickLine={false} 
                  axisLine={{ stroke: '#ddd', strokeWidth: 1 }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: '#ddd', strokeWidth: 1 }}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }} 
                />
                {showLegend && <Legend />}
                {series.map((s) => (
                  <Bar
                    key={s.dataKey}
                    dataKey={s.dataKey}
                    name={s.name}
                    fill={s.color}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

interface DualChartProps {
  className?: string;
  performanceData: ChartData[];
  completionData: ChartData[];
}

export const DualChart: React.FC<DualChartProps> = ({
  className,
  performanceData,
  completionData
}) => {
const threshold = 75;

  // Get dynamic subject keys
  const subjects = performanceData.length > 0
    ? Object.keys(performanceData[0]).filter((key) => key !== 'name')
    : [];

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader>
        <CardTitle>Assessment Analytics</CardTitle>
        <CardDescription>Track performance and completion rates</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="performance" className="w-full">
          <TabsList className="w-full grid grid-cols-2 mb-4 mx-4">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="completion">Completion</TabsTrigger>
          </TabsList>

          {/* Performance Tab - Updated with Bar Chart */}
          <TabsContent value="performance" className="h-80 w-full px-4 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: '#ddd', strokeWidth: 1 }}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: '#ddd', strokeWidth: 1 }}
                  domain={[0, 100]}
                />
                <Tooltip />
                <Legend />
                {subjects.map((subject) => (
                  <Bar key={subject} dataKey={subject} name={subject}>
                    {performanceData.map((entry, index) => (
                      <Cell
                        key={`${subject}-${index}`}
                        fill={entry[subject] >= threshold ? '#34d399' : '#f87171'}
                      />
                    ))}
                  </Bar>
                ))}
              </BarChart>
            </ResponsiveContainer>

            {/* Legend for strong/weak */}
            <div className="flex gap-4 mt-4 text-sm px-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-400 rounded" />
                <span>Strong (≥ {threshold}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-400 rounded" />
                <span>Weak (&lt; {threshold}%)</span>
              </div>
            </div>
          </TabsContent>

          {/* Completion Tab - As is */}
          <TabsContent value="completion" className="h-80 w-full px-4 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={completionData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: '#ddd', strokeWidth: 1 }}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: '#ddd', strokeWidth: 1 }}
                />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="assigned"
                  name="Assigned"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="completed"
                  name="Completed"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ProgressChart;
