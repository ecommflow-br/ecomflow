import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="w-full h-screen flex flex-col items-center justify-center bg-[#f5f5f7] p-8 text-center">
                    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-red-100">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Ops! Algo deu errado.</h2>
                        <p className="text-gray-500 mb-6">
                            Ocorreu um erro inesperado na renderização. Não se preocupe, seus dados estão seguros.
                        </p>

                        {this.state.error && (
                            <div className="bg-gray-100 p-3 rounded-lg text-xs text-left font-mono text-gray-600 mb-6 overflow-x-auto">
                                {this.state.error.toString()}
                            </div>
                        )}

                        <button
                            onClick={this.handleReload}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                        >
                            <RefreshCw size={18} />
                            Recarregar Aplicação
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
