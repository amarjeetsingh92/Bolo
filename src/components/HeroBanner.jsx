import React from "react";

export default function HeroBanner() {
  return (
    <div className="rounded-3xl bg-amber-100 border-2 border-amber-300 p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-sm">
      <div className="flex-1 space-y-2 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-black text-slate-800">
          Learn Words & Sounds! 🎈
        </h1>
        <p className="text-slate-600 font-medium text-base">
          Click any category below to see real pictures and hear how each word is pronounced.
        </p>
      </div>

      <div className="w-full md:w-64 h-44 rounded-2xl overflow-hidden shadow-md border-2 border-white flex-shrink-0">
        <img
          src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=600&q=80"
          alt="Children learning together"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
}
