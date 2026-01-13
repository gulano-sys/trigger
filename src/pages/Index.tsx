
import React from 'react';
import TriggerGenerator from '@/components/TriggerGenerator';
import ProfileCard from '@/components/ProfileCard';
import UserProfileCard from '@/components/UserProfileCard';
import AIChatBot from '@/components/AIChatBot';
import AIChatSection from '@/components/AIChatSection';
import InteractiveGrid from '@/components/InteractiveGrid';
import AuthBarrier from '@/components/AuthBarrier';
import UserFooter from '@/components/UserFooter';
import { motion } from 'framer-motion';

const Index = () => {
  return (
    <AuthBarrier>
      <div className="min-h-screen w-full bg-[#050505] overflow-x-hidden relative font-['Outfit']">
        <AIChatBot />
        <InteractiveGrid />

        <div className="max-w-6xl mx-auto px-6 relative z-10 py-24">
          <div className="flex flex-col items-center mb-20 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 20,
                duration: 1
              }}
              className="w-32 h-32 mb-12"
            >
              <img
                src="/logo.png"
                alt="Zero Logo"
                className="w-full h-full object-contain filter brightness-110 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]"
              />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-4"
            >
              Zero <span className="text-gray-500">Network</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-gray-500 text-sm md:text-base max-w-md font-light leading-relaxed tracking-wide"
            >
              A nova geração de ferramentas para desenvolvedores e administradores FiveM.
            </motion.p>
          </div>

          <div className="mb-24">
            <TriggerGenerator />
          </div>

          <AIChatSection />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto pt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <ProfileCard />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <UserProfileCard className="h-full" />
            </motion.div>
          </div>

          <UserFooter />

          <motion.div
            className="text-center mt-24 py-8 border-t border-white/5"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-600 text-sm">© {new Date().getFullYear()} Zero Network. Todos os direitos reservados.</p>
          </motion.div>
        </div>
      </div>
    </AuthBarrier>
  );
};

export default Index;
