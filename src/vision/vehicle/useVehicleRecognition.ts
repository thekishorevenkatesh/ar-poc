import { useEffect, useState } from "react";
import type { DetectedObject } from "../detector";

export type VehicleInfo = {
  brand: string;
  model: string;
  confidence: number;
};

export function useVehicleRecognition(
  _video?: HTMLVideoElement,
  object?: DetectedObject
) {
  const [vehicle, setVehicle] = useState<VehicleInfo | null>(null);

  useEffect(() => {
    if (!object || object.label !== "car") {
      setVehicle(null);
      return;
    }

    // ✅ MOCK RESULT (replace later with OCR / ML)
    setVehicle({
      brand: "HYUNDAI",
      model: "i20",
      confidence: 0.82,
    });
  }, [object]);

  return vehicle;
}
