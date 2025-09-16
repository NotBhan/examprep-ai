
'use client';

import { useEffect, useState } from 'react';
import { Icons } from '@/components/icons';
import { Progress } from '@/components/ui/progress';

export function Loader() {
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? 10 : prev + 10));
    }, 600);
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
        <p className="text-muted-foreground">Analyzing your syllabus...</p>
        <Progress value={progress} className="w-1/3" />
    </div>
  );
}
