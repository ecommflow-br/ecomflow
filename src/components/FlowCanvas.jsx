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
            alert(error.message);
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
        <div className="w-full min-h-full flex flex-col items-center p-4 md:p-8 space-y-12 max-w-7xl mx-auto">
            {/* Central Input Card */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[400px]"
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
                        className="flex flex-col items-center gap-4 py-12"
                    >
                        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        <p className="text-indigo-600 font-bold animate-pulse">Mineração de Dados Criativos...</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results Grid - "The Logic Flow" */}
            {result && !loading && (
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="w-full space-y-12"
                >
                    {/* Step 1: Content Generation */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
                        {/* Visual connector for desktop */}
                        <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-indigo-100 -z-10" />

                        <motion.div variants={item}><TitleNode data={{ content: result.title }} /></motion.div>
                        <motion.div variants={item}><DescriptionNode data={{ content: result.description }} /></motion.div>
                        <motion.div variants={item}><SizeTableNode data={{ content: result.sizeTable }} /></motion.div>
                        <motion.div variants={item}><ExtraNode data={{ content: result.extraDetails }} /></motion.div>
                    </div>

                    {/* Step 2: Final Action Row */}
                    <motion.div
                        variants={item}
                        className="flex flex-col items-center gap-6 pt-12 border-t border-gray-100"
                    >
                        <div className="p-3 bg-emerald-100 rounded-full text-emerald-600 animate-bounce">
                            <ArrowRight size={24} />
                        </div>
                        <CalculatorNode />
                    </motion.div>
                </motion.div>
            )}

            {/* Placeholder for fresh start */}
            {!result && !loading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    className="text-center text-gray-400 max-w-md"
                >
                    <Sparkles className="mx-auto mb-4 text-indigo-300" size={48} />
                    <p className="text-sm">Descreva seu produto ou suba uma foto para começar o fluxo de criação turbinado por IA.</p>
                </motion.div>
            )}
        </div>
    );
};

export default FlowCanvas;
