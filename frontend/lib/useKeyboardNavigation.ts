import { useEffect, useRef } from 'react';

/**
 * Hook to trap focus within a modal or dialog
 * Ensures keyboard navigation stays within the component
 */
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element when activated
    firstElement?.focus();

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    return () => container.removeEventListener('keydown', handleTabKey);
  }, [isActive]);

  return containerRef;
}

/**
 * Hook to handle Escape key press
 */
export function useEscapeKey(onEscape: () => void, isActive: boolean = true) {
  useEffect(() => {
    if (!isActive) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onEscape();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onEscape, isActive]);
}

/**
 * Hook for arrow key navigation in lists
 */
export function useArrowNavigation(
  itemCount: number,
  onSelect: (index: number) => void,
  isActive: boolean = true
) {
  const currentIndexRef = useRef(0);

  useEffect(() => {
    if (!isActive) return;

    const handleArrowKeys = (e: KeyboardEvent) => {
      if (!['ArrowUp', 'ArrowDown', 'Enter', 'Space'].includes(e.key)) return;

      e.preventDefault();

      switch (e.key) {
        case 'ArrowDown':
          currentIndexRef.current = (currentIndexRef.current + 1) % itemCount;
          break;
        case 'ArrowUp':
          currentIndexRef.current = (currentIndexRef.current - 1 + itemCount) % itemCount;
          break;
        case 'Enter':
        case 'Space':
          onSelect(currentIndexRef.current);
          break;
      }
    };

    document.addEventListener('keydown', handleArrowKeys);
    return () => document.removeEventListener('keydown', handleArrowKeys);
  }, [itemCount, onSelect, isActive]);

  return currentIndexRef;
}
