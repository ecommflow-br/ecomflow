import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InputNode from '../nodes/InputNode';
import { TitleNode, DescriptionNode, SizeTableNode, ExtraNode } from '../nodes/ResponseNodes';
import MiniPriceNode from '../nodes/MiniPriceNode';
import HistorySidebar from './HistorySidebar';
import { generateProductContent } from '../utils/ai';
import { generateSKU } from '../utils/skuGenerator';
import { Sparkles, ZoomIn, ZoomOut, Lock, Unlock, RotateCcw, Box, History } from 'lucide-react';

const ConnectionLine = ({ fromRef, toRef, zoom }) => {
    const [path, setPath] = useState('');
    const updatePath = () => {
        try {
            if (fromRef.current && toRef.current) {
                const fromRect = fromRef.current.getBoundingClientRect();
                const toRect = toRef.current.getBoundingClientRect();
                if (fromRect.width === 0 || toRect.width === 0) return;
                const startX = fromRect.left + fromRect.width / 2;
                const startY = fromRect.top + fromRect.height / 2;
                const endX = toRect.left + toRect.width / 2;
                const endY = toRect.top + toRect.height / 2;
                if (!Number.isFinite(startX) || !Number.isFinite(endX)) return;
                const controlY = startY + (endY - startY) / 2;
                setPath(`M ${startX} ${startY} C ${startX} ${controlY}, ${endX} ${controlY}, ${endX} ${endY}`);
            }
        } catch (error) {
            console.warn("Connection line calc error:", error);
        }
    };
    useEffect(() => {
        const interval = setInterval(updatePath, 33);
        window.addEventListener('resize', updatePath);
        window.addEventListener('scroll', updatePath);
        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', updatePath);
            window.removeEventListener('scroll', updatePath);
        };
    }, [zoom]);
    return (
        <motion.path
            d={path}
            fill="none"
            stroke="url(#neonGradient)"
            strokeWidth={3 * zoom}
            strokeLinecap="round"
            filter="url(#glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.6 }}
            transition={{ duration: 0.5 }}
        />
    );
};

const FlowCanvas = () => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [sku, setSku] = useState(null);
    const [zoom, setZoom] = useState(1);
    const [isLocked, setIsLocked] = useState(false);

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

    const handleGenerate = async (text, file, tone) => {
        setLoading(true);
        try {
            const content = await generateProductContent(text, file, tone);
            setResult(content);
            const generatedSku = content.title ? generateSKU(content.title) : null;
            setSku(generatedSku);

            // Add to history
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

        } catch (error) {
            console.error(error);
            alert(`Erro na Geração: ${error.message}`);
        } finally {
            setLoading(false);
        }
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
                    <ConnectionLine fromRef={inputRef} toRef={titleRef} zoom={zoom} />
                    <ConnectionLine fromRef={inputRef} toRef={descRef} zoom={zoom} />
                    <ConnectionLine fromRef={inputRef} toRef={sizeRef} zoom={zoom} />
                    <ConnectionLine fromRef={inputRef} toRef={extraRef} zoom={zoom} />
                    <ConnectionLine fromRef={inputRef} toRef={priceRef} zoom={zoom} />
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
                        <motion.div ref={titleRef} drag={!isLocked} dragMomentum={false} className={`absolute left-[5%] top-[400px] z-20 hover:z-50 ${isLocked ? '' : 'cursor-move active:cursor-grabbing'}`}>
                            <TitleNode data={{ content: result.title }} />
                            {sku && (
                                <div className="absolute -top-3 -right-3 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg border border-gray-700 flex items-center gap-1">
                                    <Box size={10} className="text-indigo-400" /> SKU: {sku}
                                </div>
                            )}
                        </motion.div>

                        <motion.div ref={descRef} drag={!isLocked} dragMomentum={false} className={`absolute left-[25%] top-[550px] z-20 hover:z-50 ${isLocked ? '' : 'cursor-move active:cursor-grabbing'}`}>
                            <DescriptionNode data={{ content: result.description }} />
                        </motion.div>

                        <motion.div ref={sizeRef} drag={!isLocked} dragMomentum={false} className={`absolute right-[25%] top-[400px] z-20 hover:z-50 ${isLocked ? '' : 'cursor-move active:cursor-grabbing'}`}>
                            <SizeTableNode data={{ content: result.sizeTable }} />
                        </motion.div>

                        <motion.div ref={extraRef} drag={!isLocked} dragMomentum={false} className={`absolute right-[5%] top-[550px] z-20 hover:z-50 ${isLocked ? '' : 'cursor-move active:cursor-grabbing'}`}>
                            <ExtraNode data={{ content: result.extraDetails }} />
                        </motion.div>

                        <motion.div ref={priceRef} drag={!isLocked} dragMomentum={false} className={`absolute left-1/2 -translate-x-1/2 top-[480px] z-20 hover:z-50 ${isLocked ? '' : 'cursor-move active:cursor-grabbing'}`}>
                            <MiniPriceNode />
                        </motion.div>
                    </>
                )}

                {!result && !loading && (
                    <div className="absolute top-[450px] left-1/2 -translate-x-1/2 text-center text-gray-400 max-w-md pointer-events-none">
                        <Sparkles className="mx-auto mb-4 text-indigo-300" size={48} />
                        <p className="text-sm font-bold">Arraste os cards para organizar sua mente.</p>
                        <p className="text-xs opacity-60 mt-2">Dica: Cole uma imagem direta no input para análise visual.</p>
                    </div>
                )}
            </motion.div>

            {/* Floating Controls Toolbar */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-2 bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl rounded-2xl">
                <button onClick={() => setIsHistoryOpen(true)} className="p-2 hover:bg-indigo-50 rounded-lg text-indigo-600 transition-colors" title="Ver Histórico">
                    <History size={20} />
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
            />
        </div>
    );
};

export default FlowCanvas;
