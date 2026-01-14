import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Sparkles, Mic, Image as ImageIcon, Send, X } from 'lucide-react';

const InputNode = ({ data }) => {
    const [text, setText] = useState('');
    const [image, setImage] = useState(null);
    const [recording, setRecording] = useState(false);

    const onImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleAction = () => {
        if (data.onGenerate) data.onGenerate(text, image);
    };

    return (
        <div className="node-glow w-[340px]">
            <div className="node-inner p-6 shadow-2xl relative">
                <div className="flex items-center gap-2 mb-4 text-indigo-600">
                    <Sparkles size={18} />
                    <span className="font-bold text-sm tracking-wider uppercase">Criação Instantânea</span>
                </div>

                <textarea
                    className="w-full bg-black/5 border border-black/10 rounded-xl p-3 text-sm focus:border-indigo-500 outline-none min-h-[100px] resize-none text-gray-800"
                    placeholder="O que vamos vender hoje?"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />

                {image && (
                    <div className="mt-4 relative group">
                        <img src={image} className="w-full h-32 object-cover rounded-xl border border-white/10" />
                        <button onClick={() => setImage(null)} className="absolute top-2 right-2 bg-black/50 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <X size={14} />
                        </button>
                    </div>
                )}

                <div className="flex gap-2 mt-4">
                    <button
                        onClick={() => setRecording(!recording)}
                        className={`flex-1 p-3 rounded-xl flex items-center justify-center transition-all ${recording ? 'bg-red-600 animate-pulse text-white' : 'bg-black/5 hover:bg-black/10 text-gray-600'}`}
                    >
                        <Mic size={18} />
                    </button>
                    <label className="flex-1 p-3 rounded-xl bg-black/5 hover:bg-black/10 flex items-center justify-center cursor-pointer transition-all text-gray-600">
                        <ImageIcon size={18} />
                        <input type="file" className="hidden" accept="image/*" onChange={onImageChange} />
                    </label>
                    <button
                        onClick={handleAction}
                        className="flex-[2] p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center gap-2 transition-all font-bold text-sm text-white"
                    >
                        <Send size={16} /> Gerar
                    </button>
                </div>

                <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-indigo-500" />
            </div>
        </div>
    );
};

export default InputNode;
