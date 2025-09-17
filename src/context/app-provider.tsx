
'use client';

import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { SyllabusMindMap } from '@/lib/types';
import { useRouter } from 'next/navigation';

export interface Syllabus {
  id: string;
  name: string;
  mindMap: SyllabusMindMap;
  // syllabusText is no longer stored directly in the main object list
  createdAt: string;
}

interface ErrorDialogState {
  isOpen: boolean;
  title: string;
  message: string;
}

interface RenameDialogState {
  isOpen: boolean;
  syllabusId: string | null;
  currentName: string;
}

interface DeleteDialogState {
    isOpen: boolean;
    syllabusId: string | null;
    syllabusName: string;
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
  
  // These provide data for the currently active syllabus
  mindMap: SyllabusMindMap | null;
  syllabusText: string | null;
  fileName: string | null;

  isSyllabusLoading: boolean;
  setIsSyllabusLoading: (isLoading: boolean) => void;

  errorDialog: ErrorDialogState;
  showErrorDialog: (title: string, message: string) => void;
  hideErrorDialog: () => void;
  
  renameDialog: RenameDialogState;
  showRenameDialog: (id: string, name: string) => void;
  hideRenameDialog: () => void;

  deleteDialog: DeleteDialogState;
  showDeleteDialog: (id: string, name: string) => void;
  hideDeleteDialog: () => void;
}

export const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(null);
  const [syllabuses, setSyllabuses] = useState<Syllabus[]>([]);
  const [activeSyllabusId, setActiveSyllabusId] = useState<string | null>(null);
  const [activeSyllabusText, setActiveSyllabusText] = useState<string | null>(null);
  const [isSyllabusLoading, setIsSyllabusLoading] = useState<boolean>(true);
  const [errorDialog, setErrorDialog] = useState<ErrorDialogState>({ isOpen: false, title: '', message: '' });
  const [renameDialog, setRenameDialog] = useState<RenameDialogState>({ isOpen: false, syllabusId: null, currentName: '' });
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({ isOpen: false, syllabusId: null, syllabusName: '' });
  const router = useRouter();

  const loadUserData = useCallback((username: string) => {
    setIsSyllabusLoading(true);
    try {
      const storedSyllabuses = localStorage.getItem(`${username}_syllabuses`);
      const storedActiveId = localStorage.getItem(`${username}_activeSyllabusId`);
      
      const parsedSyllabuses: Syllabus[] = storedSyllabuses ? JSON.parse(storedSyllabuses) : [];
      setSyllabuses(parsedSyllabuses);
      
      let currentActiveId = null;
      if (storedActiveId && parsedSyllabuses.some(s => s.id === storedActiveId)) {
        currentActiveId = storedActiveId;
      } else if (parsedSyllabuses.length > 0) {
        const sorted = [...parsedSyllabuses].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        currentActiveId = sorted[0].id;
      }
      
      if (currentActiveId) {
        setActiveSyllabusId(currentActiveId);
        const storedText = localStorage.getItem(`${username}_syllabus_text_${currentActiveId}`);
        setActiveSyllabusText(storedText);
      } else {
        setActiveSyllabusId(null);
        setActiveSyllabusText(null);
      }

    } catch (error) {
      console.error('Failed to parse syllabus data from localStorage', error);
      setSyllabuses([]);
      setActiveSyllabusId(null);
      setActiveSyllabusText(null);
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
      setActiveSyllabusText(null);
    }
  };

  const persistSyllabuses = (syllabusesToPersist: Syllabus[]) => {
    if (user) {
      try {
        localStorage.setItem(`${user}_syllabuses`, JSON.stringify(syllabusesToPersist));
        setSyllabuses(syllabusesToPersist);
      } catch (error) {
        console.error("Failed to save syllabuses to localStorage", error);
        throw error;
      }
    }
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
     if (id && user) {
        const storedText = localStorage.getItem(`${user}_syllabus_text_${id}`);
        setActiveSyllabusText(storedText);
     } else {
        setActiveSyllabusText(null);
     }
  }

  const addSyllabus = ({ mindMap, syllabusText, fileName }: { mindMap: SyllabusMindMap; syllabusText: string; fileName: string }) => {
    if (!user) return;
    const newSyllabus: Syllabus = {
      id: `syllabus_${Date.now()}`,
      name: fileName,
      mindMap,
      createdAt: new Date().toISOString(),
    };
    
    try {
      // Store the large text separately
      localStorage.setItem(`${user}_syllabus_text_${newSyllabus.id}`, syllabusText);
      
      const updatedSyllabuses = [...syllabuses, newSyllabus];
      persistSyllabuses(updatedSyllabuses);
      persistActiveSyllabusId(newSyllabus.id);

    } catch (error) {
      console.error("Failed to save new syllabus, storage might be full.", error);
      // Clean up the text if the syllabus list fails to update
      localStorage.removeItem(`${user}_syllabus_text_${newSyllabus.id}`);
      throw error;
    }
  };

  const deleteSyllabus = (id: string) => {
    if (!user) return;
    
    const updatedSyllabuses = syllabuses.filter(s => s.id !== id);
    persistSyllabuses(updatedSyllabuses);
    localStorage.removeItem(`${user}_syllabus_text_${id}`);
    
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

  const showErrorDialog = (title: string, message: string) => {
    setErrorDialog({ isOpen: true, title, message });
  };

  const hideErrorDialog = () => {
    setErrorDialog({ isOpen: false, title: '', message: '' });
  };
  
  const showRenameDialog = (syllabusId: string, currentName: string) => {
    setRenameDialog({ isOpen: true, syllabusId, currentName });
  };

  const hideRenameDialog = () => {
    setRenameDialog({ isOpen: false, syllabusId: null, currentName: '' });
  };
  
  const showDeleteDialog = (syllabusId: string, syllabusName: string) => {
    setDeleteDialog({ isOpen: true, syllabusId, syllabusName });
  };

  const hideDeleteDialog = () => {
    setDeleteDialog({ isOpen: false, syllabusId: null, syllabusName: '' });
  };

  const activeSyllabus = syllabuses.find(s => s.id === activeSyllabusId) || null;

  const mindMap = activeSyllabus?.mindMap || null;
  const syllabusText = activeSyllabusText;
  const fileName = activeSyllabus?.name || null;
  
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
      isSyllabusLoading, 
      setIsSyllabusLoading,
      errorDialog,
      showErrorDialog,
      hideErrorDialog,
      renameDialog,
      showRenameDialog,
      hideRenameDialog,
      deleteDialog,
      showDeleteDialog,
      hideDeleteDialog
    }}>
      {children}
    </AppContext.Provider>
  );
}
