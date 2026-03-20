import React from 'react';
import { StateData, StateType } from '../types';
import { X, Settings2, Info, Code, Database, ArrowRight, Plus, Trash2 } from 'lucide-react';
import { Node, Edge } from 'reactflow';

interface InspectorProps {
  selectedNode: StateData | null;
  allNodes: Node<StateData>[];
  edges: Edge[];
  onUpdate: (id: string, updates: Partial<StateData>) => void;
  onAddTransition: (sourceId: string, targetId: string, event: string) => void;
  onUpdateTransition: (edgeId: string, event: string) => void;
  onDeleteTransition: (edgeId: string) => void;
  onClose: () => void;
  isReadOnly?: boolean;
}

const Inspector: React.FC<InspectorProps> = ({ 
  selectedNode, 
  allNodes, 
  edges, 
  onUpdate, 
  onAddTransition,
  onUpdateTransition,
  onDeleteTransition,
  onClose, 
  isReadOnly 
}) => {
  const [isAdding, setIsAdding] = React.useState(false);
  const [newTarget, setNewTarget] = React.useState('');
  const [newEvent, setNewEvent] = React.useState('');

  if (!selectedNode) return null;

  const outgoingTransitions = edges.filter(e => e.source === selectedNode.id);

  const handleChange = (field: keyof StateData, value: string) => {
    onUpdate(selectedNode.id, { [field]: value });
  };

  const handleAddTransition = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTarget && newEvent) {
      onAddTransition(selectedNode.id, newTarget, newEvent);
      setNewTarget('');
      setNewEvent('');
      setIsAdding(false);
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 h-full flex flex-col shadow-xl animate-in slide-in-from-right duration-300">
      <div className="p-4 border-bottom border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center gap-2 font-semibold text-gray-700">
          <Settings2 className="w-4 h-4" />
          <span>State Inspector</span>
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-gray-200 rounded-full transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Basic Info */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <Info className="w-3 h-3" />
            <span>General</span>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">Name</label>
            <input
              type="text"
              value={selectedNode.name}
              onChange={(e) => handleChange('name', e.target.value)}
              disabled={isReadOnly}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
              placeholder="e.g. Idle"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">Type</label>
            <select
              value={selectedNode.type}
              onChange={(e) => handleChange('type', e.target.value as StateType)}
              disabled={isReadOnly}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
            >
              <option value="idle">Idle</option>
              <option value="action">Action</option>
              <option value="decision">Decision</option>
              <option value="error">Error</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">Description</label>
            <textarea
              value={selectedNode.description}
              onChange={(e) => handleChange('description', e.target.value)}
              disabled={isReadOnly}
              rows={3}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 resize-none"
              placeholder="What does this state do?"
            />
          </div>
        </section>

        {/* Actions */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <Code className="w-3 h-3" />
            <span>Actions</span>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">Entry Action</label>
            <input
              type="text"
              value={selectedNode.entry_action}
              onChange={(e) => handleChange('entry_action', e.target.value)}
              disabled={isReadOnly}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
              placeholder="on_enter()"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">Exit Action</label>
            <input
              type="text"
              value={selectedNode.exit_action}
              onChange={(e) => handleChange('exit_action', e.target.value)}
              disabled={isReadOnly}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
              placeholder="on_exit()"
            />
          </div>
        </section>

        {/* Transitions */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <ArrowRight className="w-3 h-3" />
              <span>Transitions</span>
            </div>
            {!isReadOnly && !isAdding && (
              <button 
                onClick={() => setIsAdding(true)}
                className="p-1 hover:bg-blue-50 text-blue-600 rounded-md transition-colors flex items-center gap-1 text-[10px] font-bold uppercase"
              >
                <Plus className="w-3 h-3" />
                Add
              </button>
            )}
          </div>

          <div className="space-y-3">
            {isAdding && !isReadOnly && (
              <form onSubmit={handleAddTransition} className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 space-y-2 animate-in fade-in zoom-in-95 duration-200">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-blue-400 uppercase">Event</label>
                  <input
                    autoFocus
                    type="text"
                    value={newEvent}
                    onChange={(e) => setNewEvent(e.target.value)}
                    placeholder="e.g. switch turned on"
                    className="w-full px-2 py-1 bg-white border border-blue-200 rounded text-xs outline-none focus:ring-1 focus:ring-blue-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-blue-400 uppercase">Target State</label>
                  <select
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    className="w-full px-2 py-1 bg-white border border-blue-200 rounded text-xs outline-none focus:ring-1 focus:ring-blue-400"
                  >
                    <option value="">Select target...</option>
                    {allNodes.filter(n => n.id !== selectedNode.id).map(n => (
                      <option key={n.id} value={n.id}>{n.data.name} ({n.id})</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 pt-1">
                  <button 
                    type="submit"
                    disabled={!newTarget || !newEvent}
                    className="flex-1 bg-blue-500 text-white py-1 rounded text-[10px] font-bold uppercase hover:bg-blue-600 disabled:opacity-50 transition-colors"
                  >
                    Create
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-2 py-1 text-gray-500 text-[10px] font-bold uppercase hover:bg-gray-100 rounded transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {outgoingTransitions.length === 0 && !isAdding ? (
              <div className="text-xs text-gray-400 italic py-2">No outgoing transitions</div>
            ) : (
              outgoingTransitions.map(edge => {
                const targetNode = allNodes.find(n => n.id === edge.target);
                return (
                  <div key={edge.id} className="group flex flex-col gap-2 p-2 bg-gray-50 rounded-md border border-gray-100 hover:border-blue-200 transition-all">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={edge.label as string || ''}
                        onChange={(e) => onUpdateTransition(edge.id, e.target.value)}
                        disabled={isReadOnly}
                        placeholder="Event name"
                        className="flex-1 bg-transparent text-[11px] font-bold text-blue-600 uppercase outline-none focus:bg-white focus:px-1 rounded transition-all"
                      />
                      {!isReadOnly && (
                        <button 
                          onClick={() => onDeleteTransition(edge.id)}
                          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <div className="text-[10px] text-gray-500 flex items-center gap-1">
                      <ArrowRight className="w-2 h-2" />
                      <span>To:</span>
                      <span className="font-semibold text-gray-700">{targetNode?.data.name || edge.target}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Parameters */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <Database className="w-3 h-3" />
            <span>Parameters (JSON)</span>
          </div>
          
          <div className="space-y-1">
            <textarea
              value={selectedNode.parameters}
              onChange={(e) => handleChange('parameters', e.target.value)}
              disabled={isReadOnly}
              rows={5}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 resize-none"
              placeholder='{ "speed": 1.0 }'
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Inspector;
