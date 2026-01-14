import React from 'react';
import { DollarSign, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const CalculatorNode = () => {
    return (
        <div className="node-glow w-[300px]">
            <div className="node-inner p-6 shadow-2xl relative">
                <div className="flex items-center gap-2 mb-4 text-emerald-600">
                    <div className="p-2 bg-emerald-50 rounded-lg">
                        <DollarSign size={20} />
                    </div>
                    <span className="font-bold text-sm uppercase tracking-wider">Precificação</span>
                </div>

                <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                    O conteúdo foi gerado! Agora calcule lucros e impostos para este produto.
                </p>

                <Link
                    to="/calculator"
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center justify-center gap-2 transition-all text-sm font-bold shadow-lg shadow-emerald-600/20"
                >
                    Abrir Cálculos <ExternalLink size={16} />
                </Link>
            </div>
        </div>
    );
};

export default CalculatorNode;
