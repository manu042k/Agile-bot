"use client";
import { Sprint, SprintStatus } from "@/types/project";
import {
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Scatter,
} from "recharts";
import { useMemo, useState } from "react";
import { Clock, Maximize2 } from "lucide-react";

interface SprintTimelineChartProps {
  sprints: Sprint[];
  onSprintClick: (sprintId: number) => void;
  onEditSprint: (sprint: Sprint) => void;
  getEffectiveStatus: (sprint: Sprint) => SprintStatus;
  getStatusColor: (status: SprintStatus) => string;
  getStatusIcon: (status: SprintStatus) => JSX.Element;
  formatDate: (dateString: string) => string;
  getDuration: (start: string, end: string) => number;
}

const SprintTimelineChart = ({
  sprints,
  onSprintClick,
  onEditSprint,
  getEffectiveStatus,
  getStatusColor,
  getStatusIcon,
  formatDate,
  getDuration,
}: SprintTimelineChartProps) => {
  const [rangeDays, setRangeDays] = useState<number>(0);

  const STATUS_COLORS = {
    [SprintStatus.Active]: "#ea580c",
    [SprintStatus.Completed]: "#1f2937",
    [SprintStatus.Planning]: "#2563eb",
    [SprintStatus.Cancelled]: "#dc2626",
  };

  const timelineBounds = useMemo(() => {
    if (sprints.length === 0) {
      return { start: new Date(), end: new Date(), totalDays: 0 };
    }

    const dates = sprints.flatMap((s) => [
      new Date(s.start_date),
      new Date(s.end_date),
    ]);

    let start: Date;
    let end: Date;

    if (rangeDays === 0) {
      start = new Date(Math.min(...dates.map((d) => d.getTime())));
      end = new Date(Math.max(...dates.map((d) => d.getTime())));
      start.setDate(start.getDate() - 2);
      end.setDate(end.getDate() + 2);
    } else {
      const today = new Date();
      start = new Date(today);
      start.setDate(start.getDate() - rangeDays);
      end = new Date(today);
      end.setDate(end.getDate() + rangeDays);
    }

    const totalDays = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );

    return { start, end, totalDays };
  }, [sprints, rangeDays]);

  const todayTimestamp = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.getTime();
  }, []);

  const chartData = useMemo(() => {
    if (timelineBounds.totalDays === 0) return [];

    const sortedSprints = [...sprints].sort(
      (a, b) =>
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );

    const filteredSprints = sortedSprints.filter((sprint) => {
      const sprintStart = new Date(sprint.start_date);
      const sprintEnd = new Date(sprint.end_date);
      sprintStart.setHours(0, 0, 0, 0);
      sprintEnd.setHours(0, 0, 0, 0);
      return sprintEnd >= timelineBounds.start && sprintStart <= timelineBounds.end;
    });

    return filteredSprints.map((sprint) => {
      const sprintStart = new Date(sprint.start_date);
      const sprintEnd = new Date(sprint.end_date);
      sprintStart.setHours(0, 0, 0, 0);
      sprintEnd.setHours(0, 0, 0, 0);

      const status = getEffectiveStatus(sprint);
      const completionRate =
        sprint.task_count && sprint.task_count > 0
          ? Math.round(
              ((sprint.completed_task_count || 0) / sprint.task_count) * 100
            )
          : 0;

      return {
        name: sprint.name,
        startTime: sprintStart.getTime(),
        endTime: sprintEnd.getTime(),
        duration: sprintEnd.getTime() - sprintStart.getTime(),
        status,
        color: STATUS_COLORS[status],
        completionRate,
        tasks: sprint.task_count || 0,
        completed: sprint.completed_task_count || 0,
        startDate: formatDate(sprint.start_date),
        endDate: formatDate(sprint.end_date),
        goal: sprint.goal,
        sprint: sprint,
      };
    });
  }, [sprints, timelineBounds, getEffectiveStatus, formatDate, rangeDays]);

  const formatXAxis = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg max-w-sm">
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
              <span className="font-medium">Period:</span> {data.startDate} - {data.endDate}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Duration:</span>{" "}
              {Math.ceil(data.duration / (1000 * 60 * 60 * 24))} days
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Tasks:</span> {data.completed}/{data.tasks} ({data.completionRate}%)
            </p>
            {data.goal && (
              <p className="text-gray-600 italic text-xs mt-2">
                "{data.goal}"
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomShape = (props: any) => {
    const { cx, cy, payload } = props;

    if (!payload) return null;

    const xScale = props.xAxis?.scale;
    if (!xScale) return null;

    const x1 = xScale(payload.startTime);
    const x2 = xScale(payload.endTime);
    const barWidth = x2 - x1;

    if (barWidth <= 0) return null;

    const barHeight = 40;
    const y = cy - barHeight / 2;
    const completionWidth = (barWidth * payload.completionRate) / 100;

    return (
      <g>
        {/* Main bar */}
        <rect
          x={x1}
          y={y}
          width={barWidth}
          height={barHeight}
          fill={payload.color}
          rx={8}
          className="cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => onSprintClick(payload.sprint.id)}
        />
        {/* Completion indicator */}
        {payload.completionRate > 0 && (
          <rect
            x={x1}
            y={y + barHeight - 8}
            width={completionWidth}
            height={8}
            fill="rgba(255, 255, 255, 0.9)"
            rx={4}
          />
        )}
        {/* Sprint name */}
        {barWidth > 80 && (
          <text
            x={x1 + barWidth / 2}
            y={y + barHeight / 2 - 5}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize={12}
            fontWeight="600"
            className="pointer-events-none"
          >
            {payload.name.length > 20 ? payload.name.substring(0, 20) + "..." : payload.name}
          </text>
        )}
        {/* Percentage */}
        {barWidth > 60 && (
          <text
            x={x1 + barWidth / 2}
            y={y + barHeight / 2 + 10}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize={11}
            fontWeight="700"
            className="pointer-events-none"
          >
            {payload.completionRate}%
          </text>
        )}
      </g>
    );
  };

  if (chartData.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No sprint data available for the selected time range
      </div>
    );
  }

  const getRangeLabel = () => {
    if (rangeDays === 0) return "All Sprints";
    return `±${rangeDays} Days`;
  };

  return (
    <>
      {/* Time Range Slider */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Time Range:</label>
            <span className="text-sm font-semibold text-orange-600">{getRangeLabel()}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>
              {timelineBounds.start.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}{" "}
              -{" "}
              {timelineBounds.end.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="text-gray-400">•</span>
            <span>{timelineBounds.totalDays} days</span>
          </div>
        </div>

        {/* Range Slider */}
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500 w-12">All</span>
          <input
            type="range"
            min="0"
            max="180"
            step="30"
            value={rangeDays}
            onChange={(e) => setRangeDays(Number(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
            style={{
              background: `linear-gradient(to right, #ea580c 0%, #ea580c ${(rangeDays / 180) * 100}%, #e5e7eb ${(rangeDays / 180) * 100}%, #e5e7eb 100%)`
            }}
          />
          <span className="text-xs text-gray-500 w-16 text-right">±180 Days</span>
        </div>

        {/* Slider Markers */}
        <div className="flex justify-between mt-1 px-12">
          <button
            onClick={() => setRangeDays(0)}
            className="text-xs text-gray-400 hover:text-orange-600 transition-colors"
          >
            All
          </button>
          <button
            onClick={() => setRangeDays(30)}
            className="text-xs text-gray-400 hover:text-orange-600 transition-colors"
          >
            ±30
          </button>
          <button
            onClick={() => setRangeDays(60)}
            className="text-xs text-gray-400 hover:text-orange-600 transition-colors"
          >
            ±60
          </button>
          <button
            onClick={() => setRangeDays(90)}
            className="text-xs text-gray-400 hover:text-orange-600 transition-colors"
          >
            ±90
          </button>
          <button
            onClick={() => setRangeDays(120)}
            className="text-xs text-gray-400 hover:text-orange-600 transition-colors"
          >
            ±120
          </button>
          <button
            onClick={() => setRangeDays(180)}
            className="text-xs text-gray-400 hover:text-orange-600 transition-colors"
          >
            ±180
          </button>
        </div>
      </div>

      <div className="overflow-x-auto -mx-6 px-6">
        <div className="relative" style={{ height: "200px", minWidth: "800px" }}>
          {/* Timeline background */}
          <div className="absolute inset-0 border border-gray-200 rounded-lg bg-white">
            {/* Grid lines */}
            <svg className="absolute inset-0 w-full h-full">
              <defs>
                <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                  <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3,3"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* X-axis labels */}
            <div className="absolute bottom-0 left-0 right-0 h-12 flex justify-between items-end px-4 pb-2">
              {Array.from({ length: 7 }).map((_, i) => {
                const timestamp = timelineBounds.start.getTime() + 
                  (i * (timelineBounds.end.getTime() - timelineBounds.start.getTime()) / 6);
                return (
                  <span key={i} className="text-xs text-gray-600 transform -rotate-45 origin-bottom-left">
                    {formatXAxis(timestamp)}
                  </span>
                );
              })}
            </div>

            {/* Today line */}
            {todayTimestamp >= timelineBounds.start.getTime() &&
              todayTimestamp <= timelineBounds.end.getTime() && (
                <div
                  className="absolute top-0 bottom-12 w-0.5 bg-red-500"
                  style={{
                    left: `${((todayTimestamp - timelineBounds.start.getTime()) / 
                      (timelineBounds.end.getTime() - timelineBounds.start.getTime())) * 100}%`
                  }}
                >
                  <span className="absolute -top-1 left-1 text-xs font-semibold text-red-500 whitespace-nowrap">
                    Today
                  </span>
                </div>
              )}

            {/* Sprint bars */}
            <div className="absolute top-16 left-0 right-0 bottom-12 px-4">
              {chartData.map((sprint, index) => {
                const startPercent = ((sprint.startTime - timelineBounds.start.getTime()) / 
                  (timelineBounds.end.getTime() - timelineBounds.start.getTime())) * 100;
                const widthPercent = ((sprint.endTime - sprint.startTime) / 
                  (timelineBounds.end.getTime() - timelineBounds.start.getTime())) * 100;

                return (
                  <div
                    key={index}
                    className="absolute cursor-pointer hover:opacity-90 transition-opacity group"
                    style={{
                      left: `${startPercent}%`,
                      width: `${widthPercent}%`,
                      top: `${(index % 3) * 30}px`,
                      height: "25px",
                    }}
                    onClick={() => onSprintClick(sprint.sprint.id)}
                  >
                    {/* Main bar */}
                    <div
                      className="h-full rounded-lg relative overflow-hidden"
                      style={{ backgroundColor: sprint.color }}
                    >
                      {/* Completion indicator */}
                      {sprint.completionRate > 0 && (
                        <div
                          className="absolute bottom-0 left-0 h-1.5 bg-white/90 rounded-full"
                          style={{ width: `${sprint.completionRate}%` }}
                        />
                      )}
                      {/* Sprint name and percentage */}
                      {widthPercent > 5 && (
                        <div className="absolute inset-0 flex items-center justify-center px-2">
                          <span className="text-white text-xs font-semibold truncate">
                            {sprint.name} ({sprint.completionRate}%)
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Tooltip on hover */}
                    <div className="absolute hidden group-hover:block z-50 bottom-full left-0 mb-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                      <p className="font-semibold text-gray-900 mb-2">{sprint.name}</p>
                      <div className="space-y-1 text-xs">
                        <p className="text-gray-600">
                          <span className="font-medium">Status:</span>{" "}
                          <span
                            className="px-2 py-0.5 rounded text-xs font-medium text-white"
                            style={{ backgroundColor: sprint.color }}
                          >
                            {sprint.status}
                          </span>
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Period:</span> {sprint.startDate} - {sprint.endDate}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Tasks:</span> {sprint.completed}/{sprint.tasks} ({sprint.completionRate}%)
                        </p>
                        {sprint.goal && (
                          <p className="text-gray-600 italic mt-2">"{sprint.goal}"</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SprintTimelineChart;
