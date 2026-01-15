import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Copy, Check, Tally3, AlignLeft, Table, PlusCircle, Maximize2, X, Minimize2, Sparkles, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BaseResponseNode = ({ title, icon: Icon, color, content, onRemove }) => {
    const [copied, setCopied] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleCopy = () => {
        if (!content) return;
        const textToCopy = typeof content === 'object'
            ? Object.entries(content).map(([k, v]) => `${k}: ${v}`).join('\n')
            : content;
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const renderContent = (isFull = false) => {
        if (!content) return <span className="text-gray-300 italic">Processando...</span>;

        if (Array.isArray(content)) {
            return (
                <ul className="list-disc pl-4 space-y-1">
                    {content.map((item, i) => (
                        <li key={i}>{typeof item === 'object' ? JSON.stringify(item) : item}</li>
                    ))}
                </ul>
            );
        }

        if (typeof content === 'object') {
            return (
                <ul className="list-disc pl-4 space-y-1">
                    {Object.entries(content).map(([key, value]) => (
                        <li key={key}>
                            <strong className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</strong>{' '}
                            {typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
                        </li>
                    ))}
                </ul>
            );
        }

        return content;
    };

    return (
        <>
            <div className={`node-glow w-[300px]`}>
                <div className="node-inner p-4 hover:scale-[1.02] transition-transform relative">
                    <div className="flex items-center justify-between mb-2">
                        <div className={`flex items-center gap-2 ${color}`}>
                            <Icon size={16} />
                            <span className="font-bold text-xs uppercase tracking-widest">{title}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setIsExpanded(true)}
                                className="p-1.5 hover:bg-gray-100 rounded-md text-gray-400 hover:text-indigo-600 transition-colors"
                                title="Expandir (Zen Mode)"
                            >
                                <Maximize2 size={14} />
                            </button>
                            <button
                                onClick={handleCopy}
                                className="p-1.5 hover:bg-gray-100 rounded-md text-gray-400 hover:text-emerald-500 transition-colors"
                            >
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                            {onRemove && (
                                <button
                                    onClick={onRemove}
                                    className="p-1.5 hover:bg-red-50 rounded-md text-gray-400 hover:text-red-500 transition-colors"
                                    title="Excluir Card"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="text-sm text-gray-700 leading-relaxed max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                        {renderContent()}
                    </div>
                </div>
            </div>

            {/* Zen Mode Modal - Popped out to body */}
            {createPortal(
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            key="zen-mode-modal"
                            className="fixed inset-0 z-[9999] bg-white/95 backdrop-blur-md flex flex-col p-8 md:p-16"
                        >
                            <div className="max-w-4xl mx-auto w-full h-full flex flex-col">
                                <div className="flex justify-between items-center mb-8">
                                    <div className={`flex items-center gap-3 ${color}`}>
                                        <Icon size={32} />
                                        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                                    </div>
                                    <div className="flex gap-4">
                                        <button onClick={handleCopy} className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl font-bold transition-all">
                                            {copied ? <Check size={20} /> : <Copy size={20} />}
                                            {copied ? 'Copiado!' : 'Copiar Texto'}
                                        </button>
                                        <button onClick={() => setIsExpanded(false)} className="p-3 hover:bg-indigo-50 text-gray-500 hover:text-indigo-600 rounded-xl transition-all">
                                            <Minimize2 size={24} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm overflow-y-auto text-lg leading-loose text-gray-800 font-medium custom-scrollbar">
                                    {renderContent(true)}
                                </div>

                                <p className="text-center text-gray-400 mt-6 text-sm flex items-center justify-center gap-2">
                                    <Sparkles size={14} /> Modo de Foco: Sem distrações.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
};

export const TitleNode = ({ data, onRemove }) => (
    <BaseResponseNode title="Título Sugerido" icon={Tally3} color="indigo" content={data.content || 'Aguardando...'} onRemove={onRemove} />
);

export const DescriptionNode = ({ data, onRemove }) => (
    <BaseResponseNode title="Descrição" icon={AlignLeft} color="purple" content={data.content || 'Aguardando...'} onRemove={onRemove} />
);

export const SizeTableNode = ({ data, onRemove }) => (
    <BaseResponseNode title="Tabela de Tamanhos" icon={Table} color="blue" content={data.content || 'Aguardando...'} onRemove={onRemove} />
);

export const ExtraNode = ({ data, onRemove }) => (
    <BaseResponseNode title="Extra / Info" icon={PlusCircle} color="pink" content={data.content || 'Aguardando...'} onRemove={onRemove} />
);
