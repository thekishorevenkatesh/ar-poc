export async function isWebXRSupported() {
  if (!navigator.xr) return false;
  return await navigator.xr.isSessionSupported("immersive-ar");
}
