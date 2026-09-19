import { useCallback, useMemo, useRef, useState } from "react";

// One entry per step in the edit history. `blob` is the actual image data;
// `url` is a stable object URL for rendering; `label` is shown in the
// history strip so the user can see (and jump back to) what they did.
function makeEntry(blob, label) {
  return { blob, url: URL.createObjectURL(blob), label, id: `${Date.now()}-${Math.random().toString(36).slice(2)}` };
}

export default function useImageEditor() {
  const [history, setHistory] = useState([]); // array of entries
  const [index, setIndex] = useState(-1); // pointer into history
  const [busy, setBusy] = useState(false);
  const [busyLabel, setBusyLabel] = useState("");
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState("untitled");
  const objectUrlsRef = useRef(new Set());

  const current = index >= 0 ? history[index] : null;

  const trackUrl = useCallback((url) => {
    objectUrlsRef.current.add(url);
    return url;
  }, []);

  const loadInitial = useCallback((blob, name) => {
    const entry = makeEntry(blob, "الصورة الأصلية");
    trackUrl(entry.url);
    setHistory([entry]);
    setIndex(0);
    setFileName(name ? name.replace(/\.[^/.]+$/, "") : "untitled");
    setError(null);
  }, [trackUrl]);

  const pushEntry = useCallback((blob, label) => {
    setHistory((prev) => {
      const truncated = prev.slice(0, index + 1);
      const entry = makeEntry(blob, label);
      trackUrl(entry.url);
      return [...truncated, entry];
    });
    setIndex((i) => i + 1);
  }, [index, trackUrl]);

  // Runs an async operation that returns a new Blob, wiring up loading/error
  // state and pushing the result into history automatically. Resolves to
  // the new blob on success, or `null` on failure (never rejects) — the
  // error is already surfaced via `error`/the Toast, so callers that need
  // to know whether it succeeded just check the return value instead of
  // needing a try/catch, which keeps every call site simple and avoids
  // unhandled-promise-rejection noise for the (common) fire-and-forget
  // callers that don't await this at all.
  const runEdit = useCallback(async (label, operation) => {
    setBusy(true);
    setBusyLabel(label);
    setError(null);
    try {
      const blob = await operation();
      pushEntry(blob, label);
      return blob;
    } catch (e) {
      setError(e?.message || "حدث خطأ غير متوقع");
      return null;
    } finally {
      setBusy(false);
      setBusyLabel("");
    }
  }, [pushEntry]);

  // Commit an already-fetched blob straight into history (used by panels
  // that show a live/debounced preview before the user hits "Apply").
  const commitBlob = useCallback((blob, label) => {
    pushEntry(blob, label);
  }, [pushEntry]);

  const undo = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);
  const redo = useCallback(() => setIndex((i) => Math.min(history.length - 1, i + 1)), [history.length]);
  const jumpTo = useCallback((i) => setIndex(Math.max(0, Math.min(history.length - 1, i))), [history.length]);

  const reset = useCallback(() => {
    objectUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    objectUrlsRef.current.clear();
    setHistory([]);
    setIndex(-1);
    setError(null);
  }, []);

  const canUndo = index > 0;
  const canRedo = index >= 0 && index < history.length - 1;

  return useMemo(() => ({
    history, index, current, busy, busyLabel, error, fileName,
    loadInitial, runEdit, commitBlob, undo, redo, jumpTo, reset, canUndo, canRedo, setError,
  }), [history, index, current, busy, busyLabel, error, fileName, loadInitial, runEdit, commitBlob, undo, redo, jumpTo, reset, canUndo, canRedo]);
}
