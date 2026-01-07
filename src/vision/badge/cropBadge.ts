export function cropBadgeFromVehicle(
  video: HTMLVideoElement,
  bbox: [number, number, number, number]
): HTMLCanvasElement {
  const [x, y, w, h] = bbox;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  // Focus on front-middle region
  const cropX = x + w * 0.3;
  const cropY = y + h * 0.15;
  const cropW = w * 0.4;
  const cropH = h * 0.25;

  canvas.width = cropW;
  canvas.height = cropH;

  ctx.drawImage(
    video,
    cropX,
    cropY,
    cropW,
    cropH,
    0,
    0,
    cropW,
    cropH
  );

  return canvas;
}
