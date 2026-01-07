import type { VehicleInfo } from "./useVehicleRecognition";

export function mergeVehicleResults(
  shape?: VehicleInfo | null,
  badge?: { brand: string; confidence: number } | null
) {
  if (badge && shape) {
    return {
      brand: badge.brand,
      model: shape.model,
      confidence: Math.max(
        badge.confidence,
        shape.confidence
      ),
    };
  }

  return shape ?? null;
}
