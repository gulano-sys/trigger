
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User as UserIcon, Youtube, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const UserFooter: React.FC = () => {
    const { user, logout } = useAuth();

    if (!user) return null;

    const avatarUrl = user.avatar
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
        : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl mx-auto mt-24 px-6 py-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6"
        >
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden bg-white/[0.02] flex items-center justify-center">
                    {avatarUrl ? (
                        <img src={avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                        <UserIcon className="w-5 h-5 text-gray-600" />
                    )}
                </div>
                <div className="flex flex-col">
                    <span className="text-white/80 text-sm font-medium tracking-tight mb-1">{user.username}</span>
                    <span className="text-[8px] uppercase tracking-[0.3em] text-gray-600 font-bold">Identified Agent</span>
                </div>
            </div>

            <div className="flex items-center gap-10">
                <a
                    href="https://www.youtube.com/@gulanoyt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-700 hover:text-white transition-all group"
                >
                    <Youtube className="w-4 h-4 text-white/10 group-hover:text-red-500/60 transition-colors" />
                    <span className="text-[9px] uppercase tracking-[0.3em] font-bold">Nosso Canal</span>
                </a>
                <a
                    href="https://discord.gg/kQgSFvrw2M"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-700 hover:text-white transition-all group"
                >
                    <Globe className="w-4 h-4 text-white/10 group-hover:text-blue-500/60 transition-colors" />
                    <span className="text-[9px] uppercase tracking-[0.3em] font-bold">Zero Network</span>
                </a>
            </div>

            <div className="flex items-center gap-8">
                <button
                    onClick={logout}
                    className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors group"
                >
                    <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Encerrar Sessão</span>
                </button>
            </div>
        </motion.div>
    );
};

export default UserFooter;
