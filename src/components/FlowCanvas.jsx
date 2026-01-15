import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InputNode from '../nodes/InputNode';
import { TitleNode, DescriptionNode, SizeTableNode, ExtraNode } from '../nodes/ResponseNodes';
import MiniPriceNode from '../nodes/MiniPriceNode';
import { generateProductContent } from '../utils/ai';
import { Sparkles, ArrowRight, ZoomIn, ZoomOut, Lock, Unlock, RotateCcw } from 'lucide-react';

// Componente de Linha Dinâmica
const ConnectionLine = ({ fromRef, toRef, zoom }) => {
    const [path, setPath] = useState('');

    const updatePath = () => {
        try {
            if (fromRef.current && toRef.current) {
                const fromRect = fromRef.current.getBoundingClientRect();
                const toRect = toRef.current.getBoundingClientRect();

                // Safety check for unmounted/hidden elements
                if (fromRect.width === 0 || toRect.width === 0) return;

                // Adjust coordinates based on zoom validation if needed, 
                // but getBoundingClientRect returns viewport coordinates, which changes with scale.
                // SVG is fixed screen, so it should match visual positions.

                const startX = fromRect.left + fromRect.width / 2;
                const startY = fromRect.top + fromRect.height / 2;
                const endX = toRect.left + toRect.width / 2;
                const endY = toRect.top + toRect.height / 2;

                // Check for NaN or infinite values
                if (!Number.isFinite(startX) || !Number.isFinite(endX)) return;

                // Curva de Bezier suave
                const controlY = startY + (endY - startY) / 2;
                setPath(`M ${startX} ${startY} C ${startX} ${controlY}, ${endX} ${controlY}, ${endX} ${endY}`);
            }
        } catch (error) {
            // Silently fail on calc errors to avoid breaking the app
            console.warn("Connection line calc error:", error);
        }
    };

    useEffect(() => {
        // Initial draw is no longer needed with immediate interval
        // Loop to update (poor man's FLIP for drag lines without complex context state)
        // Ideally we would lift x/y state, but for a simple visual effect, an interval or event listener is lighter code-wise here
        // Reduced frequency to 30ms (~33fps) to save resources, still visually smooth enough
        const interval = setInterval(updatePath, 33);

        // requestAnimationFrame frame loop could be used for smoother visuals, 
        // but interval is safer for preventing infinite recursion if logic is buggy.

        window.addEventListener('resize', updatePath);
        // Update on zoom change too
        window.addEventListener('scroll', updatePath);
        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', updatePath);
            window.removeEventListener('scroll', updatePath);
        };
    }, [zoom]); // Re-bind if zoom changes significantly affecting timing

    return (
        <motion.path
            d={path}
            fill="none"
            stroke="url(#neonGradient)"
            strokeWidth={3 * zoom} // Adjust stroke thickness with zoom
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
    const [zoom, setZoom] = useState(1);
    const [isLocked, setIsLocked] = useState(false);

    // Refs for connection points
    const inputRef = useRef(null);
    const titleRef = useRef(null);
    const descRef = useRef(null);
    const sizeRef = useRef(null);
    const extraRef = useRef(null);
    const priceRef = useRef(null);

    const handleGenerate = async (text, file) => {
        setLoading(true);
        try {
            const content = await generateProductContent(text, file);
            setResult(content);
        } catch (error) {
            console.error(error);
            alert(`Erro na Geração: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 1.5));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
    const handleResetZoom = () => setZoom(1);

    return (
        <div className="w-full min-h-screen relative overflow-hidden bg-[#f5f5f7]">
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />

            {/* Neon Definitions */}
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

            {/* Connection Layer (Full Screen SVG) - Outside scaled container to maintain resolution */}
            {result && !loading && (
                <svg className="fixed inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
                    <ConnectionLine fromRef={inputRef} toRef={titleRef} zoom={zoom} />
                    <ConnectionLine fromRef={inputRef} toRef={descRef} zoom={zoom} />
                    <ConnectionLine fromRef={inputRef} toRef={sizeRef} zoom={zoom} />
                    <ConnectionLine fromRef={inputRef} toRef={extraRef} zoom={zoom} />
                    {/* Line connecting Input to Price Node */}
                    <ConnectionLine fromRef={inputRef} toRef={priceRef} zoom={zoom} />
                </svg>
            )}

            {/* Main Scalable Content Container */}
            <motion.div
                className="w-full h-full p-8 relative"
                animate={{ scale: zoom }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                style={{ transformOrigin: 'top center' }}
            >
                {/* Central Input Card - Draggable */}
                <motion.div
                    ref={inputRef}
                    drag={!isLocked}
                    dragMomentum={false}
                    className={`absolute left-[calc(50%-170px)] top-10 z-30 w-[340px] ${isLocked ? 'cursor-default' : 'cursor-move active:cursor-grabbing'}`}
                >
                    <InputNode onGenerate={handleGenerate} />
                </motion.div>

                {/* Loading State */}
                <AnimatePresence>
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-white/50 backdrop-blur-sm scale-100" // prevent double scale
                            style={{ transform: 'none' }}
                        >
                            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                            <p className="mt-4 text-indigo-600 font-bold animate-pulse">Mineração de Dados Criativos...</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Results - Draggable "Flow" Layout */}
                {result && !loading && (
                    <>
                        {/* Nodes positioned absolutely but draggable */}
                        <motion.div ref={titleRef} drag={!isLocked} dragMomentum={false} className={`absolute left-[5%] top-[400px] z-20 hover:z-50 ${isLocked ? '' : 'cursor-move active:cursor-grabbing'}`}>
                            <TitleNode data={{ content: result.title }} />
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

                        {/* Mini Price Node (Instead of just a button) */}
                        <motion.div ref={priceRef} drag={!isLocked} dragMomentum={false} className={`absolute left-[calc(50%-150px)] top-[480px] z-20 hover:z-50 ${isLocked ? '' : 'cursor-move active:cursor-grabbing'}`}>
                            <MiniPriceNode />
                        </motion.div>
                    </>
                )}

                {/* Placeholder for fresh start */}
                {!result && !loading && (
                    <div className="absolute top-[450px] left-1/2 -translate-x-1/2 text-center text-gray-400 max-w-md pointer-events-none">
                        <Sparkles className="mx-auto mb-4 text-indigo-300" size={48} />
                        <p className="text-sm">Arraste os cards. O fluxo é livre.</p>
                        <p className="text-xs opacity-60 mt-2">Dica: Cole uma imagem (Ctrl+V) direto no input</p>
                    </div>
                )}
            </motion.div>

            {/* Floating Controls Toolbar */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-2 bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl rounded-2xl">
                <button onClick={handleZoomOut} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors" title="Zoom Out">
                    <ZoomOut size={20} />
                </button>
                <span className="text-xs font-bold text-gray-500 w-12 text-center">{(zoom * 100).toFixed(0)}%</span>
                <button onClick={handleZoomIn} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors" title="Zoom In">
                    <ZoomIn size={20} />
                </button>
                <div className="w-px h-6 bg-gray-200 mx-2" />
                <button onClick={handleResetZoom} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors" title="Reset Zoom">
                    <RotateCcw size={18} />
                </button>
                <div className="w-px h-6 bg-gray-200 mx-2" />
                <button
                    onClick={() => setIsLocked(!isLocked)}
                    className={`p-2 rounded-lg transition-all flex items-center gap-2 px-3 ${isLocked ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100 text-gray-600'}`}
                    title={isLocked ? "Desbloquear Tela" : "Travar Tela"}
                >
                    {isLocked ? <Lock size={18} /> : <Unlock size={18} />}
                    <span className="text-xs font-bold">{isLocked ? 'Travado' : 'Mover'}</span>
                </button>
            </div>
        </div>
    );
};

export default FlowCanvas;
