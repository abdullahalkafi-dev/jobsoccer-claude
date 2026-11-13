import { z } from "zod";
import { VideoKind } from "./video.constant";

const consentDto = z.object({
  body: z
    .object({
      ai: z.boolean().optional(),
      players: z.boolean().optional(),
    })
    .refine((b) => b.ai || b.players, { message: "Give at least one consent" }),
});

const uploadDto = z.object({
  body: z.object({
    kind: z.nativeEnum(VideoKind),
    title: z.string().trim().max(120).optional(),
    replaceVideoId: z.string().trim().optional(),
  }),
});

/** Start (or continue) a resumable upload: what file is coming. */
const startUploadDto = z.object({
  body: z.object({
    kind: z.nativeEnum(VideoKind),
    fileName: z.string().trim().min(1).max(255),
    size: z.number().int().positive(),
    lastModified: z.number().int().nonnegative().optional(),
    title: z.string().trim().max(120).optional(),
    replaceVideoId: z.string().trim().optional(),
  }),
});

const unlockDto = z.object({
  params: z.object({ userId: z.string().trim().min(1) }),
  body: z.object({ kind: z.nativeEnum(VideoKind).optional() }),
});

export const VideoDto = { consentDto, uploadDto, startUploadDto, unlockDto };
