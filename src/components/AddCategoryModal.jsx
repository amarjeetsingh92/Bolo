import React, { useState, useEffect } from "react";
import { X, Sparkles, FolderPlus, Image as ImageIcon } from "lucide-react";
import { fetchWikimediaImage } from "../services/imageApi";
import { saveUserCustomCategory } from "../services/customWords";
import ImageWithFallback from "./ImageWithFallback";

const PRESET_ICONS = [
  "🐦", "🐠", "🚗", "🥕", "🎸", "🧸", 
  "⛵", "🦋", "🚀", "🍇", "🚜", "⚽", 
  "👕", "🏠", "🍕", "🎨", "🐘", "🌻"
];

export default function AddCategoryModal({ isOpen, onClose, onCategoryCreated }) {
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("🐦");
  const [heroImage, setHeroImage] = useState("");
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setTitle("");
      setIcon("🐦");
      setHeroImage("");
      setErrorMessage("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFetchHero = async (searchWord) => {
    const q = (searchWord || title).trim();
    if (!q) return;

    setIsLoadingImage(true);
    setErrorMessage("");

    try {
      const res = await fetchWikimediaImage(q);
      if (res && res.url) {
        setHeroImage(res.url);
      } else {
        setErrorMessage(`Could not find a Wikimedia photo for "${q}". Try another title.`);
      }
    } catch (e) {
      setErrorMessage("Failed to connect to Wikimedia. Check connection.");
    } finally {
      setIsLoadingImage(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setErrorMessage("Please enter a category title.");
      return;
    }

    const newCategory = {
      id: `custom-cat-${cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}`,
      title: cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1),
      icon: icon || "📁",
      heroImage: heroImage || "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Quercus_robur.jpg/330px-Quercus_robur.jpg",
      items: []
    };

    saveUserCustomCategory(newCategory);
    onCategoryCreated(newCategory);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border-4 border-amber-300 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800">
                Create New Category
              </h3>
              <p className="text-xs text-slate-500 font-semibold">
                Adult mode: Add a custom learning section for the child
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Input */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Category Title:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Birds, Vegetables, Sea Animals, Vehicles"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => {
                  if (title.trim() && !heroImage) {
                    handleFetchHero(title);
                  }
                }}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 font-semibold text-slate-800 text-sm"
                required
              />
              <button
                type="button"
                onClick={() => handleFetchHero()}
                disabled={isLoadingImage || !title.trim()}
                className="px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 text-white font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isLoadingImage ? "Finding..." : "Find Photo"}</span>
              </button>
            </div>
          </div>

          {/* Icon Picker */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Choose an Icon / Emoji:
            </label>
            <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-2xl border border-slate-200">
              {PRESET_ICONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all ${
                    icon === emoji
                      ? "bg-amber-400 scale-110 shadow-sm border border-amber-500"
                      : "hover:bg-white text-slate-700"
                  }`}
                >
                  {emoji}
                </button>
              ))}
              <input
                type="text"
                maxLength={4}
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                title="Or type custom emoji"
                placeholder="Custom"
                className="w-16 px-2 py-1 text-center font-bold text-sm bg-white rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Live Preview Card */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Category Card Preview:
            </label>
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 flex items-center gap-3">
              <div className="w-20 h-14 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-300">
                {heroImage ? (
                  <ImageWithFallback
                    src={heroImage}
                    alt={title || "Category Preview"}
                    aspectRatio="aspect-16/10"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{icon}</span>
                  <h4 className="font-extrabold text-slate-800 truncate text-base">
                    {title || "Your New Category"}
                  </h4>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  {heroImage ? "✓ Real photo from Wikimedia" : "Type title and click 'Find Photo'"}
                </p>
              </div>
            </div>
          </div>

          {errorMessage && (
            <p className="text-xs text-rose-600 font-bold bg-rose-50 p-2.5 rounded-xl border border-rose-200">
              {errorMessage}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-white font-black text-sm shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Create Category</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
