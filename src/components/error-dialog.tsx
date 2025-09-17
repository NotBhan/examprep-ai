
'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAppContext } from '@/hooks/use-app';

export function ErrorDialog() {
  const { errorDialog, hideErrorDialog } = useAppContext();

  return (
    <AlertDialog open={errorDialog.isOpen} onOpenChange={hideErrorDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{errorDialog.title}</AlertDialogTitle>
          <AlertDialogDescription>
            {errorDialog.message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={hideErrorDialog}>
            Close
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
