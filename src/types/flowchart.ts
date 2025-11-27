export type NodeType = 'start' | 'action' | 'process' | 'decision' | 'end' | 'parallel';

export interface FlowNode {
  id: string;
  text: string;
  type: NodeType;
  description?: string[];
  x?: number;
  y?: number;
}

export interface FlowEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
}

export interface FlowDiagram {
  id: string;
  title: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  metadata?: {
    createdAt: string;
    updatedAt: string;
    author?: string;
  };
}
