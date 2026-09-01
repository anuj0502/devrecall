import React, { useState, useRef, useEffect } from "react";
import { X, Send, Zap } from "lucide-react";

const QUICK_PROMPTS = ["Bug: ", "Found: ", "TODO: ", "Note: ", "Error at ", "Fixed by "];

export default function TextInput({ onCapture, onClose }) {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => { textareaRef.current?.focus(); }, []);

  const handleSubmit = () => { if (text.trim()) onCapture(text.trim()); };
  const handleKeyDown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col animate-fade-in">
      <div className="flex items-center justify-between p-4">
        <button onClick={onClose} className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-neutral-800 transition"><X size={16} /></button>
        <span className="text-xs text-neutral-600 font-medium">Quick Note</span>
        <div className="w-9" />
      </div>
      <div className="flex-1 flex flex-col px-6 pt-4">
        <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-neutral-50 border border-neutral-200">
          <Zap size={12} className="text-neutral-500 flex-shrink-0" />
          <span className="text-[10px] text-neutral-500">AI will analyze your note and connect it to your code context</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {QUICK_PROMPTS.map((prompt) => (
            <button key={prompt} onClick={() => setText((prev) => prev + prompt)} className="text-[10px] px-2.5 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 transition">{prompt}</button>
          ))}
        </div>
        <div className="flex-1 relative">
          <textarea ref={textareaRef} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="Type your context here... What did you find? What's the bug? What did you try?"
            className="w-full h-full min-h-[200px] bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-sm text-neutral-800 placeholder:text-neutral-400 outline-none resize-none focus:border-neutral-400 transition font-mono leading-relaxed" />
        </div>
        <div className="flex items-center justify-between mt-3 mb-4">
          <span className="text-[10px] text-neutral-400">{text.length > 0 ? `${text.length} characters` : "Start typing..."}</span>
          <span className="text-[10px] text-neutral-400">Enter to save · Shift+Enter for new line</span>
        </div>
        <button onClick={handleSubmit} disabled={!text.trim()}
          className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-medium transition-all mb-8 ${
            text.trim() ? "bg-neutral-900 text-white hover:bg-neutral-800 active:scale-[0.98]" : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
          }`}>
          <Send size={14} /> Save Note
        </button>
      </div>
    </div>
  );
}
