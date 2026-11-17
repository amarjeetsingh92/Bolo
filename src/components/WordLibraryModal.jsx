import React, { useState, useMemo } from "react";
import { Search, X, Dices, Sparkles, Image as ImageIcon } from "lucide-react";
import { EVERYDAY_WORDS, EVERYDAY_CATEGORIES } from "../data/everydayWords";
import { searchRealImage } from "../services/imageApi";
import ImageWithFallback from "./ImageWithFallback";

export default function WordLibraryModal({ isOpen, onClose, onSelectWord }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [customWordLoading, setCustomWordLoading] = useState(false);
  const [customWords, setCustomWords] = useState([]);

  // Combine curated words with any on-the-fly API searched words
  const allWords = useMemo(() => {
    return [...customWords, ...EVERYDAY_WORDS];
  }, [customWords]);

  // Filter words by category and search text
  const filteredWords = useMemo(() => {
    return allWords.filter((item) => {
      const matchesCat =
        selectedCategory === "all" || item.category === selectedCategory;
      const matchesQuery = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase().trim());
      return matchesCat && matchesQuery;
    });
  }, [allWords, selectedCategory, searchQuery]);

  // Live real image search if user types a new word not yet in the list
  const handleSearchNewWord = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setCustomWordLoading(true);
    const result = await searchRealImage(searchQuery.trim());
    setCustomWordLoading(false);

    if (result && result.url) {
      const newWord = {
        id: `custom-${Date.now()}`,
        name: searchQuery.trim().charAt(0).toUpperCase() + searchQuery.trim().slice(1),
        category: "all",
        image: result.url,
        source: result.source
      };
      setCustomWords((prev) => [newWord, ...prev]);
      onSelectWord(newWord);
      onClose();
    } else {
      alert(`Could not find a real photo for "${searchQuery}". Please try another everyday word.`);
    }
  };

  // Pick a random word from the library
  const handleRandomPick = () => {
    const list = filteredWords.length ? filteredWords : allWords;
    const random = list[Math.floor(Math.random() * list.length)];
    if (random) {
      onSelectWord(random);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border-4 border-amber-300 overflow-hidden my-4 flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="bg-gradient-to-r from-amber-50 to-pink-50 p-4 sm:p-6 border-b border-amber-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-white flex items-center justify-center text-2xl shadow-sm">
              📚
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-800">
                Everyday Words Library
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-semibold">
                Tap any word to see its real photo and hear pronunciation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRandomPick}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-sm active:scale-95 transition-all"
              title="Pick a random word"
            >
              <Dices className="w-4 h-4" />
              <span>Random Word</span>
            </button>

            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center active:scale-95 transition-all"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar & Live API Fetch Form */}
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <form onSubmit={handleSearchNewWord} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search spoon, ball, milk, or any everyday word..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-none bg-white text-sm font-semibold shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={customWordLoading || !searchQuery.trim()}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-sm disabled:opacity-50 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>{customWordLoading ? "Fetching..." : "Fetch Photo"}</span>
            </button>
          </form>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pt-3 pb-1 scrollbar-none">
            {EVERYDAY_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? "bg-amber-500 text-white shadow-sm"
                    : "bg-white text-slate-600 hover:bg-slate-200 border border-slate-200"
                }`}
              >
                <span>{cat.icon} </span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Word Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {filteredWords.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectWord(item);
                  onClose();
                }}
                className="group bg-white rounded-2xl border-2 border-slate-200 hover:border-amber-400 p-2.5 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between"
              >
                <div className="rounded-xl overflow-hidden aspect-square bg-slate-100 mb-2 border border-slate-100">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.name}
                    aspectRatio="aspect-square"
                  />
                </div>

                <div className="text-center font-black text-slate-800 text-sm group-hover:text-amber-600 transition-colors">
                  {item.name}
                </div>
              </div>
            ))}
          </div>

          {filteredWords.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <p className="font-bold text-base mb-2">
                No built-in word found for "{searchQuery}".
              </p>
              <p className="text-sm">
                Tap <strong>"Fetch Photo"</strong> to fetch a real photo for "{searchQuery}" automatically!
              </p>
            </div>
          )}
        </div>

        {/* Bottom Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500">
          Showing {filteredWords.length} everyday words for early child learning
        </div>
      </div>
    </div>
  );
}
