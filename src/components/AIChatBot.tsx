import React from 'react';
import { Bot } from 'lucide-react';
import { motion } from 'framer-motion';

const AIChatBot: React.FC = () => {
    const scrollToChat = () => {
        const chatSection = document.getElementById('chat-section');
        if (chatSection) {
            chatSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="font-['Outfit']">
            <motion.button
                onClick={scrollToChat}
                className="fixed bottom-8 right-8 w-12 h-12 bg-white text-black flex items-center justify-center z-50 shadow-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <Bot className="w-5 h-5" />
            </motion.button>
        </div>
    );
};

export default AIChatBot;
