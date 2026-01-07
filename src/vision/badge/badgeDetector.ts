const BADGE_ENDPOINT =
  "https://detect.roboflow.com/car-logo-detection/1";

export async function detectBadge(
  crop: HTMLCanvasElement
) {
  const API_KEY = import.meta.env.VITE_ROBOFLOW_API_KEY;

  const res = await fetch(
    `${BADGE_ENDPOINT}?api_key=${API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: crop.toDataURL("image/jpeg"),
    }
  );

  const data = await res.json();
  return data.predictions ?? [];
}
