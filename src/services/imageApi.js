// Wikimedia Commons API Image Retrieval Service
// 100% Free, unlimited requests, authentic encyclopedic real photography.

const imageCache = new Map();

// Optional user keys if they ever configure them
const API_KEYS = {
  unsplash: typeof localStorage !== "undefined" ? localStorage.getItem("bolo_unsplash_key") || "" : "",
  pexels: typeof localStorage !== "undefined" ? localStorage.getItem("bolo_pexels_key") || "" : ""
};

export function setApiKey(provider, key) {
  API_KEYS[provider] = key;
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(`bolo_${provider}_key`, key);
  }
}

export function getApiKey(provider) {
  return API_KEYS[provider] || "";
}

// Load cached URLs from localStorage if available
try {
  const stored = typeof localStorage !== "undefined" ? localStorage.getItem("bolo_wikimedia_cache") : null;
  if (stored) {
    const parsed = JSON.parse(stored);
    Object.entries(parsed).forEach(([k, v]) => imageCache.set(k, v));
  }
} catch (e) {
  // Ignore localStorage errors
}

function saveCache() {
  try {
    if (typeof localStorage !== "undefined") {
      const obj = Object.fromEntries(imageCache.entries());
      localStorage.setItem("bolo_wikimedia_cache", JSON.stringify(obj));
    }
  } catch (e) {
    // Ignore quota errors
  }
}

/**
 * Searches and retrieves a high-resolution real photo from Wikimedia Commons for any word.
 */
export async function fetchWikimediaImage(query) {
  if (!query || typeof query !== "string") return null;
  const cleanQuery = query.trim().toLowerCase();

  if (imageCache.has(cleanQuery)) {
    return imageCache.get(cleanQuery);
  }

  // 1. Wikipedia Lead Encyclopedia Image (highest relevance for educational concepts)
  try {
    const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
      cleanQuery
    )}&gsrlimit=1&prop=pageimages&piprop=original|thumbnail&pithumbsize=900&format=json&origin=*`;

    const res = await fetch(wikiUrl);
    if (res.ok) {
      const data = await res.json();
      const pages = data.query?.pages;
      if (pages) {
        const pageKey = Object.keys(pages)[0];
        const page = pages[pageKey];
        const imgUrl = page?.thumbnail?.source || page?.original?.source;
        if (imgUrl) {
          const result = {
            url: imgUrl,
            title: page.title,
            source: "Wikimedia Commons"
          };
          imageCache.set(cleanQuery, result);
          saveCache();
          return result;
        }
      }
    }
  } catch (err) {
    console.warn("Wikipedia image lookup error:", err);
  }

  // 2. Wikimedia Commons Direct Media Search Fallback
  try {
    const commonsUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
      cleanQuery + " filetype:bitmap"
    )}&gsrnamespace=6&gsrlimit=1&prop=imageinfo&iiprop=url&iiurlwidth=900&format=json&origin=*`;

    const res = await fetch(commonsUrl);
    if (res.ok) {
      const data = await res.json();
      const pages = data.query?.pages;
      if (pages) {
        const pageKey = Object.keys(pages)[0];
        const page = pages[pageKey];
        const imgInfo = page?.imageinfo?.[0];
        const imgUrl = imgInfo?.thumburl || imgInfo?.url;
        if (imgUrl) {
          const result = {
            url: imgUrl,
            title: page.title,
            source: "Wikimedia Commons"
          };
          imageCache.set(cleanQuery, result);
          saveCache();
          return result;
        }
      }
    }
  } catch (err) {
    console.warn("Wikimedia Commons search error:", err);
  }

  return null;
}

/**
 * Universal search alias used by components.
 */
export async function searchRealImage(query) {
  return fetchWikimediaImage(query);
}
