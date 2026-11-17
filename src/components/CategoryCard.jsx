import React from "react";
import ImageWithFallback from "./ImageWithFallback";

export default function CategoryCard({ category, onSelect }) {
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
