'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';
import type { SyllabusMindMap } from '@/lib/types';

interface AppContextType {
  mindMap: SyllabusMindMap | null;
  syllabusText: string | null;
  fileName: string | null;
  setSyllabusData: (data: { mindMap: SyllabusMindMap; syllabusText: string; fileName: string }) => void;
  clearSyllabusData: () => void;
  isSyllabusLoading: boolean;
  setIsSyllabusLoading: (isLoading: boolean) => void;
}

export const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [mindMap, setMindMap] = useState<SyllabusMindMap | null>(null);
  const [syllabusText, setSyllabusText] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isSyllabusLoading, setIsSyllabusLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const storedMindMap = localStorage.getItem('mindMap');
      const storedSyllabusText = localStorage.getItem('syllabusText');
      const storedFileName = localStorage.getItem('fileName');
      
      if (storedMindMap) {
        setMindMap(JSON.parse(storedMindMap));
      }
      if (storedSyllabusText) {
        setSyllabusText(storedSyllabusText);
      }
      if (storedFileName) {
        setFileName(storedFileName);
      }
    } catch (error) {
      console.error('Failed to parse syllabus data from localStorage', error);
      clearSyllabusData();
    } finally {
      setIsSyllabusLoading(false);
    }
  }, []);

  const setSyllabusData = ({ mindMap, syllabusText, fileName }: { mindMap: SyllabusMindMap; syllabusText: string; fileName: string }) => {
    try {
        localStorage.setItem('mindMap', JSON.stringify(mindMap));
        localStorage.setItem('syllabusText', syllabusText);
        localStorage.setItem('fileName', fileName);
        setMindMap(mindMap);
        setSyllabusText(syllabusText);
        setFileName(fileName);
    } catch (error) {
        console.error('Failed to save syllabus data to localStorage', error);
    }
  };

  const clearSyllabusData = () => {
    setMindMap(null);
    setSyllabusText(null);
    setFileName(null);
    localStorage.removeItem('mindMap');
    localStorage.removeItem('syllabusText');
    localStorage.removeItem('fileName');
  };

  return (
    <AppContext.Provider value={{ mindMap, syllabusText, fileName, setSyllabusData, clearSyllabusData, isSyllabusLoading, setIsSyllabusLoading }}>
      {children}
    </AppContext.Provider>
  );
}
