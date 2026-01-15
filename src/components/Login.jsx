import React, { useState } from 'react';
import { auth } from '../utils/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, Mail, Lock, AlertCircle, Chrome, Sparkles } from 'lucide-react';

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
        } catch (err) {
            console.error(err);
            setError(err.message.includes('auth/user-not-found') ? 'Usuário não encontrado.' :
                err.message.includes('auth/wrong-password') ? 'Senha incorreta.' :
                    err.message.includes('auth/email-already-in-use') ? 'E-mail já está em uso.' :
                        'Erro ao autenticar. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (err) {
            setError('Erro ao entrar com Google.');
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#050507] overflow-hidden font-['Inter']">
            {/* Ambient Moving Gradients */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    x: [0, 100, 0],
                    y: [0, 50, 0],
                    rotate: [0, 180, 360]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/30 blur-[130px] rounded-full"
            />
            <motion.div
                animate={{
                    scale: [1.2, 1, 1.2],
                    x: [0, -100, 0],
                    y: [0, -50, 0],
                    rotate: [360, 180, 0]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/30 blur-[130px] rounded-full"
            />
            <motion.div
                animate={{
                    opacity: [0.3, 0.6, 0.3],
                    scale: [0.8, 1.1, 0.8]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] bg-cyan-500/10 blur-[100px] rounded-full"
            />

            {/* Main Content Area */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-md p-1 mx-4 relative group"
            >
                {/* Border Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-[2rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />

                <div className="relative bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="flex flex-col items-center mb-10">
                        <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 1 }}
                            className="w-20 h-20 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-600/40 mb-6 relative"
                        >
                            <WorkflowIcon className="text-white relative z-10" size={36} />
                            <div className="absolute inset-0 bg-white/20 rounded-2xl blur-md animate-pulse" />
                        </motion.div>

                        <h2 className="text-4xl font-black text-white tracking-tighter flex items-center gap-2">
                            EcomFlow <span className="text-indigo-500">2.0</span>
                        </h2>
                        <div className="h-1 w-12 bg-indigo-500 rounded-full mt-2 mb-3" />
                        <p className="text-gray-400 text-sm font-medium tracking-wide">
                            {isLogin ? 'INTELIGÊNCIA ARTIFICIAL PARA E-COMMERCE' : 'CRIE SUA CONTA PROFISSIONAL'}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-4">
                            <div className="relative group/input">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-indigo-400 transition-colors" size={18} />
                                <input
                                    type="email"
                                    placeholder="Seu melhor e-mail"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 focus:border-indigo-500 outline-none text-white text-sm transition-all focus:bg-white/10 placeholder:text-gray-600"
                                />
                            </div>
                            <div className="relative group/input">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-indigo-400 transition-colors" size={18} />
                                <input
                                    type="password"
                                    placeholder="Sua senha secreta"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 focus:border-indigo-500 outline-none text-white text-sm transition-all focus:bg-white/10 placeholder:text-gray-600"
                                />
                            </div>
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold"
                                >
                                    <AlertCircle size={16} />
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/20 active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
                                    {isLogin ? 'Entrar no Sistema' : 'Começar Agora'}
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/5"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-[#0c0c0e] px-4 text-[10px] text-gray-500 font-black tracking-[0.2em] uppercase">Conexão Segura</span>
                        </div>
                    </div>

                    {/* Google Login */}
                    <button
                        onClick={handleGoogleLogin}
                        className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                        <Chrome size={20} className="text-white" />
                        Acessar com Google
                    </button>

                    {/* Footer Toggle */}
                    <div className="mt-10 text-center">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-sm font-medium transition-all group"
                        >
                            <span className="text-gray-500 group-hover:text-gray-400">
                                {isLogin ? 'Não tem uma conta?' : 'Já possui acesso?'}
                            </span>
                            <span className="ml-2 text-indigo-400 font-bold group-hover:text-indigo-300 underline underline-offset-4 decoration-indigo-500/30">
                                {isLogin ? 'Criar Acesso' : 'Fazer Login'}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Aesthetic Detail */}
                <div className="mt-6 flex justify-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                        <Sparkles size={12} className="text-indigo-400" />
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Powered by Gemini 2.5 Flash</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

function WorkflowIcon({ className, size }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <rect width="8" height="8" x="3" y="3" rx="2" strokeOpacity="0.8" />
            <path d="M7 11v4a2 2 0 0 0 2 2h4" strokeOpacity="0.5" />
            <rect width="8" height="8" x="13" y="13" rx="2" strokeOpacity="0.8" />
            <circle cx="12" cy="12" r="1" fill="currentColor" className="animate-pulse" />
        </svg>
    );
}
