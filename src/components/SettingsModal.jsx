import React, { useState, useEffect } from 'react';
import { X, Key, ShieldCheck, RefreshCw, Mail, Lock } from 'lucide-react';
import { auth, db } from '../utils/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

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

        localStorage.setItem('gemini_api_key', gKey);
        localStorage.setItem('openai_api_key', oKey);

        if (auth.currentUser) {
            try {
                await setDoc(doc(db, "user_keys", auth.currentUser.uid), {
                    geminiKey: gKey,
                    openAiKey: oKey,
                    updatedAt: new Date().toISOString()
                });
            } catch (error) {
                console.error("Erro ao salvar no Firestore:", error);
            }
        }

        setLoading(false);
        setSaved(true);
        setTimeout(() => {
            setSaved(false);
            onClose();
        }, 1500);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/20 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-white rounded-[32px] max-w-md w-full p-8 shadow-2xl relative border border-gray-100 overflow-hidden"
                    >
                        {/* Decorative Background */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-600 to-purple-600" />

                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                                <Key className="text-white" size={28} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Configurações de IA</h3>
                                <div className="flex items-center gap-1.5 text-gray-500 text-xs font-bold uppercase tracking-wider mt-1">
                                    <Mail size={12} className="text-indigo-400" />
                                    {auth.currentUser?.email}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <Lock size={10} className="text-indigo-500" /> OpenAI API Key
                                        </label>
                                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">Recomendado</span>
                                    </div>
                                    <input
                                        type="password"
                                        value={openAiKey}
                                        onChange={(e) => setOpenAiKey(e.target.value)}
                                        placeholder="sk-..."
                                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-gray-800 font-bold transition-all"
                                    />
                                    <p className="text-[10px] text-gray-400 font-medium mt-2 px-1 italic">Ideal para geração de imagens e estabilidade máxima (GPT-4o mini).</p>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block flex items-center gap-1.5">
                                        <Lock size={10} className="text-purple-500" /> Google Gemini API Key
                                    </label>
                                    <input
                                        type="password"
                                        value={geminiKey}
                                        onChange={(e) => setGeminiKey(e.target.value)}
                                        placeholder="AIza..."
                                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none text-gray-800 font-bold transition-all"
                                    />
                                    <p className="text-[10px] text-gray-400 font-medium mt-2 px-1 italic">Opção gratuita poderosa (sujeita a limites de cota da API).</p>
                                </div>
                            </div>

                            <button
                                onClick={save}
                                disabled={loading}
                                className="w-full py-4 bg-indigo-600 hover:bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 mt-2 shadow-xl shadow-indigo-200 disabled:opacity-50 active:scale-[0.98]"
                            >
                                {loading ? (
                                    <RefreshCw size={20} className="animate-spin" />
                                ) : saved ? (
                                    <><ShieldCheck size={20} /> Chaves Sincronizadas!</>
                                ) : (
                                    'Salvar e Sincronizar Agora'
                                )}
                            </button>

                            <div className="pt-6 border-t border-gray-100 text-center">
                                <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em]">
                                    🔒 Dados Criptografados e Sincronizados na Nuvem
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

