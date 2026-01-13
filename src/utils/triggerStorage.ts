
interface SavedTrigger {
  id: string;
  name: string;
  cityName: string;
  code: string;
  timestamp: number;
}

const STORAGE_KEY = 'zero_network_saved_triggers';

export const saveTrigger = (name: string, cityName: string, code: string): SavedTrigger => {
  const savedTriggers = getSavedTriggers();
  
  const newTrigger: SavedTrigger = {
    id: generateId(),
    name,
    cityName,
    code,
    timestamp: Date.now()
  };
  
  savedTriggers.push(newTrigger);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedTriggers));
  
  return newTrigger;
};

export const getSavedTriggers = (): SavedTrigger[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error parsing saved triggers', error);
    return [];
  }
};

export const deleteTrigger = (id: string): void => {
  const savedTriggers = getSavedTriggers();
  const filteredTriggers = savedTriggers.filter(trigger => trigger.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredTriggers));
};

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};
