
'use client';

import { useEffect, useState } from 'react';
import { Icons } from '@/components/icons';
import { Loader2 } from 'lucide-react';

const analysisPhases = [
    "Parsing document...",
    "Identifying main topics...",
    "Structuring sub-topics...",
    "Estimating importance...",
    "Building mind map...",
];

export function Loader() {
  const [currentPhase, setCurrentPhase] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
        setCurrentPhase((prev) => (prev + 1) % analysisPhases.length);
    }, 1500);
    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-3">
            <Icons.logo className="size-10 text-primary" />
            <h2 className="font-headline text-3xl font-semibold">ExamPrep AI</h2>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin"/>
            <p className="transition-all duration-300">{analysisPhases[currentPhase]}</p>
        </div>
    </div>
  );
}
