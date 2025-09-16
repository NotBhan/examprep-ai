'use client';

import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { SyllabusMindMap } from '@/lib/types';

interface AppContextType {
  user: string | null;
  login: (username: string) => void;
  logout: () => void;
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
  const [user, setUser] = useState<string | null>(null);
  const [mindMap, setMindMap] = useState<SyllabusMindMap | null>(null);
  const [syllabusText, setSyllabusText] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isSyllabusLoading, setIsSyllabusLoading] = useState<boolean>(true);

  const loadUserData = useCallback((username: string) => {
    setIsSyllabusLoading(true);
    try {
      const storedMindMap = localStorage.getItem(`${username}_mindMap`);
      const storedSyllabusText = localStorage.getItem(`${username}_syllabusText`);
      const storedFileName = localStorage.getItem(`${username}_fileName`);
      
      if (storedMindMap) setMindMap(JSON.parse(storedMindMap));
        else setMindMap(null);
      if (storedSyllabusText) setSyllabusText(storedSyllabusText);
        else setSyllabusText(null);
      if (storedFileName) setFileName(storedFileName);
        else setFileName(null);
    } catch (error) {
      console.error('Failed to parse syllabus data from localStorage', error);
      clearSyllabusData();
    } finally {
      setIsSyllabusLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      setUser(storedUser);
      loadUserData(storedUser);
    } else {
      setIsSyllabusLoading(false);
    }
  }, [loadUserData]);
  
  const login = (username: string) => {
    sessionStorage.setItem('user', username);
    setUser(username);
    loadUserData(username);
  };

  const logout = () => {
    if (user) {
      sessionStorage.removeItem('user');
      setUser(null);
      setMindMap(null);
      setSyllabusText(null);
      setFileName(null);
    }
  };

  const setSyllabusData = ({ mindMap, syllabusText, fileName }: { mindMap: SyllabusMindMap; syllabusText: string; fileName: string }) => {
    if (user) {
        try {
            localStorage.setItem(`${user}_mindMap`, JSON.stringify(mindMap));
            localStorage.setItem(`${user}_syllabusText`, syllabusText);
            localStorage.setItem(`${user}_fileName`, fileName);
            setMindMap(mindMap);
            setSyllabusText(syllabusText);
            setFileName(fileName);
        } catch (error) {
            console.error('Failed to save syllabus data to localStorage', error);
        }
    }
  };

  const clearSyllabusData = () => {
    if(user) {
        localStorage.removeItem(`${user}_mindMap`);
        localStorage.removeItem(`${user}_syllabusText`);
        localStorage.removeItem(`${user}_fileName`);
    }
    setMindMap(null);
    setSyllabusText(null);
    setFileName(null);
  };

  return (
    <AppContext.Provider value={{ user, login, logout, mindMap, syllabusText, fileName, setSyllabusData, clearSyllabusData, isSyllabusLoading, setIsSyllabusLoading }}>
      {children}
    </AppContext.Provider>
  );
}
