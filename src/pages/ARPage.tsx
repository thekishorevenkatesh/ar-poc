import { useState } from "react";

import { ARCanvas } from "../ar/ARCanvas";
import { StartARButton } from "../ar/StartARButton";
import { DebugPanel } from "../components/DebugPanel";
import { BoundingBoxOverlay } from "../components/BoundingBoxOverlay";

import { useCamera } from "../vision/useCamera";
import { useObjectDetection } from "../vision/useObjectDetection";
import { useVehicleRecognition } from "../vision/vehicle/useVehicleRecognition";
import { useVehicleParts } from "../vision/parts/useVehicleParts";

export function ARPage() {
  const { videoRef, ready, error, dimensions } = useCamera();

  // 🔘 UI Toggles
  const [showParts, setShowParts] = useState(true);

  // 1️⃣ Generic object detection (COCO-SSD)
  const objects = useObjectDetection(
    videoRef.current ?? undefined,
    ready
  );

  const primaryObject = objects[0];

  // 2️⃣ Vehicle make / model recognition
  const vehicle = useVehicleRecognition(
    videoRef.current ?? undefined,
    primaryObject
  );

  // 3️⃣ Vehicle parts detection (throttled + cached internally)
  const parts = useVehicleParts(
    videoRef.current ?? undefined,
    primaryObject
  );

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
      {/* 🎥 Camera feed */}
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

      {/* ▶️ Start AR button */}
      {!ready && <StartARButton />}

      {/* 🟩 Debug bounding boxes (safe to remove later) */}
      <BoundingBoxOverlay
        objects={objects}
        videoWidth={dimensions.width}
        videoHeight={dimensions.height}
      />

      {/* 🧠 AR Layer */}
      <div style={{ position: "absolute", inset: 0 }}>
        <ARCanvas
          target={primaryObject}
          vehicle={vehicle}
          parts={showParts ? parts : []}
        />
      </div>

      {/* 🔘 Toggle UI */}
      {ready && (
        <div
          style={{
            position: "absolute",
            bottom: 20,
            right: 20,
            zIndex: 20,
            display: "flex",
            gap: 8,
          }}
        >
          <button
            onClick={() => setShowParts(v => !v)}
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              border: "none",
              background: showParts ? "#00ffcc" : "#333",
              color: showParts ? "#000" : "#fff",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {showParts ? "Hide Parts" : "Show Parts"}
          </button>
        </div>
      )}

      {/* ℹ️ Status / Debug Panel */}
      <DebugPanel
        message={
          error
            ? error
            : primaryObject
            ? vehicle
              ? `Detected ${vehicle.brand} ${vehicle.model}`
              : "Identifying vehicle…"
            : ready
            ? "Scanning for vehicles…"
            : "Starting camera…"
        }
      />
    </div>
  );
}
