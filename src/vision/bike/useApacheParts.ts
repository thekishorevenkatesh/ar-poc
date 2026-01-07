import * as tf from "@tensorflow/tfjs";
import type { VehiclePart } from "./types";

let model: tf.LayersModel | null = null;

async function loadModel() {
  if (!model) {
    model = await tf.loadLayersModel("/models/apache-parts/model.json");
  }
  return model;
}

export async function detectApacheParts(
  crop: HTMLCanvasElement
): Promise<VehiclePart[]> {
  const m = await loadModel();

  const tensor = tf.browser
    .fromPixels(crop)
    .resizeBilinear([224, 224])
    .toFloat()
    .div(255)
    .expandDims(0);

  const prediction = m.predict(tensor) as tf.Tensor;
  const data = await prediction.data();

  tf.dispose([tensor, prediction]);

  const labels = ["Headlamp", "Fuel Tank", "Exhaust", "Seat"];

  return labels.map((label, i) => ({
    name: label,
    confidence: data[i],
    bbox: [0, 0, 0, 0] as [number, number, number, number], // anchor later
  })).filter(p => p.confidence > 0.6);
}
