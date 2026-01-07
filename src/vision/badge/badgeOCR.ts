import { createWorker, type Worker } from "tesseract.js";

let worker: Worker | null = null;

async function getWorker() {
  if (!worker) {
    worker = await createWorker("eng");
    await worker.setParameters({
      tessedit_char_whitelist:
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
      preserve_interword_spaces: "0",
    });
  }
  return worker;
}

export async function readBadgeText(
  crop: HTMLCanvasElement
): Promise<string> {
  const w = await getWorker();

  const {
    data: { text },
  } = await w.recognize(crop);

  return text.replace(/\s+/g, "").toUpperCase();
}
