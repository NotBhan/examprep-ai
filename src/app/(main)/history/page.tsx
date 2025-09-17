
'use client';

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
import { Trash2, Edit, BookOpen, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function SyllabusHistoryPage() {
  const { syllabuses, activeSyllabus, setActiveSyllabus, showDeleteDialog, showRenameDialog } = useAppContext();
  const { toast } = useToast();

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
                    <p className="font-semibold">{syllabus.name}</p>
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
                   <Button variant="ghost" size="sm" onClick={() => showRenameDialog(syllabus.id, syllabus.name)}>
                     <Edit className="mr-2 h-4 w-4"/> Rename
                   </Button>
                  <Button variant="destructive-ghost" size="sm" onClick={() => showDeleteDialog(syllabus.id, syllabus.name)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </Button>
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
