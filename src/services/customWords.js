// Service to store and retrieve user-added words and items per category

const STORAGE_KEY = "bolo_custom_category_items";

export function getCustomCategoryItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    }
    return current;
  } catch (e) {
    return null;
  }
}

/**
 * Merges the built-in categories with any adult-added custom words stored in localStorage.
 */
export function getMergedCategories(baseCategories) {
  const customMap = getCustomCategoryItems();
  return baseCategories.map((cat) => {
    const customList = customMap[cat.id] || [];
    if (!customList.length) return cat;
    return {
      ...cat,
      items: [...customList, ...cat.items]
    };
  });
}
