import type { VehicleInfo } from "./useVehicleRecognition";

const ROBOFLOW_API_KEY = "PASTE_YOUR_API_KEY";
const ROBOFLOW_ENDPOINT =
  "https://detect.roboflow.com/car-make-model/1";

export async function classifyVehicle(
  crop: HTMLCanvasElement
): Promise<VehicleInfo | null> {
  try {
    const imageBase64 = crop.toDataURL("image/jpeg");

    const response = await fetch(
      `${ROBOFLOW_ENDPOINT}?api_key=${ROBOFLOW_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: imageBase64,
      }
    );

    const data = await response.json();

    if (!data.predictions || data.predictions.length === 0) {
      return null;
    }

    // Take highest confidence prediction
    const best = data.predictions.sort(
      (a: any, b: any) => b.confidence - a.confidence
    )[0];

    // Roboflow class usually looks like "Hyundai Creta"
    const parts = best.class.split(" ");

    return {
      brand: parts[0],
      model: parts.slice(1).join(" "),
      confidence: best.confidence,
    };
  } catch (err) {
    console.error("Roboflow vehicle recognition failed", err);
    return null;
  }
}
