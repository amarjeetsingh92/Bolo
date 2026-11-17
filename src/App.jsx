import React, { useState } from "react";
import { CATEGORIES } from "./data/categories";
import { EVERYDAY_WORDS } from "./data/everydayWords";
import Header from "./components/Header";
import CategoryCard from "./components/CategoryCard";
import FlashcardView from "./components/FlashcardView";
import WordLibraryModal from "./components/WordLibraryModal";
import { BookOpen, Search, Dices } from "lucide-react";

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  // User requirement: When a category is selected, provide a random image from that category.
  const handleSelectCategory = (cat) => {
    const randomIndex = Math.floor(Math.random() * cat.items.length);
    setSelectedCategory(cat);
    setActiveItemIndex(randomIndex);
  };

  // User requirement: Select a word directly from the 1,000 Everyday Words library
  const handleSelectEverydayWord = (word) => {
    // Check if word exists in EVERYDAY_WORDS or is custom
    let index = EVERYDAY_WORDS.findIndex((w) => w.id === word.id);
    let itemsList = EVERYDAY_WORDS;

    if (index === -1) {
      itemsList = [word, ...EVERYDAY_WORDS];
      index = 0;
    }

    const everydayCategory = {
      id: "everyday-words",
      title: "Everyday Words",
      icon: "📚",
      items: itemsList
    };

    setSelectedCategory(everydayCategory);
    setActiveItemIndex(index);
  };

  // User requirement: Random feature on Next (silent, no auto-speech)
  const handleNextRandom = () => {
    if (!selectedCategory) return;
    const items = selectedCategory.items;
    let nextIndex = Math.floor(Math.random() * items.length);

    if (items.length > 1 && nextIndex === activeItemIndex) {
      nextIndex = (nextIndex + 1) % items.length;
    }

    setActiveItemIndex(nextIndex);
  };

  // Quick random jump into the 1,000 Everyday Words library
  const handleSurpriseEverydayWord = () => {
    const randomIdx = Math.floor(Math.random() * EVERYDAY_WORDS.length);
    const everydayCategory = {
      id: "everyday-words",
      title: "Everyday Words",
      icon: "📚",
      items: EVERYDAY_WORDS
    };
    setSelectedCategory(everydayCategory);
    setActiveItemIndex(randomIdx);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Header with Top "1,000 Everyday Words" Trigger */}
      <Header
        onGoHome={() => setSelectedCategory(null)}
        onOpenLibrary={() => setIsLibraryOpen(true)}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">
        {!selectedCategory ? (
          /* ================= FIRST PAGE ================= */
          <div className="space-y-6">
            {/* Top Interactive Banner: 1,000 Everyday Words Popup Launcher */}
            <div className="rounded-3xl bg-gradient-to-r from-amber-400 via-orange-400 to-pink-500 p-5 sm:p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-black backdrop-blur-sm">
                  <span>🌟</span>
                  <span>Daily Speech Learning</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black">
                  1,000 Everyday Words
                </h1>
                <p className="text-white/90 text-xs sm:text-sm max-w-md font-medium">
                  Real photos of spoon, ball, shoes, milk, and objects children see every day!
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setIsLibraryOpen(true)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-slate-800 font-black text-sm shadow-md hover:bg-slate-100 active:scale-95 transition-all"
                >
                  <Search className="w-4 h-4 text-amber-500" />
                  <span>Browse Words</span>
                </button>

                <button
                  onClick={handleSurpriseEverydayWord}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-black/20 hover:bg-black/30 text-white font-bold text-sm backdrop-blur-sm active:scale-95 transition-all"
                  title="Random Everyday Word"
                >
                  <Dices className="w-4 h-4" />
                  <span>Random</span>
                </button>
              </div>
            </div>

            {/* Core Learning Categories */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                  Select a Learning Category:
                </h2>
                <span className="text-xs text-slate-500 font-semibold">
                  {CATEGORIES.length} Categories
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {CATEGORIES.map((cat) => (
                  <CategoryCard
                    key={cat.id}
                    category={cat}
                    onSelect={handleSelectCategory}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ================= CATEGORY FLASHCARD PAGE ================= */
          <FlashcardView
            category={selectedCategory}
            currentIndex={activeItemIndex}
            onNextRandom={handleNextRandom}
            onBack={() => setSelectedCategory(null)}
          />
        )}
      </main>

      {/* 1,000 Everyday Words Pop-up Modal */}
      <WordLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelectWord={handleSelectEverydayWord}
      />

      <footer className="bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-500">
        Bolo! - Real Everyday Words & Pronunciation Learning for Children
      </footer>
    </div>
  );
}
