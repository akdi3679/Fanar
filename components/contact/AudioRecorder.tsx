"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Square, RotateCcw, Trash2 } from "lucide-react";

interface Props {
  onRecordingComplete: (blob: Blob, durationSec: number) => void;
  onRemove?: () => void;
  disabled?: boolean;
}

type RecState = "idle" | "recording" | "recorded";
const BAR_COUNT = 16;

export function AudioRecorder({ onRecordingComplete, onRemove, disabled }: Props) {
  const [state, setState] = useState<RecState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [waveform, setWaveform] = useState<number[]>(Array(BAR_COUNT).fill(0.12));
  const [duration, setDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const startTimeRef = useRef(0);

  const drawWaveform = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const data = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      const v = (data[i] - 128) / 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / data.length);
    setWaveform((prev) => [...prev.slice(1), Math.min(1, rms * 2.4)]);
    animFrameRef.current = requestAnimationFrame(drawWaveform);
  }, []);

  const cleanup = () => {
    if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null; }
    if (audioCtxRef.current) { audioCtxRef.current.close().catch(() => {}); audioCtxRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    analyserRef.current = null;
  };

  useEffect(() => () => cleanup(), []);

  const startRecording = async () => {
    setErrorMsg(null);
    setWaveform(Array(BAR_COUNT).fill(0.12));
    if (!navigator.mediaDevices?.getUserMedia) {
      setErrorMsg("Microphone not supported. Please type instead.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      // CRITICAL for mobile: AudioContext starts suspended on phones.
      // Resuming it inside the tap gesture unlocks it so the visualizer moves.
      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.6;
      src.connect(analyser);
      analyserRef.current = analyser;

      const mimes = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"];
      const mime = mimes.find((m) => MediaRecorder.isTypeSupported(m)) || "";
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        const dur = (Date.now() - startTimeRef.current) / 1000;
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        cleanup();
        if (dur < 0.5) { setState("idle"); setErrorMsg("Too short. Try again."); return; }
        setDuration(dur);
        setState("recorded");
        onRecordingComplete(blob, dur);
      };
      rec.start();
      mediaRecorderRef.current = rec;
      startTimeRef.current = Date.now();
      setState("recording");
      animFrameRef.current = requestAnimationFrame(drawWaveform);
    } catch (err: any) {
      cleanup();
      setState("idle");
      setErrorMsg(
        err?.name === "NotAllowedError" ? "Microphone blocked. Allow it in your browser, then retry."
        : err?.name === "NotFoundError" ? "No microphone found."
        : "Could not start recording. Please type instead."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const retry = () => { onRemove?.(); startRecording(); };
  const remove = () => { setState("idle"); setDuration(0); setWaveform(Array(BAR_COUNT).fill(0.12)); onRemove?.(); };

  return (
    <div className="space-y-2">
      {/* The single pill — identical in every state */}
      <div className="inline-flex items-center gap-2 h-10 px-4 rounded-full border border-blue-200 bg-blue-50">
        {state === "idle" && (
          <button
            type="button"
            onClick={startRecording}
            disabled={disabled}
            className="flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Mic className="w-4 h-4" /> Record voice message
          </button>
        )}

        {state === "recording" && (
          <>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
            <div className="flex items-center gap-[2px] h-4">
              {waveform.map((amp, i) => (
                <span
                  key={i}
                  className="w-[2px] rounded-full bg-blue-500"
                  style={{ height: Math.max(3, amp * 16) + "px" }}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={stopRecording}
              title="Stop"
              className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors flex-shrink-0"
            >
              <Square className="w-3 h-3" />
            </button>
          </>
        )}

        {state === "recorded" && (
          <>
            <div className="flex items-center gap-[2px] h-4">
              {waveform.map((amp, i) => (
                <span
                  key={i}
                  className="w-[2px] rounded-full bg-blue-500"
                  style={{ height: Math.max(3, amp * 16) + "px" }}
                />
              ))}
            </div>
            <span className="text-xs font-medium text-blue-700 whitespace-nowrap">{duration.toFixed(1)}s</span>
            <button
              type="button"
              onClick={retry}
              title="Retry"
              className="flex items-center justify-center w-6 h-6 rounded-full bg-white border border-blue-200 text-blue-600 hover:bg-blue-100 transition-colors flex-shrink-0"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={remove}
              title="Remove"
              className="flex items-center justify-center w-6 h-6 rounded-full bg-white border border-red-200 text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </>
        )}
      </div>

      {errorMsg && <p className="text-xs text-amber-600">{errorMsg}</p>}
    </div>
  );
}