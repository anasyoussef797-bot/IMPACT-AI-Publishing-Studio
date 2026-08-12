import React, { useState, useRef } from 'react';
import { RedactionBlock } from '../types';
import { Trash2, Move, EyeOff, Layers, Check, X, ShieldAlert } from 'lucide-react';

interface RedactionOverlayLayerProps {
  blocks: RedactionBlock[];
  onChange: (blocks: RedactionBlock[]) => void;
  isEditing: boolean;
  activeColor?: string;
  isAr?: boolean;
}

export default function RedactionOverlayLayer({
  blocks = [],
  onChange,
  isEditing,
  activeColor = '#ffffff',
  isAr = true
}: RedactionOverlayLayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  
  // Drag / Resize state
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    isResizing: boolean;
    handle?: string;
    blockId: string;
    startX: number;
    startY: number;
    startBlockX: number;
    startBlockY: number;
    startWidth: number;
    startHeight: number;
  } | null>(null);

  // Click on background container to place a new shading block
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditing || !containerRef.current) return;
    
    // Check if click target is a block or button
    const target = e.target as HTMLElement;
    if (target.closest('.redaction-block') || target.closest('.redaction-controls')) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert to percentage
    const pctX = (clickX / rect.width) * 100;
    const pctY = (clickY / rect.height) * 100;

    // Default block dimensions: width 30%, height 4% (perfect for hiding a line of text)
    const blockWidth = 35;
    const blockHeight = 4.5;

    const newX = Math.max(0, Math.min(100 - blockWidth, pctX - blockWidth / 2));
    const newY = Math.max(0, Math.min(100 - blockHeight, pctY - blockHeight / 2));

    const newBlock: RedactionBlock = {
      id: `redact-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      x: parseFloat(newX.toFixed(2)),
      y: parseFloat(newY.toFixed(2)),
      width: blockWidth,
      height: blockHeight,
      color: activeColor
    };

    const updated = [...blocks, newBlock];
    onChange(updated);
    setSelectedBlockId(newBlock.id);
  };

  const handleDeleteBlock = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = blocks.filter(b => b.id !== id);
    onChange(updated);
    if (selectedBlockId === id) setSelectedBlockId(null);
  };

  const handleUpdateBlockColor = (id: string, color: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = blocks.map(b => b.id === id ? { ...b, color } : b);
    onChange(updated);
  };

  const handleSetPresetSize = (id: string, type: 'line' | 'paragraph' | 'box', e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = blocks.map(b => {
      if (b.id !== id) return b;
      if (type === 'line') {
        return { ...b, width: 80, height: 4 };
      } else if (type === 'paragraph') {
        return { ...b, width: 85, height: 20 };
      } else {
        return { ...b, width: 30, height: 15 };
      }
    });
    onChange(updated);
  };

  // Mouse Drag / Resize logic
  const handleMouseDown = (
    e: React.MouseEvent,
    block: RedactionBlock,
    action: 'move' | 'resize',
    handleName?: string
  ) => {
    if (!isEditing || !containerRef.current) return;
    e.stopPropagation();
    e.preventDefault();

    setSelectedBlockId(block.id);

    setDragState({
      isDragging: action === 'move',
      isResizing: action === 'resize',
      handle: handleName,
      blockId: block.id,
      startX: e.clientX,
      startY: e.clientY,
      startBlockX: block.x,
      startBlockY: block.y,
      startWidth: block.width,
      startHeight: block.height
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const deltaXPct = ((e.clientX - dragState.startX) / rect.width) * 100;
    const deltaYPct = ((e.clientY - dragState.startY) / rect.height) * 100;

    const currentBlock = blocks.find(b => b.id === dragState.blockId);
    if (!currentBlock) return;

    if (dragState.isDragging) {
      let newX = dragState.startBlockX + deltaXPct;
      let newY = dragState.startBlockY + deltaYPct;

      newX = Math.max(0, Math.min(100 - currentBlock.width, newX));
      newY = Math.max(0, Math.min(100 - currentBlock.height, newY));

      const updated = blocks.map(b => 
        b.id === dragState.blockId 
          ? { ...b, x: parseFloat(newX.toFixed(2)), y: parseFloat(newY.toFixed(2)) } 
          : b
      );
      onChange(updated);
    } else if (dragState.isResizing && dragState.handle) {
      let newWidth = dragState.startWidth;
      let newHeight = dragState.startHeight;
      let newX = dragState.startBlockX;
      let newY = dragState.startBlockY;

      if (dragState.handle.includes('e')) {
        newWidth = Math.max(3, Math.min(100 - dragState.startBlockX, dragState.startWidth + deltaXPct));
      }
      if (dragState.handle.includes('s')) {
        newHeight = Math.max(1, Math.min(100 - dragState.startBlockY, dragState.startHeight + deltaYPct));
      }
      if (dragState.handle.includes('w')) {
        const possibleW = dragState.startWidth - deltaXPct;
        if (possibleW >= 3) {
          newWidth = possibleW;
          newX = dragState.startBlockX + deltaXPct;
        }
      }
      if (dragState.handle.includes('n')) {
        const possibleH = dragState.startHeight - deltaYPct;
        if (possibleH >= 1) {
          newHeight = possibleH;
          newY = dragState.startBlockY + deltaYPct;
        }
      }

      const updated = blocks.map(b => 
        b.id === dragState.blockId 
          ? { 
              ...b, 
              x: parseFloat(newX.toFixed(2)), 
              y: parseFloat(newY.toFixed(2)),
              width: parseFloat(newWidth.toFixed(2)), 
              height: parseFloat(newHeight.toFixed(2)) 
            } 
          : b
      );
      onChange(updated);
    }
  };

  const handleMouseUp = () => {
    setDragState(null);
  };

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 z-30 transition-colors ${
        isEditing ? 'cursor-crosshair bg-indigo-500/5 ring-2 ring-indigo-500/40 ring-inset' : 'pointer-events-none'
      }`}
      onClick={handleContainerClick}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Tool Banner Indicator when editing */}
      {isEditing && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-40 bg-indigo-900/90 text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-lg border border-indigo-400/30 flex items-center gap-1.5 pointer-events-none animate-pulse">
          <EyeOff className="w-3.5 h-3.5 text-amber-300" />
          <span>{isAr ? 'أداة التظليل نشطة: انقر فوق أي سطر أو عنصر لإخفائه' : 'Redaction Active: Click any line/element to hide'}</span>
        </div>
      )}

      {/* Render All Redaction Blocks */}
      {blocks.map((block) => {
        const isSelected = isEditing && selectedBlockId === block.id;
        const color = block.color || '#ffffff';

        return (
          <div
            key={block.id}
            className={`redaction-block absolute transition-shadow ${
              isEditing ? 'cursor-move select-none' : ''
            } ${
              isSelected 
                ? 'ring-2 ring-indigo-600 ring-offset-1 shadow-lg z-50' 
                : isEditing 
                ? 'hover:ring-1 hover:ring-indigo-400 border border-dashed border-indigo-400/50' 
                : ''
            }`}
            style={{
              left: `${block.x}%`,
              top: `${block.y}%`,
              width: `${block.width}%`,
              height: `${block.height}%`,
              backgroundColor: color,
              // Subtle shadow when in edit mode so white blocks are visible against white backgrounds
              boxShadow: isEditing && color === '#ffffff' ? '0 0 0 1px rgba(99, 102, 241, 0.4)' : undefined
            }}
            onClick={(e) => {
              if (!isEditing) return;
              e.stopPropagation();
              setSelectedBlockId(block.id);
            }}
            onMouseDown={(e) => handleMouseDown(e, block, 'move')}
          >
            {/* Editing Controls when block is selected */}
            {isSelected && (
              <>
                {/* Top Action Floating Bar */}
                <div 
                  className="redaction-controls absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-2 py-1 rounded-lg shadow-xl border border-slate-700 flex items-center gap-1.5 text-[10px] font-sans z-50 whitespace-nowrap"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="font-bold text-amber-300 flex items-center gap-1">
                    <EyeOff className="w-3 h-3" />
                    {isAr ? 'تظليل' : 'Cover'}
                  </span>

                  <span className="w-px h-3 bg-slate-700" />

                  {/* Color Selectors */}
                  <button
                    type="button"
                    onClick={(e) => handleUpdateBlockColor(block.id, '#ffffff', e)}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition ${
                      color === '#ffffff' ? 'bg-white text-slate-900 border-white font-extrabold' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                    title={isAr ? 'إخفاء أبيض (Clean Eraser)' : 'Whiteout'}
                  >
                    ⚪ {isAr ? 'أبيض' : 'White'}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleUpdateBlockColor(block.id, '#000000', e)}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition ${
                      color === '#000000' ? 'bg-slate-950 text-white border-slate-700 font-extrabold' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                    title={isAr ? 'تظليل أسود (Blackout Bar)' : 'Blackout'}
                  >
                    🖤 {isAr ? 'أسود' : 'Black'}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleUpdateBlockColor(block.id, '#64748b', e)}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition ${
                      color === '#64748b' ? 'bg-slate-600 text-white border-slate-500 font-extrabold' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                    title={isAr ? 'تظليل رمادي' : 'Slate Gray'}
                  >
                    🩶 {isAr ? 'رمادي' : 'Gray'}
                  </button>

                  <span className="w-px h-3 bg-slate-700" />

                  {/* Size Presets */}
                  <button
                    type="button"
                    onClick={(e) => handleSetPresetSize(block.id, 'line', e)}
                    className="px-1 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-[9px] font-bold text-slate-300"
                    title={isAr ? 'تغطية سطر كامل' : 'Full Line'}
                  >
                    {isAr ? 'سطر' : 'Line'}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleSetPresetSize(block.id, 'paragraph', e)}
                    className="px-1 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-[9px] font-bold text-slate-300"
                    title={isAr ? 'تغطية فقرة كاملة' : 'Paragraph'}
                  >
                    {isAr ? 'فقرة' : 'Para'}
                  </button>

                  <span className="w-px h-3 bg-slate-700" />

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={(e) => handleDeleteBlock(block.id, e)}
                    className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 rounded transition"
                    title={isAr ? 'إزالة التظليل' : 'Remove Shading'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 4 Corner Resize Handles */}
                <div
                  className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-indigo-600 border border-white rounded-full cursor-nwse-resize z-50"
                  onMouseDown={(e) => handleMouseDown(e, block, 'resize', 'nw')}
                />
                <div
                  className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-indigo-600 border border-white rounded-full cursor-nesw-resize z-50"
                  onMouseDown={(e) => handleMouseDown(e, block, 'resize', 'ne')}
                />
                <div
                  className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-indigo-600 border border-white rounded-full cursor-nesw-resize z-50"
                  onMouseDown={(e) => handleMouseDown(e, block, 'resize', 'sw')}
                />
                <div
                  className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-indigo-600 border border-white rounded-full cursor-nwse-resize z-50"
                  onMouseDown={(e) => handleMouseDown(e, block, 'resize', 'se')}
                />

                {/* Side Resize Handles */}
                <div
                  className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-2 h-4 bg-indigo-600 border border-white rounded-full cursor-ew-resize z-50"
                  onMouseDown={(e) => handleMouseDown(e, block, 'resize', 'e')}
                />
                <div
                  className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-2 h-4 bg-indigo-600 border border-white rounded-full cursor-ew-resize z-50"
                  onMouseDown={(e) => handleMouseDown(e, block, 'resize', 'w')}
                />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
