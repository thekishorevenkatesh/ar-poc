import type { DetectedObject } from "../vision/detector/detector";

type Props = {
  objects: DetectedObject[];
  videoWidth: number;
  videoHeight: number;
};

export function BoundingBoxOverlay({
  objects,
  videoWidth,
  videoHeight,
}: Props) {
  if (!videoWidth || !videoHeight) return null;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
      }}
    >
      {objects.map((obj, index) => {
        const [x, y, width, height] = obj.bbox;

        // Convert video coords → screen %
        const left = (x / videoWidth) * 100;
        const top = (y / videoHeight) * 100;
        const w = (width / videoWidth) * 100;
        const h = (height / videoHeight) * 100;

        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: `${left}%`,
              top: `${top}%`,
              width: `${w}%`,
              height: `${h}%`,
              border: "2px solid #00ff88",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -18,
                left: 0,
                background: "#00ff88",
                color: "#000",
                fontSize: 11,
                padding: "2px 4px",
                borderRadius: 2,
              }}
            >
              {obj.label} {Math.round(obj.score * 100)}%
            </div>
          </div>
        );
      })}
    </div>
  );
}
