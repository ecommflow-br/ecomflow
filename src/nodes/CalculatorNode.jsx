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

const CalculatorNode = ({ onRemove, onAdd, initialData }) => {
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

    // Populate from AI Extraction
    useEffect(() => {
        if (initialData) {
            console.log("Calculator received AI data:", initialData);
            if (initialData.mode === 'reverse' || (initialData.targetPrice > 0 && !initialData.cost)) {
                setMode('reverse');
                if (initialData.targetPrice) setTargetPrice(initialData.targetPrice.toString());
                if (initialData.desiredMargin) setDesiredMargin(initialData.desiredMargin.toString());
                if (initialData.shipping) setShipping(initialData.shipping.toString());
            } else {
                setMode('standard');
                if (initialData.cost) setCost(initialData.cost.toString());
                if (initialData.tax) setTax(initialData.tax.toString());
                if (initialData.markup) setMarkup(initialData.markup.toString());
                if (initialData.extra) setExtra(initialData.extra.toString());
            }
        }
    }, [initialData]);

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

            // Relaxed checks to accept 0 as valid input
            if (data.cost !== undefined && data.cost !== null) setCost(data.cost.toString());

            if (data.tax !== undefined && data.tax !== null) {
                setTax(data.tax.toString());
                setReverseTax(data.tax.toString());
            }
            if (data.markup !== undefined && data.markup !== null) setMarkup(data.markup.toString());
            if (data.extra !== undefined && data.extra !== null) setExtra(data.extra.toString());

            if (data.targetPrice !== undefined && data.targetPrice !== null) setTargetPrice(data.targetPrice.toString());
            if (data.desiredMargin !== undefined && data.desiredMargin !== null) setDesiredMargin(data.desiredMargin.toString());
            if (data.shipping !== undefined && data.shipping !== null) setShipping(data.shipping.toString());

            setPlatform('manual');
            setChatInput('');

            // Force scroll to bottom to show results
            setTimeout(() => {
                const container = document.querySelector('.overflow-y-auto');
                if (container) container.scrollTop = container.scrollHeight;
            }, 100);

        } catch (error) {
            console.error(error);
            alert("Erro no Chat IA: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Standard Calculation Effect
    useEffect(() => {
        const costVal = parseFloat(cost);
        const taxVal = parseFloat(tax) || 0;
        const markupVal = parseFloat(markup) || 0;
        const extraVal = parseFloat(extra) || 0;

        if (!isNaN(costVal) && costVal >= 0) {
            // Logic:
            // 1. Base Cost = Cost + Extra
            // 2. Desired Net Revenue = Base Cost * (1 + Markup/100)
            // 3. Gross Price = Desired Net Revenue / (1 - Tax/100)
            // But usually markup is on cost.

            // Simple Markup on Cost:
            // Price = Cost * (1 + Markup)
            // Net = Price * (1 - Tax)
            // Profit = Net - Cost

            // Better formula for "I want 50% markup on cost":
            // Selling Price so that Profit = 50% of Cost? Or Margin?
            // "Markup 50%" usually means Price = Cost * 1.5.

            // Let's use:
            // Price = Cost * (1 + Markup/100) / (1 - Tax/100)
            // This ensures the markup is preserved AFTER tax? 
            // example: Cost 100. Markup 50%. Net needed 150. Tax 10%. Price = 150 / 0.9 = 166.66.
            // 166.66 * 0.9 = 150. Profit 50. 50/100 = 50%. Correct.

            const totalCost = costVal + extraVal;
            const taxMultiplier = 1 - (taxVal / 100);

            // Avoid division by zero if tax is 100% (unlikely but safe)
            if (taxMultiplier <= 0.01) {
                setResult(null);
                return;
            }

            const finalPrice = (totalCost * (1 + markupVal / 100)) / taxMultiplier;
            const taxAmount = finalPrice * (taxVal / 100);
            const profit = finalPrice - taxAmount - totalCost;
            const margin = (profit / finalPrice) * 100;

            setResult({
                finalPrice,
                profit,
                margin,
                taxAmount
            });
        } else {
            setResult(null);
        }
    }, [cost, tax, markup, extra]);

    // Reverse Calculation Effect
    useEffect(() => {
        const targetVal = parseFloat(targetPrice);
        const marginVal = parseFloat(desiredMargin) || 0;
        const taxVal = parseFloat(reverseTax) || 0;
        const shippingVal = parseFloat(shipping) || 0;

        if (!isNaN(targetVal) && targetVal > 0) {
            // Logic:
            // Revenue = Target * (1 - Tax/100)
            // Desired Profit = Target * (Margin/100)
            // Max Cost = Revenue - Desired Profit - Shipping

            const taxAmount = targetVal * (taxVal / 100);
            const netRevenue = targetVal - taxAmount;
            const desiredProfitAmount = targetVal * (marginVal / 100);
            const maxCost = netRevenue - desiredProfitAmount - shippingVal;

            setReverseResult({
                maxCost,
                profitAmount: desiredProfitAmount,
                isViable: maxCost > 0,
                taxAmount
            });
        } else {
            setReverseResult(null);
        }
    }, [targetPrice, desiredMargin, reverseTax, shipping]);

    // standard/reverse logic (omitted in previous view but assumed present or managed by existing hooks)

    const hasResult = result || reverseResult;
    const isExpanded = mode === 'chat' && hasResult;

    return (
        <div className={`node-glow transition-all duration-500 ease-in-out ${isExpanded ? 'w-[750px]' : 'w-[360px]'}`}>
            <div className="node-inner bg-white overflow-hidden flex flex-col h-[800px] relative">
                {/* Header / Toggles - Always spans full width */}
                <div className="p-4 bg-gray-50 border-b border-gray-100 shrink-0 cursor-move group/header relative">
                    {/* Move Indicator Glow */}
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

                    <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200 mb-4 max-w-[330px]">
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

                    <div className="grid grid-cols-5 gap-1.5 max-w-[330px]">
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

                <div className="flex-1 overflow-hidden flex">
                    {/* Left Panel: Inputs & Chat (Always Visible) */}
                    <div className="w-[360px] flex flex-col border-r border-gray-100 shrink-0">
                        <div className="flex-1 overflow-y-auto p-5 scrollbar-hide">
                            {mode === 'chat' ? (
                                <div className="h-full flex flex-col">
                                    <div className="space-y-4 flex-1">
                                        <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Sparkles size={14} className="text-indigo-600" />
                                                <span className="text-[10px] font-black uppercase text-indigo-700">Modo Chat Inteligente</span>
                                            </div>
                                            <p className="text-[10px] text-indigo-600/80 leading-relaxed italic">
                                                "Peça cálculos complexos. Ex: Comprei por 50, quero 30% de margem."
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <form onSubmit={handleChatSubmit} className="relative">
                                            <textarea
                                                value={chatInput}
                                                onChange={(e) => setChatInput(e.target.value)}
                                                placeholder="Digite aqui..."
                                                className="w-full h-24 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold text-gray-900 pr-12 outline-none focus:border-indigo-500 resize-none leading-relaxed"
                                            />
                                            <button type="submit" disabled={loading} className="absolute right-2 bottom-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                                                {loading ? <RefreshCw size={14} className="animate-spin" /> : <MessageSquare size={14} />}
                                            </button>
                                        </form>
                                        <div className="mt-2 flex items-center gap-2 justify-center opacity-50">
                                            <ShieldCheck size={10} className="text-gray-400" />
                                            <span className="text-[8px] font-bold text-gray-400 uppercase">Powered by Gemini 2.5 Flash</span>
                                        </div>
                                    </div>
                                </div>
                            ) : mode === 'standard' ? (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-600 uppercase flex items-center gap-2">
                                            <DollarSign size={12} className="text-indigo-500" /> Custo Produto (R$)
                                        </label>
                                        <input type="number" value={cost} onChange={(e) => setCost(e.target.value)} className="w-full bg-gray-50 border border-transparent focus:border-indigo-500 rounded-xl py-3 px-4 text-sm font-bold text-gray-900 outline-none transition-all focus:bg-white focus:shadow-sm" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-600 uppercase flex items-center gap-2">
                                                <TrendingUp size={12} className="text-indigo-500" /> Markup (%)
                                            </label>
                                            <input type="number" value={markup} onChange={(e) => setMarkup(e.target.value)} className="w-full bg-gray-50 border border-transparent focus:border-indigo-500 rounded-xl py-3 px-4 text-sm font-bold text-gray-900 outline-none transition-all focus:bg-white focus:shadow-sm" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-600 uppercase flex items-center gap-2">
                                                <Percent size={12} className="text-indigo-500" /> Taxas (%)
                                            </label>
                                            <input type="number" value={tax} onChange={(e) => { setTax(e.target.value); setPlatform('manual'); }} className="w-full bg-gray-50 border border-transparent focus:border-indigo-500 rounded-xl py-3 px-4 text-sm font-bold text-gray-900 outline-none transition-all focus:bg-white focus:shadow-sm" />
                                        </div>
                                    </div>
                                    {/* Standard Results Inline (if not chat mode or simple view) */}
                                    {result && !isExpanded && (
                                        <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100 mt-6">
                                            <div className="flex justify-between items-end border-b border-indigo-200 pb-3 mb-3">
                                                <span className="text-[10px] font-black text-indigo-600 uppercase">Venda Sugerida</span>
                                                <span className="text-2xl font-black text-indigo-700">R$ {result.finalPrice.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-xs items-center">
                                                <span className="text-gray-500 font-bold">LUCRO: <span className="text-emerald-600">R$ {result.profit.toFixed(2)}</span></span>
                                                <span className="text-gray-500 font-bold">MARGEM: <span className="text-gray-900">{result.margin.toFixed(1)}%</span></span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-purple-600 uppercase text-center block">Preço Alvo de Venda</label>
                                        <div className="relative">
                                            <Target size={16} className="absolute left-4 top-3 text-purple-400" />
                                            <input type="number" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} className="w-full bg-purple-50 text-center border border-transparent focus:border-purple-500 rounded-xl py-3 pl-10 pr-4 text-sm font-bold text-gray-900 outline-none transition-all focus:bg-white focus:shadow-sm" placeholder="Ex: 99.90" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-600 uppercase">Margem Alvo (%)</label>
                                            <input type="number" value={desiredMargin} onChange={(e) => setDesiredMargin(e.target.value)} className="w-full bg-gray-50 border border-transparent focus:border-purple-500 rounded-xl py-3 px-4 text-sm font-bold text-gray-900 outline-none transition-all focus:bg-white focus:shadow-sm" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-600 uppercase">Taxas (%)</label>
                                            <input type="number" value={reverseTax} onChange={(e) => { setReverseTax(e.target.value); setPlatform('manual'); }} className="w-full bg-gray-50 border border-transparent focus:border-purple-500 rounded-xl py-3 px-4 text-sm font-bold text-gray-900 outline-none transition-all focus:bg-white focus:shadow-sm" />
                                        </div>
                                    </div>
                                    {reverseResult && !isExpanded && (
                                        <div className={`p-5 rounded-2xl border mt-6 ${reverseResult.isViable ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                                            <div className="flex justify-between items-end border-b border-gray-200/50 pb-3 mb-3">
                                                <span className="text-[10px] font-black text-gray-600 uppercase">Custo Máximo</span>
                                                <span className={`text-2xl font-black ${reverseResult.isViable ? 'text-emerald-700' : 'text-red-600'}`}>
                                                    {reverseResult.isViable ? `R$ ${reverseResult.maxCost.toFixed(2)}` : 'Inviável'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 font-bold uppercase text-center">Lucro Real Estimado: R$ {reverseResult.profitAmount.toFixed(2)}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {/* Footer Sync */}
                        <div className="p-3 bg-gray-50 border-t border-gray-100 shrink-0">
                            <p className="text-[8px] text-gray-400 font-black text-center uppercase tracking-widest flex items-center justify-center gap-1">
                                <ShieldCheck size={10} /> Sincronizado e Draggable
                            </p>
                        </div>
                    </div>

                    {/* Right Panel: Expanded Results (Only visible in Chat Mode with Result) */}
                    {isExpanded && (
                        <div className="flex-1 bg-gray-50/50 p-6 flex flex-col animate-in fade-in slide-in-from-left-4 duration-500">
                            <div className="flex items-center gap-2 mb-6">
                                <span className="h-6 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full" />
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Análise de Lucratividade</h3>
                            </div>

                            <div className="flex-1 space-y-6">
                                {result && (
                                    <div className="space-y-6">
                                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-indigo-100">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Preço de Venda Sugerido</p>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-4xl font-black text-indigo-600">R$ {result.finalPrice.toFixed(2)}</span>
                                                <span className="text-xs font-bold text-gray-400">/unidade</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                                                <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">Lucro Líquido</p>
                                                <p className="text-xl font-black text-emerald-700">R$ {result.profit.toFixed(2)}</p>
                                            </div>
                                            <div className="bg-white p-4 rounded-2xl border border-gray-200">
                                                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Margem</p>
                                                <p className="text-xl font-black text-gray-900">{result.margin.toFixed(1)}%</p>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-2xl border border-gray-200 p-4">
                                            <h4 className="text-[10px] font-black text-gray-900 uppercase mb-4 px-1">Detalhamento de Custos</h4>
                                            <div className="space-y-3">
                                                <div className="flex justify-between text-xs items-center px-1">
                                                    <span className="text-gray-500 font-medium flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /> Custo Base</span>
                                                    <span className="font-bold text-gray-900">R$ {cost}</span>
                                                </div>
                                                <div className="flex justify-between text-xs items-center px-1">
                                                    <span className="text-gray-500 font-medium flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500" /> Impostos ({tax}%)</span>
                                                    <span className="font-bold text-gray-900">R$ {result.taxAmount.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between text-xs items-center px-1 pt-2 border-t border-gray-100">
                                                    <span className="text-gray-500 font-medium">Custo Total Global</span>
                                                    <span className="font-bold text-gray-900">R$ {(Number(result.finalPrice) - Number(result.profit)).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {reverseResult && !result && (
                                    <div className="space-y-6">
                                        <div className={`p-6 rounded-3xl shadow-sm border ${reverseResult.isViable ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                                            <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${reverseResult.isViable ? 'text-emerald-600' : 'text-red-500'}`}>
                                                {reverseResult.isViable ? 'Custo Máximo Permitido' : 'Operação Inviável'}
                                            </p>
                                            <div className="flex items-baseline gap-2">
                                                <span className={`text-4xl font-black ${reverseResult.isViable ? 'text-emerald-700' : 'text-red-600'}`}>
                                                    {reverseResult.isViable ? `R$ ${reverseResult.maxCost.toFixed(2)}` : 'Prejuízo'}
                                                </span>
                                            </div>
                                            {!reverseResult.isViable && (
                                                <p className="text-xs font-bold text-red-400 mt-2">Você precisaria pagar para vender este produto com essas taxas.</p>
                                            )}
                                        </div>

                                        <div className="bg-white rounded-2xl border border-gray-200 p-5">
                                            <p className="text-[10px] font-black text-gray-400 uppercase mb-4">Simulação de Cenário</p>
                                            <div className="space-y-3 text-xs">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Se vender por:</span>
                                                    <span className="font-bold text-gray-900">R$ {targetPrice}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Com margem de:</span>
                                                    <span className="font-bold text-gray-900">{desiredMargin}%</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Pagando impostos de:</span>
                                                    <span className="font-bold text-gray-900">{reverseTax}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

};

export default CalculatorNode;
