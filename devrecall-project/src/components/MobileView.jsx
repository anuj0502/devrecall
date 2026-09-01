import React, { useState } from "react";
import {
  Camera, Mic, Type, ChevronRight, Clock, Tag, Zap,
  ArrowLeft, Check, CircleDot, Eye, FileCode,
} from "lucide-react";
import CameraCapture from "./CameraCapture";
import VoiceRecorder from "./VoiceRecorder";
import TextInput from "./TextInput";

export default function MobileView({ sessions, activeSession, setActiveSession, addCapture, syncStatus }) {
  const [showCapture, setShowCapture] = useState(null);
  const [captureSuccess, setCaptureSuccess] = useState(false);

  const handleCapture = (type, data) => {
    addCapture(activeSession.id, {
      type, label: data, time: "just now",
      preview: type === "camera" ? "📷" : type === "voice" ? "🎙" : "✎",
    });
    setShowCapture(null);
    setCaptureSuccess(true);
    setTimeout(() => setCaptureSuccess(false), 2000);
  };

  if (activeSession) {
    return (
      <div className="max-w-md mx-auto">
        <SessionDetail session={activeSession} onBack={() => setActiveSession(null)} onCapture={(t) => setShowCapture(t)} />
        {showCapture === "camera" && <CameraCapture onCapture={(d) => handleCapture("camera", d)} onClose={() => setShowCapture(null)} />}
        {showCapture === "voice" && <VoiceRecorder onCapture={(d) => handleCapture("voice", d)} onClose={() => setShowCapture(null)} />}
        {showCapture === "text" && <TextInput onCapture={(d) => handleCapture("text", d)} onClose={() => setShowCapture(null)} />}
        {captureSuccess && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900 text-white text-xs font-medium shadow-lg">
              <Check size={14} />
              Captured & synced to PC
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="animate-fade-in">
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 relative overflow-hidden">
          <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-1">Mobile Capture</p>
          <h2 className="text-lg font-semibold leading-snug text-neutral-900">Capture context from anywhere.</h2>
          <p className="mt-2 text-xs text-neutral-500 leading-relaxed">
            Point your camera at your screen, record a voice note, or type a quick observation. DevRecall syncs everything to your PC instantly.
          </p>
          <div className="grid grid-cols-3 gap-3 mt-5">
            <CaptureButton icon={<Camera size={20} />} label="Scan" sublabel="Screenshot" onClick={() => { if (sessions.length > 0) { setActiveSession(sessions[0]); setTimeout(() => setShowCapture("camera"), 300); } }} />
            <CaptureButton icon={<Mic size={20} />} label="Voice" sublabel="Quick note" onClick={() => { if (sessions.length > 0) { setActiveSession(sessions[0]); setTimeout(() => setShowCapture("voice"), 300); } }} />
            <CaptureButton icon={<Type size={20} />} label="Write" sublabel="Text note" onClick={() => { if (sessions.length > 0) { setActiveSession(sessions[0]); setTimeout(() => setShowCapture("text"), 300); } }} />
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] uppercase tracking-widest text-neutral-400">Recent Sessions</p>
          <span className="text-[10px] text-neutral-400">{sessions.length} sessions</span>
        </div>
        <div className="space-y-3">
          {sessions.map((session, i) => (
            <SessionCard key={session.id} session={session} index={i} onClick={() => setActiveSession(session)} />
          ))}
        </div>
      </div>

      <div className="glass-light rounded-xl p-4 border border-neutral-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center">
            <Zap size={18} className="text-neutral-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-800">Cross-Device Sync</p>
            <p className="text-[10px] text-neutral-400 mt-0.5">
              {syncStatus === "synced" ? "All captures synced to PC client" : "Syncing your latest captures..."}
            </p>
          </div>
        </div>
      </div>

      {showCapture === "camera" && <CameraCapture onCapture={(d) => handleCapture("camera", d)} onClose={() => setShowCapture(null)} />}
      {showCapture === "voice" && <VoiceRecorder onCapture={(d) => handleCapture("voice", d)} onClose={() => setShowCapture(null)} />}
      {showCapture === "text" && <TextInput onCapture={(d) => handleCapture("text", d)} onClose={() => setShowCapture(null)} />}

      {captureSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900 text-white text-xs font-medium shadow-lg">
            <Check size={14} /> Captured & synced to PC
          </div>
        </div>
      )}
    </div>
  );
}

function CaptureButton({ icon, label, sublabel, onClick }) {
  return (
    <button onClick={onClick} className="rounded-xl border border-neutral-200 bg-white p-4 text-center transition-all hover:border-neutral-300 hover:bg-neutral-50 active:scale-95">
      <div className="flex justify-center text-neutral-600">{icon}</div>
      <p className="mt-2 text-xs font-medium text-neutral-800">{label}</p>
      <p className="text-[10px] text-neutral-400">{sublabel}</p>
    </button>
  );
}

function SessionCard({ session, index, onClick }) {
  const statusStyles = {
    debugging: "bg-neutral-900 text-white",
    "in-progress": "bg-neutral-200 text-neutral-700",
    resolved: "bg-neutral-100 text-neutral-500",
  };

  return (
    <button onClick={onClick} className="w-full text-left rounded-xl border border-neutral-200 bg-white p-4 transition-all hover:border-neutral-300 active:scale-[0.98] animate-fade-in" style={{ animationDelay: `${index * 80}ms` }}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${statusStyles[session.status]}`}>{session.status}</span>
            <span className="text-[10px] text-neutral-400">{session.project}</span>
          </div>
          <h3 className="text-sm font-medium text-neutral-900 truncate">{session.title}</h3>
          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1 text-[10px] text-neutral-400"><Eye size={10} />{session.captures.length} captures</span>
            <span className="flex items-center gap-1 text-[10px] text-neutral-400"><Clock size={10} />{session.captures[0]?.time}</span>
          </div>
        </div>
        <ChevronRight size={16} className="text-neutral-300 mt-1 flex-shrink-0" />
      </div>
      <div className="flex gap-1.5 mt-3">
        {session.tags.map((tag) => (
          <span key={tag} className="text-[9px] px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-500">{tag}</span>
        ))}
      </div>
    </button>
  );
}

function SessionDetail({ session, onBack, onCapture }) {
  const statusStyles = {
    debugging: "bg-neutral-900 text-white",
    "in-progress": "bg-neutral-200 text-neutral-700",
    resolved: "bg-neutral-100 text-neutral-500",
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className="w-9 h-9 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-800 transition">
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-neutral-900 truncate">{session.title}</h2>
          <p className="text-[10px] text-neutral-400">{session.project}</p>
        </div>
        <span className={`text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-full font-medium ${statusStyles[session.status]}`}>{session.status}</span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-5">
        <button onClick={() => onCapture("camera")} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-700 text-xs font-medium hover:bg-neutral-200 transition active:scale-95">
          <Camera size={14} /> Scan
        </button>
        <button onClick={() => onCapture("voice")} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-700 text-xs font-medium hover:bg-neutral-200 transition active:scale-95">
          <Mic size={14} /> Voice
        </button>
        <button onClick={() => onCapture("text")} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-700 text-xs font-medium hover:bg-neutral-200 transition active:scale-95">
          <Type size={14} /> Write
        </button>
      </div>

      {/* AI Recall */}
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 mb-5">
        <div className="flex items-center gap-2 mb-2">
          <Zap size={14} className="text-neutral-600" />
          <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium">AI Recall</span>
        </div>
        <p className="text-xs text-neutral-600 leading-relaxed">{session.aiRecall}</p>
        <div className="flex items-center gap-2 mt-3">
          <FileCode size={10} className="text-neutral-400" />
          <span className="text-[10px] text-neutral-400">{session.file}:{session.line}</span>
        </div>
      </div>

      {/* Code */}
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 overflow-hidden mb-5">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-neutral-200">
          <FileCode size={12} className="text-neutral-400" />
          <span className="text-[10px] text-neutral-500 font-mono">{session.file}</span>
        </div>
        <pre className="p-4 overflow-x-auto text-[11px] font-mono leading-relaxed text-neutral-700">
          <code>{session.codeContext}</code>
        </pre>
      </div>

      {/* Next Action */}
      <div className="rounded-xl border border-neutral-200 bg-white p-4 mb-5">
        <div className="flex items-center gap-2 mb-2">
          <CircleDot size={12} className="text-neutral-400" />
          <span className="text-[10px] uppercase tracking-wider text-neutral-400">Next Action</span>
        </div>
        <p className="text-xs text-neutral-700">{session.nextAction}</p>
      </div>

      {/* Capture Timeline */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-3">Capture Timeline</p>
        <div className="space-y-2">
          {session.captures.map((capture, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-neutral-50 border border-neutral-100 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
              <span className="text-base mt-0.5">{capture.preview}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-neutral-700 truncate">{capture.label}</p>
                <p className="text-[10px] text-neutral-400 mt-0.5">{capture.time}</p>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded bg-neutral-100 text-neutral-500 capitalize flex-shrink-0">{capture.type}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-4 mb-4">
        {session.tags.map((tag) => (
          <span key={tag} className="text-[9px] px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-500 flex items-center gap-1"><Tag size={8} />{tag}</span>
        ))}
      </div>
    </div>
  );
}
