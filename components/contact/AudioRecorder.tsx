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
          ? "The browser blocked the microphone. See the diagnosis box below for the fix."
          : e.error === "no-speech" ? "No speech detected. Try again and speak clearly."
          : e.error === "audio-capture" ? "No microphone found. Check your device."
          : e.error === "network" ? "Speech service needs network. This browser may not support transcription."
          : "Voice input failed: " + e.error
      );
    };
    rec.onend = () => setStatus((s) => (s === "listening" ? "idle" : s));
    recRef.current = rec;
    return () => { try { rec.stop(); } catch {} };
  }, [locale, onTranscript]);

  // Diagnostic ONLY — we read the state but NEVER use it to block the attempt
  const runDiagnostics = async (): Promise<string> => {
    const lines: string[] = [];
    lines.push("Secure context (HTTPS): " + (window.isSecureContext ? "YES" : "NO"));
    lines.push("mediaDevices API: " + (navigator.mediaDevices ? "present" : "MISSING"));
    try {
      if (navigator.permissions?.query) {
        const p = await navigator.permissions.query({ name: "microphone" as PermissionName });
        lines.push("Mic permission state: " + p.state.toUpperCase());
        if (p.state === "denied") {
          lines.push(">> If the attempt below still fails: click the lock icon in the address bar -> Site settings -> Microphone -> set to ALLOW, then RELOAD the page.");
          lines.push(">> On Iron: also check iron://settings/content/microphone and make sure no global block is active, then fully restart Iron.");
        }
      } else {
        lines.push("permissions.query not supported");
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

    // Diagnostic for information only
    const d = await runDiagnostics();
    setDiag(d);

    // KEY CHANGE: we ALWAYS attempt, even if the state reading says DENIED.
    // Some privacy browsers report wrong/stale states. Only the real attempt tells the truth.
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
          ? "The browser really blocked the microphone this time. Fix: lock icon -> Site settings -> Microphone -> Allow -> then RELOAD the page. On Iron, check iron://settings/content/microphone and fully restart the browser."
          : name === "NotFoundError" ? "No microphone found. Check your device."
          : name === "NotReadableError" ? "Microphone is in use by another app."
          : "Microphone error: " + name
      );
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
        {status === "requesting" ? "Trying microphone..."
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