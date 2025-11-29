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
  Cell,
  ReferenceLine,
} from "recharts";
import { useMemo } from "react";
import { PlayCircle, CheckCircle2, ListTodo, Clock } from "lucide-react";

interface SprintGanttChartProps {
  sprints: Sprint[];
  onSprintClick: (sprintId: number) => void;
  getEffectiveStatus: (sprint: Sprint) => SprintStatus;
}

const SprintGanttChart = ({
  sprints,
  onSprintClick,
  getEffectiveStatus,
}: SprintGanttChartProps) => {
  // Status colors
  const STATUS_COLORS = {
    [SprintStatus.Active]: "#ea580c",
    [SprintStatus.Completed]: "#1f2937",
    [SprintStatus.Planning]: "#2563eb",
    [SprintStatus.Cancelled]: "#dc2626",
  };

  // Calculate timeline bounds
  const timelineBounds = useMemo(() => {
    if (sprints.length === 0) {
      return { start: new Date(), end: new Date(), totalDays: 0 };
    }

    const dates = sprints.flatMap((s) => [
      new Date(s.start_date),
      new Date(s.end_date),
    ]);

    const start = new Date(Math.min(...dates.map((d) => d.getTime())));
    const end = new Date(Math.max(...dates.map((d) => d.getTime())));
    const totalDays = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );

    return { start, end, totalDays };
  }, [sprints]);

  // Prepare data for Gantt chart
  const ganttData = useMemo(() => {
    if (timelineBounds.totalDays === 0) return [];

    return sprints
      .sort(
        (a, b) =>
          new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      )
      .map((sprint) => {
        const sprintStart = new Date(sprint.start_date);
        const sprintEnd = new Date(sprint.end_date);

        // Calculate days from timeline start
        const daysFromStart = Math.max(
          0,
          (sprintStart.getTime() - timelineBounds.start.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        // Calculate sprint duration
        const duration = Math.max(
          1,
          (sprintEnd.getTime() - sprintStart.getTime()) /
            (1000 * 60 * 60 * 24) +
            1
        );

        const status = getEffectiveStatus(sprint);
        const completionRate =
          sprint.task_count && sprint.task_count > 0
            ? Math.round(
                ((sprint.completed_task_count || 0) / sprint.task_count) * 100
              )
            : 0;

        return {
          name: sprint.name,
          start: daysFromStart,
          duration: duration,
          end: daysFromStart + duration,
          status,
          color: STATUS_COLORS[status],
          completionRate,
          tasks: sprint.task_count || 0,
          completed: sprint.completed_task_count || 0,
          startDate: sprintStart.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          endDate: sprintEnd.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          id: sprint.id,
        };
      });
  }, [sprints, timelineBounds, getEffectiveStatus]);

  // Calculate today's position
  const todayPosition = useMemo(() => {
    const today = new Date();
    const daysFromStart =
      (today.getTime() - timelineBounds.start.getTime()) /
      (1000 * 60 * 60 * 24);
    return daysFromStart;
  }, [timelineBounds]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{data.name}</p>
          <div className="space-y-1 text-sm">
            <p className="text-gray-600">
              <span className="font-medium">Status:</span>{" "}
              <span
                className="px-2 py-0.5 rounded text-xs font-medium text-white"
                style={{ backgroundColor: data.color }}
              >
                {data.status}
              </span>
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Duration:</span> {data.duration}{" "}
              days
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Period:</span> {data.startDate} -{" "}
              {data.endDate}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Tasks:</span> {data.completed}/
              {data.tasks} ({data.completionRate}%)
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomYAxisTick = ({ x, y, payload }: any) => {
    const data = ganttData[payload.index];
    if (!data) return null;

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={4}
          textAnchor="end"
          fill="#374151"
          fontSize={12}
          className="cursor-pointer hover:fill-orange-600"
          onClick={() => onSprintClick(data.id)}
        >
          {payload.value}
        </text>
      </g>
    );
  };

  const CustomBar = (props: any) => {
    const { x, y, width, height, payload } = props;
    const completionWidth = (width * payload.completionRate) / 100;

    return (
      <g>
        {/* Main bar */}
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={payload.color}
          rx={4}
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => onSprintClick(payload.id)}
        />
        {/* Completion overlay */}
        {payload.completionRate > 0 && (
          <rect
            x={x}
            y={y + height - 4}
            width={completionWidth}
            height={4}
            fill="rgba(255, 255, 255, 0.8)"
            rx={2}
          />
        )}
        {/* Sprint name label */}
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize={11}
          fontWeight="600"
          className="pointer-events-none"
        >
          {payload.name.length > 20
            ? payload.name.substring(0, 20) + "..."
            : payload.name}
        </text>
        {/* Completion percentage */}
        <text
          x={x + width - 8}
          y={y + 12}
          textAnchor="end"
          fill="white"
          fontSize={10}
          fontWeight="700"
          className="pointer-events-none"
        >
          {payload.completionRate}%
        </text>
      </g>
    );
  };

  if (ganttData.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No sprint data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-600"></div>
          <span className="text-gray-700">Planning</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-orange-600"></div>
          <span className="text-gray-700">Active</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-800"></div>
          <span className="text-gray-700">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-600"></div>
          <span className="text-gray-700">Cancelled</span>
        </div>
      </div>

      {/* Gantt Chart */}
      <ResponsiveContainer width="100%" height={Math.max(400, ganttData.length * 60)}>
        <BarChart
          data={ganttData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 120, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            type="number"
            domain={[0, timelineBounds.totalDays]}
            tick={{ fontSize: 12 }}
            label={{
              value: "Days from Start",
              position: "insideBottom",
              offset: -10,
              style: { fontSize: 12, fill: "#6b7280" },
            }}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={<CustomYAxisTick />}
            width={110}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.05)" }} />
          
          {/* Today line */}
          {todayPosition >= 0 && todayPosition <= timelineBounds.totalDays && (
            <ReferenceLine
              x={todayPosition}
              stroke="#ef4444"
              strokeWidth={2}
              strokeDasharray="3 3"
              label={{
                value: "Today",
                position: "top",
                fill: "#ef4444",
                fontSize: 11,
                fontWeight: 600,
              }}
            />
          )}

          <Bar
            dataKey="duration"
            fill="#8884d8"
            shape={<CustomBar />}
            isAnimationActive={true}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Sprint Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {ganttData.map((sprint) => (
          <div
            key={sprint.id}
            onClick={() => onSprintClick(sprint.id)}
            className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:shadow-md transition-all cursor-pointer"
            style={{ borderLeftWidth: "4px", borderLeftColor: sprint.color }}
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-gray-900 text-sm">
                {sprint.name}
              </h4>
              <span
                className="px-2 py-0.5 rounded text-xs font-medium text-white"
                style={{ backgroundColor: sprint.color }}
              >
                {sprint.status}
              </span>
            </div>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>
                  {sprint.startDate} - {sprint.endDate} ({sprint.duration} days)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>
                  {sprint.completed}/{sprint.tasks} tasks
                </span>
                <span className="font-semibold text-gray-900">
                  {sprint.completionRate}%
                </span>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${sprint.completionRate}%`,
                  backgroundColor: sprint.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SprintGanttChart;
