import { Html } from "@react-three/drei";
import { useARAnchor } from "./useARAnchor";

import type { DetectedObject } from "../vision/detector";
import type { VehicleInfo } from "../vision/vehicle/useVehicleRecognition";
import type { VehiclePart } from "../vision/parts/types";
import PartLabel from "./PartLabel";

type Props = {
  target?: DetectedObject;
  vehicle?: VehicleInfo | null;
  parts?: VehiclePart[];
  onRefreshParts?: () => void;
};

export function ARScene({
  target,
  vehicle,
  parts = [],
  onRefreshParts,
}: Props) {
  const anchorRef = useARAnchor(target);

  return (
    <>
      <ambientLight intensity={0.8} />

      <group ref={anchorRef}>
        {target && (
          <Html center distanceFactor={8}>
            <div style={{ padding: 8, background: "#000", color: "#fff" }}>
              {vehicle
                ? `${vehicle.brand} ${vehicle.model}`
                : "Vehicle detected"}
            </div>
          </Html>
        )}

        {parts.map((part, index) => (
          <PartLabel
            key={index}
            part={part}
            onSelect={onRefreshParts}
          />
        ))}
      </group>
    </>
  );
}
