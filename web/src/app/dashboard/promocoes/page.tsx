"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Text } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/PageHeader";
import {
  Gift,
  Plus,
  Trash2,
  Upload,
  X,
  GripVertical,
  Image as ImageIcon,
} from "lucide-react";

interface Promotion {
  id: string;
  title: string;
  description: string;
  discount: string;
  imageUrl: string;
  enabled: boolean;
}

const defaultPromotions: Promotion[] = [
  {
    id: "mini-pack",
    title: "Pack Mini Tattoos",
    description:
      "Faça até 2 mini tattoos (tamanho até 6x6 cm) no mesmo dia por um preço promocional",
    discount: "2 por 1",
    imageUrl: "",
    enabled: true,
  },
  {
    id: "second-tattoo",
    title: "Pack Segunda Tattoo",
    description:
      "Em tatuagens maiores de 6x6 cm feitas no mesmo dia, a segunda tem 20% de desconto",
    discount: "20% off",
    imageUrl: "",
    enabled: true,
  },
];

export default function PromocoesPage() {
  const [promotions, setPromotions] = useState<Promotion[]>(defaultPromotions);
  const [saving, setSaving] = useState(false);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const addPromotion = () => {
    const newPromo: Promotion = {
      id: `promo-${Date.now()}`,
      title: "",
      description: "",
      discount: "",
      imageUrl: "",
      enabled: true,
    };
    setPromotions((prev) => [...prev, newPromo]);
  };

  const removePromotion = (id: string) => {
    setPromotions((prev) => prev.filter((p) => p.id !== id));
  };

  const updatePromotion = (
    id: string,
    field: keyof Promotion,
    value: string | boolean
  ) => {
    setPromotions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleImageUpload = (
    id: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    updatePromotion(id, "imageUrl", url);
  };

  const removeImage = (id: string) => {
    updatePromotion(id, "imageUrl", "");
  };

  const handleSave = async () => {
    setSaving(true);
    // TODO: integrar com API para salvar promoções
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSaving(false);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Promoções"
        description="Configure promoções especiais para seus clientes"
      />

      <div className="space-y-4">
        {promotions.map((promo) => (
          <Card
            key={promo.id}
            className={`p-5 space-y-4 transition-all ${
              promo.enabled
                ? "border-primary/20 bg-card"
                : "border-border bg-card opacity-60"
            }`}
          >
            {/* Header: toggle + delete */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GripVertical className="w-4 h-4 text-muted-foreground" />
                <Switch
                  checked={promo.enabled}
                  onCheckedChange={(val) =>
                    updatePromotion(promo.id, "enabled", val)
                  }
                />
                <span className="text-sm font-mono uppercase tracking-wider font-semibold text-foreground">
                  {promo.title || "Nova Promoção"}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => removePromotion(promo.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-4">
              {/* Form fields */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Título da promoção
                  </Label>
                  <Input
                    value={promo.title}
                    onChange={(e) =>
                      updatePromotion(promo.id, "title", e.target.value)
                    }
                    placeholder="Ex: Pack Mini Tattoos"
                    className="bg-background border-border"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Descrição
                  </Label>
                  <Textarea
                    value={promo.description}
                    onChange={(e) =>
                      updatePromotion(promo.id, "description", e.target.value)
                    }
                    placeholder="Descreva os detalhes da promoção..."
                    rows={2}
                    className="bg-background border-border resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Desconto / Condição
                  </Label>
                  <Input
                    value={promo.discount}
                    onChange={(e) =>
                      updatePromotion(promo.id, "discount", e.target.value)
                    }
                    placeholder="Ex: 20% off, 2 por 1, R$50 desconto"
                    className="bg-background border-border"
                  />
                </div>
              </div>

              {/* Image upload */}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Foto de exemplo
                </Label>
                <input
                  ref={(el) => {
                    fileInputRefs.current[promo.id] = el;
                  }}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleImageUpload(promo.id, e)}
                  className="hidden"
                />

                {promo.imageUrl ? (
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-border group">
                    <img
                      src={promo.imageUrl}
                      alt={promo.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20"
                        onClick={() =>
                          fileInputRefs.current[promo.id]?.click()
                        }
                      >
                        <Upload className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-destructive/60"
                        onClick={() => removeImage(promo.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRefs.current[promo.id]?.click()}
                    className="w-full aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary/40 bg-muted/20 flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Adicionar foto
                    </span>
                  </button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add new promotion */}
      <Button
        variant="outline"
        className="w-full border-dashed"
        onClick={addPromotion}
      >
        <Plus className="w-4 h-4 mr-2" />
        Adicionar Promoção
      </Button>

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          <Gift className="w-4 h-4 mr-2" />
          {saving ? "Salvando..." : "Salvar Promoções"}
        </Button>
      </div>
    </div>
  );
}
