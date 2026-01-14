import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InputNode from '../nodes/InputNode';
import { TitleNode, DescriptionNode, SizeTableNode, ExtraNode } from '../nodes/ResponseNodes';
import CalculatorNode from '../nodes/CalculatorNode';
import { generateProductContent } from '../utils/ai';
import { Sparkles, ArrowRight } from 'lucide-react';

const FlowCanvas = () => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

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

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.2 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="w-full min-h-screen relative overflow-hidden bg-[#f5f5f7] p-8">
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />

            <div className="max-w-7xl mx-auto h-full relative">
                {/* Central Input Card - Draggable */}
                <motion.div
                    drag
                    dragConstraints={{ left: -500, right: 500, top: -300, bottom: 500 }}
                    dragElastic={0.1}
                    className="absolute left-1/2 -translate-x-1/2 top-10 cursor-move z-20 active:cursor-grabbing w-full max-w-[340px]"
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
                            className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-white/50 backdrop-blur-sm"
                        >
                            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                            <p className="mt-4 text-indigo-600 font-bold animate-pulse">Mineração de Dados Criativos...</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Results - Draggable "Flow" Layout */}
                {result && !loading && (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="absolute inset-0 top-[250px] pointer-events-none"
                    >
                        {/* Wrapper for draggable elements (pointer-events-auto re-enabled) */}
                        <div className="relative w-full h-full">
                            <motion.div variants={item} drag className="absolute left-[5%] top-0 cursor-move pointer-events-auto active:cursor-grabbing">
                                <TitleNode data={{ content: result.title }} />
                            </motion.div>

                            <motion.div variants={item} drag className="absolute left-[30%] top-20 cursor-move pointer-events-auto active:cursor-grabbing">
                                <DescriptionNode data={{ content: result.description }} />
                            </motion.div>

                            <motion.div variants={item} drag className="absolute right-[30%] top-0 cursor-move pointer-events-auto active:cursor-grabbing">
                                <SizeTableNode data={{ content: result.sizeTable }} />
                            </motion.div>

                            <motion.div variants={item} drag className="absolute right-[5%] top-20 cursor-move pointer-events-auto active:cursor-grabbing">
                                <ExtraNode data={{ content: result.extraDetails }} />
                            </motion.div>

                            {/* Calculator Link */}
                            <motion.div
                                variants={item}
                                drag
                                className="absolute left-1/2 -translate-x-1/2 bottom-20 cursor-move pointer-events-auto active:cursor-grabbing"
                            >
                                <div className="flex flex-col items-center gap-4">
                                    <div className="p-2 bg-emerald-100 rounded-full text-emerald-600 animate-bounce">
                                        <ArrowRight size={20} />
                                    </div>
                                    <CalculatorNode />
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
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
