import { useState } from 'react';
import { FlowDiagram as FlowDiagramType } from '@/types/flowchart';
import { FlowNode } from './FlowNode';
import { FlowConnector } from './FlowConnector';
import { NodeDetailPanel } from './NodeDetailPanel';

interface FlowDiagramProps {
  diagram: FlowDiagramType;
}

export function FlowDiagram({ diagram }: FlowDiagramProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  const selectedNode = selectedNodeId 
    ? diagram.nodes.find(n => n.id === selectedNodeId) 
    : null;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Main Flow */}
      <div className="flex-1">
        <div className="max-w-lg mx-auto">
          {diagram.nodes.map((node, index) => (
            <div key={node.id}>
              <FlowNode
                node={node}
                index={index}
                isSelected={selectedNodeId === node.id}
                onClick={() => setSelectedNodeId(
                  selectedNodeId === node.id ? null : node.id
                )}
              />
              
              {index < diagram.nodes.length - 1 && (
                <FlowConnector 
                  index={index}
                  label={diagram.edges[index]?.label}
                />
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Detail Panel */}
      <div className="lg:w-80">
        <NodeDetailPanel 
          node={selectedNode} 
          onClose={() => setSelectedNodeId(null)}
        />
      </div>
    </div>
  );
}
