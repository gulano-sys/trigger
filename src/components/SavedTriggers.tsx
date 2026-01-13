
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, ChevronDown, ChevronRight, Trash2, Copy } from 'lucide-react';
import AnimatedButton from './AnimatedButton';
import { toast } from 'sonner';

interface SavedTrigger {
  id: string;
  name: string;
  cityName: string;
  code: string;
  timestamp: number;
}

interface SavedTriggersProps {
  savedTriggers: SavedTrigger[];
  onDelete: (id: string) => void;
}

const SavedTriggers: React.FC<SavedTriggersProps> = ({ savedTriggers, onDelete }) => {
  const [expandedCity, setExpandedCity] = useState<string | null>(null);

  // Group triggers by city name
  const triggersByCity: Record<string, SavedTrigger[]> = savedTriggers.reduce((acc, trigger) => {
    const cityName = trigger.cityName || 'Sem Cidade';
    if (!acc[cityName]) {
      acc[cityName] = [];
    }
    acc[cityName].push(trigger);
    return acc;
  }, {} as Record<string, SavedTrigger[]>);

  const handleCopyTrigger = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Trigger copiada para a área de transferência!');
  };

  const toggleCity = (cityName: string) => {
    setExpandedCity(expandedCity === cityName ? null : cityName);
  };

  return (
    <motion.div
      className="glass-card rounded-lg p-6 w-full h-full flex flex-col group transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] hover:border-white/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-lg font-medium mb-8 text-white/90 flex items-center gap-3 tracking-tight">
        <Folder className="w-5 h-5 opacity-40" />
        Arquivos Salvos
      </h2>

      {Object.keys(triggersByCity).length === 0 ? (
        <div className="text-center py-8 text-gray-400 flex-grow flex items-center justify-center">
          <div>
            <p>Nenhuma trigger salva ainda.</p>
            <p className="text-sm mt-2">Gere e salve triggers para visualizá-las aqui.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 flex-grow overflow-auto">
          {Object.entries(triggersByCity).map(([cityName, triggers]) => (
            <div key={cityName} className="border border-zero-dark-300 rounded-md overflow-hidden">
              <div
                className="bg-zero-dark-200 py-2 px-4 flex items-center justify-between cursor-pointer"
                onClick={() => toggleCity(cityName)}
              >
                <div className="flex items-center gap-2">
                  <Folder size={18} className="text-zero-yellow" />
                  <span className="font-medium">{cityName}</span>
                  <span className="text-xs text-gray-400">({triggers.length})</span>
                </div>
                {expandedCity === cityName ?
                  <ChevronDown size={18} /> :
                  <ChevronRight size={18} />
                }
              </div>

              <AnimatePresence>
                {expandedCity === cityName && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="divide-y divide-zero-dark-300">
                      {triggers.map((trigger) => (
                        <div key={trigger.id} className="py-3 px-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">{trigger.name}</p>
                              <p className="text-xs text-gray-400">
                                {new Date(trigger.timestamp).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <AnimatedButton
                                variant="ghost"
                                size="sm"
                                icon={<Copy size={16} />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyTrigger(trigger.code);
                                }}
                                className="text-gray-400 hover:text-zero-yellow"
                              />
                              <AnimatedButton
                                variant="ghost"
                                size="sm"
                                icon={<Trash2 size={16} />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDelete(trigger.id);
                                }}
                                className="text-gray-400 hover:text-red-500"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default SavedTriggers;
