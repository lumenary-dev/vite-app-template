const Lumenary = (function () {
  let API_KEY: string | null = null;
  const cache = new Map<string, string | Promise<string>>();
  const localStorageKey = 'lumenaryCache';

  function init(options: { apiKey: string }) {
    if (!options || !options.apiKey) {
      throw new Error('Lumenary.init: apiKey is required.');
    }
    API_KEY = options.apiKey;
  }

  try {
    const stored = localStorage.getItem(localStorageKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      for (const key in parsed) {
        cache.set(key, parsed[key]);
      }
    }
  } catch (err) {
    console.error('Lumenary: Error loading cache from localStorage', err);
  }

  function persistCache() {
    try {
      const obj: Record<string, string> = {};
      for (const [key, value] of cache.entries()) {
        if (typeof value === 'string') {
          obj[key] = value;
        }
      }
      localStorage.setItem(localStorageKey, JSON.stringify(obj));
    } catch (err) {
      console.error('Lumenary: Error saving cache to localStorage', err);
    }
  }

  function getCacheKey(params: Record<string, string | number>) {
    const sorted: Record<string, string | number> = {};
    Object.keys(params)
      .sort()
      .forEach((key) => {
        sorted[key] = params[key];
      });
    return JSON.stringify(sorted);
  }

  async function generateImage({
    prompt,
    aspect_ratio = '16:9',
    guidance_scale = 3.5,
  }: {
    prompt: string;
    aspect_ratio?: string;
    guidance_scale?: number;
  }): Promise<string> {
    if (!API_KEY) {
      throw new Error(
        'Lumenary.generateImage: SDK not initialized. Call Lumenary.init({ apiKey: "YOUR_API_KEY" }) first.'
      );
    }
    const params = { prompt, aspect_ratio, guidance_scale };
    const cacheKey = getCacheKey(params);

    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (typeof cached === 'string') {
        return cached;
      } else {
        return await cached as string;
      }
    }

    const promise = (async () => {
      const response = await fetch(
        'https://api.fireworks.ai/inference/v1/image_generation/accounts/fireworks/models/SSD-1B',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'image/jpeg',
            Authorization: `Bearer ${API_KEY}`,
          },
          body: JSON.stringify(params),
        }
      );

      if (!response.ok) {
        cache.delete(cacheKey);
        throw new Error(`Request failed with status ${response.status}`);
      }

      const buffer = await response.arrayBuffer();
      const dataURL = 'data:image/jpeg;base64,' + arrayBufferToBase64(buffer);
      cache.set(cacheKey, dataURL);
      persistCache();
      return dataURL;
    })();

    cache.set(cacheKey, promise);
    return await promise;
  }

  function arrayBufferToBase64(buffer: ArrayBuffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  function clearCache() {
    cache.clear();
    localStorage.removeItem(localStorageKey);
  }

  return {
    init,
    generateImage,
    clearCache,
  };
})();

export default Lumenary;
