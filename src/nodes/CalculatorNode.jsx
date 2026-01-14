import React from 'react';
import { Handle, Position } from 'reactflow';
import { DollarSign, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const CalculatorNode = () => {
    return (
        <div className="node-glow w-[280px]">
            <div className="node-inner p-6 shadow-2xl relative">
                <Handle type="target" position={Position.Left} className="!bg-emerald-500" />

                <div className="flex items-center gap-2 mb-4 text-emerald-400">
                    <DollarSign size={18} />
                    <span className="font-bold text-sm uppercase tracking-wider">Precificação</span>
                </div>

                <p className="text-xs text-white/60 mb-4 leading-relaxed">
                    Calcule lucros, taxas e ROI para este produto baseado no preço de venda sugerido pela IA.
                </p>

                <Link
                    to="/calculator"
                    className="w-full py-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/20 rounded-xl flex items-center justify-center gap-2 transition-all text-sm font-bold"
                >
                    Abrir Cálculos <ExternalLink size={14} />
                </Link>
            </div>
        </div>
    );
};

export default CalculatorNode;
