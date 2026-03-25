"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type { ChatMessage, GraphData, QueryResponse } from "@/lib/types";

export function useQuery(
  graphData: GraphData,
  onHighlight: (nodeIds: string[]) => void
) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const extractNodeIds = useCallback(
    (result: QueryResponse) => {
      if (!result.data || result.data.length === 0) {
        onHighlight([]);
        return;
      }

      const nodeIds = new Set<string>();
      for (const row of result.data) {
        for (const [key, val] of Object.entries(row)) {
          if (val === null || val === undefined) continue;
          
          const k = key.toLowerCase();
          const strVal = String(val);

          if (k === "businesspartner" || k === "soldtoparty") nodeIds.add(`business_partner_${strVal}`);
          if (k === "salesorder") nodeIds.add(`sales_order_${strVal}`);
          if (k === "product" || k === "material") nodeIds.add(`product_${strVal}`);
          if (k === "deliverydocument") nodeIds.add(`delivery_${strVal}`);
          if (k === "billingdocument") nodeIds.add(`billing_${strVal}`);

          if (k === "businesspartnerfullname" || k === "organizationbpname1") {
            const match = graphData.nodes.find(
              (n) => n.metadata?.businessPartnerFullName === val || n.metadata?.organizationBPName1 === val
            );
            if (match) nodeIds.add(match.id);
          }
        }
      }

      onHighlight([...nodeIds]);

      if (nodeIds.size > 0) {
        toast.success(`Highlighted ${nodeIds.size} flow nodes on the map`);
      } else {
        toast.info("No corresponding nodes found on the map");
      }
    },
    [graphData, onHighlight]
  );

  const sendQuery = useCallback(
    async (query: string) => {
      if (!query.trim() || loading) return;

      setMessages((prev) => [...prev, { role: "user", text: query }]);
      setLoading(true);

      try {
        const res = await fetch("/api/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });

        if (!res.ok) {
          const err = await res
            .json()
            .catch(() => ({ detail: "Server error" }));
          throw new Error(err.detail || `HTTP ${res.status}`);
        }

        const data: QueryResponse = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: data.answer,
            sql: data.sql,
            data: data.data,
            spec: data.spec,
          },
        ]);

        extractNodeIds(data);
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: err instanceof Error ? err.message : "Unknown error",
            error: true,
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, extractNodeIds]
  );

  return { messages, loading, sendQuery, messagesEndRef };
}
