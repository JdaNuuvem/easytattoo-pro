"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/typography";
import { Textarea } from "@/components/ui/textarea";
import { useBookingStore } from "@/stores/booking";
import { useBookingNavigation } from "@/hooks/useBookingNavigation";
import { api } from "@/lib/api";
import { Upload, X, Info } from "lucide-react";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const referencesSchema = z.object({
  references: z
    .array(z.instanceof(File))
    .max(3, "Maximo de 3 imagens")
    .refine((files) => files.every((file) => file.size <= MAX_FILE_SIZE), {
      message: "Tamanho maximo de 5MB por imagem",
    })
    .refine(
      (files) =>
        files.every((file) => ACCEPTED_IMAGE_TYPES.includes(file.type)),
      {
        message: "Somente imagens JPG, PNG ou WebP",
      }
    ),
  description: z
    .string()
    .min(5, "Descreva com mais detalhes as alteracoes desejadas"),
});

type ReferencesFormData = z.infer<typeof referencesSchema>;

export function References() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { tattooDetails, updateTattooDetails } = useBookingStore();
  const { goToNextStep, goToPreviousStep } = useBookingNavigation();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ReferencesFormData>({
    resolver: zodResolver(referencesSchema),
    defaultValues: {
      references: [],
    },
  });

  const onSubmit = async (data: ReferencesFormData) => {
    try {
      const uploadedUrls = await Promise.all(
        data.references.map(async (file) => {
          try {
            const formData = new FormData();
            formData.append("file", file);
            const { data: uploadResult } = await api.post(
              "/upload/reference",
              formData
            );
            return uploadResult.url || uploadResult.path;
          } catch (error) {
            console.error("Upload failed, using local URL:", error);
            return URL.createObjectURL(file);
          }
        })
      );

      updateTattooDetails({
        references: uploadedUrls,
        description: data.description,
      });
      goToNextStep();
    } catch (error) {
      console.error("Error uploading references:", error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;
    const newFiles = Array.from(fileList);
    setSelectedFiles((prev) => {
      const combined = [...prev, ...newFiles].slice(0, 3);
      setValue("references", combined);
      return combined;
    });
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      setValue("references", updated);
      return updated;
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <Text className="text-muted-foreground">
        Envie imagens de referencia do desenho que quer tatuar.
      </Text>

      {/* Photo tip */}
      <div className="flex items-start gap-2 text-xs text-amber-400/80 bg-amber-400/5 border border-amber-400/20 rounded-md px-3 py-2">
        <span className="shrink-0 mt-0.5">📸</span>
        <span>
          Caso você tenha tattoos próximas ao local escolhido, anexe uma foto da área. Se possível, faça um círculo imaginando o tamanho que você quer.
        </span>
      </div>

      {/* Important notice */}
      <div className="rounded-lg p-4 glass-card border border-primary/20 space-y-2">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Info className="w-4 h-4 text-primary" />
          </div>
          <div className="space-y-1">
            <Text className="text-sm font-semibold text-foreground">
              Informação importante
            </Text>
            <Text className="text-sm text-muted-foreground leading-relaxed">
              Não é obrigatório enviar as 3 imagens. Envie quantas referências achar necessário.
              Este orçamento é para <strong className="text-foreground">1 tatuagem apenas</strong>. Caso deseje mais de uma tatuagem,
              faça um novo orçamento para cada uma.
            </Text>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-foreground">Imagens de Referencia</Label>
          <Text className="text-xs text-muted-foreground font-mono">
            {selectedFiles.length}/3
          </Text>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ACCEPTED_IMAGE_TYPES.join(",")}
            onChange={handleFileChange}
            className="hidden"
          />
          <AnimatePresence>
            {selectedFiles.length < 3 && (
              <motion.button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-all duration-300 bg-card/50 hover:bg-primary/[0.03] group"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <div className="w-10 h-10 rounded-xl bg-muted group-hover:bg-primary/15 flex items-center justify-center transition-colors duration-300">
                    <Upload className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                  </div>
                  <Text className="text-xs text-muted-foreground text-center px-2">
                    Adicionar foto
                  </Text>
                </div>
              </motion.button>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {selectedFiles.map((file, index) => (
              <motion.div
                key={`${file.name}-${index}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="aspect-square rounded-lg bg-card border border-border overflow-hidden relative group"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Referencia ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-1.5 right-1.5 w-7 h-7 bg-background/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-destructive hover:text-destructive-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {errors.references && (
          <p className="text-sm text-destructive">
            {errors.references.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-foreground">
          Descricao das Alteracoes
        </Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Descreva com detalhes as alteracoes que deseja fazer no seu desenho para que ele fique o mais exclusivo possivel..."
          rows={4}
          className="bg-card/50 border-border focus-visible:ring-primary backdrop-blur-sm"
        />
        {errors.description && (
          <p className="text-sm text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={goToPreviousStep}>
          Voltar
        </Button>
        <Button type="submit" className="flex-1">
          Continuar
        </Button>
      </div>
    </form>
  );
}
