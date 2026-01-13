import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Youtube, ShieldAlert, LogOut, ArrowRight } from 'lucide-react';
import { AuthProvider } from '@/contexts/AuthContext';
import InteractiveGrid from './InteractiveGrid';

interface User {
    id: string;
    username: string;
    avatar: string | null;
    hasRole: boolean;
}

const AuthBarrier: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                }
            } catch (e) {
                console.error("Auth check failed");
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    const handleLogin = () => {
        window.location.href = '/api/auth/discord';
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout');
        setUser(null);
        window.location.reload();
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-[#050505] flex flex-col items-center justify-center z-[100]">
                <InteractiveGrid />
                <div className="w-12 h-12 border-t-2 border-white/20 animate-spin relative z-10" />
                <p className="mt-6 text-[10px] uppercase tracking-[0.4em] text-gray-700 animate-pulse font-medium relative z-10">Initializing Zero...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="fixed inset-0 bg-[#050505] flex flex-col items-center justify-center z-[100] px-6 overflow-hidden">
                <InteractiveGrid />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full relative z-10 flex flex-col items-center text-center"
                >
                    <img src="/logo.png" alt="Zero" className="w-24 h-24 mb-12 opacity-80" />

                    <h2 className="text-3xl font-medium text-white tracking-tight mb-4">Acesso Restrito</h2>
                    <p className="text-gray-500 text-sm font-light leading-relaxed mb-12">Conecte-se com sua conta Discord para acessar o ecossistema da Zero Network.</p>

                    <button
                        onClick={handleLogin}
                        className="w-full py-5 bg-white text-black font-bold text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-gray-200 transition-all rounded-none shadow-[0_0_40px_rgba(255,255,255,0.1)] group"
                    >
                        Conectar Discord
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <p className="mt-12 text-[8px] uppercase tracking-[0.4em] text-gray-800">Elite Software Solution</p>
                </motion.div>
            </div>
        );
    }

    if (user && !user.hasRole) {
        return (
            <div className="fixed inset-0 bg-[#050505] flex flex-col items-center justify-center z-[100] px-6">
                <InteractiveGrid />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card max-w-[420px] w-full p-12 border border-white/10 flex flex-col items-center text-center space-y-12 rounded-none"
                >
                    <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                        <ShieldAlert className="w-8 h-8 text-red-500/60" />
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-2xl font-medium text-white tracking-tight">Assinatura Necessária</h3>

                        <div className="flex flex-col gap-4 text-left">
                            <div className="flex gap-4 items-start">
                                <div className="text-[10px] bg-white/10 w-6 h-6 flex items-center justify-center shrink-0 mt-1 font-bold">1</div>
                                <p className="text-[11px] text-gray-500 uppercase tracking-widest leading-relaxed">Primeiro entre em nosso discord</p>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="text-[10px] bg-white/10 w-6 h-6 flex items-center justify-center shrink-0 mt-1 font-bold">2</div>
                                <p className="text-[11px] text-gray-500 uppercase tracking-widest leading-relaxed">
                                    Peça cargo em
                                    <a href="https://discord.gg/kQgSFvrw2M" target="_blank" className="text-white mx-1 hover:underline">#pedir-cargo</a>
                                </p>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="text-[10px] bg-white/10 w-6 h-6 flex items-center justify-center shrink-0 mt-1 font-bold">3</div>
                                <p className="text-[11px] text-gray-500 uppercase tracking-widest leading-relaxed cursor-pointer hover:text-white transition-colors" onClick={() => window.location.reload()}>Recarregue o site</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 w-full">
                        <a
                            href="https://discord.gg/kQgSFvrw2M"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-5 bg-white/5 border border-white/10 text-white text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-white/10 transition-all rounded-none"
                        >
                            Ir para o Discord
                        </a>
                        <a
                            href="https://www.youtube.com/@gulanoyt"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-5 bg-white text-black text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-gray-200 transition-all rounded-none shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                        >
                            <Youtube className="w-4 h-4" />
                            Canal do YouTube
                        </a>
                        <button
                            onClick={handleLogout}
                            className="w-full py-5 text-[10px] font-bold uppercase tracking-[0.3em] text-white/20 hover:text-white transition-colors flex items-center justify-center gap-2"
                        >
                            <LogOut className="w-3 h-3" />
                            Sair da Conta
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <AuthProvider initialUser={user}>
            {children}
        </AuthProvider>
    );
};

export default AuthBarrier;
