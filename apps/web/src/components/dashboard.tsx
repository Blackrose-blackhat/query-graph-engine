"use client";

import { useState, useCallback } from "react";
import { Network } from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ThemeToggle } from "@/components/theme-toggle";
import { StatsBar } from "@/components/stats-bar";
import { GraphView } from "@/components/graph/graph-view";
import { ChatPanel } from "@/components/chat/chat-panel";
import { useGraph } from "@/hooks/use-graph";

export function Dashboard() {
  const { graphData, loading } = useGraph();
  const [highlightNodes, setHighlightNodes] = useState<string[]>([]);

  const handleHighlight = useCallback((nodeIds: string[]) => {
    setHighlightNodes(nodeIds);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="px-4 py-2.5 border-b flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Network className="h-4 w-4 text-primary" />
            <h1 className="text-sm font-semibold">Graph Query System</h1>
          </div>
          <div className="hidden sm:block">
            <StatsBar nodes={graphData.nodes} />
          </div>
        </div>
        <ThemeToggle />
      </header>

      {/* Main content */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={55} minSize={30}>
          <GraphView
            graphData={graphData}
            highlightNodes={highlightNodes}
            loading={loading}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={45} minSize={25}>
          <ChatPanel
            graphData={graphData}
            onHighlight={handleHighlight}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
