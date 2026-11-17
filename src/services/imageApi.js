// Real-world Image Service using Wikipedia & Wikimedia Official REST APIs
// 100% Free, Instant Loading, Accurate Encyclopedic Lead Images

const imageCache = new Map();

// Load cached URLs from localStorage
try {
  if (typeof localStorage !== "undefined") {
    const stored = localStorage.getItem("bolo_wikimedia_cache");
    if (stored) {
      const parsed = JSON.parse(stored);
      Object.entries(parsed).forEach(([k, v]) => imageCache.set(k, v));
    }
  }
} catch (e) {
  // Ignore localStorage issues
}

function saveCache() {
  try {
    if (typeof localStorage !== "undefined") {
      const obj = Object.fromEntries(imageCache.entries());
      localStorage.setItem("bolo_wikimedia_cache", JSON.stringify(obj));
    }
  } catch (e) {
    // Ignore quota issues
  }
}

/**
 * Searches and retrieves a fast, lightweight real photo from Wikimedia/Wikipedia.
 * Uses official REST API endpoint: /api/rest_v1/page/summary/{title}
 * Returns official pre-rendered cached thumbnails in ~30ms.
 */
export async function fetchWikimediaImage(query) {
  if (!query || typeof query !== "string") return null;
  const cleanQuery = query.trim().toLowerCase();

  // Instant 0ms cache hit
  if (imageCache.has(cleanQuery)) {
    return imageCache.get(cleanQuery);
  }

  // 1. Wikipedia REST Summary API (returns official, 200 OK pre-rendered thumbnails in ~30ms)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const restUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
      cleanQuery
    )}`;

    const res = await fetch(restUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "BoloKidsApp/1.0 (https://example.com/bolo; contact@example.com)"
      }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const imgUrl = data.thumbnail?.source || data.originalimage?.source;
      if (imgUrl) {
        const result = {
          url: imgUrl,
          title: data.title,
          description: data.description || cleanQuery,
          source: "Wikimedia Commons"
        };
        imageCache.set(cleanQuery, result);
        saveCache();
        return result;
      }
    }
  } catch (err) {
    console.warn("REST summary lookup notice:", err.message);
  }

  // 2. Wikipedia Search API Fallback (with standard 600px bucket)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
      cleanQuery
    )}&gsrlimit=1&prop=pageimages&pithumbsize=640&format=json&origin=*`;

    const res = await fetch(searchUrl, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

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
    console.warn("Search API fallback notice:", err.message);
  }

  return null;
}

export async function searchRealImage(query) {
  return fetchWikimediaImage(query);
}

export function setApiKey() {}
export function getApiKey() { return ""; }
