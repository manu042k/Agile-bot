"use client";
import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Sprint, SprintStatus } from "@/types/project";
import { cn } from "@/lib/utils";

interface SprintCalendarProps {
  sprints: Sprint[];
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  onSprintClick: (sprintUuid: string) => void;
  getStatusColor: (status: SprintStatus) => string;
  getStatusIcon: (status: SprintStatus) => React.ReactNode;
  getEffectiveStatus: (sprint: Sprint) => SprintStatus;
  formatDate: (dateString: string) => string;
}

const SprintCalendar = ({
  sprints,
  currentMonth,
  onMonthChange,
  onSprintClick,
  getStatusColor,
  getStatusIcon,
  getEffectiveStatus,
  formatDate,
}: SprintCalendarProps) => {
  const [hoveredSprint, setHoveredSprint] = useState<Sprint | null>(null);

  // Get first and last day of the month
  const monthStart = useMemo(() => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    date.setHours(0, 0, 0, 0);
    return date;
  }, [currentMonth]);

  const monthEnd = useMemo(() => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    date.setHours(23, 59, 59, 999);
    return date;
  }, [currentMonth]);

  // Get first day of week for the month
  const startDate = useMemo(() => {
    const date = new Date(monthStart);
    const day = date.getDay();
    date.setDate(date.getDate() - day);
    return date;
  }, [monthStart]);

  // Get last day to show (end of last week)
  const endDate = useMemo(() => {
    const date = new Date(monthEnd);
    const day = date.getDay();
    date.setDate(date.getDate() + (6 - day));
    return date;
  }, [monthEnd]);

  // Generate all days in the calendar view
  const calendarDays = useMemo(() => {
    const days = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  }, [startDate, endDate]);

  // Get sprints that overlap with the current month
  const visibleSprints = useMemo(() => {
    return sprints.filter((sprint) => {
      const sprintStart = new Date(sprint.start_date);
      const sprintEnd = new Date(sprint.end_date);
      return sprintStart <= monthEnd && sprintEnd >= monthStart;
    });
  }, [sprints, monthStart, monthEnd]);

  // Calculate sprint position and width for each day row
  const getSprintPosition = (sprint: Sprint, day: Date) => {
    const sprintStart = new Date(sprint.start_date);
    const sprintEnd = new Date(sprint.end_date);
    sprintStart.setHours(0, 0, 0, 0);
    sprintEnd.setHours(23, 59, 59, 999);
    day.setHours(0, 0, 0, 0);

    // Check if sprint overlaps with this day
    if (sprintStart <= day && sprintEnd >= day) {
      const weekStart = new Date(day);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      // Calculate position within the week
      const sprintWeekStart = sprintStart > weekStart ? sprintStart : weekStart;
      const sprintWeekEnd = sprintEnd < weekEnd ? sprintEnd : weekEnd;

      const daysFromWeekStart = Math.floor(
        (sprintWeekStart.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24)
      );
      const sprintDuration = Math.ceil(
        (sprintWeekEnd.getTime() - sprintWeekStart.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;

      return {
        left: (daysFromWeekStart / 7) * 100,
        width: (sprintDuration / 7) * 100,
        isStart: sprintStart <= day && sprintStart >= weekStart,
        isEnd: sprintEnd >= day && sprintEnd <= weekEnd,
      };
    }
    return null;
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentMonth);
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    onMonthChange(newDate);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div>
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth("prev")}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={() => navigateMonth("next")}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Week Day Headers */}
      <div className="grid grid-cols-7 gap-2 mb-3">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid with Sprint Bars */}
      <div className="space-y-3 overflow-x-auto">
        {Array.from({ length: Math.ceil(calendarDays.length / 7) }).map((_, weekIndex) => {
          const weekDays = calendarDays.slice(weekIndex * 7, (weekIndex + 1) * 7);
          const weekSprints = visibleSprints.filter((sprint) => {
            const sprintStart = new Date(sprint.start_date);
            const sprintEnd = new Date(sprint.end_date);
            const weekStart = weekDays[0];
            const weekEnd = weekDays[weekDays.length - 1];
            return sprintStart <= weekEnd && sprintEnd >= weekStart;
          });

          return (
            <div key={weekIndex} className="relative min-w-0">
              {/* Calendar Days Row */}
              <div className="grid grid-cols-7 gap-2 mb-2 min-w-0">
                {weekDays.map((day, dayIndex) => {
                  const isToday = day.getTime() === today.getTime();
                  const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                  const daySprints = visibleSprints.filter((sprint) => {
                    const sprintStart = new Date(sprint.start_date);
                    const sprintEnd = new Date(sprint.end_date);
                    sprintStart.setHours(0, 0, 0, 0);
                    sprintEnd.setHours(23, 59, 59, 999);
                    day.setHours(0, 0, 0, 0);
                    return sprintStart <= day && sprintEnd >= day;
                  });

                  return (
                    <div
                      key={dayIndex}
                      className={cn(
                        "relative min-h-[100px] border border-gray-200 rounded-lg p-2 bg-white min-w-0 overflow-hidden",
                        !isCurrentMonth && "bg-gray-50 opacity-60",
                        isToday && "border-orange-500 border-2 bg-orange-50 shadow-sm"
                      )}
                    >
                      <div
                        className={cn(
                          "text-sm font-semibold mb-2",
                          isToday ? "text-orange-600" : isCurrentMonth ? "text-gray-900" : "text-gray-400"
                        )}
                      >
                        {day.getDate()}
                      </div>
                      {/* Sprint indicators for this day */}
                      <div className="space-y-1 overflow-hidden">
                        {daySprints.slice(0, 2).map((sprint) => {
                          const effectiveStatus = getEffectiveStatus(sprint);
                          return (
                            <div
                              key={sprint.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                onSprintClick(sprint.uuid);
                              }}
                              className={cn(
                                "text-[11px] px-1.5 py-1 rounded truncate cursor-pointer hover:opacity-90 transition-all shadow-sm w-full",
                                getStatusColor(effectiveStatus),
                                "text-white font-medium"
                              )}
                              title={`${sprint.name} - Click to view`}
                            >
                              {sprint.name}
                            </div>
                          );
                        })}
                        {daySprints.length > 2 && (
                          <div className="text-[10px] text-gray-500 font-medium px-1 truncate">
                            +{daySprints.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sprint Bars Row (below calendar days) */}
              {weekSprints.length > 0 && (
                <div className="relative h-10 mb-1 mx-2 overflow-hidden">
                  {weekSprints.map((sprint) => {
                    const position = getSprintPosition(sprint, weekDays[0]);
                    if (!position) return null;

                    const effectiveStatus = getEffectiveStatus(sprint);
                    const completionRate = sprint.task_count && sprint.task_count > 0
                      ? Math.round((sprint.completed_task_count || 0) / sprint.task_count * 100)
                      : 0;

                    return (
                      <div
                        key={sprint.id}
                        className="absolute top-0 h-full cursor-pointer group z-10"
                        style={{
                          left: `${Math.max(0, Math.min(100, position.left))}%`,
                          width: `${Math.max(3, Math.min(100 - Math.max(0, position.left), position.width))}%`,
                        }}
                        onClick={() => onSprintClick(sprint.uuid)}
                        onMouseEnter={() => setHoveredSprint(sprint)}
                        onMouseLeave={() => setHoveredSprint(null)}
                      >
                        <div
                          className={cn(
                            "h-full rounded-md px-2 py-1.5 flex items-center justify-between text-white text-xs font-medium transition-all hover:shadow-xl overflow-hidden",
                            getStatusColor(effectiveStatus),
                            hoveredSprint?.id === sprint.id && "ring-2 ring-white ring-offset-1 shadow-lg"
                          )}
                          title={`${sprint.name} - ${formatDate(sprint.start_date)} to ${formatDate(sprint.end_date)} - ${completionRate}% complete - Click to view board`}
                        >
                          {position.isStart && position.width > 12 && (
                            <span className="truncate flex-1 font-semibold text-xs min-w-0">{sprint.name}</span>
                          )}
                          {position.width > 18 && (
                            <span className="text-[10px] opacity-95 ml-1 font-bold bg-white/20 px-1.5 py-0.5 rounded flex-shrink-0">
                              {completionRate}%
                            </span>
                          )}
                          {/* Progress indicator */}
                          {completionRate > 0 && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 rounded-b-md overflow-hidden">
                              <div
                                className="h-full bg-white/90 rounded-b-md transition-all"
                                style={{ width: `${completionRate}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SprintCalendar;

