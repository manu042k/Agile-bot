"use client";
import { Sprint, SprintStatus } from "@/types/project";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import { useMemo } from "react";

interface SprintChartsProps {
  sprints: Sprint[];
  onSprintClick: (sprintId: number) => void;
  getEffectiveStatus: (sprint: Sprint) => SprintStatus;
}

const SprintCharts = ({
  sprints,
  onSprintClick,
  getEffectiveStatus,
}: SprintChartsProps) => {
  // Status colors
  const STATUS_COLORS = {
    [SprintStatus.Active]: "#ea580c",
    [SprintStatus.Completed]: "#1f2937",
    [SprintStatus.Planning]: "#2563eb",
    [SprintStatus.Cancelled]: "#dc2626",
  };

  // Prepare data for completion rate chart
  const completionData = useMemo(() => {
    return sprints.map((sprint) => ({
      name: sprint.name,
      completed: sprint.completed_task_count || 0,
      remaining: (sprint.task_count || 0) - (sprint.completed_task_count || 0),
      total: sprint.task_count || 0,
      completionRate:
        sprint.task_count && sprint.task_count > 0
          ? Math.round(
              ((sprint.completed_task_count || 0) / sprint.task_count) * 100
            )
          : 0,
      id: sprint.id,
    }));
  }, [sprints]);

  // Prepare data for status distribution
  const statusData = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    sprints.forEach((sprint) => {
      const status = getEffectiveStatus(sprint);
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count,
      color: STATUS_COLORS[status as SprintStatus] || "#9ca3af",
    }));
  }, [sprints, getEffectiveStatus]);

  // Prepare timeline data (sprints over time)
  const timelineData = useMemo(() => {
    return sprints
      .sort(
        (a, b) =>
          new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      )
      .map((sprint) => {
        const start = new Date(sprint.start_date);
        const end = new Date(sprint.end_date);
        const duration = Math.ceil(
          (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          name: sprint.name,
          duration,
          tasks: sprint.task_count || 0,
          completed: sprint.completed_task_count || 0,
          startDate: start.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          id: sprint.id,
        };
      });
  }, [sprints]);

  // Prepare velocity data (tasks completed per sprint)
  const velocityData = useMemo(() => {
    return sprints
      .filter((s) => getEffectiveStatus(s) === SprintStatus.Completed)
      .sort(
        (a, b) =>
          new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      )
      .map((sprint) => ({
        name: sprint.name,
        velocity: sprint.completed_task_count || 0,
        planned: sprint.task_count || 0,
        id: sprint.id,
      }));
  }, [sprints, getEffectiveStatus]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Sprint Completion Rate */}
      <div className="pm-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Sprint Completion Rate
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={completionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="completed"
              stackId="a"
              fill="#10b981"
              name="Completed"
              radius={[0, 0, 4, 4]}
            />
            <Bar
              dataKey="remaining"
              stackId="a"
              fill="#e5e7eb"
              name="Remaining"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="pm-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Sprint Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Sprint Duration */}
        <div className="pm-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Sprint Duration (Days)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="duration" fill="#ea580c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Task Progress Over Sprints */}
      <div className="pm-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Task Progress Timeline
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="tasks"
              stackId="1"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.6}
              name="Total Tasks"
            />
            <Area
              type="monotone"
              dataKey="completed"
              stackId="2"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.8}
              name="Completed Tasks"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Velocity Chart (Completed Sprints Only) */}
      {velocityData.length > 0 && (
        <div className="pm-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Sprint Velocity (Completed Sprints)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={velocityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="planned"
                stroke="#9ca3af"
                strokeWidth={2}
                name="Planned Tasks"
                strokeDasharray="5 5"
              />
              <Line
                type="monotone"
                dataKey="velocity"
                stroke="#10b981"
                strokeWidth={3}
                name="Completed Tasks"
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Completion Percentage Trend */}
      <div className="pm-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Completion Rate Trend
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={completionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              domain={[0, 100]}
              label={{ value: "%", angle: -90, position: "insideLeft" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="completionRate"
              stroke="#ea580c"
              strokeWidth={3}
              name="Completion %"
              dot={{ r: 5, fill: "#ea580c" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SprintCharts;
