// Service to store and retrieve user-added categories and words/items per category
// All user modifications persist in localStorage.

const ITEMS_STORAGE_KEY = "bolo_custom_category_items";
const CATEGORIES_STORAGE_KEY = "bolo_user_custom_categories";

// ================= CUSTOM ITEMS =================

export function getCustomCategoryItems() {
  try {
    const raw = localStorage.getItem(ITEMS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function saveCustomCategoryItem(categoryId, item) {
  try {
    const current = getCustomCategoryItems();
    if (!current[categoryId]) {
      current[categoryId] = [];
    }
    // Prevent duplicate ids
    current[categoryId] = current[categoryId].filter((x) => x.id !== item.id);
    current[categoryId].unshift(item);
    localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(current));
    return current;
  } catch (e) {
    console.error("Failed to save custom item:", e);
    return null;
  }
}

export function deleteCustomCategoryItem(categoryId, itemId) {
  try {
    const current = getCustomCategoryItems();
    if (current[categoryId]) {
      current[categoryId] = current[categoryId].filter((x) => x.id !== itemId);
      localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(current));
    }
    return current;
  } catch (e) {
    return null;
  }
}

// ================= USER-CREATED CATEGORIES =================

export function getUserCustomCategories() {
  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveUserCustomCategory(category) {
  try {
    const current = getUserCustomCategories();
    // Normalize category object
    const cleanId = category.id || `custom-cat-${category.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}`;
    const newCat = {
      ...category,
      id: cleanId,
      isUserCustom: true,
      items: category.items || []
    };

    const updated = [
      newCat,
      ...current.filter((c) => c.id !== newCat.id)
    ];
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updated));
    return newCat;
  } catch (e) {
    console.error("Failed to save custom category:", e);
    return null;
  }
}

export function deleteUserCustomCategory(categoryId) {
  try {
    const current = getUserCustomCategories();
    const updated = current.filter((c) => c.id !== categoryId);
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updated));

    // Also remove items belonging to this category
    const itemsMap = getCustomCategoryItems();
    if (itemsMap[categoryId]) {
      delete itemsMap[categoryId];
      localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(itemsMap));
    }

    return updated;
  } catch (e) {
    console.error("Failed to delete custom category:", e);
    return null;
  }
}

// ================= MERGE EVERYTHING =================

/**
 * Merges built-in categories with user-created categories and user-added items.
 */
export function getMergedCategories(baseCategories) {
  const customItemsMap = getCustomCategoryItems();

  // 1. Merge custom items into base categories
  const baseMerged = baseCategories.map((cat) => {
    const customList = customItemsMap[cat.id] || [];
    if (!customList.length) return cat;
    return {
      ...cat,
      items: [...customList, ...cat.items]
    };
  });

  // 2. Fetch user-created categories and merge their custom items
  const userCats = getUserCustomCategories().map((cat) => {
    const customList = customItemsMap[cat.id] || [];
    const baseItems = cat.items || [];
    // Combine items without duplicate IDs
    const combined = [...customList];
    for (const item of baseItems) {
      if (!combined.some((c) => c.id === item.id)) {
        combined.push(item);
      }
    }
    return {
      ...cat,
      items: combined
    };
  });

  return [...baseMerged, ...userCats];
}
