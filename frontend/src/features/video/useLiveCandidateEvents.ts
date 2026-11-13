"use client";

import { useEffect } from "react";
import { baseApi } from "@/redux/api/baseApi";
import { useAppDispatch } from "@/redux/hooks";
import { useNotificationContext } from "@/components/providers/NotificationProvider";

/**
 * Keep the candidate's screens live without polling. The server pushes these
 * events to the candidate's socket room:
 *   video:updated         a video was stored / deleted / unlocked, captions are ready
 *   assessment:status     the AI interview assessment moved (queued, transcribing, scoring, done)
 *   profileQuality:updated  the Profile Quality Score was recalculated
 * Each one refreshes the data it affects.
 */
export function useLiveCandidateEvents(): void {
  const { socket } = useNotificationContext();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!socket) return;
    // Each event reloads only what it changed
    const refreshVideos = () => dispatch(baseApi.util.invalidateTags(["Video", "User"]));
    const refreshAssessment = () => dispatch(baseApi.util.invalidateTags(["Assessment"]));
    const refreshQuality = () => dispatch(baseApi.util.invalidateTags(["ProfileQuality", "User"]));

    socket.on("video:updated", refreshVideos);
    socket.on("assessment:status", refreshAssessment);
    socket.on("profileQuality:updated", refreshQuality);
    return () => {
      socket.off("video:updated", refreshVideos);
      socket.off("assessment:status", refreshAssessment);
      socket.off("profileQuality:updated", refreshQuality);
    };
  }, [socket, dispatch]);
}
