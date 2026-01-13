
import React from 'react';
import AnimatedButton from './AnimatedButton';
import { ExternalLink, MessageSquare, ShieldAlert, Code, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProfileCardProps {
  className?: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ className }) => {
  const badges = [
    { id: 'premium', icon: <ShieldAlert className="text-white/40" size={16} />, name: 'Premium' },
    { id: 'developer', icon: <Code className="text-white/40" size={16} />, name: 'Desenvolvedor' },
    { id: 'cheats', icon: <Zap className="text-white/40" size={16} />, name: 'Security' },
  ];

  return (
    <motion.div
      className={cn("glass-card rounded-none overflow-hidden max-w-sm w-full font-['Outfit'] transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] hover:border-white/10", className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="h-16 bg-white/[0.02] border-b border-white/5 relative" />

      <div className="px-6 pb-8 relative">
        <div className="absolute -top-10 left-6">
          <div className="w-16 h-16 rounded-none border border-white/5 bg-black p-3 shadow-2xl">
            <img
              src="/logo.png"
              alt="Zero Network Logo"
              className="w-full h-full object-contain opacity-90"
            />
          </div>
        </div>

        <div className="pt-10 space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-medium text-white tracking-tight">Zero Network</h3>
            <p className="text-xs text-gray-500 font-light leading-relaxed">Sistemas avançados para FiveM.</p>
          </div>

          <div className="flex gap-2">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="w-7 h-7 rounded border border-white/5 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity cursor-help"
                title={badge.name}
              >
                {badge.icon}
              </div>
            ))}
          </div>

          <button
            onClick={() => window.open('https://discord.gg/kQgSFvrw2M', '_blank')}
            className="w-full py-3 bg-white text-black text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-200 transition-all"
          >
            Access Portal
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileCard;
