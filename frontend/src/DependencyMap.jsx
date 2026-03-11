// // import React, { useEffect, useState, useCallback } from 'react';
// // import axios from 'axios';
// // import {
// //   ReactFlow,
// //   useNodesState,
// //   useEdgesState,
// //   Background,
// //   Controls,
// //   MiniMap,
// // } from '@xyflow/react';
// // import '@xyflow/react/dist/style.css';

// // // A simple algorithm to spread the nodes out in a circle so they don't stack on top of each other
// // const getLayoutedElements = (nodes, edges) => {
// //   const radius = 250;
// //   const layoutedNodes = nodes.map((node, index) => {
// //     const angle = (index / nodes.length) * 2 * Math.PI;
// //     return {
// //       ...node,
// //       position: {
// //         x: Math.cos(angle) * radius + 300,
// //         y: Math.sin(angle) * radius + 300,
// //       },
// //       style: {
// //         background: '#1e293b',
// //         color: '#f8fafc',
// //         border: '1px solid #334155',
// //         borderRadius: '8px',
// //         padding: '10px',
// //         fontSize: '12px',
// //         fontWeight: 'bold',
// //       }
// //     };
// //   });
// //   return { nodes: layoutedNodes, edges };
// // };

// // export default function DependencyMap({ collectionName }) {
// //   const [nodes, setNodes, onNodesChange] = useNodesState([]);
// //   const [edges, setEdges, onEdgesChange] = useEdgesState([]);
// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {
// //     if (!collectionName) return;

// //     axios.get(`http://127.0.0.1:8000/api/dependencies/${collectionName}`)
// //       .then(res => {
// //         const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
// //           res.data.nodes,
// //           res.data.edges
// //         );
// //         setNodes(layoutedNodes);
// //         setEdges(layoutedEdges);
// //         setLoading(false);
// //       })
// //       .catch(err => {
// //         console.error("Failed to load dependencies", err);
// //         setLoading(false);
// //       });
// //   }, [collectionName]);

// //   if (loading) return <div className="p-10 text-center text-gray-500">Loading neural map...</div>;
// //   if (nodes.length === 0) return <div className="p-10 text-center text-gray-500">No dependencies found. Make sure you re-ingested the repo!</div>;

// //   return (
// //     <div style={{ width: '100%', height: '500px' }} className="border border-gray-200 rounded-xl overflow-hidden bg-slate-50">
// //       <ReactFlow
// //         nodes={nodes}
// //         edges={edges}
// //         onNodesChange={onNodesChange}
// //         onEdgesChange={onEdgesChange}
// //         fitView
// //       >
// //         <Background color="#cbd5e1" gap={16} />
// //         <Controls />
// //         <MiniMap nodeColor="#3b82f6" maskColor="rgba(241, 245, 249, 0.7)" />
// //       </ReactFlow>
// //     </div>
// //   );
// // }

// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import {
//   ReactFlow,
//   useNodesState,
//   useEdgesState,
//   Background,
//   Controls,
//   MiniMap,
// } from '@xyflow/react';
// import '@xyflow/react/dist/style.css';
// import dagre from 'dagre';

// // Initialize the Dagre layout engine
// const dagreGraph = new dagre.graphlib.Graph();
// dagreGraph.setDefaultEdgeLabel(() => ({}));

// // This function automatically calculates perfect spacing for the nodes
// const getLayoutedElements = (nodes, edges, direction = 'TB') => {
//   const nodeWidth = 170;
//   const nodeHeight = 50;

//   dagreGraph.setGraph({ rankdir: direction });

//   nodes.forEach((node) => {
//     dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
//   });

//   edges.forEach((edge) => {
//     dagreGraph.setEdge(edge.source, edge.target);
//   });

//   dagre.layout(dagreGraph);

//   const layoutedNodes = nodes.map((node) => {
//     const nodeWithPosition = dagreGraph.node(node.id);
//     return {
//       ...node,
//       targetPosition: direction === 'TB' ? 'top' : 'left',
//       sourcePosition: direction === 'TB' ? 'bottom' : 'right',
//       // We shift the dagre node position (anchor=center center) to the top left
//       // so it matches the React Flow node anchor point (top left).
//       position: {
//         x: nodeWithPosition.x - nodeWidth / 2,
//         y: nodeWithPosition.y - nodeHeight / 2,
//       },
//       style: {
//         background: '#1e293b',
//         color: '#f8fafc',
//         border: '1px solid #334155',
//         borderRadius: '8px',
//         padding: '10px',
//         fontSize: '12px',
//         fontWeight: 'bold',
//         textAlign: 'center',
//         width: nodeWidth,
//       }
//     };
//   });

//   return { nodes: layoutedNodes, edges };
// };

// export default function DependencyMap({ collectionName }) {
//   const [nodes, setNodes, onNodesChange] = useNodesState([]);
//   const [edges, setEdges, onEdgesChange] = useEdgesState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!collectionName) return;

//     axios.get(`http://127.0.0.1:8000/api/dependencies/${collectionName}`)
//       .then(res => {
//         // FIX: Force edge IDs to be perfectly unique to prevent React key errors
//         const safeEdges = res.data.edges.map((edge, index) => ({
//           ...edge,
//           id: `${edge.source}-${edge.target}-${index}` 
//         }));

//         // Run the nodes and safe edges through the Dagre layout engine
//         const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
//           res.data.nodes,
//           safeEdges,
//           'TB'
//         );
        
//         setNodes(layoutedNodes);
//         setEdges(layoutedEdges);
//         setLoading(false);
//       })
//       .catch(err => {
//         console.error("Failed to load dependencies", err);
//         setLoading(false);
//       });
//   }, [collectionName]);

//   if (loading) return <div className="p-10 text-center text-gray-500 font-medium">Mapping neural pathways...</div>;
//   if (nodes.length === 0) return <div className="p-10 text-center text-gray-500 font-medium">No dependencies found. Make sure you re-ingested the repo!</div>;

//   // FIX: Added rigid 75vh height so React Flow can calculate the canvas size
//   return (
//     <div style={{ width: '100%', height: '75vh' }} className="border border-gray-200 rounded-xl overflow-hidden bg-slate-50">
//       <ReactFlow
//         nodes={nodes}
//         edges={edges}
//         onNodesChange={onNodesChange}
//         onEdgesChange={onEdgesChange}
//         fitView
//         attributionPosition="bottom-right"
//       >
//         <Background color="#cbd5e1" gap={16} />
//         <Controls />
//         <MiniMap nodeColor="#3b82f6" maskColor="rgba(241, 245, 249, 0.7)" />
//       </ReactFlow>
//     </div>
//   );
// }

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
  Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const nodeWidth = 170;
  const nodeHeight = 50;

  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: direction === 'TB' ? 'top' : 'left',
      sourcePosition: direction === 'TB' ? 'bottom' : 'right',
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
      style: {
        background: '#1e293b',
        color: '#f8fafc',
        border: '1px solid #334155',
        borderRadius: '8px',
        padding: '10px',
        fontSize: '12px',
        fontWeight: 'bold',
        textAlign: 'center',
        width: nodeWidth,
      }
    };
  });

  return { nodes: layoutedNodes, edges };
};

export default function DependencyMap({ collectionName }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [wasTruncated, setWasTruncated] = useState(false);

  useEffect(() => {
    if (!collectionName) return;

    axios.get(`http://127.0.0.1:8000/api/dependencies/${collectionName}`)
      .then(res => {
        let rawNodes = res.data.nodes;
        let rawEdges = res.data.edges;

        // FIX: Node Scaling Protection 
        const MAX_NODES = 300;
        if (rawNodes.length > MAX_NODES) {
            setWasTruncated(true);
            rawNodes = rawNodes.slice(0, MAX_NODES);
            
            // Only keep edges where both source and target still exist
            const validNodeIds = new Set(rawNodes.map(n => n.id));
            rawEdges = rawEdges.filter(e => validNodeIds.has(e.source) && validNodeIds.has(e.target));
        }

        const safeEdges = rawEdges.map((edge, index) => ({
          ...edge,
          id: `${edge.source}-${edge.target}-${index}` 
        }));

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
          rawNodes,
          safeEdges,
          'TB'
        );
        
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load dependencies", err);
        setLoading(false);
      });
  }, [collectionName]);

  if (loading) return <div className="p-10 text-center text-gray-500 font-medium">Mapping neural pathways...</div>;
  if (nodes.length === 0) return <div className="p-10 text-center text-gray-500 font-medium">No dependencies found. Make sure you re-ingested the repo!</div>;

  return (
    <div style={{ width: '100%', height: '75vh' }} className="relative border border-gray-200 rounded-xl overflow-hidden bg-slate-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        attributionPosition="bottom-right"
      >
        <Background color="#cbd5e1" gap={16} />
        <Controls />
        <MiniMap nodeColor="#3b82f6" maskColor="rgba(241, 245, 249, 0.7)" />
        {wasTruncated && (
          <Panel position="top-right" className="bg-amber-100 text-amber-800 p-2 text-xs rounded border border-amber-300 shadow-sm mt-2 mr-2 max-w-[200px]">
            ⚠️ Graph too large. Displaying the first 300 nodes to prevent browser crash.
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}