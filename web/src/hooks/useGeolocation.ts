import { useState, useEffect } from "react";

interface GeoLocation {
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  country?: string;
}

export function useGeolocation() {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocalizacao nao suportada");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const geo: GeoLocation = { latitude, longitude };

        // Reverse geocode to get city/state
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=pt-BR`,
            { headers: { "User-Agent": "EasyTattooPro/1.0" } }
          );
          const data = await response.json();
          if (data.address) {
            geo.city = data.address.city || data.address.town || data.address.municipality || "";
            geo.state = data.address.state || "";
            geo.country = data.address.country || "";
          }
        } catch (geoError) {
          console.error("Reverse geocode failed:", geoError);
        }

        setLocation(geo);
        setLoading(false);
      },
      (positionError) => {
        setError(positionError.message);
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  return { location, loading, error };
}
