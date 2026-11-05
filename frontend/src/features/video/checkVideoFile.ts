const formatClock = (seconds: number): string => `${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, "0")}`;

export type TFileCheck = { ok: true; durationSeconds: number | null } | { ok: false; message: string };

/** Read length and size from the file in the browser (null when the browser cannot decode it). */
const readMetadata = (file: File): Promise<{ duration: number; width: number; height: number } | null> =>
  new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    const finish = (value: { duration: number; width: number; height: number } | null) => {
      URL.revokeObjectURL(url);
      resolve(value);
    };
    video.preload = "metadata";
    video.onloadedmetadata = () => finish({ duration: video.duration, width: video.videoWidth, height: video.videoHeight });
    video.onerror = () => finish(null);
    // Some browsers never answer for formats they cannot decode.
    setTimeout(() => finish(null), 8000);
    video.src = url;
  });

/**
 * Quick friendly checks BEFORE uploading (type, size, length, 720p), so the
 * candidate learns about a problem in a second instead of after a long upload.
 * The server repeats every check on the real file; this one only saves time.
 */
export const checkVideoFile = async (
  file: File,
  limits: { maxSeconds: number; maxMegabytes: number; minShortSide: number }
): Promise<TFileCheck> => {
  if (!/\.(mp4|mov)$/i.test(file.name)) return { ok: false, message: "Please choose an MP4 or MOV video." };
  if (file.size > limits.maxMegabytes * 1024 * 1024) {
    return { ok: false, message: `This video is ${(file.size / 1024 / 1024).toFixed(0)} MB. The maximum is ${limits.maxMegabytes} MB.` };
  }

  const meta = await readMetadata(file);
  if (!meta) return { ok: true, durationSeconds: null };

  if (meta.duration > limits.maxSeconds + 1) {
    return { ok: false, message: `This video is ${formatClock(meta.duration)} long. The maximum is ${formatClock(limits.maxSeconds)}.` };
  }
  if (Math.min(meta.width, meta.height) > 0 && Math.min(meta.width, meta.height) < limits.minShortSide) {
    return { ok: false, message: `This video is ${meta.width}x${meta.height}. The minimum quality is 720p (1280x720).` };
  }
  return { ok: true, durationSeconds: meta.duration };
};

export { formatClock };
