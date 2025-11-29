"use client";
import { useMemo } from "react";
import { Sprint, Task } from "@/types/project";
import { TaskStatus } from "@/types/project";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface SprintBurndownChartProps {
  sprint: Sprint;
  tasks: Task[];
}

const SprintBurndownChart = ({ sprint, tasks }: SprintBurndownChartProps) => {
  // Calculate burndown data
  const { chartData, stats } = useMemo(() => {
    const startDate = new Date(sprint.start_date);
    const endDate = new Date(sprint.end_date);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // Get sprint tasks
    const sprintTasks = tasks.filter(t => t.sprint && t.sprint.toString() === sprint.id.toString());
    const totalTasks = sprintTasks.length;
    
    // Calculate current day
    const currentDay = Math.min(totalDays, Math.max(0, Math.ceil((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))));
    
    // Group completed tasks by day
    const completedByDay: { [key: number]: number } = {};
    const completedTasks = sprintTasks.filter(t => t.status === TaskStatus.Completed);
    
    completedTasks.forEach(task => {
      if (task.updated_at) {
        const completedDate = new Date(task.updated_at);
        const dayIndex = Math.ceil((completedDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        if (dayIndex >= 0 && dayIndex <= totalDays) {
          completedByDay[dayIndex] = (completedByDay[dayIndex] || 0) + 1;
        }
      }
    });
    
    // Build combined chart data
    const data = [];
    let actualRemaining = totalTasks;
    
    for (let i = 0; i <= totalDays; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Update actual remaining
      if (completedByDay[i]) {
        actualRemaining -= completedByDay[i];
      }
      
      data.push({
        day: i,
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        ideal: Math.max(0, totalTasks - (totalTasks / totalDays) * i),
        actual: Math.max(0, actualRemaining),
      });
    }
    
    const currentRemaining = data[currentDay]?.actual || 0;
    const completed = totalTasks - currentRemaining;
    const progress = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;
    
    return {
      chartData: data,
      stats: {
        totalTasks,
        totalDays,
        currentDay,
        remaining: currentRemaining,
        completed,
        progress,
      },
    };
  }, [sprint, tasks]);

  return (
    <div>
      <div className="mb-4">
        <p className="text-sm text-gray-500">
          {stats.totalTasks} tasks • {stats.totalDays} days
        </p>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              interval="preserveStartEnd"
            />
            <YAxis 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              label={{ value: 'Tasks Remaining', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px 12px',
              }}
              labelStyle={{ color: '#111827', fontWeight: 600 }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />
            <ReferenceLine 
              x={chartData[stats.currentDay]?.date} 
              stroke="#ef4444" 
              strokeDasharray="3 3"
              label={{ value: 'Today', position: 'top', fill: '#ef4444', fontSize: 12 }}
            />
            <Line
              type="monotone"
              dataKey="ideal"
              stroke="#9ca3af"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Ideal Burndown"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#ea580c"
              strokeWidth={3}
              name="Actual Burndown"
              dot={{ fill: '#ea580c', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200 grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Remaining</p>
          <p className="text-2xl font-bold text-gray-900">{stats.remaining}</p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Completed</p>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Progress</p>
          <p className="text-2xl font-bold text-blue-600">{stats.progress}%</p>
        </div>
      </div>
    </div>
  );
};

export default SprintBurndownChart;

