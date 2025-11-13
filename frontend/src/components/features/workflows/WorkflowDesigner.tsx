/**
 * Workflow Designer Component
 * Visual workflow editor using React Flow
 */

'use client';

import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { WorkflowDefinition, WorkflowStatus, WorkflowTransition } from '@/types/workflow';
import { Card } from '@/components/ui/card';

interface WorkflowDesignerProps {
  workflow: WorkflowDefinition;
  onStatusClick?: (status: WorkflowStatus) => void;
  onTransitionClick?: (transition: WorkflowTransition) => void;
  editable?: boolean;
}

export function WorkflowDesigner({
  workflow,
  onStatusClick,
  onTransitionClick,
  editable = false,
}: WorkflowDesignerProps) {
  // Convert workflow to React Flow nodes and edges
  const initialNodes = useMemo(() => {
    return workflow.statuses.map((status, index) => {
      const row = Math.floor(index / 3);
      const col = index % 3;

      return {
        id: status.key,
        type: 'default',
        position: { x: col * 250, y: row * 150 },
        data: {
          label: (
            <div
              className="px-4 py-2 rounded-lg border-2 cursor-pointer hover:shadow-md transition-shadow"
              style={{
                borderColor: status.color,
                backgroundColor: `${status.color}10`,
              }}
              onClick={() => onStatusClick?.(status)}
            >
              <div className="font-semibold" style={{ color: status.color }}>
                {status.label}
              </div>
              {status.isInitial && (
                <div className="text-xs text-muted-foreground mt-1">Initial</div>
              )}
              {status.isFinal && (
                <div className="text-xs text-muted-foreground mt-1">Final</div>
              )}
            </div>
          ),
        },
        style: {
          background: 'transparent',
          border: 'none',
          padding: 0,
        },
      };
    });
  }, [workflow.statuses, onStatusClick]);

  const initialEdges = useMemo(() => {
    return workflow.transitions.map((transition, index) => ({
      id: `${transition.from}-${transition.to}-${index}`,
      source: transition.from,
      target: transition.to,
      type: 'smoothstep',
      animated: true,
      label: transition.label,
      style: { stroke: '#6366f1', strokeWidth: 2 },
      labelStyle: { fill: '#6366f1', fontWeight: 600 },
      labelBgStyle: { fill: '#fff' },
      data: { transition },
    }));
  }, [workflow.transitions]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      if (editable) {
        setEdges((eds) => addEdge(params, eds));
      }
    },
    [editable, setEdges]
  );

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      if (edge.data?.transition) {
        onTransitionClick?.(edge.data.transition);
      }
    },
    [onTransitionClick]
  );

  return (
    <Card className="h-[600px] w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={editable ? onNodesChange : undefined}
        onEdgesChange={editable ? onEdgesChange : undefined}
        onConnect={onConnect}
        onEdgeClick={onEdgeClick}
        fitView
        attributionPosition="bottom-left"
      >
        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </Card>
  );
}

export default WorkflowDesigner;
