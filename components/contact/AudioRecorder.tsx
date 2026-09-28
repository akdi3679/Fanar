"use client";
import { useState, useEffect, useRef } from "react";
import { Mic, Square, AlertCircle, Loader2 } from "lucide-react";

interface Props {
  onTranscript: (text: string) => void;
  locale: string;
  disabled?: boolean;
}
const langMap: Record<string, string> = { fr: "fr-FR", en: "en-US", ar: "ar-SA", es: "es-ES", de: "de-DE" };
type Status = "idle" | "requesting" | "listening" | "error" | "unsupported";

export function AudioRecorder({ onTranscript, locale, disabled }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [diag, setDiag] = useState<string | null>(null);
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
          ? "Microphone blocked by the browser. See the diagnosis box below."
          : e.error === "no-speech" ? "No speech detected. Try again and speak clearly."
          : e.error === "audio-capture" ? "No microphone found."
          : e.error === "network" ? "Speech service needs network. This browser may not support transcription."
          : "Voice input failed: " + e.error
      );
    };
    rec.onend = () => setStatus((s) => (s === "listening" ? "idle" : s));
    recRef.current = rec;
    return () => { try { rec.stop(); } catch {} };
  }, [locale, onTranscript]);

  const runDiagnostics = async (): Promise<string> => {
    const lines: string[] = [];
    lines.push("Secure context (HTTPS): " + (window.isSecureContext ? "YES" : "NO (mic needs HTTPS)"));
    lines.push("mediaDevices API: " + (navigator.mediaDevices ? "present" : "MISSING"));
    try {
      if (navigator.permissions?.query) {
        const p = await navigator.permissions.query({ name: "microphone" as PermissionName });
        lines.push("Mic permission state: " + p.state.toUpperCase());
        if (p.state === "denied") {
          lines.push(">> PERMISSION IS DENIED. Click the lock/site icon in the address bar -> Site settings -> Microphone -> set to Allow, then reload.");
        }
      } else {
        lines.push("permissions.query not supported here");
      }
    } catch {
      lines.push("could not read permission state");
    }
    return lines.join("\n");
  };

  const toggle = async () => {
    setErrorMsg(null);
    setDiag(null);

    if (status === "listening") {
      recRef.current?.stop();
      setStatus("idle");
      return;
    }

    if (!recRef.current) {
      setStatus("unsupported");
      setErrorMsg("Voice transcription is not supported in this browser. Use Chrome or Edge, or type your message.");
      return;
    }

    setStatus("requesting");

    // Run diagnostics first so we know exactly what's happening
    const d = await runDiagnostics();
    setDiag(d);

    // If permission already denied, don't even try — tell the user how to fix it
    if (d.includes("DENIED")) {
      setStatus("error");
      setErrorMsg("Microphone permission is DENIED in your browser. Follow the instruction in the diagnosis box, then reload the page.");
      return;
    }

    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
      }
    } catch (err: any) {
      setStatus("error");
      const name = err?.name || "UnknownError";
      setErrorMsg(
        name === "NotAllowedError" || name === "PermissionDeniedError"
          ? "The browser refused microphone access. Check the diagnosis box for the exact reason."
          : name === "NotFoundError" ? "No microphone found."
          : name === "NotReadableError" ? "Microphone is in use by another app."
          : "Microphone error: " + name
      );
      const d2 = await runDiagnostics();
      setDiag(d2);
      return;
    }

    accRef.current = "";
    try {
      recRef.current.start();
      setStatus("listening");
    } catch {
      setStatus("error");
      setErrorMsg("Could not start transcription. This browser may not support it. Please type instead.");
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
        {status === "requesting" ? "Checking microphone..."
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
      {diag && (
        <pre className="text-[11px] leading-relaxed text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-3 whitespace-pre-wrap font-mono">
          {diag}
        </pre>
      )}
    </div>
  );
}