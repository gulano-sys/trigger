
import React from 'react';
import AnimatedButton from './AnimatedButton';
import { ExternalLink, MessageSquare, Shield, Code, Gamepad2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface UserProfileCardProps {
  className?: string;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({ className }) => {
  const badges = [
    { id: 'vip', icon: <Shield className="text-white/40" size={16} />, name: 'VIP Member' },
    { id: 'developer', icon: <Code className="text-white/40" size={16} />, name: 'Desenvolvedor' },
    { id: 'gamer', icon: <Gamepad2 className="text-white/40" size={16} />, name: 'Gamer' },
  ];

  return (
    <motion.div
      className={cn("glass-card rounded-none overflow-hidden max-w-sm w-full font-['Outfit'] transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] hover:border-white/10", className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="h-16 bg-white/[0.01] border-b border-white/5 relative" />

      <div className="px-6 pb-8 relative">
        <div className="absolute -top-10 left-6">
          <div className="w-16 h-16 rounded-none border border-white/5 bg-black overflow-hidden shadow-2xl">
            <img
              src="/lovable-uploads/694ce61a-d273-43e7-aa3f-c55d42acff3e.png"
              alt="User Avatar"
              className="w-full h-full object-cover opacity-80"
            />
          </div>
        </div>

        <div className="pt-10 space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-medium text-white tracking-tight">Gulano</h3>
            <p className="text-xs text-gray-500 font-light leading-relaxed">Desenvolvedor e Fundador.</p>
          </div>

          <div className="flex gap-2">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="w-7 h-7 rounded-none border border-white/5 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity cursor-help"
                title={badge.name}
              >
                {badge.icon}
              </div>
            ))}
          </div>

          <button
            onClick={() => window.open('https://discord.gg/kQgSFvrw2M', '_blank')}
            className="w-full py-3 border border-white/10 text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all"
          >
            Send Message
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default UserProfileCard;
