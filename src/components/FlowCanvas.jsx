import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InputNode from '../nodes/InputNode';
import { TitleNode, DescriptionNode, SizeTableNode, ExtraNode } from '../nodes/ResponseNodes';
// MiniPriceNode removed
import CalculatorNode from '../nodes/CalculatorNode';
import HistorySidebar from './HistorySidebar';
import { generateProductContent, calculateWithAI } from '../utils/ai';
import { generateSKU } from '../utils/skuGenerator';
import { Sparkles, ZoomIn, ZoomOut, Lock, Unlock, RotateCcw, Box, History, Calculator as CalcIcon, Plus } from 'lucide-react';

import ConnectionLine from './ConnectionLine';

const FlowCanvas = () => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [sku, setSku] = useState(null);
    const [zoom, setZoom] = useState(1);
    const [isLocked, setIsLocked] = useState(false);
    const [calculators, setCalculators] = useState([]);
    const [removedNodes, setRemovedNodes] = useState([]); // Track dismissed response node types

    // History State
    const [history, setHistory] = useState(() => {
        const saved = localStorage.getItem('ecomflow_history');
        return saved ? JSON.parse(saved) : [];
    });
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    const inputRef = useRef(null);
    const titleRef = useRef(null);
    const descRef = useRef(null);
    const sizeRef = useRef(null);
    const extraRef = useRef(null);
    const priceRef = useRef(null);

    // Monitor performance
    useEffect(() => {
        const nodeCount = calculators.length + (result ? (5 - removedNodes.length) : 0);
        if (nodeCount > 15) {
            // Subtle alert for performance
            window.dispatchEvent(new CustomEvent('app-toast', {
                detail: { message: "Muitos cards ativos podem impactar a performance. Considere limpar o fluxo.", type: 'warning' }
            }));
        }
    }, [calculators.length, result, removedNodes.length]);

    const handleGenerate = async (text, file, style) => {
        setLoading(true);
        setRemovedNodes([]);
        try {
            // Parallel generation: Content + Price Extraction
            const [content, calcData] = await Promise.all([
                generateProductContent(text, file, style),
                calculateWithAI(text, file).catch(e => {
                    console.warn("Pricing Extraction Failed:", e);
                    return null;
                })
            ]);

            setResult(content);
            const generatedSku = content.title ? generateSKU(content.title) : null;
            setSku(generatedSku);

            const newEntry = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                input_summary: text.substring(0, 60) + (text.length > 60 ? '...' : ''),
                result: content,
                sku: generatedSku
            };
            const updatedHistory = [newEntry, ...history].slice(0, 20);
            setHistory(updatedHistory);
            localStorage.setItem('ecomflow_history', JSON.stringify(updatedHistory));

            // Auto-spawn calculator if AI found pricing data
            if (calcData && (calcData.cost > 0 || calcData.targetPrice > 0)) {
                // Position it slightly offset from the center or price node
                handleAddCalculator(50, 650, calcData);
                window.dispatchEvent(new CustomEvent('app-toast', {
                    detail: { message: "Calculadora iniciada com valores detectados!", type: 'success' }
                }));
            }

        } catch (error) {
            console.error(error);
            alert(`Erro na Geração: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleNewFlow = () => {
        if (confirm('Deseja iniciar um novo fluxo? Isso limpará o canvas atual.')) {
            setResult(null);
            setSku(null);
            setCalculators([]);
            setRemovedNodes([]);
        }
    };

    const handleRemoveResponseNode = (type) => {
        setRemovedNodes(prev => [...prev, type]);
    };

    const handleAddCalculator = (x = 50, y = 300, initialData = null) => {
        setCalculators(prev => [...prev, {
            id: Date.now(),
            x: x + (prev.length * 20),
            y: y + (prev.length * 20),
            initialData // Pass extracted data
        }]);
    };

    const handleRemoveCalculator = (id) => {
        setCalculators(prev => prev.filter(c => c.id !== id));
    };

    const handleRestore = (item) => {
        setResult(item.result);
        setSku(item.sku);
        setIsHistoryOpen(false);
    };

    const handleClearHistory = () => {
        if (confirm('Deseja limpar todo o histórico?')) {
            setHistory([]);
            localStorage.removeItem('ecomflow_history');
        }
    };

    useEffect(() => {
        const listener = (e) => {
            const { x, y } = e.detail || { x: 50, y: 300 };
            handleAddCalculator(x, y);
        };
        window.addEventListener('add-calculator', listener);
        return () => window.removeEventListener('add-calculator', listener);
    }, []);

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 1.5));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
    const handleResetZoom = () => setZoom(1);

    return (
        <div className="w-full min-h-screen relative overflow-hidden bg-[#f5f5f7]">
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />

            <svg className="absolute w-0 h-0">
                <defs>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#4f46e5" />
                        <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                </defs>
            </svg>

            {result && !loading && (
                <svg className="fixed inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
                    {!removedNodes.includes('title') && <ConnectionLine fromRef={inputRef} toRef={titleRef} zoom={zoom} />}
                    {!removedNodes.includes('desc') && <ConnectionLine fromRef={inputRef} toRef={descRef} zoom={zoom} />}
                    {!removedNodes.includes('size') && <ConnectionLine fromRef={inputRef} toRef={sizeRef} zoom={zoom} />}
                    {!removedNodes.includes('extra') && <ConnectionLine fromRef={inputRef} toRef={extraRef} zoom={zoom} />}

                </svg>
            )}

            <motion.div
                className="w-full h-full p-8 relative"
                animate={{ scale: zoom }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                style={{ transformOrigin: 'top center' }}
            >
                <motion.div
                    ref={inputRef}
                    drag={!isLocked}
                    dragMomentum={false}
                    className={`absolute left-1/2 -translate-x-1/2 top-10 z-30 w-[340px] ${isLocked ? 'cursor-default' : 'cursor-move active:cursor-grabbing'}`}
                >
                    <InputNode onGenerate={handleGenerate} />
                </motion.div>

                {calculators.map(calc => (
                    <motion.div
                        key={calc.id}
                        drag={!isLocked}
                        dragMomentum={false}
                        initial={{ opacity: 0, scale: 0.8, x: calc.x, y: calc.y }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`absolute z-20 hover:z-50 ${isLocked ? 'cursor-default' : 'cursor-move active:cursor-grabbing'}`}
                    >
                        <CalculatorNode
                            onRemove={() => handleRemoveCalculator(calc.id)}
                            onAdd={handleAddCalculator}
                            initialData={calc.initialData}
                        />
                    </motion.div>
                ))}

                <AnimatePresence>
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-white/50 backdrop-blur-sm"
                            style={{ transform: 'none' }}
                        >
                            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                            <p className="mt-4 text-indigo-600 font-bold animate-pulse">Mineração de Dados Criativos...</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {result && !loading && (
                    <>
                        {!removedNodes.includes('title') && (
                            <motion.div ref={titleRef} drag={!isLocked} dragMomentum={false} className={`absolute left-[5%] top-[400px] z-20 hover:z-50 ${isLocked ? '' : 'cursor-move active:cursor-grabbing'}`}>
                                <TitleNode data={{ content: result.title }} onRemove={() => handleRemoveResponseNode('title')} />
                                {sku && (
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigator.clipboard.writeText(sku);
                                            window.dispatchEvent(new CustomEvent('app-toast', {
                                                detail: { message: `SKU Copiado: ${sku}`, type: 'success' }
                                            }));
                                        }}
                                        className="absolute -top-3 -right-3 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg border border-gray-700 flex items-center gap-1 cursor-pointer hover:bg-gray-800 hover:scale-105 transition-all active:scale-95 group"
                                        title="Clique para copiar SKU"
                                    >
                                        <Box size={10} className="text-indigo-400 group-hover:text-emerald-400 transition-colors" /> SKU: {sku}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {!removedNodes.includes('desc') && (
                            <motion.div ref={descRef} drag={!isLocked} dragMomentum={false} className={`absolute left-[25%] top-[550px] z-20 hover:z-50 ${isLocked ? '' : 'cursor-move active:cursor-grabbing'}`}>
                                <DescriptionNode data={{ content: result.description }} onRemove={() => handleRemoveResponseNode('desc')} />
                            </motion.div>
                        )}

                        {!removedNodes.includes('size') && (
                            <motion.div ref={sizeRef} drag={!isLocked} dragMomentum={false} className={`absolute right-[25%] top-[400px] z-20 hover:z-50 ${isLocked ? '' : 'cursor-move active:cursor-grabbing'}`}>
                                <SizeTableNode data={{ content: result.sizeTable }} onRemove={() => handleRemoveResponseNode('size')} />
                            </motion.div>
                        )}

                        {!removedNodes.includes('extra') && (
                            <motion.div ref={extraRef} drag={!isLocked} dragMomentum={false} className={`absolute right-[5%] top-[550px] z-20 hover:z-50 ${isLocked ? '' : 'cursor-move active:cursor-grabbing'}`}>
                                <ExtraNode data={{ content: result.extraDetails }} onRemove={() => handleRemoveResponseNode('extra')} />
                            </motion.div>
                        )}

                        {/* Price Node Removed by User Request */}
                    </>
                )}

                {/* PERFORMANCE WARNING BANNER */}
                <AnimatePresence>
                    {(calculators.length + (result ? (5 - removedNodes.length) : 0)) > 15 && (
                        <motion.div
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -50, opacity: 0 }}
                            className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-xs font-bold"
                        >
                            <Sparkles size={14} className="text-amber-500" />
                            Site Pesado: Considere iniciar um "Novo Fluxo" para manter a velocidade.
                            <button onClick={() => setRemovedNodes(prev => [...prev, 'warning'])} className="ml-2 hover:bg-amber-100 p-1 rounded-full"><X size={12} /></button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!result && !loading && calculators.length === 0 && (
                    <div className="absolute top-[450px] left-1/2 -translate-x-1/2 text-center text-gray-400 max-w-md pointer-events-none">
                        <Sparkles className="mx-auto mb-4 text-indigo-300" size={48} />
                        <p className="text-sm font-bold">Arraste os cards para organizar sua mente.</p>
                        <p className="text-xs opacity-60 mt-2">Dica: Adicione uma calculadora ou cole uma imagem no input.</p>
                    </div>
                )}
            </motion.div>

            {/* Floating Controls Toolbar */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-2 bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl rounded-2xl">
                <button onClick={() => setIsHistoryOpen(true)} className="p-2 hover:bg-indigo-50 rounded-lg text-indigo-600 transition-colors" title="Ver Histórico">
                    <History size={20} />
                </button>
                <div className="w-px h-6 bg-gray-200 mx-1" />

                {/* NEW: ADD CALCULATOR BUTTON */}
                <button onClick={handleAddCalculator} className="p-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white transition-all shadow-md flex items-center gap-2 px-3" title="Add Calculadora">
                    <Plus size={18} />
                    <span className="text-xs font-bold">Calculadora</span>
                </button>

                <div className="w-px h-6 bg-gray-200 mx-1" />
                <button onClick={handleZoomOut} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors" title="Zoom Out">
                    <ZoomOut size={20} />
                </button>
                <span className="text-xs font-bold text-gray-500 w-12 text-center">{(zoom * 100).toFixed(0)}%</span>
                <button onClick={handleZoomIn} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors" title="Zoom In">
                    <ZoomIn size={20} />
                </button>
                <div className="w-px h-6 bg-gray-200 mx-1" />
                <button onClick={handleResetZoom} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors" title="Reset Zoom">
                    <RotateCcw size={18} />
                </button>
                <div className="w-px h-6 bg-gray-200 mx-1" />
                <button
                    onClick={() => setIsLocked(!isLocked)}
                    className={`p-2 rounded-lg transition-all flex items-center gap-2 px-3 ${isLocked ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-gray-100 text-gray-600'}`}
                    title={isLocked ? "Desbloquear" : "Travar Cards"}
                >
                    {isLocked ? <Lock size={18} /> : <Unlock size={18} />}
                    <span className="text-xs font-bold">{isLocked ? 'Travado' : 'Mover'}</span>
                </button>
            </div>

            <HistorySidebar
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                history={history}
                onRestore={handleRestore}
                onClear={handleClearHistory}
                onNewFlow={handleNewFlow}
            />
        </div>
    );
};

export default FlowCanvas;
