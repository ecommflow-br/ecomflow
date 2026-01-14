import React, { useState } from 'react';
import { Copy, Check, Tally3, AlignLeft, Table, PlusCircle } from 'lucide-react';

const BaseResponseNode = ({ title, icon: Icon, color, content }) => {
    const [copied, setCopied] = useState(false);

    const copy = () => {
        if (!content) return;
        // Copy logic simplified to handle objects
        const textToCopy = typeof content === 'object'
            ? Object.entries(content).map(([k, v]) => `${k}: ${v}`).join('\n')
            : content;
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Helper to render content safely
    const renderContent = () => {
        if (!content) return <span className="text-gray-300 italic">Processando...</span>;

        if (typeof content === 'object') {
            return (
                <ul className="list-disc pl-4 space-y-1">
                    {Object.entries(content).map(([key, value]) => (
                        <li key={key}>
                            <strong className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</strong> {value}
                        </li>
                    ))}
                </ul>
            );
        }

        return content;
    };

    return (
        <div className={`node-glow w-[320px] transition-all hover:scale-[1.02]`}>
            <div className="node-inner p-6 relative">
                <div className="flex items-center justify-between mb-4">
                    <div className={`flex items-center gap-2 text-${color}-600`}>
                        <Icon size={18} />
                        <span className="text-xs font-bold uppercase tracking-widest">{title}</span>
                    </div>
                    <button
                        onClick={copy}
                        className="p-2 hover:bg-black/5 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                        title="Copiar"
                    >
                        {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                    </button>
                </div>

                <div className="text-sm text-gray-700 leading-relaxed max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                    {renderContent()}
                </div>
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
