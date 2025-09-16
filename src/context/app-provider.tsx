
'use client';

import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { SyllabusMindMap } from '@/lib/types';
import { useRouter } from 'next/navigation';

export interface Syllabus {
  id: string;
  name: string;
  mindMap: SyllabusMindMap;
  syllabusText: string;
  createdAt: string;
}

interface AppContextType {
  user: string | null;
  login: (username: string) => void;
  logout: () => void;
  
  syllabuses: Syllabus[];
  activeSyllabus: Syllabus | null;
  setActiveSyllabus: (id: string) => void;
  addSyllabus: (data: { mindMap: SyllabusMindMap; syllabusText: string; fileName: string }) => void;
  deleteSyllabus: (id: string) => void;
  updateSyllabusName: (id: string, newName: string) => void;
  
  // Legacy accessors for components that haven't been migrated yet
  mindMap: SyllabusMindMap | null;
  syllabusText: string | null;
  fileName: string | null;

  isSyllabusLoading: boolean;
  setIsSyllabusLoading: (isLoading: boolean) => void;
}

export const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(null);
  const [syllabuses, setSyllabuses] = useState<Syllabus[]>([]);
  const [activeSyllabusId, setActiveSyllabusId] = useState<string | null>(null);
  const [isSyllabusLoading, setIsSyllabusLoading] = useState<boolean>(true);
  const router = useRouter();

  const loadUserData = useCallback((username: string) => {
    setIsSyllabusLoading(true);
    try {
      const storedSyllabuses = localStorage.getItem(`${username}_syllabuses`);
      const storedActiveId = localStorage.getItem(`${username}_activeSyllabusId`);
      
      const parsedSyllabuses: Syllabus[] = storedSyllabuses ? JSON.parse(storedSyllabuses) : [];
      setSyllabuses(parsedSyllabuses);

      if (storedActiveId && parsedSyllabuses.some(s => s.id === storedActiveId)) {
        setActiveSyllabusId(storedActiveId);
      } else if (parsedSyllabuses.length > 0) {
        setActiveSyllabusId(parsedSyllabuses[0].id);
      } else {
        setActiveSyllabusId(null);
      }

    } catch (error) {
      console.error('Failed to parse syllabus data from localStorage', error);
      setSyllabuses([]);
      setActiveSyllabusId(null);
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
      setSyllabuses([]);
      setActiveSyllabusId(null);
    }
  };

  const persistSyllabuses = (syllabuses: Syllabus[]) => {
    if (user) {
      localStorage.setItem(`${user}_syllabuses`, JSON.stringify(syllabuses));
    }
    setSyllabuses(syllabuses);
  };

  const persistActiveSyllabusId = (id: string | null) => {
     if (user) {
        if (id) {
            localStorage.setItem(`${user}_activeSyllabusId`, id);
        } else {
            localStorage.removeItem(`${user}_activeSyllabusId`);
        }
     }
     setActiveSyllabusId(id);
  }

  const addSyllabus = ({ mindMap, syllabusText, fileName }: { mindMap: SyllabusMindMap; syllabusText: string; fileName: string }) => {
    const newSyllabus: Syllabus = {
      id: `syllabus_${Date.now()}`,
      name: fileName,
      mindMap,
      syllabusText,
      createdAt: new Date().toISOString(),
    };
    const updatedSyllabuses = [...syllabuses, newSyllabus];
    persistSyllabuses(updatedSyllabuses);
    persistActiveSyllabusId(newSyllabus.id);
  };

  const deleteSyllabus = (id: string) => {
    const updatedSyllabuses = syllabuses.filter(s => s.id !== id);
    persistSyllabuses(updatedSyllabuses);
    if (activeSyllabusId === id) {
      const newActiveId = updatedSyllabuses.length > 0 ? updatedSyllabuses[0].id : null;
      persistActiveSyllabusId(newActiveId);
      if (!newActiveId) {
        router.push('/upload');
      }
    }
  };

  const updateSyllabusName = (id: string, newName: string) => {
    const updatedSyllabuses = syllabuses.map(s => 
      s.id === id ? { ...s, name: newName } : s
    );
    persistSyllabuses(updatedSyllabuses);
  };

  const setActiveSyllabus = (id: string) => {
    if (syllabuses.some(s => s.id === id)) {
        persistActiveSyllabusId(id);
    }
  };

  const activeSyllabus = syllabuses.find(s => s.id === activeSyllabusId) || null;

  // Temporary backward compatibility for older components
  const mindMap = activeSyllabus?.mindMap || null;
  const syllabusText = activeSyllabus?.syllabusText || null;
  const fileName = activeSyllabus?.name || null;
  const setSyllabusData = addSyllabus;
  const clearSyllabusData = () => { if(activeSyllabus) deleteSyllabus(activeSyllabus.id)};
  
  return (
    <AppContext.Provider value={{ 
      user, 
      login, 
      logout, 
      syllabuses,
      activeSyllabus,
      setActiveSyllabus,
      addSyllabus,
      deleteSyllabus,
      updateSyllabusName,
      mindMap,
      syllabusText,
      fileName,
      setSyllabusData, // for backward compatibility with upload component
      clearSyllabusData, // for backward compatibility
      isSyllabusLoading, 
      setIsSyllabusLoading 
    }}>
      {children}
    </AppContext.Provider>
  );
}
