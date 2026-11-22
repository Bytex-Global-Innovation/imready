"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Play } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { INTRO_VIDEO } from "@/constants/dashboard";
import { cn } from "@/lib/utils";

export function FoundationIntroVideoView({
  initiallyWatched = false,
  onWatched,
  onNext,
}: {
  initiallyWatched?: boolean;
  onWatched?: () => void;
  onNext: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [watchedFully, setWatchedFully] = useState(initiallyWatched);
  const [progress, setProgress] = useState(initiallyWatched ? 1 : 0);
  const [isPlaying, setIsPlaying] = useState(false);
  const maxWatchedRef = useRef(0);
  const watchedNotifiedRef = useRef(initiallyWatched);

  const markWatched = useCallback(() => {
    setWatchedFully(true);
    setProgress(1);
    if (!watchedNotifiedRef.current) {
      watchedNotifiedRef.current = true;
      onWatched?.();
    }
  }, [onWatched]);

  const syncProgress = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.duration || Number.isNaN(video.duration)) return;
    const ratio = Math.min(1, video.currentTime / video.duration);
    setProgress(ratio);
    if (ratio >= 0.98 || video.ended) {
      markWatched();
    }
  }, [markWatched]);

  useEffect(() => {
    if (initiallyWatched) {
      setWatchedFully(true);
      setProgress(1);
    }
  }, [initiallyWatched]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    function onTimeUpdate() {
      const el = videoRef.current;
      if (!el) return;
      if (el.currentTime > maxWatchedRef.current) {
        maxWatchedRef.current = el.currentTime;
      }
      syncProgress();
    }

    function onSeeking() {
      const el = videoRef.current;
      if (!el) return;
      if (el.currentTime > maxWatchedRef.current + 0.35) {
        el.currentTime = maxWatchedRef.current;
      }
    }

    function onEnded() {
      markWatched();
      setIsPlaying(false);
    }

    function onPlay() {
      setIsPlaying(true);
    }

    function onPause() {
      setIsPlaying(false);
    }

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("seeking", onSeeking);
    video.addEventListener("ended", onEnded);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("seeking", onSeeking);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, [markWatched, syncProgress]);

  function handlePlayClick() {
    const video = videoRef.current;
    if (!video) return;
    void video.play();
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
      <header>
        <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
          Before you begin
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {INTRO_VIDEO.title}
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted sm:text-base">
          {INTRO_VIDEO.caption} Watch the full video to unlock the next step.
        </p>
      </header>

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-white shadow-sm">
        <div className="relative aspect-video bg-foreground/95">
          <video
            ref={videoRef}
            className="h-full w-full object-contain"
            src={INTRO_VIDEO.src}
            poster={INTRO_VIDEO.poster}
            controls
            controlsList="nodownload noplaybackrate"
            disablePictureInPicture
            playsInline
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>

          {!isPlaying && progress < 0.02 && !watchedFully ? (
            <button
              type="button"
              onClick={handlePlayClick}
              aria-label="Play introduction video"
              className="absolute inset-0 flex cursor-pointer items-center justify-center bg-foreground/20"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-105">
                <Play className="h-7 w-7 fill-current" />
              </span>
            </button>
          ) : null}
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-xs font-medium">
              <span className="text-muted">Watch progress</span>
              <span className={cn(watchedFully ? "text-primary" : "text-muted")}>
                {Math.round(progress * 100)}%
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-brand-100">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-200 ease-out"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
          </div>

          <p className="text-sm text-muted">
            {watchedFully
              ? "You finished the introduction. Continue to start Foundation."
              : "Finish the video to enable Next. Skipping ahead is disabled."}
          </p>

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={onNext}
              disabled={!watchedFully}
              className="w-full sm:w-auto sm:min-w-[11rem]"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
