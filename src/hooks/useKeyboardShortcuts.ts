import { useEffect, useCallback } from 'react';

interface UseKeyboardShortcutsOptions {
  onPrevious: () => void;
  onNext: () => void;
  onTogglePlay: () => void;
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  onPrevious,
  onNext,
  onTogglePlay,
  enabled = true,
}: UseKeyboardShortcutsOptions): void {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Ignore if user is typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          onPrevious();
          break;
        case 'ArrowRight':
          event.preventDefault();
          onNext();
          break;
        case ' ':
          event.preventDefault();
          onTogglePlay();
          break;
      }
    },
    [enabled, onPrevious, onNext, onTogglePlay]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}
