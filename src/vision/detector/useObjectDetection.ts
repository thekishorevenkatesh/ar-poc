import { useEffect, useRef, useState } from "react";
import { detectObjects } from "./detector";
import type { DetectedObject } from "./detector";

export function useObjectDetection(
  video?: HTMLVideoElement,
  enabled = true
) {
  const [objects, setObjects] = useState<DetectedObject[]>([]);
  const running = useRef(false);

  useEffect(() => {
    if (!video || !enabled) return;
    running.current = true;

    const loop = async () => {
      if (!running.current) return;
      setObjects(await detectObjects(video));
      setTimeout(loop, 250);
    };

    loop();
    return () => {
      running.current = false;
    };
  }, [video, enabled]);

  return objects;
}
