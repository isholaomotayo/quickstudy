import { type Dispatch, type SetStateAction, useEffect, useState } from 'react';

type SetValue<T> = Dispatch<SetStateAction<T>>;

interface UseLocalStorageOutput<T> {
  value: T;
  setValue: SetValue<T>;
}

type StorageEventData = {
  key: string;
  value: unknown;
};

// Custom event name for same-window updates
const STORAGE_EVENT = 'local-storage-update';

// Extend Window interface to include our custom event
declare global {
  interface WindowEventMap {
    [STORAGE_EVENT]: CustomEvent<StorageEventData>;
  }
}

/**
 * A hook to persist state in localStorage with cross-component synchronization
 * @param key - The localStorage key to store the value under
 * @param initialValue - The initial value if no value is stored
 * @returns Object containing the current value and a setter function
 * @example
 * const { value: theme, setValue: setTheme } = useLocalStorage<'light' | 'dark'>('theme', 'light');
 */
export function useLocalStorage<T>(key: string, initialValue: T): UseLocalStorageOutput<T> {
  // Initialize state with function to avoid unnecessary localStorage access
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : initialValue;
  });

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent): void => {
      if (e.key === key && e.newValue !== null) {
        const newValue = JSON.parse(e.newValue) as T;
        setValue(newValue);
      }
    };
    const handleCustomEvent = (e: CustomEvent<StorageEventData>): void => {
      if (e.detail.key === key && !Object.is(e.detail.value, value)) {
        setValue(e.detail.value as T);
      }
    };

    window?.addEventListener('storage', handleStorageChange);
    window?.addEventListener(STORAGE_EVENT, handleCustomEvent);

    return () => {
      window?.removeEventListener('storage', handleStorageChange);
      window?.removeEventListener(STORAGE_EVENT, handleCustomEvent);
    };
  }, [key, value]);

  const setValueAndNotify: SetValue<T> = (newValue): void => {
    setValue((prev: T) => {
      const nextValue = newValue instanceof Function ? newValue(prev) : newValue;

      const valueToStore = JSON.stringify(nextValue);
      localStorage.setItem(key, valueToStore);

      // Dispatch custom event for other components in the same window
      window.dispatchEvent(
        new CustomEvent<StorageEventData>(STORAGE_EVENT, {
          detail: { key, value: nextValue },
        }),
      );

      return nextValue;
    });
  };

  return {
    value,
    setValue: setValueAndNotify,
  };
}
