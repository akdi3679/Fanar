"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Square, AlertCircle } from "lucide-react";

interface Props {
  onRecordingComplete: (blob: Blob, durationSec: number) => void;
  disabled?: boolean;
}

export function AudioRecorder({ onRecordingComplete, disabled }: Props) {
  const [status, setStatus] = useState<"idle" | "listening" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [bars, setBars] = useState<number[]>(Array(24).fill(0));

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Tick elapsed seconds while recording
  useEffect(() => {
    if (status === "listening") {
      timerRef.current = setInterval(() => {
        setElapsed((Date.now() - startTimeRef.current) / 1000);
      }, 100);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  // Visualizer animation loop
  const drawVisualizer = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const bufferLength = analyser.frequencyBinCount;
    const data = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(data);

    // Downsample to 24 bars
    const step = Math.floor(bufferLength / 24);
    const newBars: number[] = [];
    for (let i = 0; i < 24; i++) {
      let sum = 0;
      for (let j = 0; j < step; j++) sum += data[i * step + j] || 0;
      newBars.push(sum / step / 255);
    }
    setBars(newBars);
    animFrameRef.current = requestAnimationFrame(drawVisualizer);
  }, []);

  const cleanup = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = null;
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    analyserRef.current = null;
  };

  // Cleanup on unmount
  useEffect(() => () => cleanup(), []);

  const startRecording = async () => {
    setErrorMsg(null);
    setElapsed(0);

    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("error");
      setErrorMsg("Microphone not supported in this browser. Please type instead.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.7;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mimeTypes = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"];
      const mimeType = mimeTypes.find((t) => MediaRecorder.isTypeSupported(t)) || "";
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const finalDuration = (Date.now() - startTimeRef.current) / 1000;
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        cleanup();
        if (finalDuration < 0.5) {
          setStatus("error");
          setErrorMsg("Recording too short. Hold the button longer.");
          return;
        }
        onRecordingComplete(blob, finalDuration);
        setStatus("idle");
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      startTimeRef.current = Date.now();
      setStatus("listening");
      animFrameRef.current = requestAnimationFrame(drawVisualizer);
    } catch (err: any) {
      cleanup();
      setStatus("error");
      setErrorMsg(
        err?.name === "NotAllowedError"
          ? "Microphone blocked. Click the lock icon in the address bar → allow → reload."
          : err?.name === "NotFoundError"
          ? "No microphone found."
          : "Could not start recording. Please type instead."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && status === "listening") {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={status === "listening" ? stopRecording : startRecording}
          disabled={disabled || status === "listening"}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-medium transition-all ${
            status === "listening"
              ? "bg-red-50 border-red-300 text-red-600"
              : "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {status === "listening" ? (
            <><Square className="w-4 h-4" /> Stop & save ({elapsed.toFixed(1)}s)</>
          ) : (
            <><Mic className="w-4 h-4" /> Record voice message</>
          )}
          {status === "listening" && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
        </button>
        {status === "idle" && !errorMsg && (
          <p className="text-xs text-slate-400">Or type below. You can send both.</p>
        )}
      </div>

      {/* Sound visualizer: 24 frequency bars, only visible while recording */}
      {status === "listening" && (
        <div className="h-14 w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 flex items-center gap-1 overflow-hidden">
          {bars.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm transition-all duration-75"
              style={{
                height: `${Math.max(8, h * 100)}%`,
                background: `linear-gradient(to top, #3b82f6, #8b5cf6)`,
              }}
            />
          ))}
        </div>
      )}

      {errorMsg && (
        <p className="text-xs text-amber-600 flex items-start gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          {errorMsg}
        </p>
      )}
    </div>
  );
}