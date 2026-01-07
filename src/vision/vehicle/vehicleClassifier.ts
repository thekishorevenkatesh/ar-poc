import type { VehicleInfo } from "./useVehicleRecognition";

const ROBOFLOW_API_KEY = "YOUR_API_KEY_HERE";
const ROBOFLOW_ENDPOINT =
  "https://detect.roboflow.com/car-make-model/1";

export async function classifyVehicle(
  crop: HTMLCanvasElement
): Promise<VehicleInfo | null> {
  try {
    const image = crop.toDataURL("image/jpeg");

    const res = await fetch(
      `${ROBOFLOW_ENDPOINT}?api_key=${ROBOFLOW_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: image,
      }
    );

    const data = await res.json();

    if (!data.predictions || data.predictions.length === 0) {
      return null;
    }

    // Take the most confident prediction
    const best = data.predictions.sort(
      (a: any, b: any) => b.confidence - a.confidence
    )[0];

    return {
      brand: best.class.split(" ")[0],
      model: best.class.replace(best.class.split(" ")[0], "").trim(),
      confidence: best.confidence,
    };
  } catch (err) {
    console.error("Vehicle recognition failed", err);
    return null;
  }
}
