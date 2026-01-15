import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './utils/firebase';
import FlowCanvas from './components/FlowCanvas';
import ProfitCalculator from './components/ProfitCalculator';
import SettingsModal from './components/SettingsModal';
import Login from './components/Login';
import { Calculator, Settings, Workflow, LogOut } from 'lucide-react';
import ErrorBoundary from './components/ErrorBoundary';

function Navigation({ user }) {
    const location = useLocation();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const handleLogout = () => {
        signOut(auth);
    };

    return (
        <>
            <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-2 glass rounded-2xl shadow-xl bg-white/80 backdrop-blur-md border border-white/20">
                <Link
                    to="/"
                    className={`flex items-center gap-2 px-6 py-2 rounded-xl transition-all ${location.pathname === '/' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-gray-600 hover:bg-black/5'}`}
                >
                    <Workflow size={18} />
                    <span className="font-medium text-sm text-nowrap">AI Flow</span>
                </Link>
                <Link
                    to="/calculator"
                    className={`flex items-center gap-2 px-6 py-2 rounded-xl transition-all ${location.pathname === '/calculator' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-gray-600 hover:bg-black/5'}`}
                >
                    <Calculator size={18} />
                    <span className="font-medium text-sm text-nowrap">Calculadora</span>
                </Link>
                <div className="w-px h-6 bg-gray-200 mx-1" />
                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-2 hover:bg-black/5 rounded-xl transition-all text-gray-400 hover:text-gray-600"
                    title="Configurações"
                >
                    <Settings size={20} />
                </button>
                <button
                    onClick={handleLogout}
                    className="p-2 hover:bg-red-50 rounded-xl transition-all text-gray-400 hover:text-red-500"
                    title="Sair"
                >
                    <LogOut size={20} />
                </button>
            </nav>
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </>
    );
}

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
            setUser(authUser);
            if (authUser) {
                try {
                    const docRef = doc(db, "user_keys", authUser.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        if (data.geminiKey) localStorage.setItem('gemini_api_key', data.geminiKey);
                        if (data.openAiKey) localStorage.setItem('openai_api_key', data.openAiKey);
                    }
                } catch (e) {
                    console.error("Auto-sync keys failed:", e);
                }
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050507] flex flex-col items-center justify-center font-['Inter'] relative overflow-hidden">
                {/* Ambient Glows */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-600/20 blur-[100px] rounded-full animate-pulse" />

                <div className="relative group flex flex-col items-center">
                    <div className="w-20 h-20 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-600/40 mb-6 border border-white/10">
                        <Workflow size={36} className="text-white animate-pulse" />
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-widest uppercase">EcomFlow</h1>
                    <div className="h-0.5 w-12 bg-indigo-500 rounded-full mt-2 mb-8" />

                    <div className="flex gap-1.5">
                        <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" />
                    </div>
                    <p className="mt-4 text-[10px] text-gray-500 font-black tracking-[0.3em] uppercase opacity-50">Sincronizando Dados</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Login />;
    }

    return (
        <ErrorBoundary>
            <BrowserRouter>
                <div className="min-h-screen w-full relative bg-[#f5f5f7]">
                    <Navigation user={user} />
                    <main className="w-full pt-28 pb-12">
                        <Routes>
                            <Route path="/" element={<FlowCanvas />} />
                            <Route path="/calculator" element={<ProfitCalculator />} />
                            <Route path="*" element={<Navigate to="/" />} />
                        </Routes>
                    </main>
                </div>
            </BrowserRouter>
        </ErrorBoundary>
    );
}

export default App;
