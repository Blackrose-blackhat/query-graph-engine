"use client";

import { useState, useEffect } from "react";
import type { GraphData } from "@/lib/types";

export function useGraph() {
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    edges: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/graph")
      .then((res) => res.json())
      .then((data) => {
        setGraphData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch graph:", err);
        setLoading(false);
      });
  }, []);

  return { graphData, loading };
}
