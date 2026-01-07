import { useEffect, useRef, useState } from "react";

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then(stream => {
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setDimensions({
            width: videoRef.current!.videoWidth,
            height: videoRef.current!.videoHeight,
          });
        };
        videoRef.current.play();
        setReady(true);
      })
      .catch(() => setError("Camera unavailable"));
  }, []);

  return { videoRef, ready, error, dimensions };
}
