import type { TVideoKind } from "./types";

/**
 * Upload ONE video with a real progress bar. (fetch cannot report upload
 * progress, so this uses XMLHttpRequest.) One video per request keeps every
 * upload small enough to finish reliably, and a failed one can simply be retried.
 */
export const uploadVideo = (input: {
  token: string;
  kind: TVideoKind;
  file: File;
  replaceVideoId?: string;
  onProgress: (percent: number) => void;
  signal?: AbortSignal;
}): Promise<void> =>
  new Promise((resolve, reject) => {
    const { token, kind, file, replaceVideoId, onProgress, signal } = input;
    const form = new FormData();
    form.append("kind", kind);
    if (replaceVideoId) form.append("replaceVideoId", replaceVideoId);
    form.append("video", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/videos`);
    xhr.setRequestHeader("Authorization", token.startsWith("Bearer ") ? token : `Bearer ${token}`);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve();
      let message = "The upload failed. Please try again.";
      try {
        const body = JSON.parse(xhr.responseText);
        message = body?.message ?? message;
      } catch {
        // keep the generic message
      }
      reject(new Error(xhr.status === 413 ? "This video is larger than 600 MB." : message));
    };
    xhr.onerror = () => reject(new Error("Network problem. Check your connection and try again."));
    xhr.onabort = () => reject(new Error("Upload cancelled."));
    signal?.addEventListener("abort", () => xhr.abort());
    xhr.send(form);
  });
