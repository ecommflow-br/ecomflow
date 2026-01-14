import React, { useState, useEffect } from 'react';
import { TrendingUp, Percent, Package, DollarSign, ArrowRight, Calculator } from 'lucide-react';

const platforms = [
    { id: 'shopee', name: 'Shopee', tax: 20, trans: 5 },
    { id: 'ml', name: 'Mercado Livre', tax: 19, trans: 6 },
    { id: 'amazon', name: 'Amazon', tax: 15, trans: 0 },
    { id: 'magalu', name: 'Magalu', tax: 16, trans: 5 }
];

export default function ProfitCalculator() {
    const [cost, setCost] = useState(100);
    const [markup, setMarkup] = useState(100);
    const [shipping, setShipping] = useState(0);
    const [otherCosts, setOtherCosts] = useState(0);
    const [platform, setPlatform] = useState(platforms[0]);
    const [manualTax, setManualTax] = useState('');

    const sellPrice = cost * (1 + markup / 100);
    const currentTax = manualTax ? parseFloat(manualTax) : platform.tax;
    const platformFee = (sellPrice * currentTax) / 100 + platform.trans;
    const taxes = (sellPrice * 0.04); // Simples Nacional estimativa
    const profit = sellPrice - cost - shipping - otherCosts - platformFee - taxes;
    const roi = (profit / (cost + shipping + otherCosts)) * 100;

    const generateTableData = () => {
        const margins = [20, 40, 60, 80, 100, 150, 200];
        return margins.map(m => {
            const price = cost * (1 + m / 100);
            const fee = (price * currentTax) / 100 + platform.trans;
            const tx = price * 0.04;
            const net = price - cost - shipping - otherCosts - fee - tx;
            const r = (net / (cost + shipping + otherCosts)) * 100;
            return { margin: m, price, net, roi: r };
        });
    };

    const tableData = generateTableData();

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Coluna 1: Parâmetros */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass p-6 space-y-6">
                        <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                            <Calculator className="text-indigo-600" size={20} /> Parâmetros
                        </h2>

                        <div className="space-y-4">
                            <label className="block">
                                <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Custo do Produto (R$)</span>
                                <input
                                    type="number"
                                    value={cost}
                                    onChange={(e) => setCost(Number(e.target.value))}
                                    className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 mt-1 focus:border-indigo-500 outline-none text-gray-800 font-medium"
                                />
                            </label>

                            <div className="grid grid-cols-2 gap-4">
                                <label className="block">
                                    <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Frete (R$)</span>
                                    <input
                                        type="number"
                                        value={shipping}
                                        onChange={(e) => setShipping(Number(e.target.value))}
                                        className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-2 mt-1 focus:border-indigo-500 outline-none text-gray-800"
                                    />
                                </label>
                                <label className="block">
                                    <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Outros (R$)</span>
                                    <input
                                        type="number"
                                        value={otherCosts}
                                        onChange={(e) => setOtherCosts(Number(e.target.value))}
                                        className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-2 mt-1 focus:border-indigo-500 outline-none text-gray-800"
                                    />
                                </label>
                            </div>

                            <label className="block">
                                <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Margem Desejada (%)</span>
                                <div className="flex items-center gap-4 mt-1">
                                    <input
                                        type="range"
                                        min="10" max="300"
                                        value={markup}
                                        onChange={(e) => setMarkup(Number(e.target.value))}
                                        className="flex-1 accent-indigo-600"
                                    />
                                    <span className="w-12 font-bold text-indigo-600">{markup}%</span>
                                </div>
                            </label>

                            <div className="space-y-2">
                                <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider text-center block">Marketplace</span>
                                <div className="grid grid-cols-2 gap-2">
                                    {platforms.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => { setPlatform(p); setManualTax(''); }}
                                            className={`p-2 rounded-lg border transition-all text-xs font-bold ${platform.id === p.id && !manualTax ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 border-transparent' : 'bg-white border-gray-200 hover:border-indigo-300 text-gray-600'}`}
                                        >
                                            {p.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <label className="block">
                                <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Taxa Marketplace Manual (%)</span>
                                <input
                                    type="number"
                                    placeholder="Ex: 18"
                                    value={manualTax}
                                    onChange={(e) => setManualTax(e.target.value)}
                                    className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-2 mt-1 focus:border-indigo-500 outline-none text-gray-800"
                                />
                            </label>
                        </div>
                    </div>
                </div>

                {/* Coluna 2: Resultados Principais */}
                <div className="lg:col-span-2 space-y-6">
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
                </div>
            </div>
        </div>
    );
}
