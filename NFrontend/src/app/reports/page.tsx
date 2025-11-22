"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { FileText, Download, Calendar, Filter, BarChart3, TrendingUp, Users, CheckCircle } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";

// Mock reports data
const mockReports = [
  {
    id: 1,
    name: "Q1 2024 Project Summary",
    type: "Project Summary",
    created: "2024-03-31",
    createdBy: "John Doe",
    projects: 5,
    status: "completed",
  },
  {
    id: 2,
    name: "Team Performance Report",
    type: "Team Analytics",
    created: "2024-03-28",
    createdBy: "Jane Smith",
    teams: 3,
    status: "completed",
  },
  {
    id: 3,
    name: "Task Completion Analysis",
    type: "Task Analytics",
    created: "2024-03-25",
    createdBy: "Mike Johnson",
    tasks: 150,
    status: "completed",
  },
];

const reportTypes = [
  { value: "all", label: "All Reports" },
  { value: "project", label: "Project Summary" },
  { value: "team", label: "Team Analytics" },
  { value: "task", label: "Task Analytics" },
  { value: "custom", label: "Custom Report" },
];

export default function ReportsPage() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "all";
  const [selectedType, setSelectedType] = useState("all");
  const [dateRange, setDateRange] = useState("all");

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Reports"
        description="Generate and manage custom reports"
        icon={FileText}
        tabs={[
          { icon: FileText, label: "Reports", href: "/reports" },
          { icon: BarChart3, label: "Analytics", href: "/reports?tab=analytics" },
          { icon: Calendar, label: "Scheduled", href: "/reports?tab=scheduled" },
        ]}
      />

      <div className="px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* All Reports Tab */}
            {tab === "all" && (
              <>
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <button className="pm-card p-5 text-left group hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
                    <FileText className="h-5 w-5 text-gray-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-0.5">
                      Create Report
                    </h3>
                    <p className="text-xs text-gray-500">Custom report</p>
                  </div>
                </div>
              </button>

              <button className="pm-card p-5 text-left group hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
                    <Calendar className="h-5 w-5 text-gray-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-0.5">
                      Schedule Report
                    </h3>
                    <p className="text-xs text-gray-500">Automated reports</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Filters */}
            <div className="pm-card p-6">
              <div className="flex items-center gap-4 mb-4">
                <Filter className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-2">Report Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="pm-input w-full"
                  >
                    {reportTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-2">Date Range</label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="pm-input w-full"
                  >
                    <option value="all">All Time</option>
                    <option value="week">Last Week</option>
                    <option value="month">Last Month</option>
                    <option value="quarter">Last Quarter</option>
                    <option value="year">Last Year</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Reports List */}
            <div className="pm-card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Reports</h2>
              <div className="space-y-3">
                {mockReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-3 rounded-lg bg-gray-100">
                        <FileText className="h-5 w-5 text-gray-700" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{report.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{report.type}</span>
                          <span>•</span>
                          <span>Created by {report.createdBy}</span>
                          <span>•</span>
                          <span>{report.created}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Reports Overview */}
            <div className="pm-card p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Reports Overview</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Total Reports</p>
                  <p className="text-sm font-medium text-gray-900">{mockReports.length}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">This Month</p>
                  <p className="text-sm font-medium text-gray-900">3</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Scheduled</p>
                  <p className="text-sm font-medium text-gray-900">0</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="pm-card p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-3 w-3 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">John Doe</span> generated{" "}
                        <span className="font-medium">Q1 2024 Project Summary</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
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
}

