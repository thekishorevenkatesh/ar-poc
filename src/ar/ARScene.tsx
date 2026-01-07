import { Html } from "@react-three/drei";
import { useARAnchor } from "./useARAnchor";
import type { DetectedObject } from "../vision/detector";
import type { VehicleInfo } from "../vision/vehicle/useVehicleRecognition";

type Props = {
  target?: DetectedObject;
  vehicle?: VehicleInfo | null;
};

export function ARScene({ target, vehicle }: Props) {
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
            <div
              style={{
                padding: "8px 12px",
                background: "rgba(0,0,0,0.85)",
                color: "#fff",
                borderRadius: 6,
                fontSize: 13,
              }}
            >
              {vehicle ? (
                <>
                  <strong>{vehicle.brand}</strong>
                  <div>{vehicle.model}</div>
                  <div style={{ fontSize: 11 }}>
                    {Math.round(vehicle.confidence * 100)}%
                  </div>
                </>
              ) : (
                "Car"
              )}
            </div>
          </Html>
        )}
      </group>
    </>
  );
}
