import React, { useState } from "react";
import { CATEGORIES } from "./data/categories";
import Header from "./components/Header";
import HeroBanner from "./components/HeroBanner";
import CategoryCard from "./components/CategoryCard";
import FlashcardView from "./components/FlashcardView";

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeItemIndex, setActiveItemIndex] = useState(0);

  // User requirement: When category is selected, provide a random image from that category.
  // No auto-speech on open.
  const handleSelectCategory = (cat) => {
    const randomIndex = Math.floor(Math.random() * cat.items.length);
    setSelectedCategory(cat);
    setActiveItemIndex(randomIndex);
  };

  // User requirement: Random feature on Next, but DO NOT auto-speak on Next.
  const handleNextRandom = () => {
    if (!selectedCategory) return;
    const items = selectedCategory.items;
    let nextIndex = Math.floor(Math.random() * items.length);

    // Pick a different random item if category has multiple
    if (items.length > 1 && nextIndex === activeItemIndex) {
      nextIndex = (nextIndex + 1) % items.length;
    }

    setActiveItemIndex(nextIndex);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <Header onGoHome={() => setSelectedCategory(null)} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">
        {!selectedCategory ? (
          /* First Page: Hero image & Category selection */
          <div className="space-y-6">
            <HeroBanner />

            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-4">
                Select a Category:
              </h2>

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
          /* Category Flashcard View */
          <FlashcardView
            category={selectedCategory}
            currentIndex={activeItemIndex}
            onNextRandom={handleNextRandom}
            onBack={() => setSelectedCategory(null)}
          />
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-500">
        Bolo! - Children Word & Pronunciation Learning
      </footer>
    </div>
  );
}
