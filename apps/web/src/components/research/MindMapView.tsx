"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { MindMapNode } from "./MindMapNode";

interface MindMapNodeData {
  id: string;
  text: string;
  children?: MindMapNodeData[];
}

interface MindMapData {
  root: MindMapNodeData;
}

interface Point {
  x: number;
  y: number;
}

interface Transform {
  x: number;
  y: number;
  scale: number;
}

const MIN_SCALE = 0.5;
const MAX_SCALE = 2;
const INITIAL_TRANSFORM: Transform = { x: 0, y: 0, scale: 1 };

export function MindMapView({ data }: { data: MindMapData }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<Transform>(INITIAL_TRANSFORM);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Point>({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if (e.target !== containerRef.current) return;

    setIsPanning(true);
    setPanStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  }, [transform.x, transform.y]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isPanning) return;

    const newX = e.clientX - panStart.x;
    const newY = e.clientY - panStart.y;
    setTransform((prev) => ({ ...prev, x: newX, y: newY }));
  }, [isPanning, panStart]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const delta = e.deltaY > 0 ? 0.9 : 1.1;

    setTransform((prev) => {
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev.scale * delta));

      const scaleRatio = newScale / prev.scale;
      const newX = mouseX - (mouseX - prev.x) * scaleRatio;
      const newY = mouseY - (mouseY - prev.y) * scaleRatio;

      return { x: newX, y: newY, scale: newScale };
    });
  }, []);

  const handleReset = useCallback(() => {
    setTransform(INITIAL_TRANSFORM);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div className="relative w-full h-full">
      <div
        ref={containerRef}
        className="w-full h-full overflow-hidden bg-gray-50 rounded-lg cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
        style={{ userSelect: "none" }}
      >
        <div
          className="flex items-center justify-center p-8"
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transformOrigin: "0 0",
            transition: isPanning ? "none" : "transform 0.1s ease-out",
          }}
        >
          <MindMapNode node={data.root} />
        </div>
      </div>

      <button
        onClick={handleReset}
        className="absolute bottom-4 right-4 px-3 py-1.5 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        title="Reset view"
      >
        Reset
      </button>

      <div className="absolute bottom-4 left-4 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded">
        Scale: {transform.scale.toFixed(2)}x
      </div>
    </div>
  );
}