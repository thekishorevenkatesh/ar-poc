import { useEffect, useState } from "react";
import { ARCanvas } from "../ar/ARCanvas";
import { DebugPanel } from "../components/DebugPanel";
import { BoundingBoxOverlay } from "../components/BoundingBoxOverlay";

import { useCamera } from "../vision/camera/useCamera";
import { useObjectDetection } from "../vision/detector/useObjectDetection";
import { cropFromVideo } from "../vision/utils/cropVehicle";

import { isApacheBike } from "../vision/bike/useApacheIdentification";
import { detectApacheParts } from "../vision/bike/useApacheParts";
import type { VehiclePart } from "../vision/bike/types";

export function ARPage() {
  const { videoRef, ready, error, dimensions } = useCamera();
  const objects = useObjectDetection(videoRef.current ?? undefined, ready);
  const primary = objects[0];

  const [isApache, setIsApache] = useState(false);
  const [parts, setParts] = useState<VehiclePart[]>([]);

  // 🔍 Identify Apache
  useEffect(() => {
    if (!videoRef.current || !primary) return;

    if (primary.label !== "motorcycle") {
      setIsApache(false);
      setParts([]);
      return;
    }

    const [, , w, h] = primary.bbox;
    if (w * h < 120 * 120) return; // 👈 size gate

    const crop = cropFromVideo(videoRef.current, primary.bbox);

    isApacheBike(crop).then(result => {
      setIsApache(result);
      if (!result) setParts([]);
    });
  }, [primary]);

  // 🔧 Parts detection
  useEffect(() => {
    if (!isApache || !videoRef.current || !primary) return;

    const crop = cropFromVideo(videoRef.current, primary.bbox);
    detectApacheParts(crop).then(setParts);
  }, [isApache, primary]);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <video
        ref={videoRef}
        playsInline
        muted
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />

      <BoundingBoxOverlay
        objects={objects}
        videoWidth={dimensions.width}
        videoHeight={dimensions.height}
      />

      <ARCanvas target={primary} parts={parts} />

      <DebugPanel
        message={
          error
            ? error
            : primary
            ? isApache
              ? "TVS Apache RTR 200 4V detected"
              : `${primary.label} detected`
            : ready
            ? "Scanning…"
            : "Starting camera…"
        }
      />
    </div>
  );
}
