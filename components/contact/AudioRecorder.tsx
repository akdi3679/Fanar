"use client";
import { useState, useEffect, useRef } from "react";
import { Mic, Square, AlertCircle } from "lucide-react";

interface Props { onTranscript: (t: string) => void; locale: string; disabled?: boolean; }
const langMap: Record<string, string> = { fr: "fr-FR", en: "en-US", ar: "ar-SA", es: "es-ES", de: "de-DE" };

function mapError(code: string): string {
  switch (code) {
    case "not-allowed":
    case "service-not-allowed":
      return "Microphone blocked. Tap the lock/🔒 icon in your browser address bar → allow microphone → try again.";
    case "no-speech": return "I didn't hear anything. Try again and speak clearly.";
    case "audio-capture": return "No microphone found. Check your device or type instead.";
    case "network": return "Speech service needs network. Try again.";
    default: return "Voice input failed. Please type your message instead.";
  }
}

export function AudioRecorder({ onTranscript, locale, disabled }: Props) {
  const [status, setStatus] = useState<"idle" | "listening" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);
  const recRef = useRef<any>(null);
  const accRef = useRef("");

  useEffect(() => {
    const SR = typeof window !== "undefined"
      ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      : null;
    if (!SR) { setSupported(false); return; }

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
    rec.onerror = (e: any) => { setStatus("error"); setErrorMsg(mapError(e.error)); };
    rec.onend = () => setStatus((s) => (s === "listening" ? "idle" : s));
    recRef.current = rec;
    return () => { try { rec.stop(); } catch {} };
  }, [locale, onTranscript]);

  const toggle = () => {
    setErrorMsg(null);
    if (!recRef.current) { setStatus("error"); setErrorMsg("Voice input not available here."); return; }
    if (status === "listening") { recRef.current.stop(); setStatus("idle"); return; }
    accRef.current = "";
    try { recRef.current.start(); setStatus("listening"); }
    catch { setStatus("error"); setErrorMsg("Could not start voice input. Please type instead."); }
  };

  if (!supported) {
    return (
      <p className="text-xs text-slate-400 flex items-start gap-1.5">
        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
        Voice input needs Chrome (Android or desktop). On iPhone/iPad it isn't supported — please type your message below.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-medium transition-all ${
          status === "listening"
            ? "bg-red-50 border-red-300 text-red-600"
            : "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {status === "listening" ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        {status === "listening" ? "Stop recording" : "Speak instead of typing"}
        {status === "listening" && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
      </button>
      {status === "listening" && (
        <p className="text-xs text-red-500">Listening… speak naturally, your words appear in the box below.</p>
      )}
      {status === "idle" && !errorMsg && (
        <p className="text-xs text-slate-400">Your browser will ask for microphone access — it stays private.</p>
      )}
      {status === "error" && errorMsg && (
        <p className="text-xs text-amber-600 flex items-start gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          {errorMsg}
        </p>
      )}
    </div>
  );
}