import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { StateData } from '../types';
import { clsx } from 'clsx';
import { Play, AlertCircle, HelpCircle, Square } from 'lucide-react';

const StateNode = ({ data, selected }: NodeProps<StateData & { isActive?: boolean }>) => {
  const { name, type, isActive } = data;

  const getIcon = () => {
    switch (type) {
      case 'idle': return <Square className="w-4 h-4" />;
      case 'action': return <Play className="w-4 h-4" />;
      case 'decision': return <HelpCircle className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'idle': return 'bg-slate-50 border-slate-200 text-slate-700';
      case 'action': return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'decision': return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'error': return 'bg-red-50 border-red-200 text-red-700';
      default: return 'bg-white border-gray-200';
    }
  };

  return (
    <div className={clsx(
      'px-4 py-3 rounded-lg border-2 transition-all duration-200 min-w-[140px]',
      getTypeStyles(),
      selected ? 'border-blue-500 shadow-lg' : 'border-transparent',
      isActive && 'ring-4 ring-green-400 ring-offset-2 scale-105'
    )}>
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-gray-400" />
      
      <div className="flex items-center gap-2">
        <div className="opacity-60">
          {getIcon()}
        </div>
        <div className="font-semibold text-sm truncate max-w-[120px]">
          {name || 'Unnamed State'}
        </div>
      </div>
      
      <div className="text-[10px] uppercase tracking-wider opacity-50 mt-1 font-bold">
        {type}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-gray-400" />
    </div>
  );
};

export default memo(StateNode);
