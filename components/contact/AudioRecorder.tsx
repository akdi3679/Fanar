"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Square, RotateCcw, Trash2, CheckCircle2 } from "lucide-react";

interface Props {
  onRecordingComplete: (blob: Blob, durationSec: number) => void;
  onRemove?: () => void;
  disabled?: boolean;
}

type RecState = "idle" | "recording" | "recorded";

export function AudioRecorder({ onRecordingComplete, onRemove, disabled }: Props) {
  const [state, setState] = useState<RecState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  // Scrolling waveform history: newest value pushed on the right, old slides left
  const [waveform, setWaveform] = useState<number[]>(Array(70).fill(0));

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);

  // Elapsed timer while recording
  useEffect(() => {
    if (state === "recording") {
      timerRef.current = setInterval(
        () => setElapsed((Date.now() - startTimeRef.current) / 1000),
        100
      );
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [state]);

  // Scrolling waveform: compute RMS amplitude, shift array left, add new on right
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
    setWaveform((prev) => [...prev.slice(1), Math.min(1, rms * 1.8)]);
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
    setElapsed(0);
    setWaveform(Array(70).fill(0));

    if (!navigator.mediaDevices?.getUserMedia) {
      setErrorMsg("Microphone not supported in this browser. Please type instead.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
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
        if (dur < 0.5) {
          setState("idle");
          setErrorMsg("Recording too short. Try again.");
          return;
        }
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
        err?.name === "NotAllowedError"
          ? "Microphone blocked. Allow it in your browser, then retry."
          : err?.name === "NotFoundError"
          ? "No microphone found."
          : "Could not start recording. Please type instead."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const retry = () => {
    onRemove?.();
    startRecording();
  };

  const remove = () => {
    setState("idle");
    setDuration(0);
    onRemove?.();
  };

  return (
    <div className="space-y-3">
      {/* IDLE: record button */}
      {state === "idle" && (
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={startRecording}
            disabled={disabled}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Mic className="w-4 h-4" /> Record voice message
          </button>
          <p className="text-xs text-slate-400">Or type below. You can send both.</p>
        </div>
      )}

      {/* RECORDING: scrolling blue waveform + Stop */}
      {state === "recording" && (
        <div className="space-y-3">
          <div className="h-16 w-full rounded-xl bg-slate-900 border border-slate-700 px-2 flex items-center gap-[2px] overflow-hidden">
            {waveform.map((amp, i) => (
              <div
                key={i}
                className="flex-1 min-w-[2px] rounded-full bg-blue-500"
                style={{
                  height: Math.max(6, amp * 100) + "%",
                  opacity: 0.35 + (i / waveform.length) * 0.65,
                }}
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-red-600 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              {elapsed.toFixed(1)}s
            </span>
            <button
              type="button"
              onClick={stopRecording}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
            >
              <Square className="w-4 h-4" /> Stop
            </button>
          </div>
        </div>
      )}

      {/* RECORDED: confirm + Retry + Remove */}
      {state === "recorded" && (
        <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl flex-wrap">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span className="text-sm text-green-800 font-medium">Voice recorded ({duration.toFixed(1)}s)</span>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={retry}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-green-300 text-green-700 text-xs font-medium hover:bg-green-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Retry
            </button>
            <button
              type="button"
              onClick={remove}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Remove
            </button>
          </div>
        </div>
      )}

      {errorMsg && <p className="text-xs text-amber-600">{errorMsg}</p>}
    </div>
  );
}