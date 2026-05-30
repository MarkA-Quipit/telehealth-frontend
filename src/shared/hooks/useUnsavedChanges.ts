import { useEffect, useRef, useCallback } from 'react';
import { useBlocker } from 'react-router-dom';
import type { Blocker } from 'react-router-dom';

export function useUnsavedChanges(isDirty: boolean): { blocker: Blocker; clearDirty: () => void } {
  const isDirtyRef = useRef(isDirty);
  isDirtyRef.current = isDirty;

  // Pass a function so React Router reads the ref at navigation time,
  // allowing clearDirty() to take effect synchronously before navigate().
  const blocker = useBlocker(() => isDirtyRef.current);

  const clearDirty = useCallback(() => {
    isDirtyRef.current = false;
  }, []);

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  return { blocker, clearDirty };
}
