import React, { useState, useEffect } from "react";
import { Volume2, Dices, ArrowLeft, Plus, RefreshCw, Sparkles, CheckCircle2 } from "lucide-react";
import ImageWithFallback from "./ImageWithFallback";
import { speakWord } from "../utils/speech";
import { fetchAlternativeImages } from "../services/imageApi";

export default function FlashcardView({
  category,
  currentItem,
  cyclePosition = 1,
  totalInCycle = 1,
  cycleNumber = 1,
  onNextRandom,
  onBack,
  onOpenAddModal
}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [imageList, setImageList] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFetchingPhotos, setIsFetchingPhotos] = useState(false);

  // When currentItem changes, reset photo index and load initial image
  useEffect(() => {
    if (!currentItem) return;
    setCurrentImageIndex(0);
    const initialList = currentItem.images && currentItem.images.length > 0
      ? currentItem.images
      : [currentItem.image];
    setImageList(initialList);
  }, [currentItem?.id, currentItem?.image]);

  if (!currentItem) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-3xl border-2 border-slate-200 text-center space-y-4">
        <span className="text-5xl">{category.icon}</span>
        <h3 className="text-xl font-bold text-slate-800">
          No words in {category.title} yet!
        </h3>
        <p className="text-xs text-slate-500">
          Be the first to add words to this category.
        </p>
        <div className="flex justify-center gap-2 pt-2">
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-xl bg-slate-100 font-bold text-xs text-slate-700 hover:bg-slate-200"
          >
            Go Back
          </button>
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 rounded-xl bg-amber-500 font-bold text-xs text-white hover:bg-amber-600 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Word</span>
          </button>
        </div>
      </div>
    );
  }

  // User requirement: Speaking happens ONLY when clicking picture or sound button!
  const handleSpeak = () => {
    setIsSpeaking(true);
    speakWord(currentItem.name, {
      onEnd: () => setIsSpeaking(false)
    });
  };

  // User requirement: Multiple images per word + Refresh button to switch photos
  const handleRefreshPhoto = async (e) => {
    e?.stopPropagation(); // Prevent pronouncing word when refreshing image
    if (isFetchingPhotos) return;

    // If we only have 1 image, fetch alternate photos from Wikimedia Commons
    if (imageList.length <= 1) {
      setIsFetchingPhotos(true);
      try {
        const alternates = await fetchAlternativeImages(
          currentItem.name,
          currentItem.image,
          8
        );
        if (alternates && alternates.length > 1) {
          setImageList(alternates);
          setCurrentImageIndex(1); // switch to second photo immediately
        }
      } catch (err) {
        console.warn("Could not fetch alternate photos:", err);
      } finally {
        setIsFetchingPhotos(false);
      }
      return;
    }

    // Cycle to next photo in our list
    setCurrentImageIndex((prev) => (prev + 1) % imageList.length);
  };

  const activePhotoUrl = imageList[currentImageIndex] || currentItem.image;

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

      {/* Cycle Progress Bar: Guarantees every image comes at least once in a cycle */}
      <div className="bg-white rounded-2xl px-4 py-2 border border-slate-200 shadow-sm flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-600">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Card {cyclePosition} of {totalInCycle}</span>
          {cycleNumber > 1 && (
            <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200">
              Mix #{cycleNumber}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>All shown once per mix</span>
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
            src={activePhotoUrl}
            alt={currentItem.name}
            aspectRatio="aspect-square"
            priority={true}
          />

          {/* User Requirement: Refresh button to switch between multiple real photos */}
          <button
            type="button"
            onClick={handleRefreshPhoto}
            disabled={isFetchingPhotos}
            className="absolute top-2.5 left-2.5 z-20 bg-black/60 hover:bg-black/85 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md border border-white/20 active:scale-90 transition-all"
            title="Click to view another real photograph of this word"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-amber-300 ${
                isFetchingPhotos ? "animate-spin" : "group-hover:rotate-45"
              } transition-transform`}
            />
            <span>
              {isFetchingPhotos
                ? "Loading..."
                : imageList.length > 1
                ? `Photo ${currentImageIndex + 1}/${imageList.length}`
                : "Different Photo"}
            </span>
          </button>

          {/* Source badge if from Wikimedia or Custom */}
          <div className="absolute top-2.5 right-2.5 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full pointer-events-none">
            {currentItem.isCustom ? "Custom Added" : "Wikimedia"}
          </div>

          {/* Subtle tap prompt overlay */}
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full opacity-80 group-hover:opacity-100 transition-opacity pointer-events-none">
            👆 Tap image to speak
          </div>
        </div>

        {/* Word Name & Secondary Photo Switcher */}
        <div className="flex items-center justify-center gap-3">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">
            {currentItem.name}
          </h2>
          {/* Quick Refresh Icon beside name */}
          <button
            type="button"
            onClick={handleRefreshPhoto}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-700 transition-colors"
            title="Switch to another real photo"
          >
            <RefreshCw
              className={`w-4 h-4 ${isFetchingPhotos ? "animate-spin" : ""}`}
            />
          </button>
        </div>

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

          {/* Random Next Button (Silent switch to the next random item in the cycle) */}
          <button
            onClick={onNextRandom}
            className="py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-bold text-base text-white shadow flex items-center justify-center gap-2 transition-all active:scale-95"
            title="Next random card in this cycle"
          >
            <Dices className="w-5 h-5" />
            <span>Random Next</span>
          </button>
        </div>
      </div>
    </div>
  );
}
