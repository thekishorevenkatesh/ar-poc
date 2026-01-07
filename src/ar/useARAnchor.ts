import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import type { DetectedObject } from "../vision/detector/detector";

export function useARAnchor(object?: DetectedObject) {
  const { camera, scene } = useThree();
  const anchorRef = useRef<THREE.Object3D>(null);
  const raycaster = useRef(new THREE.Raycaster());
  const screen = useRef(new THREE.Vector2());

  useFrame(() => {
    if (!object || !anchorRef.current) return;

    const [x, y, w, h] = object.bbox;
    const nx = (x + w / 2) / window.innerWidth * 2 - 1;
    const ny = -(y + h / 2) / window.innerHeight * 2 + 1;

    screen.current.set(nx, ny);
    raycaster.current.setFromCamera(screen.current, camera);

    const hits = raycaster.current.intersectObjects(scene.children, true);
    if (hits.length) {
      anchorRef.current.position.lerp(hits[0].point, 0.2);
    }
  });

  return anchorRef;
}
