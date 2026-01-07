import { useEffect, useRef, useState } from "react";
export function useCamera(enabled: boolean) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (!enabled) return; // 👈 DO NOTHING until enabled

    let stream: MediaStream;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
          },
          audio: false,
        });

        if (!videoRef.current) return;

        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        setDimensions({
          width: videoRef.current.videoWidth,
          height: videoRef.current.videoHeight,
        });

        setReady(true);
      } catch (err) {
        setError("Camera permission denied or unavailable");
      }
    }

    startCamera();

    return () => {
      stream?.getTracks().forEach(t => t.stop());
    };
  }, [enabled]);

  return { videoRef, ready, error, dimensions };
}
