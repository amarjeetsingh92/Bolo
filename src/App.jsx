import React, { useState } from "react";
import confetti from "canvas-confetti";
import { CATEGORIES as BASE_CATEGORIES } from "./data/categories";
import { EVERYDAY_WORDS } from "./data/everydayWords";
import {
  getMergedCategories,
  saveCustomCategoryItem,
  deleteUserCustomCategory
} from "./services/customWords";
import Header from "./components/Header";
import CategoryCard from "./components/CategoryCard";
import FlashcardView from "./components/FlashcardView";
import WordLibraryModal from "./components/WordLibraryModal";
import AddItemModal from "./components/AddItemModal";
import AddCategoryModal from "./components/AddCategoryModal";
import { Search, Dices, Plus, FolderPlus } from "lucide-react";

/**
 * Fisher-Yates shuffle that creates a random deck permutation.
 * Guarantees that every single item comes at least once per cycle!
 * Also ensures that starting the next cycle won't immediately repeat the previous last item.
 */
function createShuffledDeck(length, lastItemIndex = -1) {
  if (length <= 0) return [];
  const indices = Array.from({ length }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  if (length > 1 && indices[0] === lastItemIndex) {
    [indices[0], indices[1]] = [indices[1], indices[0]];
  }
  return indices;
}

export default function App() {
  const [categories, setCategories] = useState(() => getMergedCategories(BASE_CATEGORIES));
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryCycle, setCategoryCycle] = useState({
    deck: [],
    pos: 0,
    cycleNumber: 1
  });
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [addModalCategory, setAddModalCategory] = useState(null);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);

  // User requirement: When a category is clicked, start a randomized complete cycle
  const handleSelectCategory = (cat) => {
    const currentCat = categories.find((c) => c.id === cat.id) || cat;
    const items = currentCat.items || [];
    const deck = createShuffledDeck(items.length);
    setSelectedCategory(currentCat);
    setCategoryCycle({
      deck,
      pos: 0,
      cycleNumber: 1
    });
  };

  // User requirement: Select a word directly from 1,000 Everyday Words library
  const handleSelectEverydayWord = (word) => {
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

    const deck = createShuffledDeck(itemsList.length);
    const posInDeck = Math.max(deck.indexOf(index), 0);

    setSelectedCategory(everydayCategory);
    setCategoryCycle({
      deck,
      pos: posInDeck,
      cycleNumber: 1
    });
  };

  // User requirement: Random Next advances through the cycle without repeats until all are shown
  const handleNextRandom = () => {
    if (!selectedCategory) return;
    const items = selectedCategory.items || [];
    if (items.length <= 1) return;

    const { deck, pos, cycleNumber } = categoryCycle;

    if (pos + 1 < deck.length) {
      // Advance to next random card in the current cycle
      setCategoryCycle({
        deck,
        pos: pos + 1,
        cycleNumber
      });
    } else {
      // Completed full cycle! All images in this category have been shown at least once!
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Fallback if confetti fails
      }

      // Generate a fresh shuffled cycle, ensuring no immediate repeat across boundary
      const lastItemIdx = deck[pos];
      const newDeck = createShuffledDeck(items.length, lastItemIdx);

      setCategoryCycle({
        deck: newDeck,
        pos: 0,
        cycleNumber: cycleNumber + 1
      });
    }
  };

  // Quick random jump into the 1,000 Everyday Words library
  const handleSurpriseEverydayWord = () => {
    const everydayCategory = {
      id: "everyday-words",
      title: "Everyday Words",
      icon: "📚",
      items: EVERYDAY_WORDS
    };
    const deck = createShuffledDeck(EVERYDAY_WORDS.length);
    setSelectedCategory(everydayCategory);
    setCategoryCycle({
      deck,
      pos: 0,
      cycleNumber: 1
    });
  };

  // Adult Feature: Save a custom added item from Wikimedia Commons to any category
  const handleSaveCustomItem = (categoryId, newItem) => {
    saveCustomCategoryItem(categoryId, newItem);
    const updatedCategories = getMergedCategories(BASE_CATEGORIES);
    setCategories(updatedCategories);

    // If currently viewing that category, update it and insert the new item into the cycle
    if (selectedCategory && selectedCategory.id === categoryId) {
      const updatedCat = updatedCategories.find((c) => c.id === categoryId);
      if (updatedCat) {
        setSelectedCategory(updatedCat);
        // The newly saved item is at index 0 in updatedCat.items
        const newDeck = [0, ...categoryCycle.deck.map((idx) => idx + 1)];
        setCategoryCycle({
          deck: newDeck,
          pos: 0,
          cycleNumber: categoryCycle.cycleNumber
        });
      }
    }
  };

  // Adult Feature: Create a brand new category by the user
  const handleCategoryCreated = (newCategory) => {
    const updatedCategories = getMergedCategories(BASE_CATEGORIES);
    setCategories(updatedCategories);
    // Open the new category immediately
    handleSelectCategory(newCategory);
  };

  // Adult Feature: Delete a user-created category
  const handleDeleteCategory = (categoryId) => {
    deleteUserCustomCategory(categoryId);
    const updatedCategories = getMergedCategories(BASE_CATEGORIES);
    setCategories(updatedCategories);
    if (selectedCategory && selectedCategory.id === categoryId) {
      setSelectedCategory(null);
    }
  };

  const currentItemIndex = categoryCycle.deck[categoryCycle.pos] ?? 0;
  const currentItem = selectedCategory?.items?.[currentItemIndex];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Header */}
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
                  Real photos from Wikimedia Commons of objects children see in daily life!
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

            {/* Core & User-Created Learning Categories */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                    Select a Learning Category:
                  </h2>
                  <span className="text-xs text-slate-500 font-semibold">
                    {categories.length} Categories
                  </span>
                </div>

                {/* User Feature: Button to Add Category */}
                <button
                  onClick={() => setIsAddCategoryOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
                  title="Create a new learning category (Adult mode)"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>Add Category</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat) => (
                  <div key={cat.id} className="relative group">
                    <CategoryCard
                      category={cat}
                      onSelect={handleSelectCategory}
                      onDelete={handleDeleteCategory}
                    />

                    {/* Quick Adult Add Item Button on Category Card */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setAddModalCategory(cat);
                      }}
                      className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-amber-500 hover:text-white text-slate-600 shadow-md flex items-center justify-center transition-all opacity-80 hover:opacity-100 active:scale-90"
                      title={`Add an item to ${cat.title} (Adult Mode)`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {/* Interactive 'Create New Category' Card */}
                <div
                  onClick={() => setIsAddCategoryOpen(true)}
                  className="rounded-3xl border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/50 hover:bg-amber-50 p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all group min-h-[180px] shadow-sm hover:shadow-md active:scale-98"
                >
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 group-hover:bg-amber-200 text-amber-600 flex items-center justify-center mb-2 transition-colors">
                    <FolderPlus className="w-6 h-6" />
                  </div>
                  <span className="font-extrabold text-slate-800 text-base group-hover:text-amber-700">
                    Create New Category
                  </span>
                  <span className="text-xs text-slate-500 font-semibold mt-0.5">
                    Add Birds, Vehicles, Vegetables & more
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ================= CATEGORY FLASHCARD PAGE ================= */
          <FlashcardView
            category={selectedCategory}
            currentItem={currentItem}
            cyclePosition={categoryCycle.pos + 1}
            totalInCycle={selectedCategory.items?.length || 0}
            cycleNumber={categoryCycle.cycleNumber}
            onNextRandom={handleNextRandom}
            onBack={() => setSelectedCategory(null)}
            onOpenAddModal={() => setAddModalCategory(selectedCategory)}
          />
        )}
      </main>

      {/* 1,000 Everyday Words Pop-up Modal */}
      <WordLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelectWord={handleSelectEverydayWord}
      />

      {/* Adult Add Item Modal (Fetches from Wikimedia Commons API) */}
      <AddItemModal
        isOpen={Boolean(addModalCategory)}
        onClose={() => setAddModalCategory(null)}
        category={addModalCategory}
        onSaveItem={handleSaveCustomItem}
      />

      {/* Adult Add Category Modal (Creates new category with Wikimedia Commons hero) */}
      <AddCategoryModal
        isOpen={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
        onCategoryCreated={handleCategoryCreated}
      />

      <footer className="bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-500">
        Bolo! - Real Everyday Child Words with Wikimedia Commons
      </footer>
    </div>
  );
}
