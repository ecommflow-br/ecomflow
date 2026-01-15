import React, { useState } from 'react';
import { Sparkles, Mic, MicOff, Image as ImageIcon, Send, X } from 'lucide-react';

const InputNode = ({ onGenerate }) => {
    const [text, setText] = useState('');
    const [image, setImage] = useState(null); // localImage state handled by parent or logic below
    const [localImage, setLocalImage] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [tone, setTone] = useState('standard'); // New State

    // Helper to sync image state if needed or just use localImage
    // Simplified logic for this component based on previous edits

    const onImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setLocalImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleAction = () => {
        if (onGenerate) onGenerate(text, localImage, tone);
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
        // Mock recording logic
        if (!isListening) {
            setTimeout(() => setIsListening(false), 2000); // Auto stop mock
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

                    {/* Tone Selector */}
                    <div className="relative">
                        <select
                            value={tone}
                            onChange={(e) => setTone(e.target.value)}
                            className="bg-gray-50 border-none text-xs font-bold text-indigo-600 outline-none cursor-pointer hover:bg-indigo-50 rounded-lg p-1 transition-colors"
                        >
                            <option value="standard">Padrão</option>
                            <option value="sales">Vendedor (Agressivo)</option>
                            <option value="luxury">Luxo (Sofisticado)</option>
                            <option value="fun">Jovem (Divertido)</option>
                            <option value="seo">SEO Técnico</option>
                        </select>
                    </div>
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

                {localImage && ( // Changed 'image' to 'localImage'
                    <div className="mt-4 relative group">
                        <img src={localImage} className="w-full h-32 object-cover rounded-xl border border-black/10 shadow-sm" alt="Preview" />
                        <button
                            onClick={() => setLocalImage(null)} // Changed to setLocalImage
                            className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X size={14} />
                        </button>
                    </div>
                )}

                <div className="flex gap-2 mt-6">
                    {/* The mic and image upload buttons are now inside the textarea wrapper,
                        but the send button remains here.
                        The provided snippet only shows the send button here, so I'll keep it.
                        The original mic and image buttons are replaced by the new structure.
                    */}
                    <button
                        onClick={handleAction}
                        className="flex-1 p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center gap-2 transition-all font-bold text-sm text-white shadow-lg shadow-indigo-600/20"
                    >
                        <Send size={16} /> Gerar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InputNode;
