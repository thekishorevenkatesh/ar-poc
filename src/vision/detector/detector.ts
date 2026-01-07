import * as coco from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

export type DetectedObject = {
  label: string;
  score: number;
  bbox: [number, number, number, number];
};

let model: coco.ObjectDetection | null = null;

export async function detectObjects(video: HTMLVideoElement) {
  if (!model) model = await coco.load();
  const predictions = await model.detect(video);

  return predictions.map(p => ({
    label: p.class,
    score: p.score,
    bbox: p.bbox as [number, number, number, number],
  }));
}
