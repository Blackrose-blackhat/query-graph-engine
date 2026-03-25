export interface GraphNode {
  id: string;
  label: string;
  type: string;
  color: string;
  metadata: Record<string, unknown>;
  x?: number;
  y?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface QueryResponse {
  answer: string;
  data: Record<string, unknown>[];
  sql: string;
  spec?: Record<string, unknown>;
}

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  sql?: string;
  data?: Record<string, unknown>[];
  spec?: Record<string, unknown>;
  error?: boolean;
}
