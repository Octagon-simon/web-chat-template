import { uid, type Attachment } from "./types";

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not read that image."));
    image.src = source;
  });
}

/** Downscales to keep message thumbnails inside the localStorage budget. */
async function downscale(source: string, max: number): Promise<string | undefined> {
  try {
    const image = await loadImage(source);
    const scale = Math.min(1, max / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    const context = canvas.getContext("2d");
    if (!context) return undefined;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.72);
  } catch {
    return undefined;
  }
}

export async function fileToAttachment(file: File): Promise<Attachment> {
  const isImage = file.type.startsWith("image/");
  let preview: string | undefined;
  if (isImage && file.size <= 8 * 1024 * 1024) {
    const objectUrl = URL.createObjectURL(file);
    preview = await downscale(objectUrl, 640);
    URL.revokeObjectURL(objectUrl);
  }
  return {
    id: uid(),
    name: file.name,
    kind: isImage ? "image" : "file",
    size: file.size,
    preview,
  };
}

export function dataUrlBytes(dataUrl: string): number {
  const base64 = dataUrl.split(",")[1] ?? "";
  return Math.round((base64.length * 3) / 4);
}
