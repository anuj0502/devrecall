import React, { useState, useEffect } from "react";
import MobileView from "./components/MobileView";
import PCView from "./components/PCView";
import {
  Smartphone,
  Monitor,
  ArrowLeftRight,
  Zap,
} from "lucide-react";

const DEMO_SESSIONS = [
  {
    id: 1,
    title: "Rail ETA Calculation Bug",
    project: "RailTracker Pro",
    status: "debugging",
    tags: ["Python", "API", "Bug Fix"],
    captures: [
      { type: "camera", label: "Error screenshot", time: "2 min ago", preview: "📷" },
      { type: "voice", label: "Voice note: 'The ETA is off by 30min...'", time: "2 min ago", preview: "🎙" },
      { type: "text", label: "Checked /api/v2/eta → response missing timezone", time: "1 min ago", preview: "✎" },
    ],
    nextAction: "Inspect API response format",
    codeContext: `async def calculate_eta(train_id: str) -> ETA:\n    train = await get_train(train_id)\n    distance = haversine(train.location, train.destination)\n    speed = train.avg_speed  # Bug: not accounting for delays\n    eta_hours = distance / speed\n    return ETA(\n        arrival=train.departure + timedelta(hours=eta_hours),\n        confidence=0.85\n    )`,
    aiRecall: "Similar bug found in v2.3.1 — the speed was in km/h but distance in miles. Check unit conversions first.",
    file: "services/eta_engine.py",
    line: 24,
  },
  {
    id: 2,
    title: "Dashboard WebSocket Memory Leak",
    project: "RailTracker Pro",
    status: "in-progress",
    tags: ["React", "WebSocket", "Performance"],
    captures: [
      { type: "text", label: "useEffect cleanup missing for WS connection", time: "1 hr ago", preview: "✎" },
      { type: "voice", label: "Voice note: 'Memory grows 2MB per re-render'", time: "50 min ago", preview: "🎙" },
    ],
    nextAction: "Add cleanup in useEffect return",
    codeContext: `useEffect(() => {\n  const ws = new WebSocket(WSS_URL);\n  ws.onmessage = (e) => {\n    setLiveData(JSON.parse(e.data));\n  };\n  // Missing: return () => ws.close();\n}, []);`,
    aiRecall: "This pattern matches a known React 18 + WebSocket leak. Add ws.close() in the cleanup function. Consider using a ref to track connection state.",
    file: "hooks/useRealtime.ts",
    line: 8,
  },
  {
    id: 3,
    title: "Auth Token Refresh Flow",
    project: "DevRecall Backend",
    status: "resolved",
    tags: ["Node.js", "JWT", "Auth"],
    captures: [
      { type: "text", label: "Token refresh working after retry logic added", time: "3 hrs ago", preview: "✎" },
    ],
    nextAction: "Deploy to staging",
    codeContext: `// Fixed: Added retry with exponential backoff\nasync function refreshToken(token: string) {\n  for (let attempt = 0; attempt < 3; attempt++) {\n    try {\n      return await jwt.verify(token, SECRET);\n    } catch (e) {\n      await sleep(Math.pow(2, attempt) * 1000);\n    }\n  }\n  throw new AuthError("Token refresh failed");\n}`,
    aiRecall: "Resolved — retry logic handles transient failures.",
    file: "middleware/auth.ts",
    line: 12,
  },
];

export default function App() {
  const [view, setView] = useState("mobile");
  const [sessions, setSessions] = useState(DEMO_SESSIONS);
  const [activeSession, setActiveSession] = useState(null);
  const [syncStatus, setSyncStatus] = useState("synced");
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 2400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSyncStatus("syncing");
      setTimeout(() => setSyncStatus("synced"), 1200);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const addCapture = (sessionId, capture) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId ? { ...s, captures: [capture, ...s.captures] } : s
      )
    );
    setSyncStatus("syncing");
    setTimeout(() => setSyncStatus("synced"), 1500);
  };

  useEffect(() => {
    if (activeSession) {
      const fresh = sessions.find((s) => s.id === activeSession.id);
      if (fresh && fresh !== activeSession) setActiveSession(fresh);
    }
  }, [sessions]);

  if (showSplash) return <SplashScreen />;

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {/* Nav */}
      <nav className="glass sticky top-0 z-50 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-semibold text-sm tracking-wide">DEVRECALL</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500 border border-neutral-200">
              PROTOTYPE
            </span>
          </div>
          <SyncBadge status={syncStatus} />
        </div>
      </nav>

      {/* View switcher */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center gap-2 p-1 bg-neutral-100 rounded-xl w-fit mx-auto border border-neutral-200">
          <button
            onClick={() => setView("mobile")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              view === "mobile"
                ? "bg-neutral-900 text-white shadow-sm"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            <Smartphone size={14} />
            Mobile (IQOO)
          </button>
          <button
            onClick={() => setView("pc")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              view === "pc"
                ? "bg-neutral-900 text-white shadow-sm"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            <Monitor size={14} />
            PC Client
          </button>
          <div className="px-2 text-neutral-400">
            <ArrowLeftRight size={12} />
          </div>
          <span className="text-[10px] text-neutral-400 pr-2">Real-time sync active</span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {view === "mobile" ? (
          <MobileView sessions={sessions} activeSession={activeSession} setActiveSession={setActiveSession} addCapture={addCapture} syncStatus={syncStatus} />
        ) : (
          <PCView sessions={sessions} activeSession={activeSession} setActiveSession={setActiveSession} syncStatus={syncStatus} />
        )}
      </div>

      <footer className="border-t border-neutral-200 py-6 text-center">
        <p className="text-[10px] text-neutral-400">DevRecall Prototype · Built for cross-device developer memory · 2026</p>
      </footer>
    </div>
  );
}

function SplashScreen() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-neutral-900 flex items-center justify-center">
          <Zap size={28} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2 text-neutral-900">DevRecall</h1>
        <p className="text-xs text-neutral-400 animate-pulse">Loading your developer memory...</p>
        <div className="mt-6 flex justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-neutral-900" style={{ animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SyncBadge({ status }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-100 border border-neutral-200">
      <div className={`w-2 h-2 rounded-full ${
        status === "synced" ? "bg-green-500" :
        status === "syncing" ? "bg-amber-400 animate-pulse" :
        "bg-neutral-400"
      }`} />
      <span className="text-[10px] text-neutral-500 font-medium uppercase tracking-wider">
        {status === "synced" ? "Synced" : status === "syncing" ? "Syncing" : "Offline"}
      </span>
    </div>
  );
}
