import * as tf from "@tensorflow/tfjs";
import type { VehicleInfo } from "./useVehicleRecognition";

let vehicleModel: tf.LayersModel | null = null;
let labels: string[] = [];

export async function loadVehicleModel() {
  if (!vehicleModel) {
    vehicleModel = await tf.loadLayersModel(
      "/models/vehicle-brand/model.json"
    );
    const res = await fetch("/models/vehicle-brand/labels.json");
    labels = await res.json();
  }
}

export async function classifyVehicle(
  crop: HTMLCanvasElement
): Promise<VehicleInfo | null> {
  if (!vehicleModel) await loadVehicleModel();

  const tensor = tf.browser
    .fromPixels(crop)
    .resizeBilinear([224, 224])
    .toFloat()
    .div(255)
    .expandDims(0);

  const prediction = vehicleModel!.predict(tensor) as tf.Tensor;
  const scores = Array.from(await prediction.data());

  const maxIdx = scores.indexOf(Math.max(...scores));
  const confidence = scores[maxIdx];

  if (confidence < 0.6) return null;

  const [brand, ...modelParts] = labels[maxIdx].split(" ");

  return {
    brand,
    model: modelParts.join(" "),
    confidence,
  };
}
