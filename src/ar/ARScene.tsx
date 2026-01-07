import { Html } from "@react-three/drei";
import { useARAnchor } from "./useARAnchor";
import { usePartAnchor } from "./usePartAnchor";

import type { DetectedObject } from "../vision/detector";
import type { VehicleInfo } from "../vision/vehicle/useVehicleRecognition";
import type { VehiclePart } from "../vision/parts/types";

type Props = {
  target?: DetectedObject;
  vehicle?: VehicleInfo | null;
  parts?: VehiclePart[];
};

function confidenceOpacity(conf: number) {
  if (conf >= 0.85) return 1;
  if (conf >= 0.7) return 0.75;
  return 0.45;
}

export function ARScene({ target, vehicle, parts = [] }: Props) {
  const anchorRef = useARAnchor(target);

  return (
    <>
      <ambientLight intensity={0.8} />

      <mesh rotation-x={-Math.PI / 2} position={[0, -1, -2]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial visible={false} />
      </mesh>

      <group ref={anchorRef}>
        {target && (
          <Html center distanceFactor={8}>
            <div className="vehicle-label">
              {vehicle ? (
                <>
                  <strong>{vehicle.brand}</strong>
                  <div>{vehicle.model}</div>
                  <div style={{ fontSize: 11, opacity: 0.8 }}>
                    {Math.round(vehicle.confidence * 100)}%
                  </div>
                </>
              ) : (
                "Identifying vehicle…"
              )}
            </div>
          </Html>
        )}

        {parts.map((part, i) => {
          const partRef = usePartAnchor(part);

          return (
            <group ref={partRef} key={i}>
              <Html distanceFactor={10}>
                <div
                  style={{
                    padding: "4px 8px",
                    background: "rgba(20,20,20,0.9)",
                    color: "#00ffcc",
                    borderRadius: 4,
                    fontSize: 11,
                    opacity: confidenceOpacity(part.confidence),
                  }}
                >
                  {part.name}
                </div>
              </Html>
            </group>
          );
        })}
      </group>
    </>
  );
}
