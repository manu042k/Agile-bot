"use client";
import React, { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Task } from '@/types/project';
import { ZoomIn, ZoomOut, Maximize2, GitBranch, Grid3x3, Network, Link } from 'lucide-react';
import StatCard from '@/components/common/StatCard';

interface DependencyGraphProps {
  tasks: Task[];
}

type LayoutType = 'hierarchical' | 'grid';

// Custom Zoom Controls Component (must be inside ReactFlow)
const CustomZoomControls: React.FC = () => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
      <button
        onClick={() => zoomIn()}
        className="p-2.5 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-all hover:shadow-xl group"
        title="Zoom In"
      >
        <ZoomIn className="h-5 w-5 text-gray-700 group-hover:text-orange-600" />
      </button>
      <button
        onClick={() => zoomOut()}
        className="p-2.5 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-all hover:shadow-xl group"
        title="Zoom Out"
      >
        <ZoomOut className="h-5 w-5 text-gray-700 group-hover:text-orange-600" />
      </button>
      <button
        onClick={() => fitView({ padding: 0.2, duration: 400 })}
        className="p-2.5 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-all hover:shadow-xl group"
        title="Fit View"
      >
        <Maximize2 className="h-5 w-5 text-gray-700 group-hover:text-orange-600" />
      </button>
    </div>
  );
};

// Inner component that uses ReactFlow hooks
const DependencyGraphInner: React.FC<DependencyGraphProps> = ({ tasks }) => {
  const [layoutType, setLayoutType] = useState<LayoutType>('hierarchical');
  
  // Calculate layout positions based on type
  const calculateLayout = useCallback((tasks: Task[], type: LayoutType) => {
    const positions: { [key: string]: { x: number; y: number } } = {};
    
    switch (type) {
      case 'hierarchical':
        // Hierarchical layout - tasks with no dependencies at top
        const levels: { [key: string]: number } = {};
        const calculateLevel = (taskId: string, visited = new Set<string>()): number => {
          if (visited.has(taskId)) return 0;
          visited.add(taskId);
          
          const task = tasks.find(t => t.taskid === taskId);
          if (!task || !task.related_work || task.related_work.length === 0) {
            return 0;
          }
          
          const maxDepLevel = Math.max(
            ...task.related_work.map(dep => {
              const depId = typeof dep === 'object' && 'taskid' in dep ? dep.taskid : dep;
              return calculateLevel(depId, visited) + 1;
            })
          );
          return maxDepLevel;
        };
        
        tasks.forEach(task => {
          levels[task.taskid] = calculateLevel(task.taskid);
        });
        
        const levelGroups: { [level: number]: Task[] } = {};
        tasks.forEach(task => {
          const level = levels[task.taskid];
          if (!levelGroups[level]) levelGroups[level] = [];
          levelGroups[level].push(task);
        });
        
        Object.entries(levelGroups).forEach(([level, tasksInLevel]) => {
          const y = parseInt(level) * 200 + 100;
          tasksInLevel.forEach((task, index) => {
            const x = (index - tasksInLevel.length / 2) * 250 + 400;
            positions[task.taskid] = { x, y };
          });
        });
        break;
        
      case 'grid':
      default:
        // Grid layout
        const cols = Math.ceil(Math.sqrt(tasks.length));
        tasks.forEach((task, index) => {
          const row = Math.floor(index / cols);
          const col = index % cols;
          positions[task.taskid] = {
            x: col * 250 + 100,
            y: row * 200 + 100,
          };
        });
        break;
    }
    
    return positions;
  }, []);

  // Create nodes from tasks
  const initialNodes: Node[] = useMemo(() => {
    const positions = calculateLayout(tasks, layoutType);
    
    return tasks.map((task) => {
      const { x, y } = positions[task.taskid] || { x: 0, y: 0 };

      // Color based on status
      const getStatusColor = (status: string) => {
        switch (status) {
          case 'completed':
            return '#10b981'; // green
          case 'active':
            return '#f59e0b'; // orange
          case 'backlog':
            return '#6b7280'; // gray
          default:
            return '#3b82f6'; // blue
        }
      };

      // Color based on priority
      const getPriorityBorder = (priority: string) => {
        switch (priority) {
          case 'high':
            return '#ef4444'; // red
          case 'normal':
            return '#3b82f6'; // blue
          case 'low':
            return '#6b7280'; // gray
          default:
            return '#3b82f6';
        }
      };

      return {
        id: task.taskid,
        type: 'default',
        position: { x, y },
        data: {
          label: (
            <div className="text-xs">
              <div className="font-semibold truncate max-w-[150px]" title={task.name}>
                {task.name}
              </div>
              <div className="text-gray-500 text-[10px]">
                {task.task_number}
              </div>
            </div>
          ),
        },
        style: {
          background: getStatusColor(task.status),
          color: 'white',
          border: `2px solid ${getPriorityBorder(task.priority)}`,
          borderRadius: '8px',
          padding: '10px',
          fontSize: '12px',
          width: 180,
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      };
    });
  }, [tasks, layoutType, calculateLayout]);

  // Create edges from dependencies
  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];
    
    tasks.forEach((task) => {
      if (task.related_work && Array.isArray(task.related_work)) {
        task.related_work.forEach((relatedTask) => {
          // Handle both object and string formats
          const relatedTaskId = typeof relatedTask === 'object' && 'taskid' in relatedTask
            ? relatedTask.taskid
            : relatedTask;

          edges.push({
            id: `${task.taskid}-${relatedTaskId}`,
            source: task.taskid,
            target: relatedTaskId,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#94a3b8', strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#94a3b8',
            },
            label: 'depends on',
            labelStyle: { fontSize: 10, fill: '#64748b' },
            labelBgStyle: { fill: '#f1f5f9' },
          });
        });
      }
    });

    return edges;
  }, [tasks]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when layout changes
  React.useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <p className="text-gray-600 font-medium mb-2">No tasks to display</p>
          <p className="text-sm text-gray-500">Generate tasks to see the dependency graph</p>
        </div>
      </div>
    );
  }

  const tasksWithDeps = tasks.filter(t => t.related_work && t.related_work.length > 0);
  const totalLinks = tasksWithDeps.reduce((sum, t) => sum + (t.related_work?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          value={tasks.length}
          label="Total Tasks"
          icon={Network}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard
          value={tasksWithDeps.length}
          label={`Connected Tasks (${tasks.length > 0 ? Math.round((tasksWithDeps.length / tasks.length) * 100) : 0}%)`}
          icon={GitBranch}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
        />
        <StatCard
          value={totalLinks}
          label="Total Links"
          icon={Link}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
      </div>

      {/* Graph */}
      <div className="w-full h-[700px] bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">Task Dependency Network</h3>
              <p className="text-sm text-gray-600">
                Interactive visualization of task relationships
              </p>
            </div>
          </div>
        
        {/* Layout Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-700">Layout:</span>
            <div className="flex gap-1 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
              <button
                onClick={() => setLayoutType('hierarchical')}
                className={`px-3 py-1.5 text-xs rounded-md transition-all flex items-center gap-1.5 ${
                  layoutType === 'hierarchical'
                    ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="Hierarchical Layout"
              >
                <GitBranch className="h-3.5 w-3.5" />
                Hierarchical
              </button>
              <button
                onClick={() => setLayoutType('grid')}
                className={`px-3 py-1.5 text-xs rounded-md transition-all flex items-center gap-1.5 ${
                  layoutType === 'grid'
                    ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="Grid Layout"
              >
                <Grid3x3 className="h-3.5 w-3.5" />
                Grid
              </button>
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex gap-3 ml-auto text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></div>
              <span className="text-gray-600">Completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-orange-500 shadow-sm"></div>
              <span className="text-gray-600">Active</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm"></div>
              <span className="text-gray-600">Created</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-gray-500 shadow-sm"></div>
              <span className="text-gray-600">Backlog</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="relative h-[calc(100%-120px)]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          attributionPosition="bottom-left"
          minZoom={0.1}
          maxZoom={2}
        >
          <Background color="#e5e7eb" gap={16} />
          <MiniMap
            nodeColor={(node) => {
              return node.style?.background as string || '#3b82f6';
            }}
            maskColor="rgba(0, 0, 0, 0.1)"
            className="!bg-gray-50 !border-gray-300"
          />
        </ReactFlow>
        
        {/* Custom Zoom Controls */}
        <CustomZoomControls />
      </div>
      </div>
    </div>
  );
};

// Wrapper component with ReactFlowProvider
const DependencyGraph: React.FC<DependencyGraphProps> = ({ tasks }) => {
  return (
    <ReactFlowProvider>
      <DependencyGraphInner tasks={tasks} />
    </ReactFlowProvider>
  );
};

export default DependencyGraph;
