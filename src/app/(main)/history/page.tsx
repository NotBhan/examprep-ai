
'use client';

import { useState, useRef, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/hooks/use-app';
import { Trash2, Edit, Check, X, BookOpen, PlusCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function SyllabusHistoryPage() {
  const { syllabuses, activeSyllabus, setActiveSyllabus, deleteSyllabus, updateSyllabusName } = useAppContext();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingId]);

  const handleEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditingName(currentName);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleSaveEdit = () => {
    if (editingId && editingName.trim()) {
      updateSyllabusName(editingId, editingName.trim());
      toast({ title: 'Success', description: 'Syllabus renamed.' });
      handleCancelEdit();
    }
  };
  
  const handleSetActive = (id: string) => {
    setActiveSyllabus(id);
    toast({ title: 'Syllabus Changed', description: `Switched to ${syllabuses.find(s=>s.id === id)?.name}.`});
  }

  const sortedSyllabuses = [...syllabuses].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (syllabuses.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center text-center mt-12">
            <Card className="max-w-lg">
                <CardHeader>
                    <CardTitle className="flex items-center justify-center gap-2">
                        <BookOpen className="h-8 w-8 text-primary"/>
                        No Syllabuses Yet
                    </CardTitle>
                    <CardDescription>
                        You haven't uploaded any syllabuses. Upload one to get started!
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="/upload">
                            <PlusCircle className="mr-2 h-4 w-4"/>
                            Upload First Syllabus
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight font-headline mb-4">
        Syllabus History
      </h2>
      <Card>
        <CardHeader>
          <CardTitle>Manage Your Syllabuses</CardTitle>
          <CardDescription>
            Here you can view, activate, rename, or delete your saved syllabuses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {sortedSyllabuses.map((syllabus) => (
              <li
                key={syllabus.id}
                className={`flex flex-col md:flex-row items-start md:items-center gap-4 p-4 rounded-lg border transition-colors ${
                  syllabus.id === activeSyllabus?.id
                    ? 'bg-accent/50 border-primary/50'
                    : 'bg-card'
                }`}
              >
                <div className="flex-grow">
                  {editingId === syllabus.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        ref={inputRef}
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                        className="h-9"
                      />
                      <Button size="icon" variant="ghost" className="h-9 w-9" onClick={handleSaveEdit}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-9 w-9" onClick={handleCancelEdit}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <p className="font-semibold">{syllabus.name}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Created {formatDistanceToNow(new Date(syllabus.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                   {syllabus.id !== activeSyllabus?.id && (
                     <Button variant="outline" size="sm" onClick={() => handleSetActive(syllabus.id)}>
                       Activate
                     </Button>
                   )}
                   <Button variant="ghost" size="sm" onClick={() => handleEdit(syllabus.id, syllabus.name)}>
                     <Edit className="mr-2 h-4 w-4"/> Rename
                   </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive-ghost" size="sm">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the syllabus
                          <span className="font-bold"> "{syllabus.name}"</span>.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteSyllabus(syllabus.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

// Add destructive-ghost to button variants if it does not exist
// This is a common pattern for "dangerous but not primary" actions
declare module "@/components/ui/button" {
    interface ButtonProps {
        variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "destructive-ghost";
    }
}
