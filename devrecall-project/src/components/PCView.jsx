import React, { useState, useEffect } from "react";
import {
  ChevronRight, Clock, Zap, Camera, Mic, Type, FileCode,
  Folder, FolderOpen, RefreshCw, Search, Eye, Tag,
  ArrowUpRight, Check, AlertCircle, Circle,
} from "lucide-react";

const FILE_TREE = [
  { name: "railtracker", type: "folder", open: true, children: [
    { name: "src", type: "folder", open: true, children: [
      { name: "services", type: "folder", open: true, children: [
        { name: "eta_engine.py", type: "file" },
        { name: "train_service.py", type: "file" },
      ]},
      { name: "hooks", type: "folder", open: false, children: [{ name: "useRealtime.ts", type: "file" }] },
      { name: "middleware", type: "folder", open: false, children: [{ name: "auth.ts", type: "file" }] },
      { name: "components", type: "folder", open: false, children: [{ name: "Dashboard.tsx", type: "file" }] },
    ]},
    { name: "package.json", type: "file" },
  ]},
];

export default function PCView({ sessions, activeSession, setActiveSession, syncStatus }) {
  const [selectedFile, setSelectedFile] = useState("eta_engine.py");
  const [rightPanel, setRightPanel] = useState("recall");
  const [newCaptureFlash, setNewCaptureFlash] = useState(false);

  useEffect(() => {
    if (activeSession) { setNewCaptureFlash(true); setTimeout(() => setNewCaptureFlash(false), 2000); }
  }, [activeSession?.captures?.length]);

  const session = activeSession || sessions[0];

  return (
    <div className="flex gap-4 h-[calc(100vh-140px)] min-h-[500px]">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 rounded-xl border border-neutral-200 bg-white overflow-hidden flex flex-col animate-fade-in">
        <div className="p-3 border-b border-neutral-100">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-50 border border-neutral-200">
            <Search size={12} className="text-neutral-400" />
            <input type="text" placeholder="Search sessions..." className="bg-transparent text-xs text-neutral-800 placeholder:text-neutral-400 outline-none flex-1" />
          </div>
        </div>
        <div className="px-3 py-2 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${syncStatus === "synced" ? "bg-green-500" : "bg-amber-400 animate-pulse"}`} />
            <span className="text-[10px] text-neutral-500">{syncStatus === "synced" ? "Mobile synced" : "Syncing..."}</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <p className="text-[9px] uppercase tracking-widest text-neutral-400 px-2 py-1">Sessions</p>
          {sessions.map((s) => (
            <button key={s.id} onClick={() => { setActiveSession(s); setSelectedFile(s.file?.split("/").pop() || "eta_engine.py"); }}
              className={`w-full text-left px-3 py-2.5 rounded-lg transition text-xs ${
                session?.id === s.id ? "bg-neutral-100 border border-neutral-200 text-neutral-900" : "text-neutral-500 hover:bg-neutral-50 border border-transparent"
              }`}>
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${s.status === "debugging" ? "bg-neutral-900" : s.status === "in-progress" ? "bg-neutral-400" : "bg-neutral-300"}`} />
                <span className="truncate flex-1">{s.title}</span>
                <span className="text-[9px] text-neutral-400">{s.captures.length}</span>
              </div>
              <div className="flex items-center gap-1 mt-1 ml-3.5">
                <Clock size={8} className="text-neutral-400" />
                <span className="text-[9px] text-neutral-400">{s.captures[0]?.time}</span>
              </div>
            </button>
          ))}
        </div>
        <div className="border-t border-neutral-100 p-2 max-h-48 overflow-y-auto">
          <p className="text-[9px] uppercase tracking-widest text-neutral-400 px-2 py-1">File Explorer</p>
          <FileTree items={FILE_TREE} selectedFile={selectedFile} onSelect={setSelectedFile} />
        </div>
      </div>

      {/* Code Editor */}
      <div className="flex-1 rounded-xl border border-neutral-200 bg-white overflow-hidden flex flex-col animate-fade-in" style={{ animationDelay: "100ms" }}>
        <div className="flex items-center border-b border-neutral-200 px-2">
          <div className="flex items-center gap-1.5 px-3 py-2 border-b-2 border-neutral-900 bg-neutral-50 rounded-t-lg mt-1">
            <FileCode size={12} className="text-neutral-600" />
            <span className="text-xs text-neutral-800 font-mono">{session?.file || "eta_engine.py"}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-2 text-neutral-400">
            <FileCode size={12} />
            <span className="text-xs font-mono">train_service.py</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-4 py-1.5 text-[10px] text-neutral-400 border-b border-neutral-100">
          <span>railtracker</span><ChevronRight size={8} />
          <span>src</span><ChevronRight size={8} />
          <span>services</span><ChevronRight size={8} />
          <span className="text-neutral-600">{session?.file?.split("/").pop() || "eta_engine.py"}</span>
        </div>
        <div className="flex-1 overflow-auto p-4 bg-neutral-50">
          <pre className="font-mono text-[12px] leading-[1.7]">
            {session?.codeContext?.split("\n").map((line, i) => (
              <div key={i} className="flex group hover:bg-neutral-100 -mx-4 px-4">
                <span className="text-neutral-300 w-8 text-right mr-4 select-none text-[11px] leading-[1.7]">{i + 1}</span>
                <span className="flex-1 text-neutral-700">{line}</span>
              </div>
            ))}
          </pre>
        </div>
        <div className="flex items-center justify-between px-4 py-1.5 border-t border-neutral-200 text-[10px] text-neutral-400 bg-white">
          <div className="flex items-center gap-4"><span>Python</span><span>UTF-8</span><span>Spaces: 4</span></div>
          <div className="flex items-center gap-2">
            <Zap size={10} className="text-neutral-600" />
            <span className="text-neutral-500">AI Recall Active</span>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-80 flex-shrink-0 rounded-xl border border-neutral-200 bg-white overflow-hidden flex flex-col animate-slide-in-right">
        <div className="flex border-b border-neutral-200">
          <button onClick={() => setRightPanel("recall")} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition ${rightPanel === "recall" ? "text-neutral-900 border-b-2 border-neutral-900" : "text-neutral-400 hover:text-neutral-600"}`}>
            <Zap size={12} /> AI Recall
          </button>
          <button onClick={() => setRightPanel("captures")} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition ${rightPanel === "captures" ? "text-neutral-900 border-b-2 border-neutral-900" : "text-neutral-400 hover:text-neutral-600"}`}>
            <Eye size={12} /> Captures
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {rightPanel === "recall" ? <AIReminderPanel session={session} newFlash={newCaptureFlash} /> : <CapturesPanel session={session} newFlash={newCaptureFlash} />}
        </div>
      </div>
    </div>
  );
}

function AIReminderPanel({ session, newFlash }) {
  return (
    <div className="space-y-4">
      <div className={`rounded-lg border border-neutral-200 bg-neutral-50 p-3 transition-all ${newFlash ? "ring-2 ring-neutral-300" : ""}`}>
        <div className="flex items-center gap-2 mb-2">
          <Zap size={12} className="text-neutral-600" />
          <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium">Contextual Recall</span>
        </div>
        <p className="text-xs text-neutral-600 leading-relaxed">{session?.aiRecall || "Select a session to see AI recall context."}</p>
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-2">Detected Patterns</p>
        <div className="space-y-2">
          <PatternItem icon={<AlertCircle size={12} className="text-neutral-700" />} label="Unit mismatch detected" detail="speed in km/h vs distance in miles" />
          <PatternItem icon={<Circle size={12} className="text-neutral-400" />} label="Missing error handling" detail="No try/catch around API call" />
          <PatternItem icon={<Check size={12} className="text-neutral-500" />} label="Similar fix exists" detail="v2.3.1 addressed same issue" />
        </div>
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-2">Suggested Next Steps</p>
        <div className="space-y-1.5">
          {["Check unit conversion in haversine()", "Verify API response timezone field", "Compare with v2.3.1 fix commit"].map((action, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-50 border border-neutral-100 text-xs text-neutral-600 hover:border-neutral-200 transition cursor-pointer">
              <ArrowUpRight size={10} className="text-neutral-400 flex-shrink-0" />{action}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-3">
        <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-2">Session Details</p>
        <div className="space-y-1.5 text-[11px]">
          <div className="flex justify-between"><span className="text-neutral-400">Project</span><span className="text-neutral-600">{session?.project}</span></div>
          <div className="flex justify-between"><span className="text-neutral-400">Status</span><span className={`capitalize ${session?.status === "debugging" ? "text-neutral-800 font-medium" : "text-neutral-500"}`}>{session?.status}</span></div>
          <div className="flex justify-between"><span className="text-neutral-400">Captures</span><span className="text-neutral-600">{session?.captures?.length || 0}</span></div>
          <div className="flex justify-between items-center">
            <span className="text-neutral-400">Tags</span>
            <div className="flex gap-1">{session?.tags?.map((tag) => <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500">{tag}</span>)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CapturesPanel({ session, newFlash }) {
  const typeIcons = { camera: <Camera size={12} className="text-neutral-600" />, voice: <Mic size={12} className="text-neutral-500" />, text: <Type size={12} className="text-neutral-500" /> };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-widest text-neutral-400">Mobile Captures</p>
        <div className="flex items-center gap-1.5 text-[10px] text-neutral-400"><RefreshCw size={10} /><span>{session?.captures?.length || 0} items</span></div>
      </div>
      {(session?.captures || []).map((capture, i) => (
        <div key={i} className={`rounded-lg border border-neutral-200 bg-neutral-50 p-3 transition-all ${newFlash && i === 0 ? "ring-2 ring-neutral-300" : ""}`}>
          <div className="flex items-center gap-2 mb-1.5">
            {typeIcons[capture.type]}
            <span className="text-[10px] uppercase tracking-wider text-neutral-500 capitalize">{capture.type}</span>
            <span className="text-[9px] text-neutral-400 ml-auto">{capture.time}</span>
          </div>
          <p className="text-xs text-neutral-700">{capture.label}</p>
        </div>
      ))}
      {(!session?.captures || session.captures.length === 0) && (
        <div className="text-center py-8"><Camera size={24} className="text-neutral-300 mx-auto mb-2" /><p className="text-xs text-neutral-400">No captures yet.</p></div>
      )}
      <div className="rounded-lg border border-neutral-200 bg-white p-3 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center"><Zap size={14} className="text-neutral-600" /></div>
          <div>
            <p className="text-[10px] font-medium text-neutral-700">Real-time sync</p>
            <p className="text-[9px] text-neutral-400">Captures appear here instantly from your IQOO phone</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FileTree({ items, selectedFile, onSelect }) {
  return (
    <div className="pl-1">
      {items.map((item) => (
        <div key={item.name}>
          <button onClick={() => item.type === "file" && onSelect(item.name)}
            className={`w-full flex items-center gap-1.5 px-2 py-1 rounded text-[11px] transition ${
              item.type === "file" && selectedFile === item.name ? "bg-neutral-100 text-neutral-800" : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50"
            }`}>
            {item.type === "folder" ? (item.open ? <FolderOpen size={11} /> : <Folder size={11} />) : <FileCode size={11} className="ml-3" />}
            <span className="truncate">{item.name}</span>
          </button>
          {item.children && item.open && <div className="ml-2"><FileTree items={item.children} selectedFile={selectedFile} onSelect={onSelect} /></div>}
        </div>
      ))}
    </div>
  );
}

function PatternItem({ icon, label, detail }) {
  return (
    <div className="flex items-start gap-2 p-2 rounded-lg bg-neutral-50 border border-neutral-100">
      <div className="mt-0.5">{icon}</div>
      <div><p className="text-[11px] text-neutral-700 font-medium">{label}</p><p className="text-[10px] text-neutral-400 mt-0.5">{detail}</p></div>
    </div>
  );
}
