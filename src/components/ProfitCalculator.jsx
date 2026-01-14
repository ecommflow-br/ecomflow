import React, { useState, useEffect } from 'react';
import { TrendingUp, Percent, Package, DollarSign, ArrowRight } from 'lucide-react';

const platforms = [
    { id: 'shopee', name: 'Shopee', tax: 20, trans: 5 },
    { id: 'ml', name: 'Mercado Livre', tax: 19, trans: 6 },
    { id: 'amazon', name: 'Amazon', tax: 15, trans: 0 },
    { id: 'magalu', name: 'Magalu', tax: 16, trans: 5 }
];

export default function ProfitCalculator() {
    const [cost, setCost] = useState(100);
    const [markup, setMarkup] = useState(100);
    const [platform, setPlatform] = useState(platforms[0]);
    const [manualTax, setManualTax] = useState('');

    const sellPrice = cost * (1 + markup / 100);
    const currentTax = manualTax ? parseFloat(manualTax) : platform.tax;
    const platformFee = (sellPrice * currentTax) / 100 + platform.trans;
    const taxes = (sellPrice * 0.04); // Simples
    const profit = sellPrice - cost - platformFee - taxes;
    const roi = (profit / cost) * 100;

    return (
        <div className="max-w-4xl mx-auto p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass p-8 space-y-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Calculator className="text-indigo-500" /> Parâmetros
                    </h2>

                    <div className="space-y-4">
                        <label className="block">
                            <span className="text-white/60 text-sm">Custo do Produto (R$)</span>
                            <input
                                type="number"
                                value={cost}
                                onChange={(e) => setCost(Number(e.target.value))}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mt-1 focus:border-indigo-500 outline-none"
                            />
                        </label>

                        <label className="block">
                            <span className="text-white/60 text-sm">Margem Desejada (%)</span>
                            <div className="flex items-center gap-4 mt-1">
                                <input
                                    type="range"
                                    min="10" max="300"
                                    value={markup}
                                    onChange={(e) => setMarkup(Number(e.target.value))}
                                    className="flex-1 accent-indigo-500"
                                />
                                <span className="w-12 font-bold">{markup}%</span>
                            </div>
                        </label>

                        <div className="space-y-2">
                            <span className="text-white/60 text-sm">Plataforma</span>
                            <div className="grid grid-cols-2 gap-2">
                                {platforms.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => { setPlatform(p); setManualTax(''); }}
                                        className={`p-3 rounded-xl border transition-all text-sm ${platform.id === p.id && !manualTax ? 'bg-indigo-600 border-indigo-500' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                                    >
                                        {p.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <label className="block">
                            <span className="text-white/60 text-sm">Comissão Manual (%)</span>
                            <input
                                type="number"
                                placeholder="Ex: 18"
                                value={manualTax}
                                onChange={(e) => setManualTax(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mt-1 focus:border-indigo-500 outline-none"
                            />
                        </label>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass p-8 bg-indigo-600/10 border-indigo-500/20">
                        <span className="text-white/60 text-sm">Preço de Venda Sugerido</span>
                        <div className="text-4xl font-bold mt-1 text-indigo-400">R$ {sellPrice.toFixed(2)}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="glass p-6">
                            <span className="text-white/60 text-xs">Lucro Líquido</span>
                            <div className={`text-xl font-bold mt-1 ${profit > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                R$ {profit.toFixed(2)}
                            </div>
                        </div>
                        <div className="glass p-6">
                            <span className="text-white/60 text-xs">ROI</span>
                            <div className={`text-xl font-bold mt-1 ${roi > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {roi.toFixed(1)}%
                            </div>
                        </div>
                    </div>

                    <div className="glass p-6 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-white/40">Tarifa Marketplace</span>
                            <span>R$ {platformFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-white/40">Impostos (Estimado)</span>
                            <span>R$ {taxes.toFixed(2)}</span>
                        </div>
                        <div className="h-px bg-white/5" />
                        <div className="flex justify-between font-bold">
                            <span>Total Deduções</span>
                            <span className="text-red-400">R$ {(platformFee + taxes).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
