"use client";
import { useMemo } from "react";
import { Sprint, Task } from "@/types/project";
import { TaskStatus } from "@/types/project";

interface SprintBurndownChartProps {
  sprint: Sprint;
  tasks: Task[];
}

const SprintBurndownChart = ({ sprint, tasks }: SprintBurndownChartProps) => {
  // Calculate burndown data
  const burndownData = useMemo(() => {
    const startDate = new Date(sprint.start_date);
    const endDate = new Date(sprint.end_date);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // Get sprint tasks
    const sprintTasks = tasks.filter(t => t.sprint && t.sprint.toString() === sprint.id.toString());
    const totalTasks = sprintTasks.length;
    
    // Calculate ideal burndown (linear)
    const idealBurndown = [];
    for (let i = 0; i <= totalDays; i++) {
      idealBurndown.push({
        day: i,
        remaining: Math.max(0, totalTasks - (totalTasks / totalDays) * i),
      });
    }
    
    // Calculate actual burndown (based on task completion dates)
    const actualBurndown = [];
    const completedTasks = sprintTasks.filter(t => t.status === TaskStatus.Completed);
    
    // Group completed tasks by day
    const completedByDay: { [key: number]: number } = {};
    completedTasks.forEach(task => {
      if (task.updated_at) {
        const completedDate = new Date(task.updated_at);
        const dayIndex = Math.ceil((completedDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        if (dayIndex >= 0 && dayIndex <= totalDays) {
          completedByDay[dayIndex] = (completedByDay[dayIndex] || 0) + 1;
        }
      }
    });
    
    // Build actual burndown
    let remaining = totalTasks;
    for (let i = 0; i <= totalDays; i++) {
      if (completedByDay[i]) {
        remaining -= completedByDay[i];
      }
      actualBurndown.push({
        day: i,
        remaining: Math.max(0, remaining),
      });
    }
    
    return {
      totalDays,
      totalTasks,
      idealBurndown,
      actualBurndown,
      currentDay: Math.min(totalDays, Math.max(0, Math.ceil((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))),
    };
  }, [sprint, tasks]);

  const maxRemaining = Math.max(
    ...burndownData.idealBurndown.map(d => d.remaining),
    ...burndownData.actualBurndown.map(d => d.remaining)
  );

  const chartHeight = 200;
  const chartWidth = 100; // percentage

  const getY = (value: number) => {
    return ((maxRemaining - value) / maxRemaining) * chartHeight;
  };

  const getX = (day: number) => {
    return (day / burndownData.totalDays) * chartWidth;
  };

  // Generate date labels
  const dateLabels = [];
  const startDate = new Date(sprint.start_date);
  for (let i = 0; i <= burndownData.totalDays; i += Math.max(1, Math.floor(burndownData.totalDays / 5))) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    dateLabels.push({
      day: i,
      label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    });
  }

  return (
    <div className="pm-card p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Sprint Burndown</h3>
        <p className="text-sm text-gray-500">
          {burndownData.totalTasks} tasks • {burndownData.totalDays} days
        </p>
      </div>

      <div className="relative" style={{ height: `${chartHeight + 40}px` }}>
        {/* Chart Area */}
        <svg
          className="w-full h-full"
          viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`}
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((percent) => (
            <line
              key={percent}
              x1="0"
              y1={chartHeight - (percent / 100) * chartHeight}
              x2={chartWidth}
              y2={chartHeight - (percent / 100) * chartHeight}
              stroke="#e5e7eb"
              strokeWidth="0.5"
              strokeDasharray="2,2"
            />
          ))}

          {/* Ideal burndown line */}
          <polyline
            points={burndownData.idealBurndown
              .map(d => `${getX(d.day)},${getY(d.remaining)}`)
              .join(" ")}
            fill="none"
            stroke="#9ca3af"
            strokeWidth="1"
            strokeDasharray="4,2"
          />

          {/* Actual burndown line */}
          <polyline
            points={burndownData.actualBurndown
              .map(d => `${getX(d.day)},${getY(d.remaining)}`)
              .join(" ")}
            fill="none"
            stroke="#f97316"
            strokeWidth="2"
          />

          {/* Current day indicator */}
          {burndownData.currentDay >= 0 && burndownData.currentDay <= burndownData.totalDays && (
            <line
              x1={getX(burndownData.currentDay)}
              y1="0"
              x2={getX(burndownData.currentDay)}
              y2={chartHeight}
              stroke="#ef4444"
              strokeWidth="1"
              strokeDasharray="3,3"
            />
          )}

          {/* Data points */}
          {burndownData.actualBurndown.map((d, idx) => (
            <circle
              key={idx}
              cx={getX(d.day)}
              cy={getY(d.remaining)}
              r="1.5"
              fill="#f97316"
            />
          ))}
        </svg>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 pr-2">
          <span>{Math.ceil(maxRemaining)}</span>
          <span>{Math.ceil(maxRemaining / 2)}</span>
          <span>0</span>
        </div>

        {/* X-axis labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 mt-2">
          {dateLabels.map((label, idx) => (
            <span key={idx} style={{ marginLeft: idx === 0 ? "0" : "-20px" }}>
              {label.label}
            </span>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-gray-400" style={{ borderTop: "1px dashed #9ca3af" }} />
          <span className="text-gray-600">Ideal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-orange-600" />
          <span className="text-gray-600">Actual</span>
        </div>
        {burndownData.currentDay >= 0 && burndownData.currentDay <= burndownData.totalDays && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-red-500" style={{ borderTop: "1px dashed #ef4444" }} />
            <span className="text-gray-600">Today</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Remaining</p>
          <p className="text-lg font-semibold text-gray-900">
            {burndownData.actualBurndown[burndownData.currentDay]?.remaining || 0}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Completed</p>
          <p className="text-lg font-semibold text-green-600">
            {burndownData.totalTasks - (burndownData.actualBurndown[burndownData.currentDay]?.remaining || 0)}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Progress</p>
          <p className="text-lg font-semibold text-gray-900">
            {burndownData.totalTasks > 0
              ? Math.round(
                  ((burndownData.totalTasks - (burndownData.actualBurndown[burndownData.currentDay]?.remaining || 0)) /
                    burndownData.totalTasks) *
                    100
                )
              : 0}
            %
          </p>
        </div>
      </div>
    </div>
  );
};

export default SprintBurndownChart;

