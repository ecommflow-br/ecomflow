import React, { useState, useEffect } from 'react';
import { X, Key, ShieldCheck, RefreshCw } from 'lucide-react';
import { auth, db } from '../utils/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function SettingsModal({ isOpen, onClose }) {
    const [geminiKey, setGeminiKey] = useState(localStorage.getItem('gemini_api_key') || '');
    const [openAiKey, setOpenAiKey] = useState(localStorage.getItem('openai_api_key') || '');
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(false);

    // Load keys from Firestore when modal opens
    useEffect(() => {
        const loadRemoteKeys = async () => {
            if (isOpen && auth.currentUser) {
                setLoading(true);
                try {
                    const docRef = doc(db, "user_keys", auth.currentUser.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        if (data.geminiKey) {
                            setGeminiKey(data.geminiKey);
                            localStorage.setItem('gemini_api_key', data.geminiKey);
                        }
                        if (data.openAiKey) {
                            setOpenAiKey(data.openAiKey);
                            localStorage.setItem('openai_api_key', data.openAiKey);
                        }
                    }
                } catch (error) {
                    console.error("Erro ao carregar chaves do Firestore:", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        loadRemoteKeys();
    }, [isOpen]);

    const save = async () => {
        setLoading(true);
        const gKey = geminiKey.trim();
        const oKey = openAiKey.trim();

        // Save to localStorage
        localStorage.setItem('gemini_api_key', gKey);
        localStorage.setItem('openai_api_key', oKey);

        // Save to Firestore if logged in
        if (auth.currentUser) {
            try {
                await setDoc(doc(db, "user_keys", auth.currentUser.uid), {
                    geminiKey: gKey,
                    openAiKey: oKey,
                    updatedAt: new Date().toISOString()
                });
            } catch (error) {
                console.error("Erro ao salvar no Firestore:", error);
                alert("Erro ao sincronizar com a nuvem. Mas as chaves foram salvas localmente.");
            }
        }

        setLoading(false);
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
                        <h3 className="text-xl font-bold text-white">Configurações de IA</h3>
                        <p className="text-gray-500 text-sm">Chaves vinculadas: {auth.currentUser?.email}</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-4 pt-4 border-t border-white/5">
                        <label className="block">
                            <span className="text-xs font-bold text-gray-400 mb-2 block uppercase tracking-wider">OpenAI API Key (Recomendado)</span>
                            <input
                                type="password"
                                value={openAiKey}
                                onChange={(e) => setOpenAiKey(e.target.value)}
                                placeholder="sk-..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none text-white text-sm"
                            />
                            <p className="text-[10px] text-gray-500 mt-1">Melhor para imagens e estabilidade (GPT-4o mini).</p>
                        </label>
                    </div>

                    <div className="space-y-4">
                        <label className="block">
                            <span className="text-xs font-bold text-gray-400 mb-2 block uppercase tracking-wider">Google Gemini API Key</span>
                            <input
                                type="password"
                                value={geminiKey}
                                onChange={(e) => setGeminiKey(e.target.value)}
                                placeholder="AIza..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none text-white text-sm"
                            />
                            <p className="text-[10px] text-gray-500 mt-1">Opção gratuita (pode ter limites de cota).</p>
                        </label>
                    </div>

                    <button
                        onClick={save}
                        disabled={loading}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                    >
                        {loading ? (
                            <RefreshCw size={18} className="animate-spin" />
                        ) : saved ? (
                            <><ShieldCheck size={18} /> Salvo e Sincronizado!</>
                        ) : (
                            'Salvar e Sincronizar'
                        )}
                    </button>

                    <p className="text-[10px] text-gray-400 text-center">
                        Suas chaves são salvas de forma segura vinculadas à sua conta.
                    </p>
                </div>
            </div>
        </div>
    );
}
