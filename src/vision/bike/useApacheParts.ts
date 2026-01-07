import * as tf from "@tensorflow/tfjs";
import type { VehiclePart } from "./types";

let model: tf.LayersModel | null = null;

async function loadPartsModel() {
  if (!model) {
    model = await tf.loadLayersModel(
      "/models/apache-parts/model.json"
    );
  }
  return model;
}

export async function detectApacheParts(
  crop: HTMLCanvasElement
): Promise<VehiclePart[]> {
  const m = await loadPartsModel();

  const tensor = tf.browser
    .fromPixels(crop)
    .resizeBilinear([224, 224])
    .toFloat()
    .div(255)
    .expandDims(0);

  const prediction = m.predict(tensor) as tf.Tensor;
  const scores = await prediction.data();

  tensor.dispose();
  prediction.dispose();

  const labels = [
    "headlight",
    "fuel_tank",
    "exhaust",
    "seat",
    "engine",
    "wheel",
  ];

  return labels
    .map((name, i) => ({
      name,
      confidence: scores[i],
      bbox: [0, 0, 0, 0] as [number, number, number, number],
    }))
    .filter(p => p.confidence > 0.7);
}
