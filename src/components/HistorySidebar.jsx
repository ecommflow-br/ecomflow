import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Trash2, ArrowRight, Sparkles } from 'lucide-react';

const HistorySidebar = ({ isOpen, onClose, history, onRestore, onClear, onNewFlow }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                    />

                    {/* Sidebar Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-50 flex flex-col border-l border-gray-100"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-2 text-indigo-600">
                                    <Clock size={20} />
                                    <h2 className="font-bold text-lg">Histórico</h2>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                    <X size={20} className="text-gray-500" />
                                </button>
                            </div>

                            <button
                                onClick={() => { onNewFlow(); onClose(); }}
                                className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 transition-all font-bold text-sm"
                            >
                                <Sparkles size={16} /> Novo Fluxo (Limpar)
                            </button>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {history.length === 0 ? (
                                <div className="text-center text-gray-400 mt-10">
                                    <Clock size={48} className="mx-auto mb-3 opacity-20" />
                                    <p className="text-sm">Nenhum histórico ainda.</p>
                                </div>
                            ) : (
                                history.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => onRestore(item)}
                                        className="group p-4 bg-white border border-gray-100 rounded-xl hover:border-indigo-300 hover:shadow-md cursor-pointer transition-all relative"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                                                {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {item.sku && (
                                                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                                                    {item.sku}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-sm text-gray-800 line-clamp-2 mb-1 group-hover:text-indigo-600 transition-colors">
                                            {item.result.title || "Sem Título"}
                                        </h3>
                                        <p className="text-xs text-gray-500 line-clamp-2">
                                            {item.input_summary}
                                        </p>

                                        <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ArrowRight size={16} className="text-indigo-500" />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {history.length > 0 && (
                            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                                <button
                                    onClick={onClear}
                                    className="w-full flex items-center justify-center gap-2 p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-sm font-bold"
                                >
                                    <Trash2 size={16} /> Limpar Histórico
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default HistorySidebar;
