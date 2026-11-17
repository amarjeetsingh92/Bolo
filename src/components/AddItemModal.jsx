import React, { useState } from "react";
import { Plus, X, Search, Sparkles, Volume2, Check } from "lucide-react";
import { fetchWikimediaImage } from "../services/imageApi";
import { speakWord } from "../utils/speech";
import ImageWithFallback from "./ImageWithFallback";

export default function AddItemModal({ isOpen, onClose, category, onSaveItem }) {
  const [wordName, setWordName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen || !category) return null;

  const handleFetchImage = async (e) => {
    e?.preventDefault();
    const cleanWord = wordName.trim();
    if (!cleanWord) return;

    setIsLoading(true);
    setErrorMsg("");
    setPreviewImage(null);

    // Call Wikimedia Commons API
    const result = await fetchWikimediaImage(cleanWord);
    setIsLoading(false);

    if (result && result.url) {
      setPreviewImage(result.url);
      // Test pronunciation
      speakWord(cleanWord);
    } else {
      setErrorMsg(
        `Could not find a real photo for "${cleanWord}" on Wikimedia. Try another spelling or common name.`
      );
    }
  };

  const handleSave = () => {
    const cleanWord = wordName.trim();
    if (!cleanWord || !previewImage) return;

    const newItem = {
      id: `custom-${cleanWord.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}`,
      name: cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1),
      image: previewImage,
      source: "Wikimedia Commons",
      isCustom: true
    };

    onSaveItem(category.id, newItem);
    onClose();
    // Reset state
    setWordName("");
    setPreviewImage(null);
    setErrorMsg("");
  };

  const handleTestSpeech = () => {
    if (wordName.trim()) {
      speakWord(wordName.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border-4 border-amber-300 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{category.icon}</span>
            <div>
              <h3 className="text-xl font-black text-slate-800">
                Add to {category.title}
              </h3>
              <p className="text-xs text-slate-500 font-semibold">
                Adult mode: Type any word to fetch its real photo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form: Word input & Fetch button */}
        <form onSubmit={handleFetchImage} className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Word / Item Name:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={
                  category.id === "animal"
                    ? "e.g. Cheetah, Peacock, Koala"
                    : category.id === "flower"
                    ? "e.g. Daffodil, Lily, Carnation"
                    : "e.g. Name of the item"
                }
                value={wordName}
                onChange={(e) => setWordName(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl border-2 border-slate-200 focus:border-amber-400 focus:outline-none text-sm font-bold"
                autoFocus
              />
              <button
                type="submit"
                disabled={isLoading || !wordName.trim()}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs sm:text-sm shadow-sm disabled:opacity-50 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Search className="w-4 h-4" />
                <span>{isLoading ? "Searching..." : "Find Photo"}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* Real Photo Preview */}
        {previewImage && (
          <div className="space-y-3 animate-scale-up pt-1">
            <div className="rounded-2xl overflow-hidden aspect-4/3 border-2 border-slate-200 bg-slate-50 relative group">
              <ImageWithFallback
                src={previewImage}
                alt={wordName}
                aspectRatio="aspect-4/3"
                priority={true}
              />
              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                Wikimedia Commons
              </div>
            </div>

            {/* Test Pronunciation */}
            <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-700">
                Word sound: "{wordName.trim()}"
              </span>
              <button
                onClick={handleTestSpeech}
                className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Test Voice</span>
              </button>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Save & Add to {category.title}</span>
            </button>
          </div>
        )}

        {/* Help Tip */}
        <p className="text-[11px] text-slate-400 text-center">
          Images are fetched from Wikimedia Commons and saved locally to this device.
        </p>
      </div>
    </div>
  );
}
