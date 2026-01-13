
import React, { useState, useRef, useEffect } from 'react';
import { Copy, CheckCircle2, Zap, Code, Repeat, Clock, Save, Cloud, FileText, Settings, Database, Server } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import AnimatedButton from './AnimatedButton';
import CustomCheckbox from './CustomCheckbox';
import { generateTrigger } from '@/utils/generateTrigger';
import { saveTrigger, getSavedTriggers, deleteTrigger } from '@/utils/triggerStorage';
import SavedTriggers from './SavedTriggers';

const TriggerGenerator: React.FC = () => {
  const [event1, setEvent1] = useState('');
  const [event2, setEvent2] = useState('');
  const [cityName, setCityName] = useState('');
  const [triggerName, setTriggerName] = useState('');
  const [isAutomated, setIsAutomated] = useState(false);
  const [repetitions, setRepetitions] = useState(10);
  const [delay, setDelay] = useState(1000);
  const [generatedCode, setGeneratedCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSavedTriggers, setShowSavedTriggers] = useState(false);
  const [savedTriggers, setSavedTriggers] = useState(() => getSavedTriggers());
  const codeRef = useRef<HTMLPreElement>(null);

  // Load saved triggers on mount
  useEffect(() => {
    setSavedTriggers(getSavedTriggers());
  }, []);

  const handleGenerate = () => {
    if (!event1 || !event2) {
      toast.error('Por favor, preencha os eventos necessários');
      return;
    }

    setIsGenerating(true);

    // Simulate processing time for better UX
    setTimeout(async () => {
      const code = generateTrigger({
        event1,
        event2,
        cityName,
        isAutomated,
        repetitions,
        delay
      });

      setGeneratedCode(code);
      setIsGenerating(false);

      // Enviar log para o webhook via backend
      try {
        await fetch('/api/webhooks/trigger', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cityName, code, event1, event2 })
        });
      } catch (e) {
        console.error("Erro ao enviar log para o webhook");
      }

      toast.success('Trigger gerada com sucesso!');
    }, 800);
  };

  const handleCopy = () => {
    if (!generatedCode) return;

    navigator.clipboard.writeText(generatedCode);
    setIsCopied(true);
    toast.success('Código copiado para a área de transferência!');

    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const handleSaveTrigger = () => {
    if (!generatedCode) {
      toast.error('Gere uma trigger antes de salvar');
      return;
    }

    if (!triggerName.trim()) {
      toast.error('Por favor, dê um nome para a trigger');
      return;
    }

    const newTrigger = saveTrigger(triggerName, cityName, generatedCode);
    setSavedTriggers(prev => [...prev, newTrigger]);
    toast.success('Trigger salva com sucesso!');
    setTriggerName('');
  };

  const handleDeleteTrigger = (id: string) => {
    deleteTrigger(id);
    setSavedTriggers(prev => prev.filter(trigger => trigger.id !== id));
    toast.success('Trigger excluída com sucesso!');
  };

  // Function to handle direct input for repetitions
  const handleRepetitionsInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0 && value <= 1000) {
      setRepetitions(value);
    }
  };

  // Function to handle direct input for delay
  const handleDelayInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 100 && value <= 10000) {
      setDelay(value);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-none p-6 relative overflow-hidden group transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] hover:border-white/10"
          >
            <h2 className="text-lg font-medium mb-8 text-white/90 flex items-center gap-3 tracking-tight">
              <Database className="w-5 h-5 opacity-40" />
              Dados da Trigger
            </h2>

            <div className="space-y-4">
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <label htmlFor="event1" className="block text-sm font-medium text-gray-300 flex items-center gap-1">
                  <Code className="w-4 h-4 text-white/80" />
                  Primeiro Evento
                </label>
                <input
                  id="event1"
                  type="text"
                  value={event1}
                  onChange={(e) => setEvent1(e.target.value)}
                  className="w-full bg-transparent border-b border-white/5 py-3 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-white/20 transition-all duration-300"
                  placeholder="Ex: admin:giveItem"
                />
              </motion.div>

              <motion.div
                className="space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <label htmlFor="event2" className="block text-sm font-medium text-gray-300 flex items-center gap-1">
                  <Server className="w-4 h-4 text-white/80" />
                  Segundo Evento
                </label>
                <input
                  id="event2"
                  type="text"
                  value={event2}
                  onChange={(e) => setEvent2(e.target.value)}
                  className="w-full bg-transparent border-b border-white/5 py-3 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-white/20 transition-all duration-300"
                  placeholder="Ex: {id: 1, quantidade: 100}"
                />
              </motion.div>

              <motion.div
                className="space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <label htmlFor="cityName" className="block text-sm font-medium text-gray-300 flex items-center gap-1">
                  <FileText className="w-4 h-4 text-white/80" />
                  Nome da Cidade (organizacional)
                </label>
                <input
                  id="cityName"
                  type="text"
                  value={cityName}
                  onChange={(e) => setCityName(e.target.value)}
                  className="w-full bg-transparent border-b border-white/5 py-3 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-white/20 transition-all duration-300"
                  placeholder="Ex: rp"
                />
                <p className="text-xs text-gray-500 mt-1">
                  *O nome da cidade é usado apenas para organização das triggers salvas
                </p>
              </motion.div>

              <motion.div
                className="pt-2 flex gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <AnimatedButton
                  onClick={handleGenerate}
                  isLoading={isGenerating}
                  icon={<Zap className="w-4 h-4" />}
                  className="flex-1"
                >
                  Gerar Trigger
                </AnimatedButton>

                <AnimatedButton
                  variant="outline"
                  onClick={() => setShowSavedTriggers(!showSavedTriggers)}
                  icon={<Cloud className="w-4 h-4" />}
                  className="flex-1"
                >
                  {showSavedTriggers ? 'Voltar' : 'Minhas Triggers'}
                </AnimatedButton>
              </motion.div>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {!showSavedTriggers ? (
              <motion.div
                key="automation"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-card rounded-none p-6 relative overflow-hidden"
              >
                <h2 className="text-lg font-medium mb-8 text-white/90 flex items-center gap-3 tracking-tight">
                  <Settings className="w-5 h-5 opacity-40" />
                  Automatização
                </h2>

                <div className="space-y-10">
                  <div className="flex items-center gap-3 group cursor-pointer">
                    <CustomCheckbox
                      id="automated"
                      checked={isAutomated}
                      onCheckedChange={setIsAutomated}
                    />
                    <label htmlFor="automated" className="text-sm text-gray-400 group-hover:text-white transition-colors cursor-pointer font-light">
                      Ativar fluxo automatizado
                    </label>
                  </div>

                  <AnimatePresence>
                    {isAutomated && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{
                          opacity: 1,
                          height: 'auto',
                          marginTop: 24,
                          transition: {
                            height: { duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] },
                            opacity: { duration: 0.3, delay: 0.1 },
                            marginTop: { duration: 0.4 }
                          }
                        }}
                        exit={{
                          opacity: 0,
                          height: 0,
                          marginTop: 0,
                          transition: {
                            height: { duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] },
                            opacity: { duration: 0.2 },
                            marginTop: { duration: 0.3 }
                          }
                        }}
                        className="space-y-10 overflow-hidden"
                      >
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <label htmlFor="repetitions" className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-semibold flex items-center gap-2">
                              <Repeat className="w-3 h-3" />
                              Repetições
                            </label>
                            <div className="flex items-center">
                              <input
                                type="number"
                                value={repetitions}
                                onChange={handleRepetitionsInput}
                                min={1}
                                max={1000}
                                className="w-12 bg-transparent text-right text-sm text-white focus:outline-none border-b border-white/5 focus:border-white/20 transition-colors"
                              />
                              <span className="text-[10px] text-gray-600 ml-1 font-bold">X</span>
                            </div>
                          </div>
                          <input
                            id="repetitions"
                            type="range"
                            min={1}
                            max={1000}
                            value={repetitions}
                            onChange={(e) => setRepetitions(parseInt(e.target.value))}
                            className="w-full h-[2px] bg-white/5 appearance-none cursor-pointer accent-white"
                          />
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <label htmlFor="delay" className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-semibold flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              Delay Interativo
                            </label>
                            <div className="flex items-center">
                              <input
                                type="number"
                                value={delay}
                                onChange={handleDelayInput}
                                min={100}
                                max={10000}
                                step={100}
                                className="w-16 bg-transparent text-right text-sm text-white focus:outline-none border-b border-white/5 focus:border-white/20 transition-colors"
                              />
                              <span className="text-[10px] text-gray-600 ml-1 font-bold">MS</span>
                            </div>
                          </div>
                          <input
                            id="delay"
                            type="range"
                            min={100}
                            max={10000}
                            step={100}
                            value={delay}
                            onChange={(e) => setDelay(parseInt(e.target.value))}
                            className="w-full h-[2px] bg-white/5 appearance-none cursor-pointer accent-white"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="savedTriggers"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <SavedTriggers
                  savedTriggers={savedTriggers}
                  onDelete={handleDeleteTrigger}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card rounded-none p-6 h-full flex flex-col relative overflow-hidden group transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] hover:border-white/10"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-white/90 flex items-center gap-3 tracking-tight">
              <FileText className="w-5 h-5 opacity-40" />
              Código Gerado
            </h2>
            <div className="flex gap-2">
              <AnimatedButton
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                disabled={!generatedCode}
                icon={isCopied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                className={cn(
                  "transition-all",
                  isCopied ? "text-green-500" : "text-gray-400 hover:text-zero-yellow"
                )}
              >
                {isCopied ? 'Copiado' : 'Copiar'}
              </AnimatedButton>

              <AnimatedButton
                variant="ghost"
                size="sm"
                onClick={() => setTriggerName(event1 || 'Nova Trigger')}
                disabled={!generatedCode}
                icon={<Save className="w-4 h-4" />}
                className="text-gray-400 hover:text-zero-yellow"
              >
                Salvar
              </AnimatedButton>
            </div>
          </div>

          {generatedCode && (
            <motion.div
              className="mb-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="space-y-2">
                <label htmlFor="triggerName" className="block text-sm font-medium text-gray-300 flex items-center gap-1">
                  <Save className="w-4 h-4 text-white/80" />
                  Nome da Trigger
                </label>
                <div className="flex gap-2">
                  <input
                    id="triggerName"
                    type="text"
                    value={triggerName}
                    onChange={(e) => setTriggerName(e.target.value)}
                    className="flex-1 bg-transparent border-b border-white/5 py-2 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-white/20 transition-all duration-300"
                    placeholder="Ex: Admin Money"
                  />
                  <AnimatedButton
                    onClick={handleSaveTrigger}
                    disabled={!triggerName.trim()}
                    icon={<Save className="w-4 h-4" />}
                  >
                    Salvar
                  </AnimatedButton>
                </div>
              </div>
            </motion.div>
          )}

          <div className="relative flex-1 rounded-none overflow-hidden">
            <pre
              ref={codeRef}
              className={cn(
                "h-full overflow-auto text-sm font-mono bg-zero-dark-200 border border-zero-dark-300 rounded-none p-4",
                !generatedCode && "flex items-center justify-center text-gray-500"
              )}
            >
              {generatedCode ? (
                <code className="text-white">{generatedCode}</code>
              ) : (
                "O código gerado aparecerá aqui"
              )}
            </pre>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TriggerGenerator;
