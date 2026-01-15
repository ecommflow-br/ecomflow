import React, { useState, useEffect } from 'react';
import { DollarSign, ArrowRight, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const MiniPriceNode = () => {
    const [mode, setMode] = useState('standard'); // 'standard' or 'reverse'
    const [cost, setCost] = useState('');
    const [margin, setMargin] = useState(30);
    const [price, setPrice] = useState(0);

    // Reverse State
    const [targetPrice, setTargetPrice] = useState('');
    const [maxCost, setMaxCost] = useState(0);
    const [tax, setTax] = useState(15);

    useEffect(() => {
        if (mode === 'standard') {
            const c = parseFloat(cost) || 0;
            const m = parseFloat(margin) || 0;
            const p = c * (1 + m / 100);
            setPrice(p);
        } else {
            const tp = parseFloat(targetPrice) || 0;
            const m = parseFloat(margin) || 0;
            const t = parseFloat(tax) || 0;
            // MaxCost = Price - Tax(%) - Margin(%)
            const mc = tp * (1 - (t / 100) - (m / 100));
            setMaxCost(mc);
        }
    }, [cost, margin, targetPrice, tax, mode]);

    return (
        <div className="node-glow w-[320px] z-50">
            <div className="node-inner p-5 shadow-2xl relative bg-white overflow-hidden">
                {/* Mode Toggle */}
                <div className="flex bg-gray-100 p-1 rounded-xl mb-5">
                    <button
                        onClick={() => setMode('standard')}
                        className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-tighter rounded-lg transition-all ${mode === 'standard' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'}`}
                    >
                        Padrão
                    </button>
                    <button
                        onClick={() => setMode('reverse')}
                        className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-tighter rounded-lg transition-all ${mode === 'reverse' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-400'}`}
                    >
                        Reverso
                    </button>
                </div>

                <div className="flex items-center gap-2 mb-4 text-gray-800">
                    <DollarSign size={18} className={mode === 'standard' ? 'text-emerald-500' : 'text-purple-500'} />
                    <span className="font-bold text-xs tracking-wider uppercase">
                        {mode === 'standard' ? 'Margem sobre Custo' : 'Custo Máximo Permitido'}
                    </span>
                </div>

                <div className="space-y-4">
                    {mode === 'standard' ? (
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase">Custo do Produto (R$)</label>
                            <input
                                type="number"
                                value={cost}
                                onChange={(e) => setCost(e.target.value)}
                                placeholder="0,00"
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 mt-1 focus:border-emerald-500 outline-none text-gray-800 font-bold text-sm"
                            />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase">Preço de Venda Alvo (R$)</label>
                                <input
                                    type="number"
                                    value={targetPrice}
                                    onChange={(e) => setTargetPrice(e.target.value)}
                                    placeholder="Ex: 99.90"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 mt-1 focus:border-purple-500 outline-none text-gray-800 font-bold text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase">Taxas (%)</label>
                                <input
                                    type="number"
                                    value={tax}
                                    onChange={(e) => setTax(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 mt-1 focus:border-purple-500 outline-none text-gray-800 font-bold text-xs"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase">Lucro (%)</label>
                                <div className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 mt-1 text-gray-800 font-bold text-xs flex items-center justify-between">
                                    {margin}%
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase">Margem de Lucro</label>
                            <span className={`text-[10px] font-black ${mode === 'standard' ? 'text-emerald-600' : 'text-purple-600'}`}>{margin}%</span>
                        </div>
                        <input
                            type="range"
                            min="5" max="150"
                            value={margin}
                            onChange={(e) => setMargin(Number(e.target.value))}
                            className={`w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer ${mode === 'standard' ? 'accent-emerald-500' : 'accent-purple-500'}`}
                        />
                    </div>

                    <div className={`pt-4 border-t border-gray-100`}>
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black text-gray-400 uppercase mb-1">
                                {mode === 'standard' ? 'Venda Sugerida' : 'Pagar no Máximo'}
                            </span>
                            <span className={`text-2xl font-black ${mode === 'standard' ? 'text-emerald-600' : 'text-purple-600'}`}>
                                R$ {mode === 'standard' ? price.toFixed(2) : maxCost.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

                <Link to="/calculator" className="mt-5 flex items-center justify-center gap-2 w-full py-3 bg-gray-50 text-gray-500 rounded-xl font-bold text-[10px] uppercase hover:bg-gray-100 transition-colors tracking-widest">
                    <TrendingUp size={14} />
                    Calculadora Completa
                </Link>
            </div>
        </div>
    );
};

export default MiniPriceNode;
