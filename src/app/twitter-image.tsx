import OpenGraphImage, { alt, size } from "./opengraph-image";

export const runtime = "edge";

export { alt, size };

export default function TwitterImage() {
  return OpenGraphImage();
}
