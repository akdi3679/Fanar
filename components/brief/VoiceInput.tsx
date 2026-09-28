"use client";
import { useState, useEffect } from "react";
import { Mic, MicOff } from "lucide-react";

export function VoiceInput({ onTranscript }: { onTranscript: (text: string) => void }) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = "fr-FR"; // Default to French, can be dynamic
        
        rec.onresult = (event: any) => {
          let finalTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          if (finalTranscript) onTranscript(finalTranscript);
        };
        setRecognition(rec);
      }
    }
  }, [onTranscript]);

  const toggleListen = () => {
    if (!recognition) return alert("Voice recognition not supported in this browser.");
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleListen}
      className={lex items-center gap-2 px-4 py-2 rounded-full border transition-all }
    >
      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
      <span className="text-xs font-medium uppercase tracking-wider">
        {isListening ? "Stop" : "Dictate"}
      </span>
    </button>
  );
}
