export function cropFromVideo(
  video: HTMLVideoElement,
  [x, y, w, h]: [number, number, number, number]
) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(video, x, y, w, h, 0, 0, w, h);

  return canvas;
}
