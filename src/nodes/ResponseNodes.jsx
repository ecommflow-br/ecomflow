import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Copy, Check, Tally3, AlignLeft, Table, PlusCircle } from 'lucide-react';

const BaseResponseNode = ({ title, icon: Icon, color, content, type }) => {
    const [copied, setCopied] = useState(false);

    const copy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={`node-glow w-[300px]`}>
            <div className="node-inner p-5 relative">
                <Handle type="target" position={Position.Left} className={`!bg-${color}-500`} />

                <div className="flex items-center justify-between mb-3">
                    <div className={`flex items-center gap-2 text-${color}-600`}>
                        <Icon size={16} />
                        <span className="text-xs font-bold uppercase tracking-widest">{title}</span>
                    </div>
                    <button onClick={copy} className="text-gray-400 hover:text-gray-600 transition-colors">
                        {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </button>
                </div>

                <div className="text-sm text-gray-600 line-clamp-6 leading-relaxed">
                    {content}
                </div>

                <Handle type="source" position={Position.Right} className={`!bg-${color}-500`} />
            </div>
        </div>
    );
};

export const TitleNode = ({ data }) => (
    <BaseResponseNode title="Título Sugerido" icon={Tally3} color="indigo" content={data.content || 'Aguardando...'} />
);

export const DescriptionNode = ({ data }) => (
    <BaseResponseNode title="Descrição" icon={AlignLeft} color="purple" content={data.content || 'Aguardando...'} />
);

export const SizeTableNode = ({ data }) => (
    <BaseResponseNode title="Tabela de Tamanhos" icon={Table} color="blue" content={data.content || 'Aguardando...'} />
);

export const ExtraNode = ({ data }) => (
    <BaseResponseNode title="Extra / Info" icon={PlusCircle} color="pink" content={data.content || 'Aguardando...'} />
);
