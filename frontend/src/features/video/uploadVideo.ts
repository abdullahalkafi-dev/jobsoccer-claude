import type { TVideoKind } from "./types";

/** Longest one upload may take on the server (backend UPLOAD_REQUEST_TIMEOUT_MS). */
export const UPLOAD_LIMIT_MINUTES = 45;

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
  onProgress: (loadedBytes: number, totalBytes: number) => void;
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
      if (event.lengthComputable) onProgress(event.loaded, event.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve();
      if (xhr.status === 413) return reject(new Error("This video is larger than 600 MB."));
      if (xhr.status === 408) {
        return reject(
          new Error(
            `The upload took longer than ${UPLOAD_LIMIT_MINUTES} minutes and was stopped. Please try again on a faster connection, or export the video at 720p so the file is smaller.`
          )
        );
      }
      let message = "The upload failed. Please try again.";
      try {
        const body = JSON.parse(xhr.responseText);
        message = body?.message ?? message;
      } catch {
        // keep the generic message
      }
      reject(new Error(message));
    };
    xhr.onerror = () =>
      reject(
        new Error(
          "The connection was interrupted during the upload, so the video was not saved. Please check your internet connection and upload it again."
        )
      );
    xhr.onabort = () => reject(new Error("Upload cancelled."));
    signal?.addEventListener("abort", () => xhr.abort());
    xhr.send(form);
  });
