import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import FlowCanvas from './components/FlowCanvas';
import ProfitCalculator from './components/ProfitCalculator';
import SettingsModal from './components/SettingsModal';
import { Settings, Calculator, Workflow } from 'lucide-react';

function Navigation() {
    const location = useLocation();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    return (
        <>
            <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-2 glass rounded-2xl">
                <Link
                    to="/"
                    className={`flex items-center gap-2 px-6 py-2 rounded-xl transition-all ${location.pathname === '/' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'hover:bg-white/5'}`}
                >
                    <Workflow size={18} />
                    <span className="font-medium text-sm">AI Flow</span>
                </Link>
                <Link
                    to="/calculator"
                    className={`flex items-center gap-2 px-6 py-2 rounded-xl transition-all ${location.pathname === '/calculator' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'hover:bg-white/5'}`}
                >
                    <Calculator size={18} />
                    <span className="font-medium text-sm">Calculadora</span>
                </Link>
                <div className="w-px h-6 bg-white/10 mx-2" />
                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-2 hover:bg-white/5 rounded-xl transition-all text-white/60 hover:text-white"
                >
                    <Settings size={20} />
                </button>
            </nav>
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </>
    );
}

function App() {
    return (
        <Router>
            <div className="w-full h-screen relative bg-[#0a0a0c]">
                <Navigation />
                <main className="w-full h-full pt-24">
                    <Routes>
                        <Route path="/" element={<FlowCanvas />} />
                        <Route path="/calculator" element={<ProfitCalculator />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
