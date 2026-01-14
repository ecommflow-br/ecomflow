import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import FlowCanvas from './components/FlowCanvas';
import ProfitCalculator from './components/ProfitCalculator';
import SettingsModal from './components/SettingsModal';
import { Calculator, Box, Settings } from 'lucide-react';
import ErrorBoundary from './components/ErrorBoundary';

function Navigation() {
    className = {`flex items-center gap-2 px-6 py-2 rounded-xl transition-all ${location.pathname === '/calculator' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-gray-600 hover:bg-black/5'}`
}
                >
                    <Calculator size={18} />
                    <span className="font-medium text-sm">Calculadora</span>
                </Link >
                <div className="w-px h-6 bg-gray-200 mx-2" />
                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-2 hover:bg-black/5 rounded-xl transition-all text-gray-400 hover:text-gray-600"
                >
                    <Settings size={20} />
                </button>
            </nav >
    <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </>
    );
}

function App() {
    return (
        <Router>
            <div className="min-h-screen w-full relative bg-[#f5f5f7]">
                <Navigation />
                <main className="w-full pt-28 pb-12">
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
