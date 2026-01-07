import { createWorker } from "tesseract.js";

let workerPromise: Promise<any> | null = null;

async function getWorker() {
  if (!workerPromise) {
    workerPromise = (async () => {
      const worker = await createWorker("eng");
      await worker.setParameters({
        tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      });
      return worker;
    })();
  }
  return workerPromise;
}

export async function readBadgeText(
  crop: HTMLCanvasElement
): Promise<string | null> {
  try {
    const worker = await getWorker();
    const result = await worker.recognize(crop);

    const raw = result.data.text ?? "";

    const text = raw
      .replace(/[^A-Z]/gi, "")
      .toUpperCase()
      .trim();

    return text.length >= 3 ? text : null;
  } catch (err) {
    console.error("Badge OCR failed", err);
    return null;
  }
}
