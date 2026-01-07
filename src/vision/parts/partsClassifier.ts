const PARTS_ENDPOINT =
  "https://detect.roboflow.com/vehicle-exterior-parts/1";

export async function classifyVehicleParts(
  crop: HTMLCanvasElement
) {
  const API_KEY = import.meta.env.VITE_ROBOFLOW_API_KEY;

  const response = await fetch(
    `${PARTS_ENDPOINT}?api_key=${API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: crop.toDataURL("image/jpeg"),
    }
  );

  const data = await response.json();

  if (!data.predictions) return [];

  return data.predictions.map((p: any) => ({
    name: p.class,
    confidence: p.confidence,
    bbox: [p.x, p.y, p.width, p.height],
  }));
}
