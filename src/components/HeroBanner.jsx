import React from "react";

export default function HeroBanner() {
  return (
    <div className="rounded-3xl bg-gradient-to-r from-amber-50 via-white to-pink-50 border-2 border-amber-200 p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-sm">
      <div className="flex-1 space-y-2 text-center md:text-left">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
          Interactive Child Learning
        </span>
        <h1 className="text-3xl md:text-4xl font-black text-slate-800">
          Learn Words & Sounds! 🎈
        </h1>
        <p className="text-slate-600 font-medium text-base">
          Click any category below to explore clean pictures, and tap to hear clear, natural speech pronunciations.
        </p>
      </div>

      <div className="w-full md:w-80 h-48 rounded-2xl overflow-hidden shadow-lg border-2 border-white flex-shrink-0 group">
        <img
          src="/images/ui/hero-tablet.jpg"
          alt="Modern child learning interface"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
    </div>
  );
}
