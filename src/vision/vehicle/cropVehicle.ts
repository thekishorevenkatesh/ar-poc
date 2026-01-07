/**
 * Crops a region from the video based on detection bbox
 * bbox format: [x, y, width, height] in video pixel space
 */
export function cropFromVideo(
  video: HTMLVideoElement,
  bbox: [number, number, number, number]
): HTMLCanvasElement {
  const [x, y, w, h] = bbox;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Unable to get canvas context");
  }

  // Clamp values to video bounds
  const sx = Math.max(0, x);
  const sy = Math.max(0, y);
  const sw = Math.min(video.videoWidth - sx, w);
  const sh = Math.min(video.videoHeight - sy, h);

  canvas.width = Math.max(1, sw);
  canvas.height = Math.max(1, sh);

  ctx.drawImage(
    video,
    sx,
    sy,
    sw,
    sh,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return canvas;
}
