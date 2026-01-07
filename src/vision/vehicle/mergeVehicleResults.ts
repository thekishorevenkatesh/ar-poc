import type { VehicleInfo } from "./useVehicleRecognition";
import type { BadgeResult } from "../badge/useVehicleBadgeRecognition";

export function mergeVehicleResults(
  shape?: VehicleInfo | null,
  badge?: BadgeResult | null
): VehicleInfo | null {
  if (!shape && !badge) return null;

  // Badge wins if present
  if (badge?.brand) {
    return {
      brand: badge.brand,
      model: badge.model || shape?.model || "Unknown",
      confidence: Math.max(
        shape?.confidence ?? 0,
        badge.confidence
      ),
    };
  }

  return shape ?? null;
}
