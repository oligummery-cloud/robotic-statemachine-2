import React from 'react';
import { AppMode } from '../types';
import { Play, Pause, SkipForward, Download, Edit3, Eye, Plus } from 'lucide-react';
import { clsx } from 'clsx';

interface ToolbarProps {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  onAddNode: () => void;
  onExport: () => void;
  onStep: () => void;
  onPlay: () => void;
  onPause: () => void;
  isPlaying: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({ 
  mode, 
  setMode, 
  onAddNode, 
  onExport, 
  onStep, 
  onPlay, 
  onPause,
  isPlaying 
}) => {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-4">
      {/* Mode Toggle */}
      <div className="bg-white rounded-full shadow-lg border border-gray-200 p-1 flex items-center">
        <button
          onClick={() => setMode('builder')}
          className={clsx(
            'flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all',
            mode === 'builder' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
          )}
        >
          <Edit3 className="w-4 h-4" />
          <span>Builder</span>
        </button>
        <button
          onClick={() => setMode('viewer')}
          className={clsx(
            'flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all',
            mode === 'viewer' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
          )}
        >
          <Eye className="w-4 h-4" />
          <span>Viewer</span>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-full shadow-lg border border-gray-200 p-1 flex items-center gap-1">
        {mode === 'builder' ? (
          <>
            <button
              onClick={onAddNode}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
              title="Add State"
            >
              <Plus className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-gray-200 mx-1" />
            <button
              onClick={onExport}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
              title="Export YAML"
            >
              <Download className="w-5 h-5" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={isPlaying ? onPause : onPlay}
              className="p-2 hover:bg-gray-100 rounded-full text-blue-600 transition-colors"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button
              onClick={onStep}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
              title="Step Forward"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Toolbar;
