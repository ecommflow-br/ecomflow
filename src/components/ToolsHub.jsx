import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Search, Wand2, Upload, Scissors, FileCode, Film, Play, Download, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import { analyzeCompetitor } from '../utils/ai';

const ToolCard = ({ icon: Icon, title, desc, onClick, active = false }) => (
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
    </motion.button>
);

const ImageStudio = () => {
    const fileInputRef = useRef(null);
    const [mode, setMode] = useState('');
    const [processing, setProcessing] = useState(false);

    const handleClick = (selectedMode) => {
        setMode(selectedMode);
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setProcessing(true);
            const files = Array.from(e.target.files);

            let processedCount = 0;
            // Process sequentially to not choke browser downloads
            for (const file of files) {
                await processImage(file);
                processedCount++;
                // Small delay to prevent browser blocking multiple downloads
                await new Promise(resolve => setTimeout(resolve, 800));
            }

            setProcessing(false);
            window.dispatchEvent(new CustomEvent('app-toast', {
                detail: { message: `${processedCount} Imagens Processadas com Sucesso!`, type: 'success' }
            }));

            // Reset input to allow selecting same files again if needed
            e.target.value = '';
        }
    };

    const processImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    if (mode === 'crop') {
                        // Auto-crop to square center
                        const size = Math.min(img.width, img.height);
                        canvas.width = size;
                        canvas.height = size;
                        const sx = (img.width - size) / 2;
                        const sy = (img.height - size) / 2;
                        ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size);
                    } else {
                        canvas.width = img.width;
                        canvas.height = img.height;
                        ctx.drawImage(img, 0, 0); // Draw original

                        if (mode === 'watermark') {
                            const fontSize = Math.max(20, img.width * 0.05);
                            ctx.font = `bold ${fontSize}px Arial`;
                            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';

                            // Diagonal watermark
                            ctx.save();
                            ctx.translate(canvas.width / 2, canvas.height / 2);
                            ctx.rotate(-Math.PI / 4);
                            ctx.fillText('PROTEGIDO', 0, 0);
                            ctx.restore();
                        }
                    }

                    // Force JPG conversion
                    const url = canvas.toDataURL('image/jpeg', 0.95);

                    // Trigger Download
                    const link = document.createElement('a');
                    const originalName = file.name.split('.')[0];
                    link.download = `${originalName}_${mode}.jpg`;
                    link.href = url;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    resolve();
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 min-h-[400px] flex flex-col items-center justify-center text-center">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                multiple
                className="hidden"
            />

            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                {processing ? <Wand2 className="animate-spin text-indigo-500" size={48} /> : <ImageIcon size={48} className="text-gray-300" />}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Estúdio de Imagem</h2>
            <p className="text-gray-500 mb-8 max-w-md">Converta WebP, corte ou proteja suas fotos em lote. Selecione várias de uma vez!</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
                <button
                    onClick={() => handleClick('convert')}
                    disabled={processing}
                    className="p-4 border border-dashed border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex flex-col items-center gap-2 group"
                >
                    <FileCode className="text-gray-400 group-hover:text-indigo-600" />
                    <span className="text-sm font-bold text-gray-600">WebP → JPG</span>
                </button>
                <button
                    onClick={() => handleClick('crop')}
                    disabled={processing}
                    className="p-4 border border-dashed border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex flex-col items-center gap-2 center group"
                >
                    <Scissors className="text-gray-400 group-hover:text-purple-600" />
                    <span className="text-sm font-bold text-gray-600">Recorte 1:1</span>
                </button>
                <button
                    onClick={() => handleClick('watermark')}
                    disabled={processing}
                    className="p-4 border border-dashed border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex flex-col items-center gap-2 group"
                >
                    <Wand2 className="text-gray-400 group-hover:text-emerald-600" />
                    <span className="text-sm font-bold text-gray-600">Marca D'água</span>
                </button>
            </div>
        </div>
    );
};

const CompAnalysis = () => {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleAnalyze = async () => {
        if (!text) return alert("Cole o texto do anúncio primeiro.");
        setLoading(true);
        try {
            const data = await analyzeCompetitor(text);
            setResult(data);
        } catch (error) {
            alert("Erro: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 min-h-[400px]">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Search className="text-indigo-600" /> Análise de Concorrência
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="flex flex-col gap-4">
                    <label className="text-sm font-bold text-gray-700">Cole o Anúncio do Concorrente (Título e Descrição):</label>
                    <textarea
                        className="w-full h-64 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm"
                        placeholder="Cole aqui o texto do anúncio que você quer superar..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                    <button
                        onClick={handleAnalyze}
                        disabled={loading}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <Wand2 className="animate-spin" /> : <Zap />}
                        {loading ? 'Analisando Estratégia...' : 'Revelar Pontos Fracos'}
                    </button>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 h-full overflow-y-auto max-h-[500px]">
                    {!result ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center opacity-60">
                            <Search size={48} className="mb-4" />
                            <p>Os segredos do seu concorrente aparecerão aqui.</p>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                            <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl">
                                <h3 className="text-rose-700 font-bold flex items-center gap-2 mb-3">
                                    <AlertTriangle size={18} /> Pontos Fracos (Ataque aqui!)
                                </h3>
                                <ul className="space-y-2">
                                    {result.weaknesses?.map((w, i) => (
                                        <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                            <span className="text-rose-400 mt-1">•</span> {w}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                                <h3 className="text-emerald-700 font-bold flex items-start gap-2 mb-3">
                                    <CheckCircle size={18} /> Oportunidade de Ouro
                                </h3>
                                <p className="text-sm text-gray-700 italic">"{result.opportunity}"</p>
                            </div>

                            <div className="bg-white border border-gray-200 p-4 rounded-xl">
                                <h3 className="text-gray-900 font-bold text-sm mb-2">Sugestão de Título Melhor:</h3>
                                <div className="bg-gray-100 p-3 rounded-lg text-indigo-600 font-mono text-sm font-bold">
                                    {result.betterTitle}
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const VideoEditor = () => {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 min-h-[400px] flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                <Film size={48} className="text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Editor de Vídeo (Beta)</h2>
            <p className="text-gray-500 mb-8 max-w-md">Para converter vídeos do Instagram, recomendamos usar serviços externos por enquanto.</p>

            <a
                href="https://snapinsta.app/"
                target="_blank"
                rel="noreferrer"
                className="px-8 py-3 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-xl font-bold shadow-lg hover:opacity-90 transition-all flex items-center gap-2"
            >
                <Download size={20} />
                Acessar Downloader Externo
            </a>
            <p className="text-xs text-gray-400 mt-4 italic">Integração nativa em breve.</p>
        </div>
    );
};

const ToolsHub = () => {
    const [activeTab, setActiveTab] = useState('studio');

    return (
        <div className="max-w-7xl mx-auto px-6">
            <div className="mb-12">
                <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Estúdio Flow <span className="text-indigo-600">PRO</span></h1>
                <p className="text-lg text-gray-500 max-w-2xl">Ferramentas avançadas para acelerar sua operação.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Navigation */}
                <div className="space-y-4">
                    <ToolCard
                        icon={ImageIcon}
                        title="Estúdio de Imagem"
                        desc="Converta e trate fotos."
                        active={activeTab === 'studio'}
                        onClick={() => setActiveTab('studio')}
                    />
                    <ToolCard
                        icon={Film}
                        title="Downloader Vídeo"
                        desc="Instagram/TikTok."
                        active={activeTab === 'video'}
                        onClick={() => setActiveTab('video')}
                    />
                    <ToolCard
                        icon={Search}
                        title="Espião de Ofertas"
                        desc="Analise a concorrência."
                        active={activeTab === 'spy'}
                        onClick={() => setActiveTab('spy')}
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
                        {activeTab === 'studio' && <ImageStudio />}
                        {activeTab === 'video' && <VideoEditor />}
                        {activeTab === 'spy' && <CompAnalysis />}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ToolsHub;
