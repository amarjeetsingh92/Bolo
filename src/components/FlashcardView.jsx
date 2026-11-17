import React, { useState } from "react";
import { Volume2, Dices, ArrowLeft, Plus } from "lucide-react";
import ImageWithFallback from "./ImageWithFallback";
import { speakWord } from "../utils/speech";

export default function FlashcardView({
  category,
  currentIndex,
  onNextRandom,
  onBack,
  onOpenAddModal
}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const currentItem = category.items[currentIndex] || category.items[0];

  // User requirement: "When I click the things, then only the name."
  // Speaking happens ONLY when the user clicks the picture or the sound button!
  const handleSpeak = () => {
    if (!currentItem) return;
    setIsSpeaking(true);
    speakWord(currentItem.name, {
      onEnd: () => setIsSpeaking(false)
    });
  };

  // User requirement: "I don't want that whenever I click Next, they automatically say the name."
  // Clicking Next just switches to the next random item silently!
  const handleNextClick = () => {
    onNextRandom();
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      {/* Top Bar: Back to Categories, Category Name, and Adult Add Item Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-sm shadow-sm hover:bg-slate-50 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-amber-500" />
          <span>All Categories</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="font-extrabold text-slate-700 text-base">
            {category.icon} {category.title}
          </span>

          {/* Adult Add Button */}
          {onOpenAddModal && (
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold border border-amber-300 active:scale-95 transition-all"
              title={`Add a new ${category.title} item (Adult mode)`}
            >
              <Plus className="w-3.5 h-3.5 text-amber-700" />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Flashcard */}
      <div className="bg-white rounded-3xl border-2 border-amber-300 p-5 shadow-xl space-y-4 text-center">
        {/* Clickable Image: Tapping the image pronounces the word! */}
        <div
          onClick={handleSpeak}
          className="relative rounded-2xl overflow-hidden aspect-square bg-slate-50 border-2 border-slate-100 shadow-sm cursor-pointer hover:border-amber-400 active:scale-98 transition-all group"
          title="Tap picture to hear pronunciation"
        >
          <ImageWithFallback
            src={currentItem.image}
            alt={currentItem.name}
            aspectRatio="aspect-square"
            priority={true}
          />

          {/* Source badge if from Wikimedia or Custom */}
          <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            {currentItem.isCustom ? "Custom Added" : "Wikimedia"}
          </div>

          {/* Subtle tap prompt overlay */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full opacity-80 group-hover:opacity-100 transition-opacity">
            👆 Tap image to speak
          </div>
        </div>

        {/* Word Name */}
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">
          {currentItem.name}
        </h2>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {/* Sound Button */}
          <button
            onClick={handleSpeak}
            className={`py-3 px-4 rounded-2xl font-bold text-base shadow flex items-center justify-center gap-2 text-white transition-all active:scale-95 ${
              isSpeaking
                ? "bg-amber-600 animate-pulse"
                : "bg-amber-500 hover:bg-amber-600"
            }`}
            title="Hear pronunciation"
          >
            <Volume2 className="w-5 h-5" />
            <span>{isSpeaking ? "Speaking..." : "Sound 🔊"}</span>
          </button>

          {/* Random Next Button (Silent switch to another random item) */}
          <button
            onClick={handleNextClick}
            className="py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-bold text-base text-white shadow flex items-center justify-center gap-2 transition-all active:scale-95"
            title="Show another random card without speaking"
          >
            <Dices className="w-5 h-5" />
            <span>Random Next</span>
          </button>
        </div>
      </div>
    </div>
  );
}
