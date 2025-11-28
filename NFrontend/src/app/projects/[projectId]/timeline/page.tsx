"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  Loader2,
  Plus,
  PlayCircle,
  CheckCircle2,
  ListTodo,
  TrendingUp,
  Edit,
} from "lucide-react";
import Link from "next/link";
import ProjectHeader from "@/components/projects/ProjectHeader";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import SprintCreateEditDialog from "@/components/projects/SprintCreateEditDialog";
import SprintCalendar from "@/components/projects/SprintCalendar";
import CreateCard from "@/components/common/CreateCard";
import StatCard from "@/components/common/StatCard";
import sprintService from "@/services/sprintService";
import { Sprint, SprintStatus } from "@/types/project";
import toast from "react-hot-toast";

const TimelinePage = () => {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeScale, setTimeScale] = useState<"days" | "weeks" | "months">(
    "weeks"
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);
  const [viewMode, setViewMode] = useState<"calendar" | "timeline">("calendar");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  useEffect(() => {
    fetchSprints();
  }, [projectId]);

  const fetchSprints = async () => {
    try {
      setLoading(true);
      const data = await sprintService.getSprints(projectId);
      setSprints(data);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching sprints:", err);
      setError(err.message || "Failed to fetch sprints");
      toast.error("Failed to load timeline");
    } finally {
      setLoading(false);
    }
  };

  // Calculate timeline bounds from sprints
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

  // Calculate sprint position and width on timeline
  const getSprintPosition = (sprint: Sprint) => {
    if (timelineBounds.totalDays === 0) return { position: 0, width: 0 };

    const sprintStart = new Date(sprint.start_date);
    const sprintEnd = new Date(sprint.end_date);
    
    // Calculate days from timeline start
    const daysFromStart = Math.max(
      0,
      (sprintStart.getTime() - timelineBounds.start.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    // Calculate sprint duration in days (inclusive)
    const sprintDuration = Math.max(
      1,
      (sprintEnd.getTime() - sprintStart.getTime()) / (1000 * 60 * 60 * 24) + 1
    );
    
    // Calculate position as percentage
    const position = Math.max(
      0,
      Math.min(100, (daysFromStart / timelineBounds.totalDays) * 100)
    );
    // Calculate width as percentage, ensuring it doesn't exceed available space
    const maxWidth = 100 - position;
    const width = Math.max(
      3,
      Math.min(maxWidth, (sprintDuration / timelineBounds.totalDays) * 100)
    );

    return { position, width };
  };

  const getEffectiveStatus = (sprint: Sprint): SprintStatus => {
    // Use auto_status if available, otherwise use status
    return sprint.auto_status || sprint.status;
  };

  const getStatusColor = (status: SprintStatus) => {
    switch (status) {
      case SprintStatus.Active:
        return "bg-orange-600";
      case SprintStatus.Completed:
        return "bg-gray-800";
      case SprintStatus.Planning:
        return "bg-blue-600";
      case SprintStatus.Cancelled:
        return "bg-red-600";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusIcon = (status: SprintStatus) => {
    switch (status) {
      case SprintStatus.Active:
        return <PlayCircle className="h-4 w-4" />;
      case SprintStatus.Completed:
        return <CheckCircle2 className="h-4 w-4" />;
      case SprintStatus.Planning:
        return <ListTodo className="h-4 w-4" />;
      default:
        return <CalendarIcon className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const days =
      Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;
    return days;
  };

  // Generate date labels for timeline
  const generateDateLabels = () => {
    if (timelineBounds.totalDays === 0) return [];
    
    const labels = [];
    const start = new Date(timelineBounds.start);
    const end = new Date(timelineBounds.end);
    
    // Always include start and end dates
    labels.push(start);
    
    if (timeScale === "days") {
      const days = Math.ceil(timelineBounds.totalDays);
      const step = Math.max(1, Math.floor(days / 8));
      for (let i = step; i < days; i += step) {
        const date = new Date(start);
        date.setDate(date.getDate() + i);
        if (date < end) labels.push(date);
      }
    } else if (timeScale === "weeks") {
      const weeks = Math.ceil(timelineBounds.totalDays / 7);
      const step = Math.max(1, Math.floor(weeks / 8));
      for (let i = step; i < weeks; i += step) {
        const date = new Date(start);
        date.setDate(date.getDate() + i * 7);
        if (date < end) labels.push(date);
      }
    } else {
      const months = Math.ceil(timelineBounds.totalDays / 30);
      for (let i = 1; i < months; i++) {
        const date = new Date(start);
        date.setMonth(date.getMonth() + i);
        if (date < end) labels.push(date);
      }
    }
    
    // Always include end date
    labels.push(end);
    
    // Sort and remove duplicates
    const uniqueLabels = Array.from(new Set(labels.map((d) => d.getTime())))
      .map((time) => new Date(time))
      .sort((a, b) => a.getTime() - b.getTime());
    
    return uniqueLabels;
  };

  const handleSprintClick = (sprintId: number) => {
    router.push(`/projects/${projectId}/board?sprint=${sprintId}`);
  };

  // Get sprints for a specific date
  const getSprintsForDate = (date: Date) => {
    return sprints.filter((sprint) => {
      const start = new Date(sprint.start_date);
      const end = new Date(sprint.end_date);
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      return checkDate >= start && checkDate <= end;
    });
  };

  // Get all dates that have sprints for calendar highlighting
  const sprintDates = useMemo(() => {
    const dates = new Set<string>();
    sprints.forEach((sprint) => {
      const start = new Date(sprint.start_date);
      const end = new Date(sprint.end_date);
      const current = new Date(start);
      while (current <= end) {
        dates.add(current.toISOString().split("T")[0]);
        current.setDate(current.getDate() + 1);
      }
    });
    return dates;
  }, [sprints]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProjectHeader />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Loading timeline...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProjectHeader />
        <div className="px-6 py-8">
          <div className="pm-card p-8 text-center border-red-200 bg-red-50">
            <p className="text-red-600 font-medium mb-2">
              Failed to load timeline
            </p>
            <p className="text-sm text-red-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const dateLabels = generateDateLabels();
  const completedSprints = sprints.filter(
    (s) => getEffectiveStatus(s) === SprintStatus.Completed
  );
  const planningSprints = sprints.filter(
    (s) => getEffectiveStatus(s) === SprintStatus.Planning
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <ProjectHeader />
      <div className="px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="mb-4">
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">
              Timeline
            </h1>
            <p className="text-gray-600">
              View sprint cycles and navigate to sprint boards
            </p>
          </div>
        </div>

        {/* Sprint Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Create Sprint Card */}
          <CreateCard
            title="Create Sprint"
            description="New sprint"
            icon={Plus}
            onClick={() => setIsCreateDialogOpen(true)}
          />

          <StatCard
            icon={CalendarIcon}
            value={sprints.length}
            label="Total Sprints"
            className="p-5"
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
          />
          <StatCard
            icon={CheckCircle2}
            value={completedSprints.length}
            label="Completed"
            className="p-5"
            iconBgColor="bg-green-100"
            iconColor="text-green-600"
          />
          <StatCard
            icon={ListTodo}
            value={planningSprints.length}
            label="Planning"
            className="p-5"
            iconBgColor="bg-orange-100"
            iconColor="text-orange-600"
          />
        </div>

        {/* Sprint Calendar/Timeline View */}
        {sprints.length > 0 ? (
          <>
            {viewMode === "calendar" ? (
              <div className="space-y-6 mb-6">
                {/* Sprint Calendar with Integrated Bars */}
                <div className="pm-card p-6 overflow-hidden">
                  {/* View Toggle */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700">
                        View Mode:
                      </span>
                      <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
                        <button
                          onClick={() => setViewMode("calendar")}
                          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                            viewMode === "calendar"
                              ? "bg-orange-600 text-white"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          Calendar
                        </button>
                        <button
                          onClick={() => setViewMode("timeline")}
                          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                            viewMode === "timeline"
                              ? "bg-orange-600 text-white"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          Timeline
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto -mx-6 px-6">
                    <SprintCalendar
                      sprints={sprints}
                      currentMonth={currentMonth}
                      onMonthChange={setCurrentMonth}
                      onSprintClick={handleSprintClick}
                      getStatusColor={getStatusColor}
                      getStatusIcon={getStatusIcon}
                      getEffectiveStatus={getEffectiveStatus}
                      formatDate={formatDate}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="pm-card p-6 mb-6">
                {/* View Toggle */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">
                      View Mode:
                    </span>
                    <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
                      <button
                        onClick={() => setViewMode("calendar")}
                        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                          viewMode === "calendar"
                            ? "bg-orange-600 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        Calendar
                      </button>
                      <button
                        onClick={() => setViewMode("timeline")}
                        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                          viewMode === "timeline"
                            ? "bg-orange-600 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        Timeline
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                      Time Scale:
                    </span>
                    <select
                      value={timeScale}
                      onChange={(e) =>
                        setTimeScale(
                          e.target.value as "days" | "weeks" | "months"
                        )
                      }
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="days">Days</option>
                      <option value="weeks">Weeks</option>
                      <option value="months">Months</option>
                    </select>
                  </div>
                </div>
                <Separator className="mb-6" />
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Sprint Timeline
                </h2>
                <Separator className="mb-6" />
            
            {/* Timeline Header with Date Labels */}
            <div className="relative mb-6 overflow-x-auto">
              <div className="min-w-full">
                <div className="flex border-b-2 border-gray-300 pb-3 mb-4">
                      <div className="w-56 flex-shrink-0 font-semibold text-sm text-gray-700">
                        Sprint
                      </div>
                  <div className="flex-1 relative min-h-[30px]">
                    {dateLabels.length > 0 && (
                      <div className="flex justify-between text-xs text-gray-600 font-medium">
                        {dateLabels.map((date, idx) => (
                          <span 
                            key={idx} 
                            className="flex-shrink-0 text-center"
                            style={{ 
                                  width:
                                    idx === dateLabels.length - 1
                                      ? "auto"
                                      : `${100 / (dateLabels.length - 1)}%`,
                                  position:
                                    idx === dateLabels.length - 1
                                      ? "absolute"
                                      : "relative",
                                  right:
                                    idx === dateLabels.length - 1
                                      ? "0"
                                      : "auto",
                            }}
                          >
                                {date.toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sprint Rows */}
            <div className="space-y-4">
              {sprints.map((sprint) => {
                const { position, width } = getSprintPosition(sprint);
                    const completionRate =
                      sprint.task_count && sprint.task_count > 0
                        ? Math.round(
                            ((sprint.completed_task_count || 0) /
                              sprint.task_count) *
                              100
                          )
                  : 0;
                
                const effectiveStatus = getEffectiveStatus(sprint);

                return (
                      <div
                        key={sprint.id}
                        className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0"
                      >
                    {/* Sprint Info Column */}
                    <div className="w-56 flex-shrink-0">
                      <div className="group">
                        <div className="flex items-center gap-2 mb-2">
                              <span
                                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 ${getStatusColor(
                                  effectiveStatus
                                )} text-white shadow-sm`}
                              >
                            {getStatusIcon(effectiveStatus)}
                                <span className="capitalize">
                                  {effectiveStatus}
                                </span>
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingSprint(sprint);
                            }}
                            className="p-1 rounded hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
                            title="Edit Sprint"
                          >
                            <Edit className="h-3.5 w-3.5 text-gray-600" />
                          </button>
                        </div>
                        <div
                          onClick={() => handleSprintClick(sprint.id)}
                          className="cursor-pointer"
                        >
                          <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors mb-1.5 text-base">
                            {sprint.name}
                          </h3>
                          <p className="text-xs text-gray-500 mb-2 font-medium">
                                {formatDate(sprint.start_date)} -{" "}
                                {formatDate(sprint.end_date)}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                                  {getDuration(
                                    sprint.start_date,
                                    sprint.end_date
                                  )}{" "}
                                  days
                            </span>
                            <span>•</span>
                            <span className="font-medium">
                                  {sprint.completed_task_count || 0}/
                                  {sprint.task_count || 0} tasks
                            </span>
                          </div>
                          {sprint.goal && (
                            <p className="text-xs text-gray-600 mt-2 line-clamp-2 italic bg-gray-50 p-2 rounded">
                              "{sprint.goal}"
                            </p>
                          )}
                          {/* Progress indicator */}
                          <div className="mt-2">
                            <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-gray-500">
                                    Progress
                                  </span>
                                  <span className="text-xs font-semibold text-gray-700">
                                    {completionRate}%
                                  </span>
                            </div>
                            <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                    className={`h-full rounded-full transition-all ${getStatusColor(
                                      effectiveStatus
                                    )}`}
                                style={{ width: `${completionRate}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Timeline Bar Column */}
                    <div className="flex-1 relative min-h-[80px] bg-gray-50 rounded-lg border border-gray-200 p-2">
                      <div
                        onClick={() => handleSprintClick(sprint.id)}
                        className="absolute top-2 group cursor-pointer transition-all z-10"
                        style={{
                              left: `${Math.max(
                                0,
                                Math.min(100 - width, position)
                              )}%`,
                          width: `${Math.max(3, Math.min(100, width))}%`,
                        }}
                            title={`${sprint.name} - ${formatDate(
                              sprint.start_date
                            )} to ${formatDate(
                              sprint.end_date
                            )} - Click to view board`}
                      >
                            <div
                              className={`h-16 rounded-lg px-3 py-2 flex flex-col justify-between text-white text-sm font-medium transition-all hover:shadow-xl hover:scale-[1.02] ${getStatusColor(
                                effectiveStatus
                              )} border-2 border-white/20 shadow-md`}
                            >
                          <div className="flex items-center justify-between gap-2">
                                <span className="truncate flex-1 font-semibold text-base">
                                  {sprint.name}
                                </span>
                            <span className="ml-2 text-xs opacity-95 font-bold bg-white/20 px-1.5 py-0.5 rounded">
                              {completionRate}%
                            </span>
                          </div>
                          <div className="text-xs opacity-90 mt-1 flex items-center justify-between">
                            <span>{formatDate(sprint.start_date)}</span>
                            <span className="mx-1">→</span>
                            <span>{formatDate(sprint.end_date)}</span>
                          </div>
                          {/* Progress indicator inside sprint bar */}
                          {completionRate > 0 && (
                            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20 rounded-b-lg overflow-hidden">
                              <div
                                className="h-full bg-white/80 rounded-b-lg transition-all"
                                style={{ width: `${completionRate}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
              </div>
            )}
          </>
        ) : (
          <div className="pm-card p-12 text-center">
            <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium mb-2">No sprints yet</p>
            <p className="text-sm text-gray-500">
              Create your first sprint to start planning
            </p>
          </div>
        )}

        {/* Sprint List View */}
        <div className="pm-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            All Sprints
          </h2>
          <Separator className="mb-4" />
          {sprints.length > 0 ? (
            <div className="space-y-3">
              {sprints.map((sprint) => {
                const completionRate =
                  sprint.task_count && sprint.task_count > 0
                    ? Math.round(
                        ((sprint.completed_task_count || 0) /
                          sprint.task_count) *
                          100
                      )
                  : 0;
                
                const effectiveStatus = getEffectiveStatus(sprint);

                return (
                  <div
                    key={sprint.id}
                    onClick={() => handleSprintClick(sprint.id)}
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:shadow-sm transition-all cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {sprint.name}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium border flex items-center gap-1 ${getStatusColor(
                            effectiveStatus
                          )} text-white`}
                        >
                          {getStatusIcon(effectiveStatus)}
                          {effectiveStatus}
                        </span>
                      </div>
                      {sprint.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                          {sprint.description}
                        </p>
                      )}
                      {sprint.goal && (
                        <p className="text-xs text-gray-500 italic mb-2">
                          "{sprint.goal}"
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <CalendarIcon className="h-3.5 w-3.5" />
                          {formatDate(sprint.start_date)} -{" "}
                          {formatDate(sprint.end_date)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {getDuration(sprint.start_date, sprint.end_date)} days
                        </span>
                        <span>
                          {sprint.completed_task_count || 0} /{" "}
                          {sprint.task_count || 0} tasks
                        </span>
                      </div>
                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${getStatusColor(
                              effectiveStatus
                            )}`}
                            style={{ width: `${completionRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        {completionRate}%
                      </p>
                      <p className="text-xs text-gray-500">Complete</p>
                  </div>
                </div>
              );
            })}
          </div>
          ) : (
            <div className="text-center py-12">
              <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium mb-2">No sprints yet</p>
              <p className="text-sm text-gray-500">
                Create sprints to see them on the timeline
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Sprint Dialog */}
      <SprintCreateEditDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        projectId={projectId}
        onSuccess={fetchSprints}
      />

      {/* Edit Sprint Dialog */}
      <SprintCreateEditDialog
        open={!!editingSprint}
        onOpenChange={(open) => {
          if (!open) setEditingSprint(null);
        }}
        projectId={projectId}
        sprint={editingSprint}
        onSuccess={() => {
          setEditingSprint(null);
          fetchSprints();
        }}
      />
    </div>
  );
};

export default TimelinePage;
