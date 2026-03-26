"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { X, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { GraphLegend } from "./graph-legend";
import type { GraphData, GraphNode } from "@/lib/types";
import { formatValue } from "@/lib/utils";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

const NODE_RADIUS = 6;

interface GraphViewProps {
  graphData: GraphData;
  highlightNodes: string[];
  loading?: boolean;
}

export function GraphView({
  graphData,
  highlightNodes,
  loading,
}: GraphViewProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const initialLock = useRef(false);
  const [dimensions, setDimensions] = useState({ width: 600, height: 500 });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const currentContainer = containerRef.current;
    if (!currentContainer) return;

    const observer = new ResizeObserver(() => {
      setDimensions({
        width: currentContainer.offsetWidth,
        height: currentContainer.offsetHeight,
      });
    });

    observer.observe(currentContainer);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (fgRef.current && graphData.nodes.length > 0) {
      fgRef.current.d3Force("charge").strength(-150);
      fgRef.current.d3Force("link").distance(80);
    }
  }, [graphData]);

  const highlightSet = useMemo(
    () => new Set(highlightNodes || []),
    [highlightNodes],
  );

  const centerGraphInView = useCallback(
    (duration = 600, padding = 60) => {
      if (!fgRef.current || graphData.nodes.length === 0) return;

      fgRef.current.zoomToFit(duration, padding);

      window.setTimeout(() => {
        const bounds = fgRef.current?.getGraphBbox?.();
        if (!bounds) return;

        const centerX = (bounds.x[0] + bounds.x[1]) / 2;
        const centerY = (bounds.y[0] + bounds.y[1]) / 2;
        fgRef.current?.centerAt(centerX, centerY, duration / 2);
      }, Math.max(duration - 150, 0));
    },
    [graphData.nodes.length],
  );

  useEffect(() => {
    if (!fgRef.current) return;

    if (highlightSet.size > 0) {
      window.setTimeout(() => {
        fgRef.current.zoomToFit(800, 50, (n: any) => highlightSet.has(n.id));
      }, 500); // 500ms allows physics to stabilize before camera lock
    }
  }, [highlightSet]);

  useEffect(() => {
    if (!initialLock.current || graphData.nodes.length === 0) return;

    const timeoutId = window.setTimeout(() => {
      centerGraphInView(400, 70);
    }, 120);

    return () => window.clearTimeout(timeoutId);
  }, [dimensions, graphData.nodes.length, centerGraphInView]);

  const paintNode = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (node: any, ctx: CanvasRenderingContext2D) => {
      const isHighlighted = highlightSet.has(node.id);
      const isSelected = selectedNode?.id === node.id;
      const isHovered = hoveredNode?.id === node.id;
      const radius =
        isHighlighted || isSelected ? NODE_RADIUS + 3 : NODE_RADIUS;

      if (isHighlighted) {
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 15;
      }

      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
      ctx.fillStyle =
        isHighlighted || isSelected || isHovered
          ? node.color
          : node.color + "99";
      ctx.fill();

      if (isSelected || isHighlighted) {
        ctx.strokeStyle = resolvedTheme === "dark" ? "#fff" : "#000";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;

      if (isHighlighted || isSelected || isHovered) {
        ctx.font = "4px Inter, sans-serif";
        ctx.fillStyle = resolvedTheme === "dark" ? "#f1f5f9" : "#1e293b";
        ctx.textAlign = "center";
        ctx.fillText(node.label, node.x, node.y + radius + 6);
      }
    },
    [highlightSet, selectedNode, hoveredNode, resolvedTheme],
  );

  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNode((prev) => (prev?.id === node.id ? null : node));
  }, []);

  const formattedData = useMemo(
    () => ({
      nodes: graphData.nodes,
      links: graphData.edges.map((e) => ({
        source: e.source,
        target: e.target,
        type: e.type,
      })),
    }),
    [graphData],
  );

  const bgColor = "transparent";
  const linkColor = resolvedTheme === "dark" ? "#475569" : "#cbd5e1";

  if (loading) {
    return (
      <Card className="h-full flex flex-col border-0 rounded-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Knowledge Graph</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <Skeleton className="w-full h-full min-h-[300px] rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col border-0 rounded-none bg-transparent w-full">
      <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-sm">Knowledge Graph</CardTitle>
          <CardDescription className="text-xs">
            {graphData.nodes.length} nodes &middot; {graphData.edges.length}{" "}
            edges
          </CardDescription>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => centerGraphInView(400, 70)}
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => fgRef.current?.zoom(fgRef.current.zoom() * 1.3, 300)}
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => fgRef.current?.zoom(fgRef.current.zoom() * 0.7, 300)}
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 relative" ref={containerRef}>
        {graphData.nodes.length > 0 && (
          <ForceGraph2D
            ref={fgRef}
            graphData={formattedData}
            width={dimensions.width}
            height={dimensions.height}
            nodeCanvasObject={paintNode}
            nodePointerAreaPaint={(
              node: any,
              color: string,
              ctx: CanvasRenderingContext2D,
            ) => {
              ctx.beginPath();
              ctx.arc(node.x, node.y, NODE_RADIUS + 4, 0, 2 * Math.PI);
              ctx.fillStyle = color;
              ctx.fill();
            }}
            onNodeClick={handleNodeClick as any}
            onNodeHover={setHoveredNode as any}
            linkColor={() => linkColor}
            linkWidth={(link: any) =>
              highlightSet.has(link.source?.id || "") ||
              highlightSet.has(link.target?.id || "")
                ? 2
                : 0.5
            }
            linkDirectionalArrowLength={4}
            linkDirectionalArrowRelPos={1}
            backgroundColor={bgColor}
            cooldownTicks={100}
            onEngineStop={() => {
              if (!initialLock.current && fgRef.current) {
                centerGraphInView(600, 70);
                initialLock.current = true;
              }
            }}
          />
        )}
      </CardContent>

      <div className="border-t">
        <GraphLegend />
      </div>

      {selectedNode && (
        <div className="border-t bg-card/50">
          <div className="flex justify-between items-center px-4 pt-3 pb-1">
            <span
              className="text-sm font-medium"
              style={{ color: selectedNode.color }}
            >
              {selectedNode.type.replace("_", " ").toUpperCase()}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setSelectedNode(null)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
          <ScrollArea className="max-h-32 px-4 pb-3">
            <div className="grid grid-cols-2 gap-1 text-xs">
              {Object.entries(selectedNode.metadata || {}).map(([key, val]) => (
                <div key={key}>
                  <span className="text-muted-foreground">{key}: </span>
                  <span className="text-foreground">{formatValue(val)}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </Card>
  );
}
