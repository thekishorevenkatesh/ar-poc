import * as tf from "@tensorflow/tfjs";

let partsModel: tf.LayersModel | null = null;
let partLabels: string[] = [];

export async function loadPartsModel() {
  if (!partsModel) {
    partsModel = await tf.loadLayersModel(
      "/models/vehicle-parts/model.json"
    );
    const res = await fetch("/models/vehicle-parts/labels.json");
    partLabels = await res.json();
  }
}

export async function classifyVehicleParts(
  crop: HTMLCanvasElement
) {
  if (!partsModel) await loadPartsModel();

  const tensor = tf.browser
    .fromPixels(crop)
    .resizeBilinear([224, 224])
    .toFloat()
    .div(255)
    .expandDims(0);

  const prediction = partsModel!.predict(tensor) as tf.Tensor;
  const scores = Array.from(await prediction.data());

  return scores
    .map((conf, i) => ({
      name: partLabels[i],
      confidence: conf,
    }))
    .filter(p => p.confidence > 0.6);
}
