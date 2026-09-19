import { useCallback, useEffect, useRef, useState } from "react";

const MIN_ZOOM = 8;
const MAX_ZOOM = 500;

/**
 * Manages the zoom level of the canvas viewport. "Fit" computes the
 * percentage that makes the whole image visible inside the current
 * viewport (like Photoshop's "Fit on screen"); the user can then zoom
 * in/out freely with buttons, a slider, or Ctrl/Cmd + mouse wheel — at
 * which point the viewport becomes scrollable instead of auto-fitting.
 */
export default function useZoomFit(viewportRef, naturalW, naturalH) {
  const [zoomPct, setZoomPct] = useState(100);
  const autoFitRef = useRef(true);

  const computeFitPct = useCallback(() => {
    const el = viewportRef.current;
    if (!el || !naturalW || !naturalH) return null;
    const padding = 48;
    const availW = Math.max(50, el.clientWidth - padding);
    const availH = Math.max(50, el.clientHeight - padding);
    const scale = Math.min(availW / naturalW, availH / naturalH);
    return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, scale * 100));
  }, [viewportRef, naturalW, naturalH]);

  const fitToScreen = useCallback(() => {
    const pct = computeFitPct();
    if (pct) {
      setZoomPct(pct);
      autoFitRef.current = true;
    }
  }, [computeFitPct]);

  // Recompute fit whenever a new image loads.
  useEffect(() => {
    fitToScreen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [naturalW, naturalH]);

  // Keep auto-fitting on viewport resize, unless the user manually zoomed.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(() => {
      if (autoFitRef.current) fitToScreen();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [viewportRef, fitToScreen]);

  const setZoom = useCallback((pct) => {
    autoFitRef.current = false;
    setZoomPct(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, pct)));
  }, []);

  const zoomBy = useCallback(
    (deltaPct) => {
      setZoom(zoomPct + deltaPct);
    },
    [zoomPct, setZoom]
  );

  const zoomByFactor = useCallback(
    (factor) => {
      setZoom(zoomPct * factor);
    },
    [zoomPct, setZoom]
  );

  return { zoomPct, setZoom, zoomBy, zoomByFactor, fitToScreen };
}
