
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, History, Trash2, Terminal, Copy, CheckCircle2, ChevronDown, ChevronUp, Cpu, Plus, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Message, initialMessages, fetchAIChatResponse } from '@/utils/aiChat';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
    lastUpdate: number;
}

const TerminalCodeBlock: React.FC<{ code: string; language?: string }> = ({ code, language }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="my-6 rounded-none overflow-hidden border border-white/5 bg-[#0a0a0a] shadow-2xl font-mono group">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/40" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/40" />
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-gray-500 ml-4 flex items-center gap-2">
                        <Terminal className="w-3 h-3" />
                        {language || 'system_console'}
                    </span>
                </div>
                <button
                    onClick={handleCopy}
                    className="p-1.5 hover:bg-white/5 rounded transition-colors text-gray-500 hover:text-white"
                >
                    {copied ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                </button>
            </div>
            <div className="p-6 text-xs leading-relaxed overflow-x-auto scrollbar-none">
                <code className="text-gray-300 block whitespace-pre">{code}</code>
            </div>
        </div>
    );
};

const ThinkingBlock: React.FC<{ content: string }> = ({ content }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="mb-6 border-l-2 border-white/5 pl-6 py-1 group">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-gray-600 hover:text-white transition-colors"
            >
                <Cpu className="w-3 h-3 animate-pulse text-blue-500" />
                <span>Raciocínio Interno</span>
                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-4 text-[11px] text-gray-500 font-light leading-relaxed italic pr-12">
                            {content}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const MessageRenderer: React.FC<{ content: string; role: 'user' | 'assistant' }> = ({ content, role }) => {
    if (role === 'user') return <span className="font-light break-words">{content}</span>;

    // Extrair o bloco de pensamento se existir
    const thinkMatch = content.match(/<think>([\s\S]*?)<\/think>/);
    const thinkingContent = thinkMatch ? thinkMatch[1].trim() : null;
    const mainContent = content.replace(/<think>[\s\S]*?<\/think>/, '').trim();

    return (
        <div className="space-y-4 prose prose-invert max-w-none overflow-x-auto scrollbar-none w-full break-words">
            {thinkingContent && <ThinkingBlock content={thinkingContent} />}

            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    h2: ({ ...props }) => <h2 className="text-lg font-medium text-white mb-4 pt-4" {...props} />,
                    h3: ({ ...props }) => <h3 className="text-md font-medium text-white/90 mb-3 pt-2" {...props} />,
                    p: ({ ...props }) => <p className="text-gray-400 leading-relaxed mb-4 text-sm font-light" {...props} />,
                    ul: ({ ...props }) => <ul className="list-disc list-inside space-y-2 mb-6 text-gray-400 text-sm font-light" {...props} />,
                    li: ({ ...props }) => <li className="marker:text-blue-500/40" {...props} />,
                    code: ({ inline, className, children, ...props }: any) => {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline ? (
                            <TerminalCodeBlock
                                code={String(children).replace(/\n$/, '')}
                                language={match ? match[1] : undefined}
                                {...props}
                            />
                        ) : (
                            <code className="bg-white/5 px-1.5 py-0.5 rounded text-blue-400 font-mono text-xs" {...props}>
                                {children}
                            </code>
                        );
                    }
                }}
            >
                {mainContent}
            </ReactMarkdown>
        </div>
    );
};

const TypewriterText: React.FC<{ text: string; role: 'user' | 'assistant'; onComplete?: () => void }> = ({ text, role, onComplete }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (index < text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText(text.slice(0, index + 1));
                setIndex(prev => prev + 1);
            }, 5);
            return () => clearTimeout(timeout);
        } else if (onComplete) {
            onComplete();
        }
    }, [index, text, onComplete]);

    return <MessageRenderer content={displayedText} role={role} />;
};

const DeleteModal: React.FC<{ isOpen: boolean; onConfirm: () => void; onCancel: () => void }> = ({ isOpen, onConfirm, onCancel }) => (
    <AnimatePresence>
        {isOpen && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md px-4"
                onClick={onCancel}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="glass-card max-w-[320px] w-full p-10 border border-white/10 flex flex-col items-center text-center space-y-8"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="w-14 h-14 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center mb-2">
                        <Trash2 className="w-6 h-6 text-white/20" />
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-xl font-medium text-white tracking-tight">Limpar Sessão?</h3>
                        <p className="text-[9px] text-gray-500 leading-relaxed uppercase tracking-[0.2em]">Os dados serão removidos permanentemente do banco de dados.</p>
                    </div>
                    <div className="flex flex-col gap-3 w-full">
                        <button
                            onClick={onConfirm}
                            className="w-full py-4 bg-white text-black text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-gray-200 transition-all"
                        >
                            Confirmar
                        </button>
                        <button
                            onClick={onCancel}
                            className="w-full py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-white/20 hover:text-white transition-colors"
                        >
                            Voltar
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

const AIChatSection: React.FC = () => {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [animatingId, setAnimatingId] = useState<string | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        const loadSessions = async () => {
            try {
                // Carregar do localStorage
                const saved = localStorage.getItem('zero_chats');
                if (saved) {
                    const data = JSON.parse(saved) as ChatSession[];
                    setSessions(data);
                    if (data.length > 0 && !currentSessionId) {
                        const last = data[data.length - 1];
                        setCurrentSessionId(last.id);
                        setMessages(last.messages);
                    }
                }
            } catch (error) {
                console.error("Erro ao carregar histórico:", error);
            }
        };
        loadSessions();
    }, []);

    const syncSession = async (updatedMessages: Message[], sessionId: string | null) => {
        let sid = sessionId;
        let newSessions: ChatSession[];

        if (!sid) {
            sid = Date.now().toString();
            const newSession: ChatSession = {
                id: sid,
                title: updatedMessages.find(m => m.role === 'user')?.content.slice(0, 30) + '...' || 'Nova Conversa',
                messages: updatedMessages,
                lastUpdate: Date.now()
            };
            setCurrentSessionId(sid);
            newSessions = [newSession, ...sessions.filter(s => s.id !== sid)];
        } else {
            const currentSession = sessions.find(s => s.id === sid);
            const updatedSession = {
                id: sid,
                title: currentSession?.title || 'Conversa',
                messages: updatedMessages,
                lastUpdate: Date.now()
            };
            newSessions = [updatedSession, ...sessions.filter(s => s.id !== sid)];
        }

        setSessions(newSessions);
        // Salvar no localStorage
        localStorage.setItem('zero_chats', JSON.stringify(newSessions));
    };

    const handleNewChat = () => {
        setCurrentSessionId(null);
        setMessages(initialMessages);
        setShowSidebar(false);
    };

    const handleSwitchSession = (id: string) => {
        const session = sessions.find(s => s.id === id);
        if (session) {
            setCurrentSessionId(id);
            setMessages(session.messages);
            setShowSidebar(false);
        }
    };

    const confirmDelete = async () => {
        if (!deletingId) return;
        const id = deletingId;
        setDeletingId(null);

        try {
            const newSessions = sessions.filter(s => s.id !== id);
            setSessions(newSessions);
            localStorage.setItem('zero_chats', JSON.stringify(newSessions));

            if (currentSessionId === id) handleNewChat();
            toast.success("Arquivo removido.");
        } catch (error) {
            toast.error("Erro ao excluir sessão.");
        }
    };

    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleStopGeneration = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        setIsTyping(false);
        setAnimatingId(null);
        toast.info("Geração interrompida.");
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const newUserMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue,
            timestamp: new Date()
        };

        const updatedMessagesWithUser = [...messages, newUserMessage];
        setMessages(updatedMessagesWithUser);
        setInputValue('');
        setIsTyping(true);

        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            const response = await fetchAIChatResponse(newUserMessage.content, messages, controller.signal);

            const newAiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response,
                timestamp: new Date()
            };
            const finalMessages = [...updatedMessagesWithUser, newAiMessage];
            setMessages(finalMessages);
            setAnimatingId(newAiMessage.id);
            // Non-streamed response, keep isTyping true for animation
        } catch (error: any) {
            if (error.name === 'AbortError') {
                console.log('Fetch aborted');
            } else {
                toast.error("Erro ao obter resposta da Inteligência Zero.");
            }
            setIsTyping(false);
        } finally {
            abortControllerRef.current = null;
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <div id="chat-section" className="w-full max-w-5xl mx-auto mt-32 mb-16 px-4 flex flex-col items-center">
            <div className="w-full max-w-4xl flex flex-col items-center mb-16">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="flex items-center gap-3 px-4 py-1 border border-white/5 rounded-full mb-6"
                >
                    <Sparkles className="w-3 h-3 text-blue-500/60" />
                    <span className="text-[10px] tracking-[0.2em] text-gray-500 uppercase">Interactive Node</span>
                </motion.div>
                <h2 className="text-3xl font-medium text-white/90 tracking-tight mb-3">Inteligência Zero</h2>
                <p className="text-gray-500 text-sm font-light tracking-wide">Tire suas dúvidas sobre Triggers com nosso chat bot IA.</p>
            </div>

            <div className="w-full flex gap-6 relative">
                <div className={cn(
                    "fixed md:relative top-0 left-0 h-screen md:h-auto z-[60] md:z-0 bg-[#050505]/95 md:bg-transparent backdrop-blur-3xl md:backdrop-blur-none transition-all duration-500 flex flex-col shrink-0 border-r border-white/5 md:border-none",
                    showSidebar ? "w-80 p-6 opacity-100" : "w-0 overflow-hidden opacity-0"
                )}>
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-[10px] uppercase tracking-[0.3em] text-gray-700 font-bold">Encrypted Logs</h3>
                        <button onClick={handleNewChat} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                            <Plus className="w-4 h-4 text-white/40" />
                        </button>
                    </div>

                    <div className="flex-1 space-y-2 overflow-y-auto scrollbar-none pb-20">
                        {sessions.map(session => (
                            <div
                                key={session.id}
                                onClick={() => handleSwitchSession(session.id)}
                                className={cn(
                                    "p-4 rounded-none border border-transparent transition-all cursor-pointer group relative",
                                    currentSessionId === session.id ? "bg-white/5 border-white/5" : "hover:bg-white/[0.02]"
                                )}
                            >
                                <p className="text-[11px] text-gray-500 truncate pr-6 group-hover:text-white transition-colors">{session.title}</p>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setDeletingId(session.id); }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2 text-gray-700 hover:text-red-500 transition-all"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.99 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="flex-1 bg-white/[0.01] border border-white/5 min-h-[720px] max-h-[800px] flex flex-col relative group overflow-hidden"
                >
                    <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
                        <div className="flex items-center gap-6">
                            <button onClick={() => setShowSidebar(!showSidebar)} className="p-2 hover:bg-white/5 rounded transition-all">
                                <History className={cn("w-4 h-4", showSidebar ? "text-white" : "text-white/10")} />
                            </button>
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                                <span className="text-[9px] uppercase tracking-[0.2em] text-gray-600 font-bold">Reasoning Core active</span>
                            </div>
                        </div>
                    </div>

                    <div
                        ref={scrollContainerRef}
                        className="flex-1 p-8 md:p-12 space-y-16 overflow-y-auto scrollbar-none"
                    >
                        {messages.map((message) => (
                            <div key={message.id} className={cn("flex gap-8", message.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                                <div className={cn(
                                    "w-8 h-8 rounded-full shrink-0 flex items-center justify-center border",
                                    message.role === 'user' ? "bg-white border-white text-black" : "bg-black border-white/10 text-white/40"
                                )}>
                                    {message.role === 'user' ? 'U' : <Bot className="w-4 h-4" />}
                                </div>
                                <div className={cn(
                                    "max-w-[85%] text-sm leading-relaxed",
                                    message.role === 'user' ? "text-white/80 pr-4" : "text-gray-300"
                                )}>
                                    {message.role === 'assistant' && animatingId === message.id ? (
                                        <TypewriterText
                                            text={message.content}
                                            role="assistant"
                                            onComplete={() => {
                                                setAnimatingId(null);
                                                setIsTyping(false);
                                                syncSession(messages, currentSessionId);
                                            }}
                                        />
                                    ) : (
                                        <MessageRenderer content={message.content} role={message.role} />
                                    )}
                                </div>
                            </div>
                        ))}

                        {isTyping && !animatingId && (
                            <div className="flex items-center gap-10">
                                <div className="w-8 h-8 rounded-full bg-black border border-white/5 flex items-center justify-center">
                                    <Bot className="w-4 h-4 text-white/10" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className="text-[10px] text-gray-700 tracking-[0.4em] uppercase animate-pulse">Analizando requisição...</div>
                                    <div className="w-32 h-[1px] bg-gradient-to-r from-blue-500/40 to-transparent" />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-8 border-t border-white/5 bg-black/40">
                        <div className="max-w-4xl mx-auto flex items-center gap-6 relative">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => handleKeyPress(e)}
                                placeholder="PERGUNTAR_ALGO..."
                                className="flex-1 bg-white/[0.02] border border-white/5 rounded-none px-6 py-4 text-sm text-white focus:outline-none focus:border-white/20 placeholder:text-gray-800 placeholder:text-[10px] placeholder:tracking-[0.4em] font-light transition-all"
                            />
                            {isTyping ? (
                                <button
                                    onClick={handleStopGeneration}
                                    className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-none transition-all hover:bg-red-500/20 flex items-center gap-2 group"
                                >
                                    <Square className="w-4 h-4 fill-current group-hover:scale-90 transition-transform" />
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] hidden md:block">Parar</span>
                                </button>
                            ) : (
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!inputValue.trim()}
                                    className="p-4 bg-white text-black rounded-none disabled:opacity-5 transition-all hover:bg-gray-200"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>

            <DeleteModal
                isOpen={!!deletingId}
                onConfirm={confirmDelete}
                onCancel={() => setDeletingId(null)}
            />
        </div>
    );
};

export default AIChatSection;
