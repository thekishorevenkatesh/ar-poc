import { useState } from "react";

import { ARCanvas } from "../ar/ARCanvas";
import { StartARButton } from "../ar/StartARButton";
import { DebugPanel } from "../components/DebugPanel";
import { BoundingBoxOverlay } from "../components/BoundingBoxOverlay";
import { IntroScene } from "./IntroScene";

import { useCamera } from "../vision/useCamera";
import { useObjectDetection } from "../vision/useObjectDetection";
import { useVehicleRecognition } from "../vision/vehicle/useVehicleRecognition";
import { useVehicleParts } from "../vision/parts/useVehicleParts";
import { useVehicleBadgeRecognition } from "../vision/badge/useVehicleBadgeRecognition";
import { mergeVehicleResults } from "../vision/vehicle/mergeVehicleResults";

export function ARPage() {
  /* ───────────── UI state ───────────── */
  const [scene, setScene] =
    useState<"intro" | "ar">("intro");
  const [showParts, setShowParts] = useState(true);

  /* ───────────── Hooks (ALWAYS CALLED) ───────────── */
  const { videoRef, ready, error, dimensions } =
    useCamera();

  const objects = useObjectDetection(
    videoRef.current ?? undefined,
    ready && scene === "ar" // 👈 only active in AR
  );

  const primaryObject = objects[0];

  const vehicle = useVehicleRecognition(
    videoRef.current ?? undefined,
    primaryObject
  );

  const badge = useVehicleBadgeRecognition(
    videoRef.current ?? undefined,
    primaryObject
  );

  const finalVehicle = mergeVehicleResults(
    vehicle,
    badge
  );

  const parts = useVehicleParts(
    videoRef.current ?? undefined,
    primaryObject
  );

  /* ───────────── INTRO SCENE ───────────── */
  if (scene === "intro") {
    return (
      <IntroScene
        onStart={() => setScene("ar")}
      />
    );
  }

  /* ───────────── AR SCENE ───────────── */
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        background: "#000",
      }}
    >
      {/* 🎥 Camera */}
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

      {!ready && <StartARButton />}

      <BoundingBoxOverlay
        objects={objects}
        videoWidth={dimensions.width}
        videoHeight={dimensions.height}
      />

      <div style={{ position: "absolute", inset: 0 }}>
        <ARCanvas
          target={primaryObject}
          vehicle={finalVehicle}
          parts={showParts ? parts : []}
        />
      </div>

      {ready && (
        <div
          style={{
            position: "absolute",
            bottom: 20,
            right: 20,
            zIndex: 20,
          }}
        >
          <button
            onClick={() => setShowParts(v => !v)}
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              border: "none",
              background: showParts
                ? "#00ffcc"
                : "#333",
              color: showParts
                ? "#000"
                : "#fff",
            }}
          >
            {showParts ? "Hide Parts" : "Show Parts"}
          </button>
        </div>
      )}

      <DebugPanel
        message={
          error
            ? error
            : primaryObject
            ? finalVehicle
              ? `Detected ${finalVehicle.brand} ${finalVehicle.model}`
              : "Identifying vehicle…"
            : ready
            ? "Scanning for vehicles…"
            : "Starting camera…"
        }
      />
    </div>
  );
}
