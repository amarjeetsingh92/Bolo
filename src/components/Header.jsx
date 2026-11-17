import React, { useState } from "react";
import { BookOpen, Settings, Key } from "lucide-react";
import { getApiKey, setApiKey } from "../services/imageApi";

export default function Header({ onGoHome, onOpenLibrary }) {
  const [showSettings, setShowSettings] = useState(false);
  const [unsplashKey, setUnsplashKey] = useState(getApiKey("unsplash"));
  const [pexelsKey, setPexelsKey] = useState(getApiKey("pexels"));
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSaveKeys = (e) => {
    e.preventDefault();
    setApiKey("unsplash", unsplashKey.trim());
    setApiKey("pexels", pexelsKey.trim());
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      setShowSettings(false);
    }, 1500);
  };

  return (
    <>
      <header className="bg-white border-b-2 border-slate-200 py-3 px-4 md:px-8 shadow-sm sticky top-0 z-30">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          {/* Logo */}
          <button
            onClick={onGoHome}
            className="flex items-center gap-2.5 text-left active:scale-95 transition-transform"
          >
            <span className="text-3xl">🗣️</span>
            <div>
              <span className="text-2xl font-black bg-gradient-to-r from-amber-500 to-pink-500 bg-clip-text text-transparent">
                Bolo!
              </span>
              <span className="text-xs text-slate-500 font-bold ml-2 hidden sm:inline">
                Kids Words
              </span>
            </div>
          </button>

          {/* Top Actions: 1,000 Words Popup Trigger + API Settings */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Pop-up at the top for 1,000 Words */}
            <button
              onClick={onOpenLibrary}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs sm:text-sm shadow-md active:scale-95 transition-all"
              title="Open full dictionary of everyday words"
            >
              <BookOpen className="w-4 h-4" />
              <span>📚 1,000 Everyday Words</span>
            </button>

            {/* Optional API Settings */}
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 active:scale-95 transition-all"
              title="Custom Image API Settings (Optional)"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* API Key Modal (Optional for user) */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border-2 border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-slate-800 text-lg">
                  Image API Settings
                </h3>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Bolo already works with authentic real photos without any API keys.
              If you have your own <strong>Unsplash</strong> or <strong>Pexels</strong> developer key, you can enter it below to search their live photo libraries:
            </p>

            <form onSubmit={handleSaveKeys} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Unsplash Access Key (Optional):
                </label>
                <input
                  type="text"
                  placeholder="Paste your Unsplash Client ID..."
                  value={unsplashKey}
                  onChange={(e) => setUnsplashKey(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Pexels API Key (Optional):
                </label>
                <input
                  type="text"
                  placeholder="Paste your Pexels API key..."
                  value={pexelsKey}
                  onChange={(e) => setPexelsKey(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500"
                />
              </div>

              {savedNotice && (
                <div className="text-xs font-bold text-emerald-600 bg-emerald-50 p-2 rounded-xl text-center">
                  ✓ Keys saved successfully!
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm"
                >
                  Save Keys
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
