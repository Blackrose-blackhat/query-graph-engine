"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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

function LoadingScreen({
  ready,
  onDone,
}: {
  ready: boolean;
  onDone: () => void;
}) {
  const [fadeOut, setFadeOut] = useState(false);
  const doneRef = useRef(false);

  useEffect(() => {
    if (ready && !doneRef.current) {
      // small delay so the user sees the loaded state briefly
      const t1 = setTimeout(() => setFadeOut(true), 300);
      const t2 = setTimeout(() => {
        doneRef.current = true;
        onDone();
      }, 900);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [ready, onDone]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"}`}
    >
      <div className="flex flex-col items-center gap-6 animate-in fade-in duration-300">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-muted" />
          <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
          <Network className="absolute inset-0 m-auto h-6 w-6 text-primary" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-lg font-semibold text-foreground">
            Graph Query System
          </h2>
          <p className="text-sm text-muted-foreground">
            {ready ? "Ready" : "Loading knowledge graph\u2026"}
          </p>
        </div>
        {!ready && (
          <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{
                animation: "loading-bar 1.5s ease-in-out infinite",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function Dashboard() {
  const { graphData, loading } = useGraph();
  const [highlightNodes, setHighlightNodes] = useState<string[]>([]);
  const [showLoading, setShowLoading] = useState(true);

  const handleDismissLoading = useCallback(() => {
    setShowLoading(false);
  }, []);

  const handleHighlight = useCallback((nodeIds: string[]) => {
    setHighlightNodes(nodeIds);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background">
      {showLoading && (
        <LoadingScreen ready={!loading} onDone={handleDismissLoading} />
      )}

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
