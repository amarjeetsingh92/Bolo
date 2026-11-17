// Real-World Image API Service for Educational Vocabulary
// Supports:
// 1. Wikimedia Commons Public Educational API (Zero API key required!)
// 2. Unsplash API (Optional user API key)
// 3. Pexels API (Optional user API key)

const API_KEYS = {
  unsplash: localStorage.getItem("bolo_unsplash_key") || "",
  pexels: localStorage.getItem("bolo_pexels_key") || ""
};

export function setApiKey(provider, key) {
  API_KEYS[provider] = key;
  localStorage.setItem(`bolo_${provider}_key`, key);
}

export function getApiKey(provider) {
  return API_KEYS[provider] || "";
}

/**
 * Searches real-world photography for any everyday object.
 * Priority:
 * 1. Unsplash (if key provided)
 * 2. Pexels (if key provided)
 * 3. Wikimedia Commons Open API (100% free, authentic encyclopedic photo)
 */
export async function searchRealImage(query) {
  const cleanQuery = query.toLowerCase().trim();

  // 1. Try Unsplash if user configured a key
  if (API_KEYS.unsplash) {
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?page=1&per_page=1&query=${encodeURIComponent(
          cleanQuery
        )}`,
        {
          headers: {
            Authorization: `Client-ID ${API_KEYS.unsplash}`
          }
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          return {
            url: data.results[0].urls.regular,
            source: "Unsplash",
            author: data.results[0].user?.name
          };
        }
      }
    } catch (e) {
      console.warn("Unsplash API query error:", e);
    }
  }

  // 2. Try Pexels if user configured a key
  if (API_KEYS.pexels) {
    try {
      const res = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(
          cleanQuery
        )}&per_page=1`,
        {
          headers: {
            Authorization: API_KEYS.pexels
          }
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.photos && data.photos.length > 0) {
          return {
            url: data.photos[0].src.large,
            source: "Pexels",
            author: data.photos[0].photographer
          };
        }
      }
    } catch (e) {
      console.warn("Pexels API query error:", e);
    }
  }

  // 3. Wikimedia Commons Open API (No key needed! Authentic encyclopedia photo)
  try {
    const res = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageimages&piprop=original|thumbnail&pithumbsize=800&titles=${encodeURIComponent(
        cleanQuery
      )}`
    );
    if (res.ok) {
      const data = await res.json();
      const pages = data.query?.pages;
      if (pages) {
        const pageKey = Object.keys(pages)[0];
        const page = pages[pageKey];
        const imageUrl = page.original?.source || page.thumbnail?.source;
        if (imageUrl) {
          return {
            url: imageUrl,
            source: "Wikimedia Commons",
            author: page.title
          };
        }
      }
    }
  } catch (e) {
    console.warn("Wikimedia API error:", e);
  }

  return null;
}
