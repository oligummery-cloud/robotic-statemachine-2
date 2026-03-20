import React, { useState, useRef, useEffect } from 'react';
import {
  EdgeProps,
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge,
} from 'reactflow';

export default function TransitionEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetPosition,
    targetX,
    targetY,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(label as string || 'event');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const onLabelClick = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    setIsEditing(true);
  };

  const onBlur = () => {
    setIsEditing(false);
    if (data && typeof data.onEditLabel === 'function') {
      data.onEditLabel(id, inputValue);
    }
  };

  const onKeyDown = (evt: React.KeyboardEvent) => {
    if (evt.key === 'Enter') {
      setIsEditing(false);
      if (data && typeof data.onEditLabel === 'function') {
        data.onEditLabel(id, inputValue);
      }
    }
    if (evt.key === 'Escape') {
      setIsEditing(false);
      setInputValue(label as string || 'event');
    }
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={onBlur}
              onKeyDown={onKeyDown}
              className="bg-white px-2 py-1 rounded border-2 border-blue-400 shadow-lg text-blue-600 font-semibold outline-none text-xs min-w-[80px] text-center"
            />
          ) : (
            <button
              type="button"
              onClick={onLabelClick}
              className="bg-white px-2 py-1 rounded border border-gray-200 shadow-sm hover:border-blue-400 hover:text-blue-600 transition-all font-semibold text-gray-700 cursor-pointer whitespace-nowrap select-none text-xs min-w-[40px] text-center"
            >
              {label || 'event'}
            </button>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
