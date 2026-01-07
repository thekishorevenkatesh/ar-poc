export function cropFromVideo(
  video: HTMLVideoElement,
  bbox: [number, number, number, number]
): HTMLCanvasElement {
  const [x, y, w, h] = bbox;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(video, x, y, w, h, 0, 0, w, h);

  return canvas;
}
