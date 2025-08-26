import React, { useCallback, useRef } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  useReactFlow,
  Background,
  type Node,
  type Edge,
  type Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import Sidebar from './Sidebar';
import { DnDProvider, useDnD } from './DnDContext';
import SquareNode from './nodes/SquareNode';
import LandscapeNode from './nodes/LandscapeNode';
import PortraitNode from './nodes/PortraitNode';
import WideNode from './nodes/WideNode';
import { useNavigate } from 'react-router-dom';
import { useGalleryStore } from '../store/gallery';



let idCounter = 1;
const getId = () => `node_${idCounter++}`;

const DnDFlow: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { screenToFlowPosition } = useReactFlow();
  const [type] = useDnD();
  const navigate = useNavigate();
  const { setLayoutSchema } = useGalleryStore();

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    if (!type) return;

    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });

    const nodeTypeMap: Record<string, { type: Node['type']; width: number; height: number }> = {
      'square-1-1': { type: 'square', width: 160, height: 160 },
      'landscape-4-3': { type: 'landscape', width: 200, height: 150 },
      'portrait-3-4': { type: 'portrait', width: 150, height: 200 },
      'wide-16-9': { type: 'wide', width: 220, height: 124 },
    };
    const def = nodeTypeMap[type];
    const newNode: Node = {
      id: getId(),
      type: def?.type || 'square',
      position,
      data: {},
      style: { width: def?.width || 160, height: def?.height || 160 }
    };
    setNodes((nds) => nds.concat(newNode));
  }, [screenToFlowPosition, type, setNodes]);

  const nodeTypes = {
    square: SquareNode,
    landscape: LandscapeNode,
    portrait: PortraitNode,
    wide: WideNode,
  } as const;

  const onNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    // simple context menu with delete for now
    const shouldDelete = window.confirm('Delete this node?');
    if (shouldDelete) {
      setNodes((nds) => nds.filter((n) => n.id !== node.id));
      setEdges((eds) => eds.filter((e) => e.source !== node.id && e.target !== node.id));
    }
  }, [setNodes, setEdges]);

  return (
    <div className="flex h-screen">
      <div className="flex-1 p-4 space-y-3">
        <div className="flex gap-2">
          <button
            className="px-3 py-2 rounded-md border border-black-700 bg-black-900 text-white"
            onClick={() => {
              // export schema from current nodes relative to 800x600 tile
              const schema = {
                id: 'builder-export',
                tileSize: { width: 800, height: 600 },
                nodes: nodes.map((n) => ({
                  id: n.id,
                  frame: {
                    x: n.position.x,
                    y: n.position.y,
                    width: (n.style as any)?.width ?? 160,
                    height: (n.style as any)?.height ?? 160,
                  },
                })),
                version: 1 as const,
              };
              setLayoutSchema(schema as any);
              navigate('/');
            }}
          >
            Export Layout
          </button>
        </div>
        <div className="mx-auto border border-black-700 rounded-xl overflow-hidden" style={{ width: 1000, height: 700 }}>
          <div className="w-full h-full" ref={reactFlowWrapper}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              colorMode='dark'
              onConnect={onConnect}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodeContextMenu={onNodeContextMenu}
              nodeTypes={nodeTypes}
              fitView
            >
              <Controls />
              <Background />
            </ReactFlow>
          </div>
        </div>
      </div>
      <Sidebar />
    </div>
  );
};

const BuilderPage: React.FC = () => (
  <ReactFlowProvider>
    <DnDProvider>
      <DnDFlow />
    </DnDProvider>
  </ReactFlowProvider>
);

export default BuilderPage;


