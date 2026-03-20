import React, { useState, useCallback, useMemo, useEffect } from 'react';
import ReactFlow, { 
  addEdge, 
  Background, 
  Controls, 
  Connection, 
  Edge, 
  Node, 
  applyNodeChanges, 
  applyEdgeChanges,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  MarkerType,
  Panel
} from 'reactflow';
import yaml from 'js-yaml';
import { clsx } from 'clsx';

import StateNode from './components/StateNode';
import TransitionEdge from './components/TransitionEdge';
import Inspector from './components/Inspector';
import Toolbar from './components/Toolbar';
import { StateData, TransitionData, AppMode, StateType } from './types';

const nodeTypes = {
  stateNode: StateNode,
};

const edgeTypes = {
  transitionEdge: TransitionEdge,
};

const initialNodes: Node<StateData>[] = [
  {
    id: '1',
    type: 'stateNode',
    data: { 
      id: '1', 
      name: 'Idle', 
      type: 'idle', 
      description: 'Waiting for command', 
      entry_action: '', 
      exit_action: '', 
      parameters: '{}' 
    },
    position: { x: 250, y: 100 },
  },
  {
    id: '2',
    type: 'stateNode',
    data: { 
      id: '2', 
      name: 'Moving', 
      type: 'action', 
      description: 'Robot is in motion', 
      entry_action: 'start_motors()', 
      exit_action: 'stop_motors()', 
      parameters: '{ "speed": 0.5 }' 
    },
    position: { x: 250, y: 300 },
  },
];

const initialEdges: Edge[] = [
  { 
    id: 'e1-2', 
    source: '1', 
    target: '2', 
    label: 'start_command',
    type: 'transitionEdge',
    markerEnd: { type: MarkerType.ArrowClosed },
  },
];

export default function App() {
  const [nodes, setNodes] = useState<Node<StateData>[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [mode, setMode] = useState<AppMode>('builder');
  const [activeNodeId, setActiveNodeId] = useState<string | null>('1');
  const [isPlaying, setIsPlaying] = useState(false);

  // Sync active state to node data for visual feedback
  const nodesWithActiveState = useMemo(() => {
    return nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        isActive: node.id === activeNodeId
      }
    }));
  }, [nodes, activeNodeId]);

  const onEditEdgeLabel = useCallback((id: string, newLabel: string) => {
    if (mode === 'viewer') return;
    setEdges((eds) => eds.map((e) => e.id === id ? { ...e, label: newLabel } : e));
  }, [mode]);

  // Add the edit handler to edges
  const edgesWithHandlers = useMemo(() => {
    return edges.map(edge => ({
      ...edge,
      type: 'transitionEdge',
      data: {
        ...edge.data,
        onEditLabel: onEditEdgeLabel
      }
    }));
  }, [edges, onEditEdgeLabel]);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      if (mode === 'viewer') return;
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    [mode]
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      if (mode === 'viewer') return;
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    [mode]
  );

  const onConnect: OnConnect = useCallback(
    (params: Connection) => {
      if (mode === 'viewer') return;
      setEdges((eds) => addEdge({ 
        ...params, 
        label: 'event',
        type: 'transitionEdge',
        markerEnd: { type: MarkerType.ArrowClosed },
      }, eds));
    },
    [mode]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
    if (mode === 'viewer') {
      setActiveNodeId(node.id);
    }
  }, [mode]);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const addNode = useCallback(() => {
    const id = `${nodes.length + 1}`;
    const newNode: Node<StateData> = {
      id,
      type: 'stateNode',
      data: {
        id,
        name: `State ${id}`,
        type: 'idle',
        description: '',
        entry_action: '',
        exit_action: '',
        parameters: '{}'
      },
      position: { x: Math.random() * 400, y: Math.random() * 400 },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [nodes]);

  const addTransition = useCallback((sourceId: string, targetId: string, event: string) => {
    const newEdge: Edge = {
      id: `e${sourceId}-${targetId}-${Date.now()}`,
      source: sourceId,
      target: targetId,
      label: event,
      type: 'transitionEdge',
      markerEnd: { type: MarkerType.ArrowClosed },
    };
    setEdges((eds) => addEdge(newEdge, eds));
  }, []);

  const deleteEdge = useCallback((id: string) => {
    setEdges((eds) => eds.filter((e) => e.id !== id));
  }, []);

  const updateTransition = useCallback((id: string, event: string) => {
    setEdges((eds) => eds.map((e) => e.id === id ? { ...e, label: event } : e));
  }, []);

  const updateNodeData = useCallback((id: string, updates: Partial<StateData>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: { ...node.data, ...updates },
          };
        }
        return node;
      })
    );
  }, []);

  const exportYaml = useCallback(() => {
    const stateMachine = {
      name: "Robot State Machine",
      initial_state: activeNodeId || nodes[0]?.id,
      states: nodes.map(n => ({
        id: n.data.id,
        name: n.data.name,
        type: n.data.type,
        description: n.data.description,
        entry_action: n.data.entry_action,
        exit_action: n.data.exit_action,
        parameters: JSON.parse(n.data.parameters || '{}')
      })),
      transitions: edges.map(e => ({
        source: e.source,
        target: e.target,
        event: e.label
      }))
    };

    const yamlStr = yaml.dump(stateMachine);
    const blob = new Blob([yamlStr], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'state_machine.yaml';
    a.click();
  }, [nodes, edges, activeNodeId]);

  const stepSimulation = useCallback(() => {
    if (!activeNodeId) return;
    
    // Find outgoing edges from current active node
    const outgoingEdges = edges.filter(e => e.source === activeNodeId);
    if (outgoingEdges.length > 0) {
      // For simplicity, take the first outgoing edge
      const nextNodeId = outgoingEdges[0].target;
      setActiveNodeId(nextNodeId);
    }
  }, [activeNodeId, edges]);

  // Simulation loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && mode === 'viewer') {
      interval = setInterval(() => {
        stepSimulation();
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, mode, stepSimulation]);

  const selectedNode = useMemo(() => 
    nodes.find(n => n.id === selectedNodeId)?.data || null
  , [nodes, selectedNodeId]);

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
      <div className="flex-1 relative">
        <Toolbar 
          mode={mode}
          setMode={(m) => {
            setMode(m);
            setIsPlaying(false);
          }}
          onAddNode={addNode}
          onExport={exportYaml}
          onStep={stepSimulation}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          isPlaying={isPlaying}
        />

        <ReactFlow
          nodes={nodesWithActiveState}
          edges={edgesWithHandlers}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          className="bg-gray-50"
        >
          <Background color="#e5e7eb" gap={20} />
          <Controls />
          
          <Panel position="bottom-left" className="bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Status</div>
            <div className="flex items-center gap-2">
              <div className={clsx("w-2 h-2 rounded-full", mode === 'builder' ? "bg-blue-500" : "bg-green-500")} />
              <span className="text-sm font-medium text-gray-700 capitalize">{mode} Mode</span>
            </div>
            {mode === 'viewer' && activeNodeId && (
              <div className="mt-2 text-xs text-gray-500">
                Active: <span className="font-semibold text-gray-700">{nodes.find(n => n.id === activeNodeId)?.data.name}</span>
              </div>
            )}
          </Panel>
        </ReactFlow>
      </div>

      {selectedNode && (
        <Inspector 
          selectedNode={selectedNode}
          allNodes={nodes}
          edges={edges}
          onUpdate={updateNodeData}
          onAddTransition={addTransition}
          onUpdateTransition={updateTransition}
          onDeleteTransition={deleteEdge}
          onClose={() => setSelectedNodeId(null)}
          isReadOnly={mode === 'viewer'}
        />
      )}
    </div>
  );
}
