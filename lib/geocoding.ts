/**
 * Client-side geocoding helper for recipient addresses.
 */

export interface GeocodeResult {
  latitude: number;
  longitude: number;
}

const loadGoogleMaps = (): Promise<void> => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Geocoding is only available in the browser'));
  }

  if (window.google?.maps?.Geocoder) {
    return Promise.resolve();
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  if (!apiKey) {
    return Promise.reject(new Error('Google Maps API key is not configured'));
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-parcego-google-maps]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Maps')));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.dataset.parcegoGoogleMaps = 'true';
    script.addEventListener('load', () => resolve());
    script.addEventListener('error', () => reject(new Error('Failed to load Google Maps')));
    document.head.appendChild(script);
  });
};

export const geocodeAddress = async (address: string): Promise<GeocodeResult | null> => {
  try {
    await loadGoogleMaps();
    const geocoder = new window.google.maps.Geocoder();

    return await new Promise((resolve) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status !== 'OK' || !results?.[0]?.geometry?.location) {
          resolve(null);
          return;
        }

        const location = results[0].geometry.location;
        resolve({
          latitude: location.lat(),
          longitude: location.lng(),
        });
      });
    });
  } catch {
    return null;
  }
};

export const buildFullAddress = (parts: {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country?: string;
}): string => {
  return [
    parts.street,
    parts.city,
    parts.province,
    parts.postalCode,
    parts.country || 'Canada',
  ]
    .filter(Boolean)
    .join(', ');
};
