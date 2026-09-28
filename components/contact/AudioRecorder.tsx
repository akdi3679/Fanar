"use client";
import { useState, useEffect, useRef } from "react";
import { Mic, Square, AlertCircle, Loader2 } from "lucide-react";

interface AudioRecorderProps {
  onTranscript: (text: string) => void;
  locale: string;
  disabled?: boolean;
}

const langMap: Record<string, string> = {
  fr: "fr-FR", en: "en-US", ar: "ar-SA", es: "es-ES", de: "de-DE",
};

export function AudioRecorder({ onTranscript, locale, disabled }: AudioRecorderProps) {
  const [state, setState] = useState<"idle" | "requesting" | "listening" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState<boolean | null>(null);
  const recRef = useRef<any>(null);

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSupported(!!SR);
    if (!SR) return;

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = langMap[locale] || "fr-FR";

    rec.onresult = (e: any) => {
      let final = "";
      let interim = "";
      for (let i = 0; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t + " ";
        else interim += t;
      }
      const text = (final || interim).trim();
      if (text) onTranscript(text);
    };
    rec.onerror = (e: any) => {
      setState("error");
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setError("denied");
      } else if (e.error === "no-speech") {
        setError("silence");
      } else if (e.error === "audio-capture") {
        setError("noMic");
      } else if (e.error === "network") {
        setError("network");
      } else {
        setError("generic");
      }
    };
    rec.onend = () => setState((s) => (s === "listening" ? "idle" : s));
    recRef.current = rec;
    return () => { try { rec.stop(); } catch {} };
  }, [locale, onTranscript]);

  const toggle = async () => {
    setError(null);
    if (!recRef.current) {
      setError("unsupported");
      return;
    }

    if (state === "listening") {
      recRef.current.stop();
      setState("idle");
      return;
    }

    // STEP 1: Request microphone permission explicitly via getUserMedia
    // This is what triggers the browser's permission dialog
    setState("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Immediately stop the stream — we just needed the permission grant
      stream.getTracks().forEach((t) => t.stop());
    } catch (err: any) {
      setState("error");
      if (err?.name === "NotAllowedError") setError("denied");
      else if (err?.name === "NotFoundError") setError("noMic");
      else setError("generic");
      return;
    }

    // STEP 2: Now start speech recognition (permission already granted)
    try {
      recRef.current.start();
      setState("listening");
    } catch {
      setState("error");
      setError("generic");
    }
  };

  const errorMsg = {
    denied: "Microphone blocked. Click the 🔒 icon in your address bar → allow microphone → try again.",
    silence: "I didn't hear anything. Try speaking clearly or just type below.",
    noMic: "No microphone detected. Please check your device or type below.",
    network: "Network issue with speech service. Please type below.",
    unsupported: "Voice input isn't supported in this browser — just type below.",
    generic: "Voice input failed. You can type your message below instead.",
  }[error || ""];

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={toggle}
        disabled={disabled || state === "requesting"}
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-medium transition-all ${
          state === "listening"
            ? "bg-red-50 border-red-300 text-red-600"
            : "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
        } ${disabled || state === "requesting" ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {state === "requesting" ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : state === "listening" ? (
          <Square className="w-4 h-4" />
        ) : (
          <Mic className="w-4 h-4" />
        )}
        {state === "requesting" ? "Requesting permission..." : state === "listening" ? "Stop recording" : "Speak instead of typing"}
        {state === "listening" && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
      </button>
      {state === "listening" && (
        <p className="text-xs text-red-500 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          Listening… speak naturally. Your words will appear in the box below.
        </p>
      )}
      {state === "idle" && supported !== false && (
        <p className="text-xs text-slate-400">Your browser will ask for microphone access — it stays private.</p>
      )}
      {state === "idle" && supported === false && (
        <p className="text-xs text-slate-400">Voice input isn't available in this browser — just type below.</p>
      )}
      {state === "error" && errorMsg && (
        <p className="text-xs text-amber-600 flex items-start gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          {errorMsg}
        </p>
      )}
    </div>
  );
}