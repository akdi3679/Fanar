"use client";
import { useState, useEffect, useRef } from "react";
import { Mic, Square, AlertCircle, Loader2 } from "lucide-react";

interface Props {
  onTranscript: (text: string) => void;
  locale: string;
  disabled?: boolean;
}
const langMap: Record<string, string> = {
  fr: "fr-FR", en: "en-US", ar: "ar-SA", es: "es-ES", de: "de-DE",
};
type Status = "idle" | "requesting" | "listening" | "error" | "unsupported";

export function AudioRecorder({ onTranscript, locale, disabled }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [supported, setSupported] = useState<boolean | null>(null);
  const recRef = useRef<any>(null);
  const accRef = useRef("");

  useEffect(() => {
    const SR = typeof window !== "undefined"
      ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      : null;
    setSupported(!!SR);
    if (!SR) return;

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = langMap[locale] || "fr-FR";
    rec.onresult = (e: any) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          accRef.current += e.results[i][0].transcript + " ";
          onTranscript(accRef.current.trim());
        }
      }
    };
    rec.onerror = (e: any) => {
      setStatus("error");
      setErrorMsg(
        e.error === "not-allowed" || e.error === "service-not-allowed"
          ? "Microphone blocked. Click the lock icon in the address bar, allow the microphone, then try again."
          : e.error === "no-speech" ? "No speech detected. Try again and speak clearly."
          : e.error === "audio-capture" ? "No microphone found. Check your device."
          : e.error === "network" ? "Speech service needs network access. This browser may not support transcription."
          : "Voice input failed. Please type instead."
      );
    };
    rec.onend = () => setStatus((s) => (s === "listening" ? "idle" : s));
    recRef.current = rec;
    return () => { try { rec.stop(); } catch {} };
  }, [locale, onTranscript]);

  const toggle = async () => {
    setErrorMsg(null);

    if (status === "listening") {
      recRef.current?.stop();
      setStatus("idle");
      return;
    }

    if (typeof window !== "undefined" && !window.isSecureContext) {
      setStatus("error");
      setErrorMsg("Voice input requires HTTPS.");
      return;
    }

    if (!recRef.current) {
      setStatus("unsupported");
      setErrorMsg("Voice transcription is not supported in this browser. Use Chrome or Edge, or type your message.");
      return;
    }

    // KEY FIX: explicitly request the microphone. THIS is what triggers the browser prompt.
    setStatus("requesting");
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop()); // just needed the permission grant
      }
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(
        err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError"
          ? "Microphone permission denied. Click the lock icon in the address bar, allow the microphone, then retry."
          : err?.name === "NotFoundError" ? "No microphone found. Check your device."
          : "Could not access the microphone. Please type instead."
      );
      return;
    }

    accRef.current = "";
    try {
      recRef.current.start();
      setStatus("listening");
    } catch {
      setStatus("error");
      setErrorMsg("Could not start voice input. This browser may not support transcription. Please type instead.");
    }
  };

  if (supported === false) {
    return (
      <p className="text-xs text-slate-400 flex items-start gap-1.5">
        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
        Voice transcription is not available in this browser (iPhone/iPad and some privacy browsers). Please type your message, or use Chrome.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={toggle}
        disabled={disabled || status === "requesting"}
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-medium transition-all ${
          status === "listening" ? "bg-red-50 border-red-300 text-red-600" : "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
        } ${disabled || status === "requesting" ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {status === "requesting" ? <Loader2 className="w-4 h-4 animate-spin" />
          : status === "listening" ? <Square className="w-4 h-4" />
          : <Mic className="w-4 h-4" />}
        {status === "requesting" ? "Requesting microphone..."
          : status === "listening" ? "Stop recording"
          : "Speak instead of typing"}
        {status === "listening" && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
      </button>
      {status === "listening" && (
        <p className="text-xs text-red-500">Listening... speak naturally, your words appear in the box below.</p>
      )}
      {status === "idle" && !errorMsg && (
        <p className="text-xs text-slate-400">Your browser will ask for microphone access. It stays private.</p>
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