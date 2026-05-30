import { useEffect } from 'react';
import { useBlocker } from 'react-router-dom';
import type { Blocker } from 'react-router-dom';

export function useUnsavedChanges(isDirty: boolean): { blocker: Blocker } {
  const blocker = useBlocker(isDirty);

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  return { blocker };
}
