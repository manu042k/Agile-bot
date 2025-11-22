"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, Flag, CalendarDays, Calendar, CalendarClock, ListTodo } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";

// Mock calendar data
const getMockTasks = () => [
  { id: 1, title: "Implement user authentication", dueDate: "2024-02-15", assignee: "John Doe", priority: "high", project: "E-Commerce Platform" },
  { id: 2, title: "Design dashboard UI", dueDate: "2024-02-18", assignee: "Jane Smith", priority: "medium", project: "Analytics Dashboard" },
  { id: 3, title: "Write API documentation", dueDate: "2024-02-20", assignee: "Mike Johnson", priority: "low", project: "Mobile Banking App" },
  { id: 4, title: "Sprint Planning", dueDate: "2024-02-15", assignee: "Team", priority: "high", project: "E-Commerce Platform" },
  { id: 5, title: "Code Review", dueDate: "2024-02-16", assignee: "Sarah Wilson", priority: "medium", project: "Mobile Banking App" },
];

const CalendarPage = () => {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "month";
  const [currentDate, setCurrentDate] = useState(new Date(2024, 1, 1)); // February 2024
  const tasks = getMockTasks();

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const getTasksForDate = (date: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(date).padStart(2, "0")}`;
    return tasks.filter(task => task.dueDate === dateStr);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + (direction === "next" ? 1 : -1), 1));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Calendar"
        description="View tasks and deadlines in calendar format"
        icon={CalendarIcon}
        tabs={[
          { icon: CalendarDays, label: "Month", href: "/calendar" },
          { icon: Calendar, label: "Week", href: "/calendar?tab=week" },
          { icon: CalendarClock, label: "Day", href: "/calendar?tab=day" },
          { icon: ListTodo, label: "Upcoming", href: "/calendar?tab=upcoming" },
        ]}
      />

      <div className="px-6 py-8">
        {/* Calendar Navigation */}
        <div className="flex items-center justify-end mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateMonth("prev")}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900 min-w-[200px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={() => navigateMonth("next")}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <button className="pm-card p-5 text-left group hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
                    <CalendarIcon className="h-5 w-5 text-gray-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-0.5">View Month</h3>
                    <p className="text-xs text-gray-500">Calendar view</p>
                  </div>
                </div>
              </button>

              <button className="pm-card p-5 text-left group hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
                    <Clock className="h-5 w-5 text-gray-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-0.5">Upcoming Tasks</h3>
                    <p className="text-xs text-gray-500">View schedule</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Calendar Overview */}
            <div className="pm-card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Calendar Overview</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Tasks This Month</span>
                    <span className="font-medium text-gray-900">{tasks.length}</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-900 rounded-full transition-all"
                      style={{ width: `${(tasks.length / 10) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">{tasks.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Total Tasks</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">{tasks.filter(t => t.priority === "high").length}</p>
                    <p className="text-xs text-gray-500 mt-1">High Priority</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">{new Set(tasks.map(t => t.project)).size}</p>
                    <p className="text-xs text-gray-500 mt-1">Projects</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Calendar */}
            <div>
            <div className="pm-card p-6">
              {/* Calendar Header */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                  <div key={day} className="text-center text-sm font-semibold text-gray-700 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Empty cells for days before month starts */}
                {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="aspect-square" />
                ))}

                {/* Days of the month */}
                {Array.from({ length: daysInMonth }).map((_, idx) => {
                  const day = idx + 1;
                  const dayTasks = getTasksForDate(day);
                  return (
                    <div
                      key={day}
                      className={`aspect-square border border-gray-200 rounded-lg p-2 ${
                        dayTasks.length > 0 ? "bg-gray-50" : "bg-white"
                      } hover:border-gray-300 hover:shadow-sm transition-all`}
                    >
                      <div className="text-sm font-medium text-gray-900 mb-1">{day}</div>
                      <div className="space-y-1">
                        {dayTasks.slice(0, 2).map(task => (
                          <div
                            key={task.id}
                            className={`text-xs p-1 rounded truncate ${
                              task.priority === "high" ? "pm-priority-high" :
                              task.priority === "medium" ? "pm-priority-medium" :
                              "pm-priority-low"
                            }`}
                            title={task.title}
                          >
                            {task.title}
                          </div>
                        ))}
                        {dayTasks.length > 2 && (
                          <div className="text-xs text-gray-500">+{dayTasks.length - 2}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Calendar Details */}
            <div className="pm-card p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Calendar Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Current Month</p>
                  <p className="text-sm font-medium text-gray-900">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Total Tasks</p>
                  <p className="text-sm font-medium text-gray-900">{tasks.length}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Projects</p>
                  <p className="text-sm font-medium text-gray-900">{new Set(tasks.map(t => t.project)).size}</p>
                </div>
              </div>
            </div>

            {/* Upcoming Tasks */}
            <div className="pm-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Tasks</h3>
              <div className="space-y-3">
                {tasks.slice(0, 5).map(task => (
                  <div key={task.id} className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        task.priority === "high" ? "pm-priority-high" :
                        task.priority === "medium" ? "pm-priority-medium" :
                        "pm-priority-low"
                      }`}>
                        <Flag className="h-3 w-3 inline mr-1" />
                        {task.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {task.dueDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {task.assignee}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;

