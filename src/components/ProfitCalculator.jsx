import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign, Percent, TrendingUp, Package, ArrowRight, RefreshCw, Target } from 'lucide-react';

const ProfitCalculator = () => {
    const [mode, setMode] = useState('standard'); // 'standard' or 'reverse'

    // Standard Mode State
    const [cost, setCost] = useState('');
    const [tax, setTax] = useState('11'); // Taxa padrão (ex: Simples + Mktplace)
    const [markup, setMarkup] = useState('50'); // Margem desejada sobre o custo
    const [extra, setExtra] = useState('0'); // Custos extras (embalagem, brinde)

    // Reverse Mode State
    const [targetPrice, setTargetPrice] = useState('');
    const [desiredMargin, setDesiredMargin] = useState('20'); // Margem líquida desejada (%)
    const [reverseTax, setReverseTax] = useState('18'); // Shopee com frete grátis geralmente é maior
    const [shipping, setShipping] = useState('0');

    // Results
    const [result, setResult] = useState(null);
    const [reverseResult, setReverseResult] = useState(null);

    // Standard Calculation
    useEffect(() => {
        const costVal = parseFloat(cost) || 0;
        const taxVal = parseFloat(tax) || 0;
        const markupVal = parseFloat(markup) || 0;
        const extraVal = parseFloat(extra) || 0;

        if (costVal > 0) {
            // Price = (Cost + Extra) * (1 + Markup/100) / (1 - Tax/100) ? 
            // Simplified Logic: 
            // 1. Base Cost = Cost + Extra
            // 2. Sell Price to cover everything + Markup?
            // Let's use a standard Markup on Cost pricing model:

            const totalCost = costVal + extraVal;
            // Selling Price = Total Cost * (1 + Markup%)
            // BUT taxes are usually on Selling Price. 
            // Formula: Price = (Total Cost * (1 + Profit%)) / (1 - Tax%)

            // Let's stick to a simpler Markup Multiplier first, which is common in BR "Mark-up"
            // Price = TotalCost * (1 + Markup/100)
            // But we must deduct tax to see REAL profit.

            const finalPrice = totalCost * (1 + markupVal / 100);
            const taxAmount = finalPrice * (taxVal / 100);
            const profit = finalPrice - totalCost - taxAmount;
            const margin = (profit / finalPrice) * 100;

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
            // Logic: I want to sell at Price X.
            // Deduct Taxes (X * Tax%)
            // Deduct Shipping (Fixed)
            // Deduct Desired Profit (X * Margin%)
            // What remains is my MAX COST.

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
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col h-[500px]">
            {/* Header / Toggles */}
            <div className="p-4 bg-gray-50 border-b border-gray-100">
                <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200">
                    <button
                        onClick={() => setMode('standard')}
                        className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${mode === 'standard' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Calculadora
                    </button>
                    <button
                        onClick={() => setMode('reverse')}
                        className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${mode === 'reverse' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Simulador Reverso
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">

                {/* STANDARD MODE */}
                {mode === 'standard' ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Custo do Produto (R$)</label>
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
                                <label className="text-xs font-bold text-gray-500 uppercase">Markup (%)</label>
                                <div className="relative">
                                    <TrendingUp size={16} className="absolute left-3 top-3 text-indigo-400" />
                                    <input type="number" value={markup} onChange={(e) => setMarkup(e.target.value)} className="w-full bg-gray-50 rounded-xl py-2.5 pl-9 pr-4 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500/20 border border-transparent focus:border-indigo-500" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Impostos (%)</label>
                                <div className="relative">
                                    <Percent size={16} className="absolute left-3 top-3 text-red-400" />
                                    <input type="number" value={tax} onChange={(e) => setTax(e.target.value)} className="w-full bg-gray-50 rounded-xl py-2.5 pl-9 pr-4 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500/20 border border-transparent focus:border-indigo-500" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Custos Extras (R$)</label>
                            <div className="relative">
                                <Package size={16} className="absolute left-3 top-3 text-orange-400" />
                                <input type="number" value={extra} onChange={(e) => setExtra(e.target.value)} className="w-full bg-gray-50 rounded-xl py-2.5 pl-9 pr-4 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500/20 border border-transparent focus:border-indigo-500" />
                            </div>
                        </div>

                        {result && (
                            <div className="mt-6 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-3">
                                <div className="flex justify-between items-end pb-2 border-b border-indigo-200">
                                    <span className="text-xs text-indigo-600 font-bold uppercase tracking-wider">Preço de Venda</span>
                                    <span className="text-2xl font-black text-indigo-700">R$ {result.finalPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-600">
                                    <span>Lucro Líquido:</span>
                                    <span className="font-bold text-emerald-600">+R$ {result.profit.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-600">
                                    <span>Margem:</span>
                                    <span className="font-bold">{result.margin.toFixed(1)}%</span>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (

                    {/* Coluna 2: Resultados Principais */ }
                    < div className = "lg:col-span-2 space-y-6" >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass p-8 bg-indigo-600 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <TrendingUp size={80} />
                        </div>
                        <span className="text-indigo-100 text-xs font-bold uppercase tracking-widest opacity-80">Preço de Venda Sugerido</span>
                        <div className="text-5xl font-black mt-2 tracking-tight">R$ {sellPrice.toFixed(2)}</div>
                        <div className="mt-4 flex items-center gap-2 text-indigo-100 text-sm italic">
                            <Sparkles size={16} /> Ajustado com sua margem de {markup}%
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="glass p-6 flex justify-between items-center border-emerald-100">
                            <div>
                                <span className="text-gray-400 text-xs font-bold uppercase block mb-1">Lucro Líquido</span>
                                <div className={`text-3xl font-black ${profit > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                    R$ {profit.toFixed(2)}
                                </div>
                            </div>
                            <div className={`p-3 rounded-2xl ${profit > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                                <DollarSign size={24} />
                            </div>
                        </div>
                        <div className="glass p-6 flex justify-between items-center border-indigo-100">
                            <div>
                                <span className="text-gray-400 text-xs font-bold uppercase block mb-1">Retorno (ROI)</span>
                                <div className={`text-3xl font-black ${roi > 0 ? 'text-indigo-600' : 'text-red-500'}`}>
                                    {roi.toFixed(1)}%
                                </div>
                            </div>
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                                <Percent size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabela de Preços Dinâmica */}
                <div className="glass overflow-hidden border-gray-100">
                    <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2 italic">
                            <TrendingUp size={16} className="text-indigo-500" /> Simulação de Escala de Preços
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-[10px] uppercase font-bold text-gray-400 border-b border-gray-50">
                                    <th className="px-6 py-4">Margem</th>
                                    <th className="px-6 py-4">Venda</th>
                                    <th className="px-6 py-4">Lucro</th>
                                    <th className="px-6 py-4">ROI</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {tableData.map((row, idx) => (
                                    <tr key={idx} className="border-b border-gray-50/50 hover:bg-indigo-50/30 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-500">{row.margin}%</td>
                                        <td className="px-6 py-4 font-black text-gray-800">R$ {row.price.toFixed(2)}</td>
                                        <td className={`px-6 py-4 font-bold ${row.net > 0 ? 'text-emerald-500' : 'text-red-400'}`}>R$ {row.net.toFixed(2)}</td>
                                        <td className={`px-6 py-4 font-bold ${row.roi > 0 ? 'text-indigo-500' : 'text-red-400'}`}>{row.roi.toFixed(0)}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="glass p-6 space-y-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Detalhamento de Custos</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-4 bg-gray-50 rounded-2xl">
                            <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Taxas Marketplace</span>
                            <span className="text-lg font-bold text-gray-700">R$ {platformFee.toFixed(2)}</span>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl">
                            <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Impostos (4%)</span>
                            <span className="text-lg font-bold text-gray-700">R$ {taxes.toFixed(2)}</span>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Custo Total Operacional</span>
                            <span className="text-lg font-bold text-indigo-600">R$ {(cost + shipping + otherCosts + platformFee + taxes).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div >
        </div >
        </div >
    );
}
