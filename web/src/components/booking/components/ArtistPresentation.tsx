"use client";

import { useEffect, useState } from "react";
import { Text } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { useBookingNavigation } from "@/hooks/useBookingNavigation";
import { useBookingStore } from "@/stores/booking";
import { api } from "@/lib/api";

interface ArtistPresentationProps {
  artistId?: string;
}

interface ArtistData {
  id: string;
  name: string;
  profileImage: string;
  bio: string;
  styles: string[];
  portfolio: string[];
  phone?: string;
  pixKey?: string;
  pixName?: string;
  pixBank?: string;
  acceptsCompanion?: boolean;
  maxCompanions?: number;
  paymentMethods?: string[];
  studios?: Array<{ id: string; name: string; address?: string }>;
}

const STYLE_IMAGES: Record<string, string> = {
  fineline: "/images/styles/fineline.jpg",
  blackwork: "/images/styles/blackwork.jpg",
  realismo: "/images/styles/realismo.jpg",
  realism: "/images/styles/realismo.jpg",
  traditional: "/images/styles/traditional.jpg",
  watercolor: "/images/styles/watercolor.jpg",
  cobertura: "/images/styles/cobertura.jpg",
  "old school": "/images/styles/oldschool.jpg",
  "new school": "/images/styles/newschool.jpg",
  geometrico: "/images/styles/geometrico.jpg",
  pontilhismo: "/images/styles/pontilhismo.jpg",
  tribal: "/images/styles/tribal.jpg",
  lettering: "/images/styles/lettering.jpg",
  minimalista: "/images/styles/minimalista.jpg",
  oriental: "/images/styles/oriental.jpg",
  aquarela: "/images/styles/watercolor.jpg",
};

function getStyleImage(style: string): string {
  const key = style.toLowerCase().trim();
  return STYLE_IMAGES[key] || "/images/styles/default.jpg";
}

export function ArtistPresentation({ artistId }: ArtistPresentationProps) {
  const { goToNextStep } = useBookingNavigation();
  const { updateArtistInfo, updatePricingConfig } = useBookingStore();
  const [artist, setArtist] = useState<ArtistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArtist() {
      if (!artistId) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get(`/users/${artistId}/public`);
        setArtist({
          id: data.id,
          name: data.name || data.firstName + " " + data.lastName,
          profileImage: data.profileImage || "",
          bio: data.bio || "Tatuador profissional",
          styles: data.styles || [],
          portfolio: data.portfolio || [],
          phone: data.phone || undefined,
          pixKey: data.pixKey || undefined,
          pixName: data.pixName || undefined,
          pixBank: data.pixBank || undefined,
          acceptsCompanion: data.acceptsCompanion ?? true,
          maxCompanions: data.maxCompanions ?? 1,
          paymentMethods: data.paymentMethods || [],
          studios: data.studios || [],
        });

        // Fetch artist's pricing config
        try {
          const { data: pricingData } = await api.get(`/pricing/${artistId}`);
          if (pricingData) {
            updatePricingConfig(pricingData);
          }
        } catch {
          // Use default pricing config
        }
      } catch (error) {
        setArtist({
          id: artistId,
          name: "",
          profileImage: "",
          bio: "",
          styles: [],
          portfolio: [],
        });
      } finally {
        setLoading(false);
      }
    }

    fetchArtist();
  }, [artistId]);

  const handleContinue = () => {
    updateArtistInfo({
      id: artist?.id ?? artistId ?? "default",
      name: artist?.name ?? "Tatuador",
      photo: artist?.profileImage ?? "",
      description: artist?.bio ?? "",
      styles: artist?.styles ?? [],
      portfolio: artist?.portfolio ?? [],
      phone: artist?.phone,
      pixKey: artist?.pixKey,
      pixName: artist?.pixName,
      pixBank: artist?.pixBank,
      acceptsCompanion: artist?.acceptsCompanion,
      maxCompanions: artist?.maxCompanions,
      paymentMethods: artist?.paymentMethods,
      studios: artist?.studios,
    });
    goToNextStep();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse space-y-6 w-full max-w-md">
          <div className="w-48 h-48 mx-auto rounded-full bg-muted" />
          <div className="h-6 bg-muted rounded w-3/4 mx-auto" />
          <div className="h-4 bg-muted rounded w-full" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 bg-muted rounded-sm" />
            <div className="h-16 bg-muted rounded-sm" />
          </div>
        </div>
      </div>
    );
  }

  if (!artist?.name) {
    return (
      <div className="space-y-6 text-center py-12">
        <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center">
          <span className="text-3xl text-muted-foreground">?</span>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-mono uppercase tracking-wider text-foreground">
            Tatuador não encontrado
          </h2>
          <Text className="text-muted-foreground">
            Não foi possível carregar as informações deste tatuador.
            Verifique se o link está correto.
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Artist Photo */}
      <div className="aspect-square w-48 mx-auto overflow-hidden rounded-full border-2 border-primary/30">
        {artist?.profileImage ? (
          <img
            src={artist.profileImage}
            alt={artist.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-4xl text-muted-foreground">
              {artist?.name?.charAt(0) || "T"}
            </span>
          </div>
        )}
      </div>

      {/* Artist Info */}
      <div className="space-y-4 text-center">
        <h2 className="text-2xl font-mono uppercase tracking-wider text-primary">
          {artist?.name || "Tatuador"}
        </h2>
        <Text className="text-muted-foreground max-w-lg mx-auto">
          {artist?.bio || "Tatuador profissional"}
        </Text>
      </div>

      {/* Styles with Photos */}
      {artist?.styles && artist.styles.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground text-center">
            Estilos
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {artist.styles.map((style) => (
              <div
                key={style}
                className="relative overflow-hidden border border-border rounded-sm bg-card hover:border-primary/50 transition-colors group"
              >
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <img
                    src={getStyleImage(style)}
                    alt={`Estilo ${style}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent) {
                        parent.classList.add("flex", "items-center", "justify-center");
                        const fallback = document.createElement("span");
                        fallback.className = "text-2xl text-muted-foreground";
                        fallback.textContent = style.charAt(0).toUpperCase();
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                </div>
                <div className="p-3 text-center">
                  <Text className="text-sm font-medium text-foreground">
                    {style}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feed / Portfolio Gallery */}
      {artist?.portfolio && artist.portfolio.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground text-center">
            Feed - Trabalhos Recentes
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {artist.portfolio.map((image, i) => (
              <button
                key={i}
                type="button"
                className="aspect-square overflow-hidden rounded-sm bg-muted border border-border hover:border-primary/50 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
                onClick={() => setSelectedImage(image)}
              >
                <img
                  src={image}
                  alt={`Trabalho ${i + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </button>
            ))}
          </div>
          {artist.portfolio.length > 9 && (
            <Text className="text-xs text-muted-foreground text-center">
              Mostrando {Math.min(artist.portfolio.length, 9)} de {artist.portfolio.length} trabalhos
            </Text>
          )}
        </div>
      )}

      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-lg w-full max-h-[80vh]">
            <img
              src={selectedImage}
              alt="Trabalho ampliado"
              className="w-full h-full object-contain rounded-sm"
            />
            <button
              type="button"
              className="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              X
            </button>
          </div>
        </div>
      )}

      <Button variant="default" className="w-full" onClick={handleContinue}>
        Fazer um orçamento
      </Button>
    </div>
  );
}
