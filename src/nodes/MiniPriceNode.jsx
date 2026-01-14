import React, { useState, useEffect } from 'react';
import { DollarSign, ArrowRight, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const MiniPriceNode = () => {
    const [cost, setCost] = useState('');
    const [margin, setMargin] = useState(50);
    const [price, setPrice] = useState(0);

    useEffect(() => {
        const c = parseFloat(cost) || 0;
        const m = parseFloat(margin) || 0;
        // Simple calculation: Cost * (1 + Margin%)
        // This is a rough estimate for the "Flow" view
        const p = c * (1 + m / 100);
        setPrice(p);
    }, [cost, margin]);

    return (
        <div className="node-glow w-[300px] z-50">
            <div className="node-inner p-6 shadow-2xl relative bg-white/90 backdrop-blur-xl">
                <div className="flex items-center gap-2 mb-4 text-emerald-600">
                    <DollarSign size={18} />
                    <span className="font-bold text-sm tracking-wider uppercase">Precificação Rápida</span>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">Custo (R$)</label>
                        <input
                            type="number"
                            value={cost}
                            onChange={(e) => setCost(e.target.value)}
                            placeholder="0,00"
                            className="w-full bg-black/5 border border-black/10 rounded-lg px-3 py-2 mt-1 focus:border-emerald-500 outline-none text-gray-800 font-bold"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-xs font-bold text-gray-400 uppercase">Margem</label>
                            <span className="text-xs font-bold text-emerald-600">{margin}%</span>
                        </div>
                        <input
                            type="range"
                            min="10" max="200"
                            value={margin}
                            onChange={(e) => setMargin(Number(e.target.value))}
                            className="w-full accent-emerald-500 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <div className="flex justify-between items-end">
                            <span className="text-xs font-bold text-gray-400 uppercase mb-1">Venda Sugerida</span>
                            <span className="text-2xl font-black text-gray-800">R$ {price.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <Link to="/calculator" className="mt-4 flex items-center justify-center gap-2 w-full py-2 bg-emerald-100 text-emerald-700 rounded-lg font-bold text-xs hover:bg-emerald-200 transition-colors">
                    <TrendingUp size={14} />
                    Ver Lucro Real na Calculadora
                </Link>
            </div>
        </div>
    );
};

export default MiniPriceNode;
