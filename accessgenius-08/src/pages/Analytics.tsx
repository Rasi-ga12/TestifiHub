import React, { useState, useEffect } from 'react';
import {
  LineChart,
  BarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/card';
import { Award, Book } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import ActivityList from '@/components/dashboard/ActivityList';
import axios from 'axios';
import { toast } from '@/hooks/use-toast';

import type { TooltipProps } from 'recharts';

const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-md border bg-background p-4 shadow-md">
        <p className="font-semibold text-sm mb-1">{data.month} - Average: {data.average_score}%</p>
        <p className="font-semibold text-sm mb-1">Number of Assessments: {data.total_assessments}</p>
      </div>
    );
  }
  return null;
};

const difficultyColors = {
  easy: '#34d399',
  medium: '#fbbf24',
  hard: '#ef4444'
};

const Analytics = () => {
  const currentYear = new Date().getFullYear();
  const dummyFirstLoginYear = 2024;
  const [firstLoginYear] = useState(dummyFirstLoginYear);

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const [recentActivities, setRecentActivities] = useState([]);
  const [totalAssessments, setTotalAssessments] = useState({
    total_assessment: 0,
    percentage: "0%",
    average: "0%",
    approxi_average: "0%"
  });
  const [userPerformance, setUserPerformance] = useState([]);
  const [subjectPerformanceData, setSubjectPerformanceData] = useState([]);
  const [topicPerformanceData, setTopicPerformanceData] = useState([]);
  console.log("Selected Year:", selectedYear);

  const user_id = localStorage.getItem("user_id");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const recentActivitiesRes = await axios.post('http://127.0.0.1:5000/recent_activity', { user_id });
        setRecentActivities(recentActivitiesRes.data);
        const totalAssessmentsRes = await axios.post('http://127.0.0.1:5000/total_assessment', { user_id });
        setTotalAssessments(totalAssessmentsRes.data);

        const userPerformanceRes = await axios.post('http://127.0.0.1:5000/performance_analysis', {
          user_id,
          selectedYear
        });
        setUserPerformance(userPerformanceRes.data);

        const subjectPerformanceRes = await axios.post('http://127.0.0.1:5000/sub_analysis', {
          user_id,
          selectedYear,
          selectedMonth
        });
        setSubjectPerformanceData(subjectPerformanceRes.data);
        const topicPerformanceRes = await axios.post('http://127.0.0.1:5000/analysis', {
          user_id,
          selectedYear,
          selectedMonth
        });
        setTopicPerformanceData(topicPerformanceRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "",
          description: error.response?.data?.message || "Failed to fetch analytics data.",
          variant: 'destructive',
        });
      }
    };

    fetchData();
  }, [user_id, selectedYear, selectedMonth]);

  const years = Array.from({ length: currentYear - firstLoginYear + 1 }, (_, i) => firstLoginYear + i);
  const months = [
    { value: 1, label: "January" }, { value: 2, label: "February" }, { value: 3, label: "March" },
    { value: 4, label: "April" }, { value: 5, label: "May" }, { value: 6, label: "June" },
    { value: 7, label: "July" }, { value: 8, label: "August" }, { value: 9, label: "September" },
    { value: 10, label: "October" }, { value: 11, label: "November" }, { value: 12, label: "December" },
  ];

  const monthLabel = months.find(m => m.value === selectedMonth)?.label; // Get full month label
  // const selectedMonthData = subjectPerformanceData.find(d => d.name === monthLabel); // This line is no longer strictly needed for barChartData processing, but keeping for reference if used elsewhere

  const barChartData = subjectPerformanceData.map(item => ({
    subject: item.subject,
    score: item.average_score,
    month: item.month, // Include the month from backend response
    year: selectedYear, // Include the year
    color: Number(item.average_score) < 75 ? '#ef4444' : '#3b82f6'
  }));

  const filteredTopicData = topicPerformanceData.filter((entry) => {
    const entryDate = new Date(entry.date);
    return (
      entryDate.getFullYear() === selectedYear &&
      entryDate.getMonth() + 1 === selectedMonth
    );
  });

  const uniqueDates = [...new Set(filteredTopicData.map(d => d.date))].sort();
  const uniqueTopics = [...new Set(filteredTopicData.map(d => d.topic))];

  const chartData = uniqueDates.map(date => {
    const dayObj = { date };
    uniqueTopics.forEach(topic => {
      const found = filteredTopicData.find(d => d.date === date && d.topic === topic);
      dayObj[topic] = found ? found.score : null;
    });
    return dayObj;
  });

  const getDifficulty = (topic) => {
    const entry = filteredTopicData.find(d => d.topic === topic);
    return entry ? entry.difficulty : 'easy';
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-6 p-6 overflow-x-hidden max-w-screen">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive overview of assessment performance and student engagement metrics.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
          {/* Total Assessments Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{totalAssessments?.total_assessment ?? 0}</div>
                <Book className="h-8 w-8 text-muted-foreground/70" />
              </div>
              <p className="text-xs text-muted-foreground">Overall assessments completed</p>
            </CardContent>
          </Card>

          {/* Average Score Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{totalAssessments?.average ?? "0%"}</div>
                <Award className="h-8 w-8 text-muted-foreground/70" />
              </div>
              <p className="text-xs text-muted-foreground">{totalAssessments?.approxi_average ?? 0} from last month</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className='min-w-full'>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Performance Overview</CardTitle>
              <select
                className="rounded-md border px-2 py-1 text-xs lg:text-sm bg-white text-black dark:text-white dark:bg-black"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </CardHeader>
            <CardContent className="py-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={userPerformance}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" label={{ value: 'Average Score', angle: -90, position: 'insideLeft' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="average_score"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className='min-w-full'>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Subject Performance for {monthLabel} {selectedYear} {/* Added month and year here */}
              </CardTitle>
              <div className="flex flex-col lg:flex-row gap-2">
                <select
                  className="w-16 rounded-md border px-2 py-1 text-xs lg:text-sm bg-white text-black dark:text-white dark:bg-black"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <select
                  className="w-16 rounded-md border px-2 py-1 text-xs lg:text-sm bg-white text-black dark:text-white dark:bg-black"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                >
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>
            </CardHeader>
            <CardContent className=" py-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" tickFormatter={(sub) => sub.charAt(0).toUpperCase() + sub.slice(1)} />
                  <YAxis domain={[0, 100]} />
                  {barChartData.length > 0 && <Tooltip content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white border p-2 rounded-md shadow dark:bg-black dark:text-white">
                          <p className="font-semibold text-sm">
                            {data.subject} - {months.find(m => m.value === selectedMonth)?.label} {data.year}
                          </p>
                          <p className="text-sm">Average Score: {data.score}</p>
                        </div>
                      );
                    }
                    return null;
                  }} />}
                  <Legend
                    verticalAlign="bottom"
                    payload={[
                      { value: 'Weak', type: 'square', id: 'weak', color: 'red' },
                      { value: 'Strength', type: 'square', id: 'strength', color: 'blue' },
                    ]}
                  />
                  <Bar dataKey="score">
                    {barChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="min-w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Topic Based Performance</CardTitle>
              <div className="flex flex-col lg:flex-row gap-2">
                <select
                  className="w-16 rounded-md border px-2 py-1 text-xs lg:text-sm bg-white text-black dark:text-white dark:bg-black"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <select
                  className="w-16 rounded-md border px-2 py-1 text-xs lg:text-sm bg-white text-black dark:text-white dark:bg-black"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                >
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>{month.label}</option>
                  ))}
                </select>
              </div>
            </CardHeader>

            <CardContent className="py-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={d => d.slice(-2)} />
                  <YAxis domain={[0, 100]} />
                  {chartData.length > 0 && <Tooltip contentStyle={{
                    backgroundColor: '#1e3a8a',
                    borderRadius: '8px',
                    border: 'none',
                    color: 'white',
                  }} />}
                  <Legend
                    verticalAlign="bottom"
                    payload={[
                      { value: 'hard', type: 'square', id: 'hard', color: '#ef4444' },
                      { value: 'medium', type: 'square', id: 'medium', color: '#fbbf24' },
                      { value: 'easy', type: 'square', id: 'easy', color: '#34d399' },
                    ]}
                  />
                  {uniqueTopics.map((topic) => (
                    <Bar key={topic} dataKey={topic} name={topic}>
                      {chartData.map((_, i) => (
                        <Cell key={`cell-${i}`} fill={difficultyColors[getDifficulty(topic)]} />
                      ))}
                    </Bar>
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <ActivityList
            title="Recent Activities"
            activities={recentActivities}
            description="Latest assessment activities and alerts"
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default Analytics;