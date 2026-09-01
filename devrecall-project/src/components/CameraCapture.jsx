import React, { useState, useRef, useEffect } from "react";
import { X, FlipHorizontal } from "lucide-react";

export default function CameraCapture({ onCapture, onClose }) {
  const [mode, setMode] = useState("demo");
  const [demoFrame, setDemoFrame] = useState(0);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => { if (mode === "live") startCamera(); return () => stopCamera(); }, [mode]);
  useEffect(() => { if (mode === "demo") { const i = setInterval(() => setDemoFrame((f) => (f + 1) % 4), 800); return () => clearInterval(i); } }, [mode]);

  const startCamera = async () => { try { const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }); streamRef.current = s; if (videoRef.current) videoRef.current.srcObject = s; } catch { setMode("demo"); } };
  const stopCamera = () => { streamRef.current?.getTracks().forEach((t) => t.stop()); streamRef.current = null; };

  const handleCapture = () => {
    stopCamera();
    const labels = ["Screenshot of terminal showing ETA error output", "Photo of notebook with API response headers", "Screen capture of browser devtools network tab", "Photo of whiteboard with architecture diagram"];
    onCapture(mode === "live" ? "Live camera capture — error log visible on screen" : labels[demoFrame]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col animate-fade-in">
      <div className="flex items-center justify-between p-4">
        <button onClick={() => { stopCamera(); onClose(); }} className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-neutral-800 transition"><X size={16} /></button>
        <span className="text-xs text-neutral-600 font-medium">Scan Context</span>
        <button onClick={() => setMode(mode === "demo" ? "live" : "demo")} className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-neutral-800 transition"><FlipHorizontal size={16} /></button>
      </div>
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm aspect-[3/4] rounded-2xl border-2 border-dashed border-neutral-300 overflow-hidden relative bg-neutral-50">
          {mode === "live" ? <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" /> : <DemoCaptureFrame frame={demoFrame} />}
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-neutral-400 rounded-tl" />
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-neutral-400 rounded-tr" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-neutral-400 rounded-bl" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-neutral-400 rounded-br" />
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-neutral-400 to-transparent animate-bounce" />
        </div>
      </div>
      <div className="text-center mb-2"><span className="text-[10px] text-neutral-400 uppercase tracking-wider">{mode === "live" ? "Live Camera" : "Demo Mode"} — Tap to capture</span></div>
      <div className="flex justify-center pb-8">
        <button onClick={handleCapture} className="w-16 h-16 rounded-full bg-neutral-100 border-4 border-neutral-300 flex items-center justify-center transition-all hover:scale-110 active:scale-95">
          <div className="w-12 h-12 rounded-full bg-neutral-800" />
        </button>
      </div>
    </div>
  );
}

function DemoCaptureFrame({ frame }) {
  const frames = [
    { content: <div className="p-4 font-mono text-[10px]"><div className="text-neutral-800 mb-1">$ python train_eta.py</div><div className="text-neutral-500">Traceback (most recent call last):</div><div className="text-neutral-500">  File "eta_engine.py", line 24</div><div className="text-neutral-700">    ETA off by 30 minutes</div><div className="text-neutral-700">AssertionError: mismatch</div></div> },
    { content: <div className="p-4"><div className="text-[10px] text-neutral-400 mb-2">API Response Headers</div><div className="space-y-1 font-mono text-[9px]"><div className="text-neutral-500">content-type: application/json</div><div className="text-neutral-800 font-medium">x-timezone: missing ⚠</div><div className="text-neutral-500">x-request-id: 8f3a2b</div><div className="text-neutral-500">status: 200 OK</div></div></div> },
    { content: <div className="p-4"><div className="text-[10px] text-neutral-400 mb-2">Network Tab</div><div className="space-y-1.5">{["GET /api/v2/eta", "POST /api/v2/trains", "GET /api/v2/status"].map((r, i) => <div key={i} className="flex items-center gap-2 text-[9px]"><span className={`w-1.5 h-1.5 rounded-full ${i === 0 ? "bg-neutral-800" : "bg-neutral-400"}`} /><span className="text-neutral-500 font-mono">{r}</span></div>)}</div></div> },
    { content: <div className="p-4"><div className="text-[10px] text-neutral-400 mb-2">Notes</div><div className="space-y-1 text-[9px] text-neutral-600"><div>→ ETA calculation uses avg_speed</div><div>→ No delay factor in formula</div><div className="text-neutral-800 font-medium">→ Check haversine units!</div></div></div> },
  ];
  return <div className="w-full h-full bg-white flex items-start">{frames[frame].content}</div>;
}
