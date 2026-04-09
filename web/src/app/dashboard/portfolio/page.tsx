"use client";

import { useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/typography";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Image, Plus, Pencil, Trash2, Upload, Video, ChevronLeft, ChevronRight, Play, Star, MessageSquareQuote, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Card as CardUI, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { PortfolioGridSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { STYLE_CATEGORIES } from "@/lib/constants";

interface PortfolioItem {
  id: string;
  imageUrl: string;
  videoUrl?: string;
  images?: string[]; // Carousel images
  title: string;
  description: string;
  style: string;
  tags: string[];
  isPublic: boolean;
  order: number;
}

interface Testimonial {
  id: string;
  clientName: string;
  text: string;
  rating: number;
  videoUrl?: string;
  imageUrl?: string;
  isPublic: boolean;
  createdAt: string;
}

function StarRating({ rating, onChange }: { rating: number; onChange?: (r: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          disabled={!onChange}
          className={onChange ? "cursor-pointer" : "cursor-default"}
        >
          <Star
            className={`w-5 h-5 transition-colors ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-none text-muted-foreground/30"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function PortfolioPage() {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const carouselInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState<PortfolioItem | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [previewItem, setPreviewItem] = useState<PortfolioItem | null>(null);
  const [previewIndex, setPreviewIndex] = useState(0);
  const { toast } = useToast();

  // Upload form state
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadVideoFile, setUploadVideoFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadStyle, setUploadStyle] = useState("");
  const [uploadTags, setUploadTags] = useState("");
  const [uploading, setUploading] = useState(false);

  // Testimonials state
  const testimonialVideoRef = useRef<HTMLInputElement>(null);
  const testimonialImageRef = useRef<HTMLInputElement>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [testimonialOpen, setTestimonialOpen] = useState(false);
  const [editTestimonial, setEditTestimonial] = useState<Testimonial | null>(null);
  const [editTestimonialOpen, setEditTestimonialOpen] = useState(false);
  const [tClientName, setTClientName] = useState("");
  const [tText, setTText] = useState("");
  const [tRating, setTRating] = useState(5);
  const [tVideoFile, setTVideoFile] = useState<File | null>(null);
  const [tImageFile, setTImageFile] = useState<File | null>(null);
  const [tSaving, setTSaving] = useState(false);

  useEffect(() => {
    fetchPortfolio();
    fetchTestimonials();
  }, []);

  async function fetchPortfolio() {
    try {
      const response = await api.get("/portfolio/me");
      setItems(response.data);
    } catch (error) {
      console.error("Erro ao carregar portfolio:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload() {
    if (uploadFiles.length === 0) return;
    setUploading(true);

    try {
      // Upload all images
      const imageUrls: string[] = [];
      for (const file of uploadFiles) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadResponse = await api.post("/upload/image", formData);
        imageUrls.push(uploadResponse.data.url);
      }

      // Upload video if present
      let videoUrl: string | undefined;
      if (uploadVideoFile) {
        const videoFormData = new FormData();
        videoFormData.append("file", uploadVideoFile);
        const videoResponse = await api.post("/upload/image", videoFormData);
        videoUrl = videoResponse.data.url;
      }

      await api.post("/portfolio", {
        imageUrl: imageUrls[0],
        images: imageUrls,
        videoUrl,
        title: uploadTitle,
        description: uploadDescription,
        style: uploadStyle,
        tags: uploadTags.split(",").map((t) => t.trim()).filter(Boolean),
        isPublic: true,
      });

      toast({ title: "Sucesso", description: "Item adicionado ao portfolio" });
      setUploadOpen(false);
      resetUploadForm();
      fetchPortfolio();
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Erro ao fazer upload" });
    } finally {
      setUploading(false);
    }
  }

  function resetUploadForm() {
    setUploadFiles([]);
    setUploadVideoFile(null);
    setUploadTitle("");
    setUploadDescription("");
    setUploadStyle("");
    setUploadTags("");
  }

  // Testimonials functions
  async function fetchTestimonials() {
    try {
      const response = await api.get("/portfolio/testimonials/me");
      setTestimonials(response.data);
    } catch {
      // endpoint may not exist yet, use empty
    }
  }

  function resetTestimonialForm() {
    setTClientName("");
    setTText("");
    setTRating(5);
    setTVideoFile(null);
    setTImageFile(null);
  }

  async function handleSaveTestimonial() {
    if (!tClientName || !tText) return;
    setTSaving(true);
    try {
      let videoUrl: string | undefined;
      let imageUrl: string | undefined;

      if (tVideoFile) {
        const fd = new FormData();
        fd.append("file", tVideoFile);
        const res = await api.post("/upload/image", fd);
        videoUrl = res.data.url;
      }
      if (tImageFile) {
        const fd = new FormData();
        fd.append("file", tImageFile);
        const res = await api.post("/upload/image", fd);
        imageUrl = res.data.url;
      }

      await api.post("/portfolio/testimonials", {
        clientName: tClientName,
        text: tText,
        rating: tRating,
        videoUrl,
        imageUrl,
        isPublic: true,
      });

      toast({ title: "Depoimento adicionado" });
      setTestimonialOpen(false);
      resetTestimonialForm();
      fetchTestimonials();
    } catch {
      toast({ variant: "destructive", title: "Erro ao salvar depoimento" });
    } finally {
      setTSaving(false);
    }
  }

  async function handleDeleteTestimonial(id: string) {
    try {
      await api.delete(`/portfolio/testimonials/${id}`);
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
      toast({ title: "Depoimento removido" });
    } catch {
      toast({ variant: "destructive", title: "Erro ao remover" });
    }
  }

  async function handleToggleTestimonialPublic(id: string, isPublic: boolean) {
    try {
      await api.put(`/portfolio/testimonials/${id}`, { isPublic });
      setTestimonials((prev) => prev.map((t) => (t.id === id ? { ...t, isPublic } : t)));
    } catch {
      toast({ variant: "destructive", title: "Erro" });
    }
  }

  async function handleTogglePublic(id: string, isPublic: boolean) {
    try {
      await api.put(`/portfolio/${id}`, { isPublic });
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, isPublic } : item)));
    } catch (error) {
      toast({ variant: "destructive", title: "Erro" });
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/portfolio/${id}`);
      toast({ title: "Removido" });
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      toast({ variant: "destructive", title: "Erro" });
    }
  }

  async function handleSaveEdit() {
    if (!editItem) return;
    try {
      await api.put(`/portfolio/${editItem.id}`, {
        title: editItem.title,
        description: editItem.description,
        style: editItem.style,
        tags: editItem.tags,
      });
      toast({ title: "Salvo" });
      setEditOpen(false);
      fetchPortfolio();
    } catch (error) {
      toast({ variant: "destructive", title: "Erro" });
    }
  }

  const filteredItems = filterCategory === "all"
    ? items
    : items.filter((item) => item.style?.toLowerCase() === filterCategory.toLowerCase());

  const allCarouselImages = (item: PortfolioItem): string[] => {
    if (item.images && item.images.length > 0) return item.images;
    return [item.imageUrl];
  };

  const avgRating = testimonials.length > 0
    ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
    : null;

  return (
    <div>
      <PageHeader
        title="Portfolio"
        description="Gerencie suas fotos, videos e depoimentos"
      />

      <Tabs defaultValue="trabalhos" className="w-full mb-6">
        <TabsList className="grid grid-cols-2 w-full max-w-md bg-muted">
          <TabsTrigger value="trabalhos">Trabalhos</TabsTrigger>
          <TabsTrigger value="depoimentos">
            Depoimentos {testimonials.length > 0 && `(${testimonials.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trabalhos" className="mt-6">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setUploadOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Trabalho
            </Button>
          </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          type="button"
          onClick={() => setFilterCategory("all")}
          className={`px-3 py-1.5 rounded-sm text-xs font-medium transition-colors border ${
            filterCategory === "all"
              ? "bg-primary/10 text-primary border-primary/30"
              : "bg-card text-muted-foreground border-border hover:border-primary/30"
          }`}
        >
          Todos ({items.length})
        </button>
        {STYLE_CATEGORIES.filter((cat) =>
          items.some((item) => item.style?.toLowerCase() === cat.toLowerCase())
        ).map((cat) => {
          const count = items.filter((i) => i.style?.toLowerCase() === cat.toLowerCase()).length;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-sm text-xs font-medium transition-colors border ${
                filterCategory === cat
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-card text-muted-foreground border-border hover:border-primary/30"
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Portfolio Grid */}
      {loading ? (
        <PortfolioGridSkeleton />
      ) : filteredItems.length === 0 ? (
        <Card className="border-dashed border-border">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Image className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Nenhuma imagem no portfolio</p>
            <Button onClick={() => setUploadOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeira Imagem
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            const images = allCarouselImages(item);
            const hasMultiple = images.length > 1;
            const hasVideo = !!item.videoUrl;

            return (
              <Card key={item.id} className="border-border overflow-hidden group hover:border-primary/30 transition-colors">
                <div
                  className="aspect-square bg-muted relative cursor-pointer"
                  onClick={() => {
                    setPreviewItem(item);
                    setPreviewIndex(0);
                  }}
                >
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />

                  {/* Carousel indicator */}
                  {hasMultiple && (
                    <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-sm font-mono">
                      1/{images.length}
                    </div>
                  )}

                  {/* Video indicator */}
                  {hasVideo && (
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white rounded-full p-1.5">
                      <Play className="w-3 h-3" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); setEditItem(item); setEditOpen(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/20" onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium truncate">{item.title || "Sem titulo"}</p>
                    <Switch checked={item.isPublic} onCheckedChange={(checked) => handleTogglePublic(item.id, checked)} className="scale-75" />
                  </div>
                  {item.style && (
                    <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                      {item.style}
                    </Badge>
                  )}
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.tags.map((tag) => (
                        <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-muted rounded-sm text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

        </TabsContent>

        <TabsContent value="depoimentos" className="mt-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {avgRating && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-400/10 border border-yellow-400/20 rounded-sm">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-bold text-yellow-600">{avgRating}</span>
                  <span className="text-xs text-muted-foreground">({testimonials.length} avaliacoes)</span>
                </div>
              )}
            </div>
            <Button onClick={() => setTestimonialOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Depoimento
            </Button>
          </div>

          {testimonials.length === 0 ? (
            <Card className="border-dashed border-border">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <MessageSquareQuote className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Nenhum depoimento adicionado</p>
                <Button onClick={() => setTestimonialOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Depoimento
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testimonials.map((t) => (
                <Card key={t.id} className="border-border">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {t.imageUrl ? (
                          <img src={t.imageUrl} alt={t.clientName} className="w-10 h-10 rounded-full object-cover border border-border" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border border-border">
                            <User className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium">{t.clientName}</p>
                          <StarRating rating={t.rating} />
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Switch
                          checked={t.isPublic}
                          onCheckedChange={(checked) => handleToggleTestimonialPublic(t.id, checked)}
                          className="scale-75"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteTestimonial(t.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground italic">&ldquo;{t.text}&rdquo;</p>

                    {t.videoUrl && (
                      <div className="rounded-sm overflow-hidden border border-border">
                        <video src={t.videoUrl} controls className="w-full max-h-48 object-cover" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Carousel Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setPreviewItem(null)}>
          <div className="relative max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            {/* Close */}
            <button type="button" className="absolute -top-10 right-0 text-white/70 hover:text-white text-sm" onClick={() => setPreviewItem(null)}>
              Fechar
            </button>

            {/* Image/Video */}
            {previewItem.videoUrl && previewIndex === allCarouselImages(previewItem).length ? (
              <video src={previewItem.videoUrl} controls className="w-full max-h-[70vh] rounded-sm" />
            ) : (
              <img
                src={allCarouselImages(previewItem)[previewIndex]}
                alt={`${previewItem.title} ${previewIndex + 1}`}
                className="w-full max-h-[70vh] object-contain rounded-sm"
              />
            )}

            {/* Navigation arrows */}
            {(allCarouselImages(previewItem).length > 1 || previewItem.videoUrl) && (
              <>
                <button
                  type="button"
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70"
                  onClick={() => {
                    const total = allCarouselImages(previewItem).length + (previewItem.videoUrl ? 1 : 0);
                    setPreviewIndex((prev) => (prev - 1 + total) % total);
                  }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70"
                  onClick={() => {
                    const total = allCarouselImages(previewItem).length + (previewItem.videoUrl ? 1 : 0);
                    setPreviewIndex((prev) => (prev + 1) % total);
                  }}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-4">
              {allCarouselImages(previewItem).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`w-2 h-2 rounded-full transition-colors ${i === previewIndex ? "bg-primary" : "bg-white/30"}`}
                  onClick={() => setPreviewIndex(i)}
                />
              ))}
              {previewItem.videoUrl && (
                <button
                  type="button"
                  className={`w-2 h-2 rounded-full transition-colors ${previewIndex === allCarouselImages(previewItem).length ? "bg-primary" : "bg-white/30"}`}
                  onClick={() => setPreviewIndex(allCarouselImages(previewItem).length)}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Adicionar ao Portfolio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {/* Multiple Images Upload */}
            <div>
              <Label>Imagens (carrossel - ate 10)</Label>
              <div className="mt-1 border-2 border-dashed border-border rounded-sm p-4">
                <input
                  ref={carouselInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setUploadFiles((prev) => [...prev, ...files].slice(0, 10));
                  }}
                  className="hidden"
                />
                {uploadFiles.length > 0 ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-4 gap-2">
                      {uploadFiles.map((file, i) => (
                        <div key={i} className="relative aspect-square rounded-sm overflow-hidden bg-muted">
                          <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setUploadFiles((prev) => prev.filter((_, idx) => idx !== i))}
                            className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white text-xs"
                          >
                            x
                          </button>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => carouselInputRef.current?.click()}>
                      <Plus className="w-3 h-3 mr-1" />
                      Mais fotos ({uploadFiles.length}/10)
                    </Button>
                  </div>
                ) : (
                  <button type="button" onClick={() => carouselInputRef.current?.click()} className="cursor-pointer flex flex-col items-center gap-2 w-full py-4">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Clique para selecionar imagens</span>
                  </button>
                )}
              </div>
            </div>

            {/* Video Upload */}
            <div>
              <Label>Video (opcional - 1 video)</Label>
              <div className="mt-1 border-2 border-dashed border-border rounded-sm p-4">
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={(e) => setUploadVideoFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <button type="button" onClick={() => videoInputRef.current?.click()} className="cursor-pointer flex items-center gap-2 w-full">
                  <Video className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {uploadVideoFile ? uploadVideoFile.name : "Adicionar video"}
                  </span>
                </button>
              </div>
            </div>

            <div>
              <Label>Titulo</Label>
              <Input value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} className="bg-background border-border" placeholder="Nome do trabalho" />
            </div>
            <div>
              <Label>Descricao</Label>
              <Input value={uploadDescription} onChange={(e) => setUploadDescription(e.target.value)} className="bg-background border-border" placeholder="Descricao breve" />
            </div>

            {/* Style Category Selector */}
            <div>
              <Label>Categoria/Estilo</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {STYLE_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setUploadStyle(cat)}
                    className={`px-3 py-1.5 rounded-sm text-xs font-medium transition-colors border ${
                      uploadStyle === cat
                        ? "bg-primary/10 text-primary border-primary/30"
                        : "bg-card text-muted-foreground border-border hover:border-primary/30"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Tags (separadas por virgula)</Label>
              <Input value={uploadTags} onChange={(e) => setUploadTags(e.target.value)} className="bg-background border-border" placeholder="Ex: braco, geometrico, mandala" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadOpen(false)}>Cancelar</Button>
            <Button onClick={handleUpload} disabled={uploadFiles.length === 0 || uploading} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {uploading ? "Enviando..." : "Enviar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Testimonial Dialog */}
      <Dialog open={testimonialOpen} onOpenChange={setTestimonialOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Adicionar Depoimento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <div>
              <Label>Nome do Cliente</Label>
              <Input
                value={tClientName}
                onChange={(e) => setTClientName(e.target.value)}
                className="bg-background border-border"
                placeholder="Nome do cliente"
              />
            </div>
            <div>
              <Label>Avaliacao</Label>
              <div className="mt-1">
                <StarRating rating={tRating} onChange={setTRating} />
              </div>
            </div>
            <div>
              <Label>Depoimento</Label>
              <Textarea
                value={tText}
                onChange={(e) => setTText(e.target.value)}
                className="bg-background border-border min-h-[100px]"
                placeholder="O que o cliente disse sobre o trabalho..."
              />
            </div>
            <div>
              <Label>Foto do Cliente (opcional)</Label>
              <div className="mt-1 border-2 border-dashed border-border rounded-sm p-3">
                <input
                  ref={testimonialImageRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setTImageFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <button type="button" onClick={() => testimonialImageRef.current?.click()} className="cursor-pointer flex items-center gap-2 w-full">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {tImageFile ? tImageFile.name : "Adicionar foto do cliente"}
                  </span>
                </button>
              </div>
            </div>
            <div>
              <Label>Video do Depoimento (opcional)</Label>
              <div className="mt-1 border-2 border-dashed border-border rounded-sm p-3">
                <input
                  ref={testimonialVideoRef}
                  type="file"
                  accept="video/*"
                  onChange={(e) => setTVideoFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <button type="button" onClick={() => testimonialVideoRef.current?.click()} className="cursor-pointer flex items-center gap-2 w-full">
                  <Video className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {tVideoFile ? tVideoFile.name : "Adicionar video do depoimento"}
                  </span>
                </button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setTestimonialOpen(false); resetTestimonialForm(); }}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveTestimonial}
              disabled={!tClientName || !tText || tSaving}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {tSaving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Item</DialogTitle>
          </DialogHeader>
          {editItem && (
            <div className="space-y-4">
              <div>
                <Label>Titulo</Label>
                <Input value={editItem.title} onChange={(e) => setEditItem({ ...editItem, title: e.target.value })} className="bg-background border-border" />
              </div>
              <div>
                <Label>Descricao</Label>
                <Input value={editItem.description} onChange={(e) => setEditItem({ ...editItem, description: e.target.value })} className="bg-background border-border" />
              </div>
              <div>
                <Label>Categoria/Estilo</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {STYLE_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setEditItem({ ...editItem, style: cat })}
                      className={`px-3 py-1.5 rounded-sm text-xs font-medium transition-colors border ${
                        editItem.style === cat
                          ? "bg-primary/10 text-primary border-primary/30"
                          : "bg-card text-muted-foreground border-border hover:border-primary/30"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Tags (separadas por virgula)</Label>
                <Input
                  value={editItem.tags.join(", ")}
                  onChange={(e) => setEditItem({ ...editItem, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })}
                  className="bg-background border-border"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveEdit} className="bg-primary text-primary-foreground hover:bg-primary/90">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
