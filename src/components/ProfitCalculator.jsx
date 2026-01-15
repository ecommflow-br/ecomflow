import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign, Percent, TrendingUp, Package, RefreshCw, Target } from 'lucide-react';

const ProfitCalculator = () => {
    const [mode, setMode] = useState('standard'); // 'standard' or 'reverse'
    const [platform, setPlatform] = useState('manual');

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

    // Standard Calculation
    useEffect(() => {
        const costVal = parseFloat(cost) || 0;
        const taxVal = parseFloat(tax) || 0;
        const markupVal = parseFloat(markup) || 0;
        const extraVal = parseFloat(extra) || 0;

        if (costVal > 0) {
            const totalCost = costVal + extraVal;
            const finalPrice = totalCost * (1 + markupVal / 100);
            const taxAmount = finalPrice * (taxVal / 100);
            const profit = finalPrice - totalCost - taxAmount;
            const margin = finalPrice > 0 ? (profit / finalPrice) * 100 : 0;

            setResult({
                finalPrice,
                taxAmount,
                profit,
                margin
            });
        } else {
            setResult(null);
        }
    }, [cost, tax, markup, extra]);

    // Reverse Calculation
    useEffect(() => {
        const priceVal = parseFloat(targetPrice) || 0;
        const marginVal = parseFloat(desiredMargin) || 0;
        const taxVal = parseFloat(reverseTax) || 0;
        const shipVal = parseFloat(shipping) || 0;

        if (priceVal > 0) {
            const taxAmount = priceVal * (taxVal / 100);
            const profitAmount = priceVal * (marginVal / 100);
            const maxCost = priceVal - taxAmount - shipVal - profitAmount;

            setReverseResult({
                maxCost,
                taxAmount,
                profitAmount,
                isViable: maxCost > 0
            });
        } else {
            setReverseResult(null);
        }
    }, [targetPrice, desiredMargin, reverseTax, shipping]);

    return (
        <div className="w-full max-w-sm mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col h-[600px]">
            {/* Header / Toggles */}
            <div className="p-4 bg-gray-50 border-b border-gray-100 shrink-0">
                <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200 mb-4">
                    <button
                        onClick={() => setMode('standard')}
                        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${mode === 'standard' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
                    >
                        Calculadora
                    </button>
                    <button
                        onClick={() => setMode('reverse')}
                        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${mode === 'reverse' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
                    >
                        Preço Reverso
                    </button>
                </div>

                {/* Platform Selector Grid */}
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-2 text-center">Selecionar Marketplace</p>
                <div className="grid grid-cols-5 gap-1.5 px-0.5">
                    {Object.entries(platforms).map(([id, info]) => (
                        <button
                            key={id}
                            onClick={() => handlePlatformChange(id)}
                            className={`py-2 px-1 rounded-lg border text-[9px] font-black transition-all ${platform === id
                                ? 'bg-black text-white border-black shadow-lg scale-105'
                                : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'}`}
                        >
                            {info.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">

                {/* STANDARD MODE */}
                {mode === 'standard' ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-500 uppercase">Custo do Produto (R$)</label>
                            <div className="relative">
                                <DollarSign size={16} className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="number"
                                    value={cost}
                                    onChange={(e) => setCost(e.target.value)}
                                    className="w-full bg-gray-50 rounded-xl py-2.5 pl-9 pr-4 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all border border-transparent focus:border-indigo-500"
                                    placeholder="0,00"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-500 uppercase">Markup (%)</label>
                                <div className="relative">
                                    <TrendingUp size={16} className="absolute left-3 top-3 text-indigo-400" />
                                    <input type="number" value={markup} onChange={(e) => setMarkup(e.target.value)} className="w-full bg-gray-50 rounded-xl py-2.5 pl-9 pr-4 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500/20 border border-transparent focus:border-indigo-500" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-500 uppercase">Taxas/Impostos (%)</label>
                                <div className="relative">
                                    <Percent size={16} className="absolute left-3 top-3 text-red-400" />
                                    <input
                                        type="number"
                                        value={tax}
                                        onChange={(e) => {
                                            setTax(e.target.value);
                                            setPlatform('manual');
                                        }}
                                        className="w-full bg-gray-50 rounded-xl py-2.5 pl-9 pr-4 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500/20 border border-transparent focus:border-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-500 uppercase">Custos Extras (Embalagem/R$) </label>
                            <div className="relative">
                                <Package size={16} className="absolute left-3 top-3 text-orange-400" />
                                <input type="number" value={extra} onChange={(e) => setExtra(e.target.value)} className="w-full bg-gray-50 rounded-xl py-2.5 pl-9 pr-4 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500/20 border border-transparent focus:border-indigo-500" />
                            </div>
                        </div>

                        {result && (
                            <div className="mt-6 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-3 shadow-inner">
                                <div className="flex justify-between items-end pb-2 border-b border-indigo-200">
                                    <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Venda Sugerida</span>
                                    <span className="text-2xl font-black text-indigo-700">R$ {result.finalPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-600">
                                    <span className="font-medium">Lucro Líquido:</span>
                                    <span className="font-black text-emerald-600">+R$ {result.profit.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-600">
                                    <span className="font-medium">Margem Líquida:</span>
                                    <span className="font-black text-gray-800">{result.margin.toFixed(1)}%</span>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* REVERSE MODE */
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-purple-600 uppercase">Preço Alvo de Venda (R$)</label>
                            <div className="relative">
                                <Target size={16} className="absolute left-3 top-3 text-purple-400" />
                                <input
                                    type="number"
                                    value={targetPrice}
                                    onChange={(e) => setTargetPrice(e.target.value)}
                                    className="w-full bg-purple-50 rounded-xl py-2.5 pl-9 pr-4 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-purple-500/20 transition-all border border-transparent focus:border-purple-500"
                                    placeholder="Ex: 99.90"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-500 uppercase">Lucro Desejado (%)</label>
                                <div className="relative">
                                    <TrendingUp size={16} className="absolute left-3 top-3 text-emerald-400" />
                                    <input type="number" value={desiredMargin} onChange={(e) => setDesiredMargin(e.target.value)} className="w-full bg-gray-50 rounded-xl py-2.5 pl-9 pr-4 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-purple-500/20 border border-transparent focus:border-purple-500" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-500 uppercase">Taxas (%)</label>
                                <div className="relative">
                                    <Percent size={16} className="absolute left-3 top-3 text-red-400" />
                                    <input
                                        type="number"
                                        value={reverseTax}
                                        onChange={(e) => {
                                            setReverseTax(e.target.value);
                                            setPlatform('manual');
                                        }}
                                        className="w-full bg-gray-50 rounded-xl py-2.5 pl-9 pr-4 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-purple-500/20 border border-transparent focus:border-purple-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-500 uppercase">Frete/Extras (R$)</label>
                            <div className="relative">
                                <Package size={16} className="absolute left-3 top-3 text-orange-400" />
                                <input type="number" value={shipping} onChange={(e) => setShipping(e.target.value)} className="w-full bg-gray-50 rounded-xl py-2.5 pl-9 pr-4 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-purple-500/20 border border-transparent focus:border-purple-500" />
                            </div>
                        </div>

                        {reverseResult && (
                            <div className={`mt-6 p-4 rounded-2xl border space-y-3 transition-colors shadow-inner ${reverseResult.isViable ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                                <div className="flex justify-between items-end pb-2 border-b border-gray-200/50">
                                    <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">Custo Máximo Permitido</span>
                                    <span className={`text-2xl font-black ${reverseResult.isViable ? 'text-emerald-700' : 'text-red-600'}`}>
                                        {reverseResult.isViable ? `R$ ${reverseResult.maxCost.toFixed(2)}` : 'Inviável'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-600">
                                    <span className="font-medium">Seu Lucro Real Estimado:</span>
                                    <span className="font-black text-gray-800">R$ {reverseResult.profitAmount.toFixed(2)}</span>
                                </div>
                                {!reverseResult.isViable && (
                                    <p className="text-[10px] text-red-500 font-black text-center mt-2 uppercase tracking-tight">Custos excedem o preço de venda alvo!</p>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 shrink-0 flex justify-center">
                <p className="text-[10px] text-gray-400 font-black flex items-center gap-1.5 uppercase tracking-widest">
                    <RefreshCw size={12} className="animate-spin-slow" /> Tempo Real
                </p>
            </div>
        </div>
    );
};


export default ProfitCalculator;
