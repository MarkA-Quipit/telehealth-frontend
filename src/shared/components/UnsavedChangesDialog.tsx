import type { Blocker } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/shared/ui/alert-dialog';
import { Button } from '@/shared/ui/button';

interface UnsavedChangesDialogProps {
  blocker: Blocker;
}

export function UnsavedChangesDialog({ blocker }: UnsavedChangesDialogProps) {
  return (
    <AlertDialog open={blocker.state === 'blocked'}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Abandon changes?</AlertDialogTitle>
          <AlertDialogDescription>
            You have unsaved changes. If you leave now, your work will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="secondary" onClick={() => blocker.reset?.()}>
              Stay
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="destructive" onClick={() => blocker.proceed?.()}>
              Leave
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
