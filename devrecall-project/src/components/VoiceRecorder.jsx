import React, { useState, useRef, useEffect } from "react";
import { Mic, X, Square, Pause, Play } from "lucide-react";

export default function VoiceRecorder({ onCapture, onClose }) {
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [analyserData, setAnalyserData] = useState(new Array(20).fill(0));
  const timerRef = useRef(null);
  const animRef = useRef(null);
  const audioContextRef = useRef(null);

  useEffect(() => { startRecording(); return () => { clearInterval(timerRef.current); cancelAnimationFrame(animRef.current); audioContextRef.current?.close(); }; }, []);

  const startRecording = async () => {
    setRecording(true); setPaused(false); setDuration(0);
    timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new AudioContext(); const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser(); analyser.fftSize = 64; source.connect(analyser);
      audioContextRef.current = ctx;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const update = () => { analyser.getByteFrequencyData(dataArray); setAnalyserData(Array.from(dataArray.slice(0, 20)).map((v) => v / 255)); animRef.current = requestAnimationFrame(update); };
      update();
    } catch { animateDemoWaveform(); }
  };

  const animateDemoWaveform = () => {
    let tick = 0;
    const update = () => { tick += 0.15; setAnalyserData(new Array(20).fill(0).map((_, i) => 0.2 + 0.3 * Math.sin(tick + i * 0.5) + 0.2 * Math.sin(tick * 1.7 + i * 0.3) + 0.15 * Math.random())); animRef.current = requestAnimationFrame(update); };
    update();
  };

  const stopRecording = () => { setRecording(false); clearInterval(timerRef.current); cancelAnimationFrame(animRef.current); audioContextRef.current?.close(); };

  const handleComplete = () => {
    stopRecording();
    const m = Math.floor(duration / 60); const s = duration % 60;
    onCapture(`Voice note (${m}:${s.toString().padStart(2, "0")}): "The ETA calculation is off by about 30 minutes, need to check unit conversions"`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col animate-fade-in">
      <div className="flex items-center justify-between p-4">
        <button onClick={() => { stopRecording(); onClose(); }} className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-neutral-800 transition"><X size={16} /></button>
        <span className="text-xs text-neutral-600 font-medium">Voice Note</span>
        <div className="w-9" />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="text-4xl font-mono font-light text-neutral-900 mb-8 tabular-nums">{`${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, "0")}`}</div>
        <div className="flex items-center gap-[3px] h-20 mb-8">
          {analyserData.map((value, i) => (
            <div key={i} className="w-[3px] rounded-full transition-all duration-75" style={{ height: `${Math.max(4, value * 80)}px`, backgroundColor: recording ? `rgba(0, 0, 0, ${0.15 + value * 0.85})` : "rgba(0, 0, 0, 0.1)" }} />
          ))}
        </div>
        <div className="flex items-center gap-2 mb-2">
          {recording && !paused && <><div className="w-2 h-2 rounded-full bg-neutral-800 animate-pulse" /><span className="text-xs text-neutral-500">Recording</span></>}
          {paused && <><Pause size={12} className="text-neutral-500" /><span className="text-xs text-neutral-500">Paused</span></>}
          {!recording && <span className="text-xs text-neutral-400">Ready to record</span>}
        </div>
      </div>
      <div className="flex items-center justify-center gap-6 pb-8">
        {recording ? (
          <>
            <button onClick={() => setPaused(!paused)} className="w-12 h-12 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-800 transition">{paused ? <Play size={18} /> : <Pause size={18} />}</button>
            <button onClick={handleComplete} className="w-16 h-16 rounded-full bg-neutral-800 border-4 border-neutral-300 flex items-center justify-center transition-all hover:scale-110 active:scale-95"><Square size={20} className="text-white fill-white" /></button>
          </>
        ) : (
          <button onClick={startRecording} className="w-16 h-16 rounded-full bg-neutral-100 border-4 border-neutral-300 flex items-center justify-center transition-all hover:scale-110 active:scale-95"><Mic size={24} className="text-neutral-700" /></button>
        )}
      </div>
    </div>
  );
}
