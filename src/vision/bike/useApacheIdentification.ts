import * as tf from "@tensorflow/tfjs";

let model: tf.LayersModel | null = null;

async function loadModel() {
  if (!model) {
    model = await tf.loadLayersModel("/models/apache/model.json");
  }
  return model;
}

export async function isApacheBike(
  crop: HTMLCanvasElement
): Promise<boolean> {
  const m = await loadModel();

  const tensor = tf.browser
    .fromPixels(crop)
    .resizeBilinear([224, 224])
    .toFloat()
    .div(255)
    .expandDims(0);

  const prediction = m.predict(tensor) as tf.Tensor;
  const confidence = (await prediction.data())[0];

  tf.dispose([tensor, prediction]);

  return confidence > 0.85;
}
