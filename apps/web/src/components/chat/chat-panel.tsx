"use client";

import { useState } from "react";
import { Send, Loader2, MessageSquare } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCard } from "./message-card";
import { useQuery } from "@/hooks/use-query";
import type { GraphData } from "@/lib/types";

const EXAMPLE_QUERIES = [
  "What are the latest 3 sales orders and their creation dates?",
  "Show me all the products in sales order 740506",
  "Which business partners have the highest number of billing documents?",
  "What is the total net amount for sales orders by business partner?",
  "List the top 5 products by requested quantity in sales order items",
];

interface ChatPanelProps {
  graphData: GraphData;
  onHighlight: (nodeIds: string[]) => void;
}

export function ChatPanel({ graphData, onHighlight }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const { messages, loading, sendQuery, messagesEndRef } = useQuery(
    graphData,
    onHighlight,
  );

  const handleSubmit = () => {
    if (!input.trim()) return;
    sendQuery(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Card className="h-full flex flex-col border-0 rounded-none bg-transparent">
      <CardHeader className="pb-2 shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm">Query Interface</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Ask questions about business partners, sales orders, products,
          outbound deliveries, and billing documents.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0 p-0">
        <div className="flex-1 px-4 overflow-y-auto">
          <div className="py-4">
            {messages.length === 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground mb-3">
                  Try an example query:
                </p>
                {EXAMPLE_QUERIES.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendQuery(q)}
                    className="block w-full text-left px-3 py-2.5 rounded-lg border bg-card/50 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
            {messages.map((msg, i) => (
              <MessageCard key={i} message={msg} />
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm py-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Generating query...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="px-4 py-3 border-t shrink-0">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about the data..."
              disabled={loading}
              className="text-sm"
            />
            <Button
              onClick={handleSubmit}
              disabled={loading || !input.trim()}
              size="icon"
              className="shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
