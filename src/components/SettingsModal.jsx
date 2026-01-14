import React, { useState } from 'react';
import { X, Key, ShieldCheck } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose }) {
    const [key, setKey] = useState(localStorage.getItem('gemini_api_key') || '');
    const [saved, setSaved] = useState(false);

    const save = () => {
        localStorage.setItem('gemini_api_key', key);
        setSaved(true);
        setTimeout(() => {
            setSaved(false);
            onClose();
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="glass max-w-md w-full p-8 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white">
                    <X size={20} />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-indigo-600/20 rounded-2xl">
                        <Key className="text-indigo-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">Configurações</h3>
                        <p className="text-white/40 text-sm">Gerencie suas chaves de API</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="block">
                        <span className="text-sm text-white/60 mb-2 block">Google Gemini API Key</span>
                        <input
                            type="password"
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            placeholder="Cole sua chave aqui..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none text-sm"
                        />
                    </label>

                    <button
                        onClick={save}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                    >
                        {saved ? <><ShieldCheck size={18} /> Salvo!</> : 'Salvar Alterações'}
                    </button>

                    <p className="text-[10px] text-white/20 text-center">
                        Sua chave é armazenada localmente no seu navegador e nunca enviada para nossos servidores.
                    </p>
                </div>
            </div>
        </div>
    );
}
