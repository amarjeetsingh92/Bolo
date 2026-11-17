// Real-world Image Service using Wikipedia & Wikimedia Official REST APIs
// 100% Free, Instant Loading, Accurate Encyclopedic Lead Images & Multi-Image Gallery

const imageCache = new Map();
const multiImageCache = new Map();

// Load cached single URLs from localStorage
try {
  if (typeof localStorage !== "undefined") {
    const stored = localStorage.getItem("bolo_wikimedia_cache");
    if (stored) {
      const parsed = JSON.parse(stored);
      Object.entries(parsed).forEach(([k, v]) => imageCache.set(k, v));
    }
    const multiStored = localStorage.getItem("bolo_wikimedia_multi_cache");
    if (multiStored) {
      const parsedMulti = JSON.parse(multiStored);
      Object.entries(parsedMulti).forEach(([k, v]) => multiImageCache.set(k, v));
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

function saveMultiCache() {
  try {
    if (typeof localStorage !== "undefined") {
      const obj = Object.fromEntries(multiImageCache.entries());
      localStorage.setItem("bolo_wikimedia_multi_cache", JSON.stringify(obj));
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

  // 2. Wikipedia Search API Fallback (with standard 500px bucket)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
      cleanQuery
    )}&gsrlimit=1&prop=pageimages&pithumbsize=500&format=json&origin=*`;

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

/**
 * Retrieves multiple alternative authentic photographs for a word from Wikimedia Commons.
 * Enables the "🔄 Different Photo" refresh feature.
 */
export async function fetchAlternativeImages(query, currentUrl, limit = 8) {
  if (!query || typeof query !== "string") {
    return currentUrl ? [currentUrl] : [];
  }
  const cleanQuery = query.trim().toLowerCase();

  // If already fetched and cached, return cached list
  if (multiImageCache.has(cleanQuery)) {
    const cachedList = multiImageCache.get(cleanQuery);
    if (cachedList && cachedList.length > 0) {
      if (currentUrl && !cachedList.includes(currentUrl)) {
        return [currentUrl, ...cachedList];
      }
      return cachedList;
    }
  }

  const collected = currentUrl ? [currentUrl] : [];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    // Search Wikimedia Commons File namespace (ns 6) for real photographs
    const commonsUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
      cleanQuery
    )}&gsrnamespace=6&gsrlimit=${limit + 4}&prop=imageinfo&iiprop=url&iiurlwidth=500&format=json&origin=*`;

    const res = await fetch(commonsUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "BoloKidsApp/1.0 (https://example.com/bolo; contact@example.com)"
      }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const pages = Object.values(data.query?.pages || {});

      for (const p of pages) {
        const title = (p.title || "").toLowerCase();
        const info = p.imageinfo?.[0];
        const thumb = info?.thumburl || info?.url;

        // Filter out non-photo files, icons, flags, maps, logos, coats of arms, audio, SVG
        const isUnwanted =
          title.includes(".svg") ||
          title.includes(".ogg") ||
          title.includes(".webm") ||
          title.includes("map") ||
          title.includes("flag") ||
          title.includes("icon") ||
          title.includes("diagram") ||
          title.includes("logo") ||
          title.includes("coat_of_arms");

        if (thumb && !isUnwanted && !collected.includes(thumb)) {
          collected.push(thumb);
        }
      }
    }
  } catch (err) {
    console.warn("Multi-image fetch notice:", err.message);
  }

  // Fallback: If Commons returned fewer than 2 images, also search Wikipedia pages
  if (collected.length < 2) {
    try {
      const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
        cleanQuery
      )}&gsrlimit=5&prop=pageimages&pithumbsize=500&format=json&origin=*`;
      const res = await fetch(wikiUrl);
      if (res.ok) {
        const data = await res.json();
        const pages = Object.values(data.query?.pages || {});
        for (const p of pages) {
          const img = p.thumbnail?.source;
          if (img && !collected.includes(img)) {
            collected.push(img);
          }
        }
      }
    } catch (e) {
      // Ignore
    }
  }

  if (collected.length > 0) {
    multiImageCache.set(cleanQuery, collected);
    saveMultiCache();
  }

  return collected;
}

export async function searchRealImage(query) {
  return fetchWikimediaImage(query);
}

export function setApiKey() {}
export function getApiKey() {
  return "";
}
