// Thin wrapper around the Flask backend. Every mutating endpoint takes the
// current image as a Blob/File and returns a new image Blob — the frontend
// never needs to know how the processing happens server-side.

const BASE = "/api";

async function postForBlob(path, formData) {
  const res = await fetch(`${BASE}${path}`, { method: "POST", body: formData });
  if (!res.ok) {
    let message = `فشل الطلب (${res.status})`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      /* ignore parse errors */
    }
    throw new Error(message);
  }
  const blob = await res.blob();
  return blob;
}

async function postForJson(path, formData) {
  const res = await fetch(`${BASE}${path}`, { method: "POST", body: formData });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error || `فشل الطلب (${res.status})`);
  }
  return data;
}

function buildForm(image, fields = {}) {
  const fd = new FormData();
  fd.append("image", image, "image.png");
  Object.entries(fields).forEach(([k, v]) => {
    if (v !== undefined && v !== null) fd.append(k, v);
  });
  return fd;
}

export const api = {
  health: () => fetch(`${BASE}/health`).then((r) => r.json()),

  convert: (image, targetFormat, quality = 95) =>
    postForBlob("/convert", buildForm(image, { target_format: targetFormat, quality })),

  removeBackground: (image, shadow = false) =>
    postForBlob("/background/remove", buildForm(image, { shadow })),

  backgroundLibrary: () => fetch(`${BASE}/background/library`).then((r) => r.json()),

  applyBackground: (image, { backgroundId, backgroundFile, x, y, scale, shadow, autoRemove }) => {
    const fd = buildForm(image, { x, y, scale, shadow, auto_remove: autoRemove });
    if (backgroundFile) fd.append("background", backgroundFile);
    else if (backgroundId) fd.append("background_id", backgroundId);
    return postForBlob("/background/apply", fd);
  },

  crop: (image, { x, y, width, height }) => postForBlob("/transform/crop", buildForm(image, { x, y, width, height })),

  resize: (image, { width, height, keepAspect }) =>
    postForBlob("/transform/resize", buildForm(image, { width, height, keep_aspect: keepAspect })),

  rotate: (image, angle, expand = true) => postForBlob("/transform/rotate", buildForm(image, { angle, expand })),

  flip: (image, direction) => postForBlob("/transform/flip", buildForm(image, { direction })),

  enhancePixel: (image, params) => postForBlob("/enhance/pixel", buildForm(image, params)),

  listFilters: () => fetch(`${BASE}/filters/list`).then((r) => r.json()),

  applyFilter: (image, filter, intensity) => postForBlob("/filters", buildForm(image, { filter, intensity })),

  merge: (imageBase, imageOverlay, params) => {
    const fd = buildForm(imageBase, params);
    fd.append("image2", imageOverlay, "overlay.png");
    return postForBlob("/merge", fd);
  },

  drawApply: (image, strokes) => postForBlob("/draw/apply", buildForm(image, { strokes: JSON.stringify(strokes) })),

  autoEnhance: (image) => postForBlob("/creative/auto_enhance", buildForm(image)),

  faceBlur: (image, intensity) => postForBlob("/creative/face_blur", buildForm(image, { intensity })),

  watermark: (image, params) => postForBlob("/creative/watermark", buildForm(image, params)),

  palette: (image, k = 6) => postForJson("/creative/palette", buildForm(image, { k })),
};

export default api;
