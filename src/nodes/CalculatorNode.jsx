import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    X,
    Plus,
    GripHorizontal,
    Calculator as CalcIcon,
    Target,
    MessageSquare,
    DollarSign,
    TrendingUp,
    Percent,
    Package,
    RefreshCw,
    ShieldCheck,
    Sparkles
} from 'lucide-react';
import { calculateWithAI } from '../utils/ai';

const CalculatorNode = ({ onRemove, onAdd }) => {
    const [mode, setMode] = useState('standard'); // 'standard', 'reverse', 'chat'
    const [platform, setPlatform] = useState('manual');
    const [loading, setLoading] = useState(false);
    const [chatInput, setChatInput] = useState('');

    // Standard Mode State
    const [cost, setCost] = useState('');
    const [tax, setTax] = useState('11');
    const [markup, setMarkup] = useState('50');
    const [extra, setExtra] = useState('0');

    // Reverse Mode State
    const [targetPrice, setTargetPrice] = useState('');
    const [desiredMargin, setDesiredMargin] = useState('25');
    const [reverseTax, setReverseTax] = useState('18');
    const [shipping, setShipping] = useState('0');

    // Results
    const [result, setResult] = useState(null);
    const [reverseResult, setReverseResult] = useState(null);

    const platforms = {
        shopee: { name: 'Shopee', tax: 18 },
        mercadolivre: { name: 'ML', tax: 17 },
        amazon: { name: 'Amazon', tax: 15 },
        tiktok: { name: 'TikTok', tax: 12 },
        manual: { name: 'Manual', tax: 0 }
    };

    const handlePlatformChange = (p) => {
        setPlatform(p);
        if (p !== 'manual') {
            const t = platforms[p].tax.toString();
            if (mode === 'standard') setTax(t);
            else setReverseTax(t);
        }
    };

    const handleChatSubmit = async (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;
        setLoading(true);
        try {
            const data = await calculateWithAI(chatInput);
            // Don't switch mode automatically, keep user in chat
            // if (data.mode) setMode(data.mode);

            if (data.cost) setCost(data.cost.toString());
            if (data.tax) {
                setTax(data.tax.toString());
                setReverseTax(data.tax.toString());
            }
            if (data.markup) setMarkup(data.markup.toString());
            if (data.extra) setExtra(data.extra.toString());
            if (data.targetPrice) setTargetPrice(data.targetPrice.toString());
            if (data.desiredMargin) setDesiredMargin(data.desiredMargin.toString());
            if (data.shipping) setShipping(data.shipping.toString());
            setPlatform('manual');
            setChatInput('');
        } catch (error) {
            console.error(error);
            alert("Erro no Chat IA: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    // ... (useEffect hooks unchanged)

    return (
        <div className="node-glow w-[360px]">
            {/* ... (Header unchanged) ... */}
            <div className="node-inner bg-white overflow-hidden flex flex-col h-[600px] relative">
                <div className="p-4 bg-gray-50 border-b border-gray-100 shrink-0 cursor-move group/header relative">
                    <div className="absolute inset-x-0 -top-px h-[2px] bg-indigo-500 opacity-0 group-hover/header:opacity-100 transition-opacity" />

                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <GripHorizontal size={14} className="text-gray-300 group-hover/header:text-indigo-400 transition-colors" />
                            <CalcIcon size={16} className="text-indigo-600" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">Calculadora Flow</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={(e) => { e.stopPropagation(); onAdd(); }}
                                className="p-1.5 hover:bg-indigo-100 rounded-lg text-indigo-500 transition-all active:scale-95"
                                title="Nova Calculadora"
                            >
                                <Plus size={14} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                                className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-all active:scale-95"
                                title="Remover"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </div>

                    <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200 mb-4">
                        <button
                            onClick={() => setMode('standard')}
                            className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-tighter rounded-lg transition-all ${mode === 'standard' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-50'}`}
                        >
                            Padrão
                        </button>
                        <button
                            onClick={() => setMode('reverse')}
                            className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-tighter rounded-lg transition-all ${mode === 'reverse' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-50'}`}
                        >
                            Reverso
                        </button>
                        <button
                            onClick={() => setMode('chat')}
                            className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-tighter rounded-lg transition-all ${mode === 'chat' ? 'bg-black text-white' : 'text-gray-400 hover:bg-gray-50'}`}
                        >
                            Chat IA
                        </button>
                    </div>

                    <div className="grid grid-cols-5 gap-1.5">
                        {Object.entries(platforms).map(([id, info]) => (
                            <button
                                key={id}
                                onClick={() => handlePlatformChange(id)}
                                className={`py-1.5 rounded-lg border text-[8px] font-black transition-all ${platform === id
                                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200 scale-105'
                                    : 'bg-white text-gray-500 border-gray-100'}`}
                            >
                                {info.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 scrollbar-hide">
                    {mode === 'chat' ? (
                        <div className="h-full flex flex-col">
                            <div className="space-y-4">
                                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Sparkles size={14} className="text-indigo-600" />
                                        <span className="text-[10px] font-black uppercase text-indigo-700">Modo Chat Inteligente</span>
                                    </div>
                                    <p className="text-[10px] text-indigo-600/80 leading-relaxed italic">
                                        "Peça cálculos complexos. Ex: Comprei por 50, quero 30% de margem."
                                    </p>
                                </div>
                                <form onSubmit={handleChatSubmit} className="relative">
                                    <input
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        placeholder="Digite aqui..."
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold text-gray-900 pr-12 outline-none focus:border-indigo-500"
                                    />
                                    <button type="submit" disabled={loading} className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                                        {loading ? <RefreshCw size={14} className="animate-spin" /> : <MessageSquare size={14} />}
                                    </button>
                                </form>
                            </div>

                            {/* Results Display in Chat Mode */}
                            <div className="mt-6 flex-1 overflow-y-auto">
                                {result && (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[9px] font-black text-gray-400 uppercase">Resultado (Padrão)</span>
                                            <div className="h-px bg-gray-100 flex-1" />
                                        </div>
                                        <div className="p-4 bg-white rounded-2xl border border-indigo-100 shadow-sm">
                                            <div className="flex justify-between items-end border-b border-indigo-50 pb-2 mb-2">
                                                <span className="text-[9px] font-black text-indigo-600 uppercase">Venda Sugerida</span>
                                                <span className="text-xl font-black text-indigo-700">R$ {result.finalPrice.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-[10px] items-center">
                                                <span className="text-gray-500 font-bold">LUCRO: <span className="text-emerald-600">R$ {result.profit.toFixed(2)}</span></span>
                                                <span className="text-gray-500 font-bold">MARGEM: <span className="text-gray-900">{result.margin.toFixed(1)}%</span></span>
                                            </div>
                                        </div>
                                        <div className="mt-2 grid grid-cols-3 gap-2 text-center opacity-75">
                                            <div className="bg-gray-50 p-1 rounded">
                                                <div className="text-[8px] text-gray-400 uppercase">Custo</div>
                                                <div className="text-[10px] font-bold text-gray-900">R$ {cost}</div>
                                            </div>
                                            <div className="bg-gray-50 p-1 rounded">
                                                <div className="text-[8px] text-gray-400 uppercase">Taxas</div>
                                                <div className="text-[10px] font-bold text-gray-900">{tax}%</div>
                                            </div>
                                            <div className="bg-gray-50 p-1 rounded">
                                                <div className="text-[8px] text-gray-400 uppercase">Markup</div>
                                                <div className="text-[10px] font-bold text-gray-900">{markup}%</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {reverseResult && !result && (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[9px] font-black text-gray-400 uppercase">Resultado (Reverso)</span>
                                            <div className="h-px bg-gray-100 flex-1" />
                                        </div>
                                        <div className={`p-4 rounded-2xl border ${reverseResult.isViable ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                                            <div className="flex justify-between items-end border-b border-gray-200/50 pb-2 mb-2">
                                                <span className="text-[9px] font-black text-gray-600 uppercase">Custo Máximo</span>
                                                <span className={`text-xl font-black ${reverseResult.isViable ? 'text-emerald-700' : 'text-red-600'}`}>
                                                    {reverseResult.isViable ? `R$ ${reverseResult.maxCost.toFixed(2)}` : 'Inviável'}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase text-center">Lucro Real: R$ {reverseResult.profitAmount.toFixed(2)}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : mode === 'standard' ? (
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-gray-600 uppercase">Custo Produto (R$)</label>
                                <div className="relative">
                                    <DollarSign size={14} className="absolute left-3 top-2.5 text-gray-300" />
                                    <input type="number" value={cost} onChange={(e) => setCost(e.target.value)} className="w-full bg-gray-50 border border-transparent focus:border-indigo-500 rounded-xl py-2 pl-9 pr-4 text-xs font-bold text-gray-900 outline-none" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-gray-600 uppercase">Markup (%)</label>
                                    <input type="number" value={markup} onChange={(e) => setMarkup(e.target.value)} className="w-full bg-gray-50 border border-transparent focus:border-indigo-500 rounded-xl py-2 px-3 text-xs font-bold text-gray-900 outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-gray-600 uppercase">Taxas (%)</label>
                                    <input type="number" value={tax} onChange={(e) => { setTax(e.target.value); setPlatform('manual'); }} className="w-full bg-gray-50 border border-transparent focus:border-indigo-500 rounded-xl py-2 px-3 text-xs font-bold text-gray-900 outline-none" />
                                </div>
                            </div>
                            {result && (
                                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 mt-4">
                                    <div className="flex justify-between items-end border-b border-indigo-200 pb-2 mb-2">
                                        <span className="text-[9px] font-black text-indigo-600 uppercase">Venda Sugerida</span>
                                        <span className="text-xl font-black text-indigo-700">R$ {result.finalPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] items-center">
                                        <span className="text-gray-500 font-bold">LUCRO: <span className="text-emerald-600">R$ {result.profit.toFixed(2)}</span></span>
                                        <span className="text-gray-500 font-bold">MARGEM: <span className="text-gray-900">{result.margin.toFixed(1)}%</span></span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-purple-600 uppercase text-center block">Preço Alvo</label>
                                <div className="relative">
                                    <Target size={14} className="absolute left-1/2 -ml-[60px] top-2.5 text-purple-300" />
                                    <input type="number" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} className="w-full bg-purple-50 text-center border border-transparent focus:border-purple-500 rounded-xl py-2 pl-4 pr-4 text-xs font-bold text-gray-900 outline-none" placeholder="Ex: 99.90" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-gray-600 uppercase">Margem Alvo (%)</label>
                                    <input type="number" value={desiredMargin} onChange={(e) => setDesiredMargin(e.target.value)} className="w-full bg-gray-50 border border-transparent focus:border-purple-500 rounded-xl py-2 px-3 text-xs font-bold text-gray-900 outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-gray-600 uppercase">Taxas (%)</label>
                                    <input type="number" value={reverseTax} onChange={(e) => { setReverseTax(e.target.value); setPlatform('manual'); }} className="w-full bg-gray-50 border border-transparent focus:border-purple-500 rounded-xl py-2 px-3 text-xs font-bold text-gray-900 outline-none" />
                                </div>
                            </div>
                            {reverseResult && (
                                <div className={`p-4 rounded-2xl border mt-4 ${reverseResult.isViable ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                                    <div className="flex justify-between items-end border-b border-gray-200/50 pb-2 mb-2">
                                        <span className="text-[9px] font-black text-gray-600 uppercase">Custo Máximo</span>
                                        <span className={`text-xl font-black ${reverseResult.isViable ? 'text-emerald-700' : 'text-red-600'}`}>
                                            {reverseResult.isViable ? `R$ ${reverseResult.maxCost.toFixed(2)}` : 'Inviável'}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase text-center">Lucro Real Estimado: R$ {reverseResult.profitAmount.toFixed(2)}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-3 bg-gray-50 border-t border-gray-100 shrink-0">
                    <p className="text-[8px] text-gray-400 font-black text-center uppercase tracking-widest flex items-center justify-center gap-1">
                        <ShieldCheck size={10} /> Sincronizado e Draggable
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CalculatorNode;
