import { Html } from "@react-three/drei";
import { usePartAnchor } from "./usePartAnchor";
import type { VehiclePart } from "../vision/bike/types";

type Props = {
  part: VehiclePart;
  onSelect?: () => void;
};

export function PartLabel({ part, onSelect }: Props) {
  // ✅ Hook is SAFE here (not in loop)
  const anchorRef = usePartAnchor(part);

  return (
    <group ref={anchorRef}>
      <Html distanceFactor={10}>
        <div
          onClick={onSelect}
          style={{
            padding: "6px 8px",
            background: "rgba(20,20,20,0.95)",
            borderRadius: 6,
            fontSize: 11,
            color: "#00ffcc",
            cursor: "pointer",
            whiteSpace: "nowrap",
            userSelect: "none",
          }}
        >
          {part.name}
        </div>
      </Html>
    </group>
  );
}
