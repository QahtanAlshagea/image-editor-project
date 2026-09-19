import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Shared pattern for "slider panels" (pixel enhancements, filters):
 * every slider tweak fetches a fresh preview from the backend (debounced),
 * shown on the canvas WITHOUT touching history. Hitting "Apply" commits the
 * last preview blob into the edit history; leaving the panel discards it.
 */
export default function useLivePreview({ onPreviewUrl, delay = 220 }) {
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [pending, setPending] = useState(false);
  const blobRef = useRef(null);
  const timerRef = useRef(null);
  const tokenRef = useRef(0);

  const request = useCallback(
    (computeFn) => {
      clearTimeout(timerRef.current);
      const myToken = ++tokenRef.current;
      setPending(true);
      timerRef.current = setTimeout(async () => {
        try {
          const blob = await computeFn();
          if (myToken !== tokenRef.current) return; // superseded by a newer request
          blobRef.current = blob;
          setIsPreviewing(true);
          onPreviewUrl(URL.createObjectURL(blob));
        } catch {
          // silently ignore preview errors — the user can still hit Apply-less state
        } finally {
          if (myToken === tokenRef.current) setPending(false);
        }
      }, delay);
    },
    [delay, onPreviewUrl]
  );

  const cancel = useCallback(() => {
    clearTimeout(timerRef.current);
    tokenRef.current += 1;
    blobRef.current = null;
    setIsPreviewing(false);
    setPending(false);
    onPreviewUrl(null);
  }, [onPreviewUrl]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return { request, cancel, isPreviewing, pending, getBlob: () => blobRef.current };
}
