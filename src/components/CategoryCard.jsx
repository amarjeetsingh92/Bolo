import React from "react";
import ImageWithFallback from "./ImageWithFallback";
import { Trash2 } from "lucide-react";

export default function CategoryCard({ category, onSelect, onDelete }) {
  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Delete the "${category.title}" category and its custom words?`)) {
      onDelete?.(category.id);
    }
  };

  return (
    <div
      onClick={() => onSelect(category)}
      className="group bg-white rounded-3xl border-2 border-slate-200 hover:border-amber-400 p-3.5 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
    >
      {/* Category Image */}
      <div className="relative rounded-2xl overflow-hidden aspect-16/10 mb-3 bg-slate-100 border border-slate-100">
        <ImageWithFallback
          src={category.heroImage}
          alt={category.title}
          aspectRatio="aspect-16/10"
          className="group-hover:scale-105 transition-transform duration-300"
        />

        {category.isUserCustom && (
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-amber-500/90 backdrop-blur-sm text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
            <span>Custom Category</span>
          </div>
        )}

        {category.isUserCustom && onDelete && (
          <button
            onClick={handleDelete}
            className="absolute bottom-2 right-2 z-10 w-7 h-7 rounded-full bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center transition-colors shadow"
            title="Delete custom category"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Category Title & Badge */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{category.icon}</span>
          <h3 className="text-xl font-bold text-slate-800 group-hover:text-amber-600 transition-colors">
            {category.title}
          </h3>
        </div>
        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
          {category.items.length} words
        </span>
      </div>
    </div>
  );
}
