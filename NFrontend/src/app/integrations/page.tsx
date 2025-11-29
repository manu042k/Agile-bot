"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plug, CheckCircle, X, ExternalLink, Settings } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { Separator } from "@/components/ui/separator";
import ActivityFeed from "@/components/common/ActivityFeed";
import EmptyState from "@/components/common/EmptyState";

// Integrations will be fetched from API
const mockIntegrations: any[] = [];

const categories = ["All", "Communication", "Development", "Project Management", "Storage", "Automation"];

export default function IntegrationsPage() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "all";
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [integrations, setIntegrations] = useState<any[]>([]);

  const filteredIntegrations =
    selectedCategory === "All"
      ? integrations
      : integrations.filter((int) => int.category === selectedCategory);

  const handleConnect = (id: number) => {
    setIntegrations((prev) =>
      prev.map((int) =>
        int.id === id
          ? { ...int, connected: true, connectedAt: new Date().toISOString().split("T")[0] }
          : int
      )
    );
  };

  const handleDisconnect = (id: number) => {
    setIntegrations((prev) =>
      prev.map((int) => (int.id === id ? { ...int, connected: false, connectedAt: undefined } : int))
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Integrations"
        description="Connect your favorite tools and services"
        icon={Plug}
        tabs={[
          { icon: Plug, label: "Integrations", href: "/integrations" },
          { icon: Settings, label: "Settings", href: "/integrations?tab=settings" },
        ]}
      />

      <div className="px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* All Integrations Tab */}
            {tab === "all" && (
              <>
                {/* Category Filter */}
            <div className="pm-card p-6">
              <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
              <Separator className="my-4" />
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Integrations List */}
            <div className="pm-card p-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedCategory === "All" ? "Integrations" : selectedCategory}
              </h2>
              <Separator className="my-4" />
              {filteredIntegrations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredIntegrations.map((integration) => (
                  <div
                    key={integration.id}
                    className="p-5 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{integration.icon}</div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                          <p className="text-xs text-gray-500">{integration.category}</p>
                        </div>
                      </div>
                      {integration.connected && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Connected
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{integration.description}</p>
                    <div className="flex items-center gap-2">
                      {integration.connected ? (
                        <>
                          <button
                            onClick={() => handleDisconnect(integration.id)}
                            className="flex-1 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                            <X className="h-4 w-4" />
                            Disconnect
                          </button>
                          <button className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                            <Settings className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleConnect(integration.id)}
                          className="flex-1 pm-button-primary text-sm px-4 py-2"
                        >
                          Connect
                        </button>
                      )}
                      <button className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                    {integration.connected && integration.connectedAt && (
                      <p className="text-xs text-gray-500 mt-3">
                        Connected on {new Date(integration.connectedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              ) : (
                <EmptyState
                  icon={Plug}
                  title="No integrations available"
                  description="Integrations will be available soon to connect your favorite tools"
                />
              )}
            </div>
              </>
            )}

            {/* Settings Tab */}
            {tab === "settings" && (
              <div className="pm-card p-6">
                <h2 className="text-lg font-semibold text-gray-900">Integration Settings</h2>
                <Separator className="my-4" />
                <p className="text-gray-600">Settings content coming soon...</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Integrations Overview */}
            <div className="pm-card p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Overview</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Total Integrations</p>
                  <p className="text-sm font-medium text-gray-900">{mockIntegrations.length}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Connected</p>
                  <p className="text-sm font-medium text-gray-900">
                    {mockIntegrations.filter((int) => int.connected).length}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Available</p>
                  <p className="text-sm font-medium text-gray-900">
                    {mockIntegrations.filter((int) => !int.connected).length}
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <ActivityFeed limit={5} />
          </div>
        </div>
      </div>
    </div>
  );
}

