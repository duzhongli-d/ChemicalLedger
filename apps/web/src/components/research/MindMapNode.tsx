"use client";

import { useState } from "react";

interface MindMapNodeData {
  id: string;
  text: string;
  children?: MindMapNodeData[];
}

interface MindMapNodeProps {
  node: MindMapNodeData;
  level?: number;
  depthColors?: string[];
}

export function MindMapNode({ node, level = 0, depthColors = [
  "bg-blue-800 text-white border-blue-900",
  "bg-blue-700 text-white border-blue-800",
  "bg-blue-600 text-white border-blue-700",
  "bg-blue-500 text-white border-blue-600",
  "bg-blue-400 text-blue-900 border-blue-500",
] }: MindMapNodeProps) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const colorClass = depthColors[Math.min(level, depthColors.length - 1)];

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative px-4 py-2 rounded-lg text-sm font-medium border-2 cursor-pointer transition-all duration-200 ${colorClass} ${
          hasChildren ? "hover:opacity-90" : ""
        }`}
        onClick={() => hasChildren && setExpanded(!expanded)}
        style={{ minWidth: "80px" }}
      >
        {node.text}
        {hasChildren && (
          <span className="ml-2 text-xs opacity-75">
            {expanded ? "−" : "+"}
          </span>
        )}
      </div>

      {hasChildren && expanded && node.children && (
        <div className="flex gap-6 mt-4">
          {node.children.map((child) => (
            <div key={child.id} className="flex flex-col items-center">
              <div className="w-px h-4 bg-gray-400" />
              <div className="relative">
                <svg
                  className="absolute"
                  style={{
                    width: "100%",
                    height: "100%",
                    left: 0,
                    top: 0,
                    overflow: "visible",
                  }}
                  viewBox="0 0 100 30"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M 50 0 Q 50 15 50 30"
                    stroke="rgba(156, 163, 175, 0.5)"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
                <MindMapNode
                  node={child}
                  level={level + 1}
                  depthColors={depthColors}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}