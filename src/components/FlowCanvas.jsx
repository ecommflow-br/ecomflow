import React, { useState, useCallback } from 'react';
import ReactFlow, {
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    addEdge,
    MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import InputNode from '../nodes/InputNode';
import { TitleNode, DescriptionNode, SizeTableNode, ExtraNode } from '../nodes/ResponseNodes';
import CalculatorNode from '../nodes/CalculatorNode';
import { generateProductContent } from '../utils/ai';

const nodeTypes = {
    input: InputNode,
    title: TitleNode,
    description: DescriptionNode,
    sizeTable: SizeTableNode,
    extra: ExtraNode,
    calculator: CalculatorNode
};

const initialNodes = [
    {
        id: 'input-1',
        type: 'input',
        position: { x: 50, y: 50 },
        data: { label: 'Input do Produto' }
    }
];

const FlowCanvas = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [loading, setLoading] = useState(false);

    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    const handleGenerate = async (text, file) => {
        setLoading(true);
        try {
            const content = await generateProductContent(text, file);

            const responseNodes = [
                { id: 'title-1', type: 'title', position: { x: 450, y: 0 }, data: { content: content.title } },
                { id: 'desc-1', type: 'description', position: { x: 450, y: 150 }, data: { content: content.description } },
                { id: 'size-1', type: 'sizeTable', position: { x: 450, y: 400 }, data: { content: content.sizeTable } },
                { id: 'extra-1', type: 'extra', position: { x: 450, y: 550 }, data: { content: content.extraDetails } },
                { id: 'calc-1', type: 'calculator', position: { x: 850, y: 250 }, data: {} },
            ];

            const newEdges = [
                { id: 'e1-2', source: 'input-1', target: 'title-1', animated: true },
                { id: 'e1-3', source: 'input-1', target: 'desc-1', animated: true },
                { id: 'e1-4', source: 'input-1', target: 'size-1', animated: true },
                { id: 'e1-5', source: 'input-1', target: 'extra-1', animated: true },
                { id: 'e2-6', source: 'title-1', target: 'calc-1', animated: true },
            ];

            setNodes([...initialNodes, ...responseNodes]);
            setEdges(newEdges);
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full h-full">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
            >
                <Background color="#333" gap={20} />
                <Controls />
            </ReactFlow>

            {loading && (
                <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="glass px-8 py-4 flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent animate-spin rounded-full" />
                        <span className="font-medium">IA Processando...</span>
                    </div>
                </div>
            )}

            {/* Inject handleGenerate into InputNode */}
            {nodes.find(n => n.id === 'input-1') && (
                <div className="hidden">
                    {nodes[0].data.onGenerate = handleGenerate}
                </div>
            )}
        </div>
    );
};

export default FlowCanvas;
