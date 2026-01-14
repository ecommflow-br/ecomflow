import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import InputNode from '../nodes/InputNode';
import { TitleNode, DescriptionNode, SizeTableNode, ExtraNode } from '../nodes/ResponseNodes';
import MiniPriceNode from '../nodes/MiniPriceNode';
import { generateProductContent } from '../utils/ai';
import { Sparkles, ArrowRight } from 'lucide-react';

// Componente de Linha Dinâmica
const ConnectionLine = ({ fromRef, toRef }) => {
    const [path, setPath] = useState('');

    const updatePath = () => {
        try {
            if (fromRef.current && toRef.current) {
                const fromRect = fromRef.current.getBoundingClientRect();
                const toRect = toRef.current.getBoundingClientRect();

                // Safety check for unmounted/hidden elements
                if (fromRect.width === 0 || toRect.width === 0) return;

                // Calculate center points relative to the container is tricky with absolute, 
                // but for a fullscreen fixed/absolute, we can use window coordinates providing container is full width

                // Adjusting to relative coordinates of the canvas container would be ideal, 
                // but simply updating based on rects works if the SVG is fixed/absolute inset-0

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
        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', updatePath);
        };
    }, []);

    return (
        <motion.path
            d={path}
            fill="none"
            stroke="url(#neonGradient)"
            strokeWidth="3"
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

            {/* Connection Layer (Full Screen SVG) */}
            {result && !loading && (
                <svg className="fixed inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
                    <ConnectionLine fromRef={inputRef} toRef={titleRef} />
                    <ConnectionLine fromRef={inputRef} toRef={descRef} />
                    <ConnectionLine fromRef={inputRef} toRef={sizeRef} />
                    <ConnectionLine fromRef={inputRef} toRef={extraRef} />
                    {/* Line connecting Input to Price Node */}
                    <ConnectionLine fromRef={inputRef} toRef={priceRef} />
                </svg>
            )}

            <div className="w-full h-full p-8 relative">
                {/* Central Input Card - Draggable */}
                <motion.div
                    ref={inputRef}
                    drag
                    dragMomentum={false}
                    className="absolute left-[calc(50%-170px)] top-10 cursor-move z-30 active:cursor-grabbing w-[340px]"
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
                            className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-white/50 backdrop-blur-sm"
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
                        <motion.div ref={titleRef} drag dragMomentum={false} className="absolute left-[5%] top-[400px] cursor-move z-20 hover:z-50 active:cursor-grabbing">
                            <TitleNode data={{ content: result.title }} />
                        </motion.div>

                        <motion.div ref={descRef} drag dragMomentum={false} className="absolute left-[25%] top-[550px] cursor-move z-20 hover:z-50 active:cursor-grabbing">
                            <DescriptionNode data={{ content: result.description }} />
                        </motion.div>

                        <motion.div ref={sizeRef} drag dragMomentum={false} className="absolute right-[25%] top-[400px] cursor-move z-20 hover:z-50 active:cursor-grabbing">
                            <SizeTableNode data={{ content: result.sizeTable }} />
                        </motion.div>

                        <motion.div ref={extraRef} drag dragMomentum={false} className="absolute right-[5%] top-[550px] cursor-move z-20 hover:z-50 active:cursor-grabbing">
                            <ExtraNode data={{ content: result.extraDetails }} />
                        </motion.div>

                        {/* Mini Price Node (Instead of just a button) */}
                        <motion.div ref={priceRef} drag dragMomentum={false} className="absolute left-[calc(50%-150px)] top-[480px] cursor-move z-20 hover:z-50 active:cursor-grabbing">
                            <MiniPriceNode />
                        </motion.div>
                    </>
                )}

                {/* Placeholder for fresh start */}
                {!result && !loading && (
                    <div className="absolute top-[450px] left-1/2 -translate-x-1/2 text-center text-gray-400 max-w-md pointer-events-none">
                        <Sparkles className="mx-auto mb-4 text-indigo-300" size={48} />
                        <p className="text-sm">Arraste os cards. O fluxo é livre.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FlowCanvas;
