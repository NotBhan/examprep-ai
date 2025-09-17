
'use client';

import { useState, useEffect, useRef } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { useAppContext } from '@/hooks/use-app';
import { useToast } from '@/hooks/use-toast';
import { Label } from './ui/label';

export function RenameSyllabusDialog() {
  const { renameDialog, hideRenameDialog, updateSyllabusName } = useAppContext();
  const { toast } = useToast();
  const [editingName, setEditingName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renameDialog.isOpen) {
      setEditingName(renameDialog.currentName);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [renameDialog.isOpen, renameDialog.currentName]);

  const handleSave = () => {
    if (renameDialog.syllabusId && editingName.trim()) {
      updateSyllabusName(renameDialog.syllabusId, editingName.trim());
      toast({ title: 'Success', description: 'Syllabus renamed.' });
      hideRenameDialog();
    }
  };

  return (
    <AlertDialog open={renameDialog.isOpen} onOpenChange={hideRenameDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Rename Syllabus</AlertDialogTitle>
          <AlertDialogDescription>
            Enter a new name for the syllabus "{renameDialog.currentName}".
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2">
            <Label htmlFor="syllabusName" className="sr-only">New syllabus name</Label>
            <Input
                id="syllabusName"
                ref={inputRef}
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleSave}>Save</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
