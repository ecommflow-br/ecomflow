import React, { useState } from 'react';
import { Sparkles, Mic, MicOff, Image as ImageIcon, Send, X } from 'lucide-react';

const InputNode = ({ onGenerate }) => {
    const [text, setText] = useState('');
    const [localImage, setLocalImage] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [style, setStyle] = useState('marketplace'); // 'marketplace', 'boutique', 'elite'

    const onImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setLocalImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleAction = () => {
        if (onGenerate) onGenerate(text, localImage, style);
    };

    const handlePaste = (e) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                const reader = new FileReader();
                reader.onload = (event) => {
                    setLocalImage(event.target.result);
                };
                reader.readAsDataURL(blob);
                e.preventDefault();
                return;
            }
        }
    };

    const toggleListening = () => {
        setIsListening(!isListening);
        if (!isListening) {
            setTimeout(() => setIsListening(false), 2000);
        }
    };

    const handleImageUpload = (e) => {
        onImageChange(e);
    };

    return (
        <div className="node-glow w-full">
            <div className={`node-inner p-6 relative transition-all ${isListening ? 'border-indigo-500 ring-2 ring-indigo-500/20' : ''}`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-indigo-600">
                        <Sparkles size={20} />
                        <span className="font-bold text-xs uppercase tracking-widest">Input do Produto</span>
                    </div>
                </div>

                {/* Style Selector Buttons */}
                <div className="flex bg-gray-50 p-1 rounded-xl shadow-inner border border-gray-100 mb-4">
                    <button
                        onClick={() => setStyle('marketplace')}
                        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-tight rounded-lg transition-all ${style === 'marketplace' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-gray-400 hover:bg-white hover:text-indigo-500'}`}
                    >
                        ⚡ Marketplace
                    </button>
                    <button
                        onClick={() => setStyle('boutique')}
                        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-tight rounded-lg transition-all ${style === 'boutique' ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'text-gray-400 hover:bg-white hover:text-purple-500'}`}
                    >
                        💎 Boutique
                    </button>
                    <button
                        onClick={() => setStyle('elite')}
                        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-tight rounded-lg transition-all ${style === 'elite' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-gray-400 hover:bg-white hover:text-emerald-500'}`}
                    >
                        🔥 Copy Elite
                    </button>
                </div>

                <div
                    className="relative group"
                    onPaste={handlePaste}
                >
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Cole uma imagem aqui ou descreva... 'Tênis Nike...'"
                        className="w-full h-32 bg-gray-50/50 rounded-xl border border-gray-200 p-4 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 resize-none transition-all"
                    />

                    {/* Image Preview Overlay or Button */}
                    <div className="absolute bottom-3 right-3 flex gap-2">
                        <label className="p-2 bg-white hover:bg-gray-100 rounded-lg cursor-pointer shadow-sm border border-gray-100 transition-all text-gray-500 hover:text-indigo-600">
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            <ImageIcon size={18} />
                        </label>
                        <button
                            onClick={toggleListening}
                            className={`p-2 rounded-lg transition-all shadow-sm border border-gray-100 ${isListening ? 'bg-red-50 text-red-500 animate-pulse' : 'bg-white text-gray-500 hover:text-indigo-600 hover:bg-gray-100'}`}
                        >
                            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                        </button>
                    </div>
                </div>

                {localImage && (
                    <div className="mt-4 relative group">
                        <img src={localImage} className="w-full h-32 object-cover rounded-xl border border-black/10 shadow-sm" alt="Preview" />
                        <button
                            onClick={() => setLocalImage(null)}
                            className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X size={14} />
                        </button>
                    </div>
                )}

                <div className="flex gap-2 mt-6">
                    <button
                        onClick={handleAction}
                        className={`flex-1 p-3 rounded-xl flex items-center justify-center gap-2 transition-all font-bold text-sm text-white shadow-lg
                            ${style === 'marketplace' ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20' :
                                style === 'boutique' ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/20' :
                                    'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'}`}
                    >
                        <Send size={16} />
                        {style === 'marketplace' ? 'Gerar Anúncio Rápido' :
                            style === 'boutique' ? 'Gerar Copy Boutique' :
                                'Gerar Copy de Alta Conversão'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InputNode;
