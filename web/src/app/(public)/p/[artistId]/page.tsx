"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Instagram, Calendar, Image, X, Star } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  client: { firstName: string };
  booking: { tattooType: string; bodyLocation: string };
}

interface ArtistProfile {
  id: string;
  name: string;
  bio: string;
  instagram: string;
  profilePhoto: string;
  averageRating: number;
  totalReviews: number;
}

interface PortfolioItem {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  style: string;
  tags: string[];
}

export default function PublicPortfolioPage() {
  const params = useParams();
  const artistId = params.artistId as string;

  const [artist, setArtist] = useState<ArtistProfile | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<PortfolioItem | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const [profileRes, portfolioRes, reviewsRes] = await Promise.all([
          api.get(`/users/${artistId}/profile`),
          api.get(`/portfolio/${artistId}`),
          api.get(`/reviews/artist/${artistId}`),
        ]);
        setArtist(profileRes.data);
        setPortfolio(portfolioRes.data);
        setReviews(reviewsRes.data.reviews || []);
        setTotalReviews(reviewsRes.data.totalReviews || 0);
      } catch (error) {
        console.error("Erro ao carregar portfolio:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [artistId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="text-primary font-mono uppercase tracking-widest animate-pulse">
          Carregando...
        </span>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-mono uppercase tracking-wider text-foreground mb-2">
            Artista nao encontrado
          </h1>
          <p className="text-muted-foreground mb-6">
            O portfolio que voce esta procurando nao existe
          </p>
          <Link href="/">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Voltar ao inicio
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Artist Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="h-24 w-24 rounded-sm bg-muted overflow-hidden border border-border shrink-0">
              {artist.profilePhoto ? (
                <img
                  src={artist.profilePhoto}
                  alt={artist.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-3xl font-mono text-muted-foreground">
                    {artist.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="text-center sm:text-left flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-mono uppercase tracking-wider font-bold text-foreground">
                  {artist.name}
                </h1>
                {artist.totalReviews > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                    <span className="text-sm font-semibold text-foreground">
                      {artist.averageRating}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ({artist.totalReviews})
                    </span>
                  </div>
                )}
              </div>
              {artist.bio && (
                <p className="text-muted-foreground mt-1 max-w-md">
                  {artist.bio}
                </p>
              )}
              {artist.instagram && (
                <a
                  href={`https://instagram.com/${artist.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 mt-2 transition-colors"
                >
                  <Instagram className="h-4 w-4" />
                  {artist.instagram}
                </a>
              )}
            </div>
            <div className="shrink-0">
              <Link href={`/t/${artistId}`}>
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono uppercase tracking-wider glow-gold"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Agendar Tatuagem
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Portfolio Grid */}
      <main className="container mx-auto px-4 py-8">
        {portfolio.length === 0 ? (
          <div className="text-center py-20">
            <Image className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-mono uppercase tracking-wider text-foreground mb-2">
              Portfolio em construcao
            </h2>
            <p className="text-muted-foreground">
              Este artista ainda nao adicionou trabalhos ao portfolio
            </p>
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
            {portfolio.map((item) => (
              <Card
                key={item.id}
                className="border-border bg-card overflow-hidden break-inside-avoid cursor-pointer group hover:border-primary/30 transition-colors"
                onClick={() => setSelectedImage(item)}
              >
                <div className="relative">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end">
                    <div className="p-3 opacity-0 group-hover:opacity-100 transition-opacity w-full">
                      {item.title && (
                        <p className="text-sm font-medium text-white">
                          {item.title}
                        </p>
                      )}
                      {item.style && (
                        <p className="text-xs text-white/70">{item.style}</p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <section className="container mx-auto px-4 py-8 border-t border-border">
          <h2 className="text-xl font-mono uppercase tracking-wider font-bold text-foreground mb-6">
            Avaliacoes ({totalReviews})
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {reviews.map((review) => (
              <Card key={review.id} className="border-border bg-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i <= review.rating
                              ? "text-amber-400 fill-amber-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {review.client.firstName}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-foreground">{review.comment}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(review.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 sm:hidden bg-card border-t border-border p-4">
        <Link href={`/t/${artistId}`}>
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-mono uppercase tracking-wider">
            <Calendar className="h-4 w-4 mr-2" />
            Agendar Tatuagem
          </Button>
        </Link>
      </div>

      {/* Image Lightbox */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent className="max-w-3xl p-0 bg-transparent border-none">
          {selectedImage && (
            <div className="relative">
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.title}
                className="w-full h-auto rounded-sm"
              />
              {(selectedImage.title || selectedImage.description) && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-sm">
                  {selectedImage.title && (
                    <h3 className="text-lg font-mono uppercase tracking-wider text-white font-semibold">
                      {selectedImage.title}
                    </h3>
                  )}
                  {selectedImage.description && (
                    <p className="text-sm text-white/70 mt-1">
                      {selectedImage.description}
                    </p>
                  )}
                  {selectedImage.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedImage.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-1.5 py-0.5 bg-white/20 rounded-sm text-white/80"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
