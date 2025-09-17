
'use client';

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
import { useAppContext } from '@/hooks/use-app';

export function DeleteSyllabusDialog() {
  const { deleteDialog, hideDeleteDialog, deleteSyllabus } = useAppContext();

  const handleDelete = () => {
    if (deleteDialog.syllabusId) {
      deleteSyllabus(deleteDialog.syllabusId);
      hideDeleteDialog();
    }
  };

  return (
    <AlertDialog open={deleteDialog.isOpen} onOpenChange={hideDeleteDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the syllabus{' '}
            <span className="font-bold">"{deleteDialog.syllabusName}"</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
