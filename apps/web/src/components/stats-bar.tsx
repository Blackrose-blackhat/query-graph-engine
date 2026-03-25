"use client";

import { Badge } from "@/components/ui/badge";
import type { GraphNode } from "@/lib/types";

const TYPE_COLORS: Record<string, string> = {
  customer: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  order: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  product: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  delivery: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  invoice: "bg-red-500/20 text-red-400 border-red-500/30",
  payment: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  address: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  order_item: "bg-violet-500/20 text-violet-400 border-violet-500/30",
};

interface StatsBarProps {
  nodes: GraphNode[];
}

export function StatsBar({ nodes }: StatsBarProps) {
  const counts = nodes.reduce(
    (acc, node) => {
      acc[node.type] = (acc[node.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="flex flex-wrap gap-1.5">
      {Object.entries(counts).map(([type, count]) => (
        <Badge
          key={type}
          variant="outline"
          className={`text-[10px] px-2 py-0.5 ${TYPE_COLORS[type] || ""}`}
        >
          {type.replace("_", " ")} {count}
        </Badge>
      ))}
    </div>
  );
}
