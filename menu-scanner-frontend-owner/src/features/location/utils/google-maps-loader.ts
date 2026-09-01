let gmapLoadPromise: Promise<void> | null = null;

export function loadGoogleMapsScript(): Promise<void> {
  if (gmapLoadPromise) return gmapLoadPromise;
  gmapLoadPromise = new Promise<void>((resolve, reject) => {
    if (typeof window !== "undefined" && window.google?.maps?.Map) {
      resolve();
      return;
    }
    const existing = document.querySelector(
      'script[src*="maps.googleapis.com"]'
    ) as HTMLScriptElement | null;
    if (existing) {
      const id = setInterval(() => {
        if (window.google?.maps?.Map) {
          clearInterval(id);
          resolve();
        }
      }, 100);
      setTimeout(() => {
        clearInterval(id);
        if (window.google?.maps?.Map) resolve();
        else reject(new Error("Timeout"));
      }, 10000);
      return;
    }
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      reject(new Error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not configured"));
      return;
    }
    const callbackName = "__googleMapsReady";
    (window as unknown as Record<string, unknown>)[callbackName] = () => {
      delete (window as unknown as Record<string, unknown>)[callbackName];
      resolve();
    };
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async&callback=${callbackName}`;
    script.async = true;
    script.onerror = () => {
      gmapLoadPromise = null;
      reject(new Error("Failed to load Google Maps"));
    };
    document.head.appendChild(script);
  });
  gmapLoadPromise.catch(() => {
    gmapLoadPromise = null;
  });
  return gmapLoadPromise;
}
