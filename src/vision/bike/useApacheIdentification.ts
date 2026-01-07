import * as tf from "@tensorflow/tfjs";

let model: tf.LayersModel | null = null;

async function loadModel() {
  if (!model) {
    model = await tf.loadLayersModel(
      "/models/apache/model.json"
    );
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
  const scores = await prediction.data();

  tensor.dispose();
  prediction.dispose();

  // index 0 = apache_rtr_200_4v
  return scores[0] > 0.8;
}
