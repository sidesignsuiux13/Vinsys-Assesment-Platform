import { useEffect, useRef, useState } from 'react';

// Debounced auto-save. Returns a transient "saving" flag for a subtle indicator.
export function useAutoSave<T>(value: T, save: (v: T) => void, delay = 2000) {
  const [saving, setSaving] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setSaving(true);
    const saveId = setTimeout(() => {
      save(value);
      // Keep the "Saving..." label up briefly, then fade it out.
      const hideId = setTimeout(() => setSaving(false), 1000);
      return () => clearTimeout(hideId);
    }, delay);
    return () => clearTimeout(saveId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(value)]);

  return { saving };
}
