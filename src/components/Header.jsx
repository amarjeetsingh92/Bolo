import React from "react";

export default function Header({ onGoHome }) {
  return (
    <header className="bg-white border-b border-slate-200 py-3.5 px-4 md:px-8 shadow-sm">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <button
          onClick={onGoHome}
          className="flex items-center gap-2.5 text-left active:scale-95 transition-transform"
        >
          <span className="text-3xl">🗣️</span>
          <div>
            <span className="text-2xl font-black bg-gradient-to-r from-amber-500 to-pink-500 bg-clip-text text-transparent">
              Bolo!
            </span>
            <span className="text-xs text-slate-500 font-bold ml-2">
              Kids Learning
            </span>
          </div>
        </button>
      </div>
    </header>
  );
}
