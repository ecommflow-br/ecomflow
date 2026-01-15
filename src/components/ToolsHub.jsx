import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Video, Tag, Search, Wand2, Upload, Download, Scissors, FileCode, Check } from 'lucide-react';

const ToolCard = ({ icon: Icon, title, desc, onClick, comingSoon = false, active = false }) => (
    <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full text-left p-6 rounded-2xl border transition-all relative overflow-hidden group
        ${active
                ? 'bg-indigo-600 border-indigo-500 shadow-xl shadow-indigo-200'
                : 'bg-white border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200'
            }`}
    >
        <div className={`p-4 rounded-xl inline-flex mb-4 ${active ? 'bg-white/20 text-white' : 'bg-gray-50 text-indigo-600 group-hover:bg-indigo-50'}`}>
            <Icon size={24} />
        </div>
        <h3 className={`text-lg font-bold mb-2 ${active ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
        <p className={`text-sm leading-relaxed ${active ? 'text-indigo-100' : 'text-gray-500'}`}>{desc}</p>

        {comingSoon && (
            <div className="absolute top-4 right-4 bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                Em Breve
            </div>
        )}
    </motion.button>
);

const ImageStudio = () => {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 min-h-[400px] flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <ImageIcon size={48} className="text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Estúdio de Imagem</h2>
            <p className="text-gray-500 mb-8 max-w-md">Converta WebP para JPG, recorte para Stories ou aplique marca d'água automaticamente.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
                <button className="p-4 border border-dashed border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex flex-col items-center gap-2 group">
                    <FileCode className="text-gray-400 group-hover:text-indigo-600" />
                    <span className="text-sm font-bold text-gray-600">WebP → JPG</span>
                </button>
                <button className="p-4 border border-dashed border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex flex-col items-center gap-2 group">
                    <Scissors className="text-gray-400 group-hover:text-purple-600" />
                    <span className="text-sm font-bold text-gray-600">Recorte 1:1</span>
                </button>
                <button className="p-4 border border-dashed border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex flex-col items-center gap-2 group">
                    <Wand2 className="text-gray-400 group-hover:text-emerald-600" />
                    <span className="text-sm font-bold text-gray-600">Marca D'água</span>
                </button>
            </div>
        </div>
    );
};

const ToolsHub = () => {
    const [activeTab, setActiveTab] = useState('studio');

    return (
        <div className="max-w-7xl mx-auto px-6">
            <div className="mb-12">
                <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Estúdio Flow <span className="text-indigo-600">PRO</span></h1>
                <p className="text-lg text-gray-500 max-w-2xl">Ferramentas avançadas para acelerar sua operação de e-commerce. Separe o criativo da estratégia.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Navigation */}
                <div className="space-y-4">
                    <ToolCard
                        icon={ImageIcon}
                        title="Estúdio de Imagem"
                        desc="Converta, corte e trate fotos em lote."
                        active={activeTab === 'studio'}
                        onClick={() => setActiveTab('studio')}
                    />
                    <ToolCard
                        icon={Video}
                        title="Criador de Reels"
                        desc="Transforme fotos em vídeos virais."
                        comingSoon
                        onClick={() => { }}
                    />
                    <ToolCard
                        icon={Tag}
                        title="Gerador de Etiquetas"
                        desc="PDFs prontos para impressão Zebra/A4."
                        comingSoon
                        onClick={() => { }}
                    />
                    <ToolCard
                        icon={Search}
                        title="Espião de Ofertas"
                        desc="Analise e supere a concorrência."
                        comingSoon
                        onClick={() => { }}
                    />
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {activeTab === 'studio' ? <ImageStudio /> : (
                            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center h-[400px] flex flex-col items-center justify-center">
                                <span className="text-4xl mb-4">🚧</span>
                                <h3 className="text-xl font-bold text-gray-900">Em Desenvolvimento</h3>
                                <p className="text-gray-500 mt-2">Estamos construindo esta ferramenta para você.</p>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ToolsHub;
