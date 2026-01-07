import { useEffect, useRef, useState } from "react";

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    let stream: MediaStream;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
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
      } catch {
        setError("Camera access denied");
      }
    }

    startCamera();

    return () => {
      stream?.getTracks().forEach(t => t.stop());
    };
  }, []);

  return { videoRef, ready, error, dimensions };
}
