"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/typography";
import { useRouter } from "next/navigation";
import { useBookingStore } from "@/stores/booking";
import api from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { formatPrice } from "@/components/booking/pricing/calculator";
import { CheckCircle, Loader2, MessageCircle } from "lucide-react";

const toBackendEnum: Record<string, string> = {
  drawing: "DRAWING",
  text: "TEXT",
  none: "NONE",
  light: "LIGHT",
  medium: "MEDIUM",
  realism: "REALISM",
  black: "BLACK",
  oneColor: "ONE_COLOR",
  twoColors: "TWO_COLORS",
  threeColors: "THREE_COLORS",
  "mini-pack": "MINI_PACK",
  "second-tattoo": "SECOND_TATTOO",
  closure: "CLOSURE",
};

function mapEnum(value: string | undefined): string {
  if (!value) return "NONE";
  return toBackendEnum[value] || value.toUpperCase();
}

interface BookingConfirmationProps {
  artistId: string;
}

export function BookingConfirmation({ artistId }: BookingConfirmationProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const {
    personalInfo,
    tattooDetails,
    companion,
    promotion,
    scheduling,
    payment,
    artistInfo,
    priceCalculation,
    pricingConfig,
    geolocation,
  } = useBookingStore();

  const handleSubmitBooking = async () => {
    setSubmitting(true);
    try {
      // Demo mode - simulate booking success
      if ((artistInfo?.id || artistId) === "demo") {
        await new Promise((r) => setTimeout(r, 1000));
        setSubmitted(true);
        toast({
          title: "Demo - Agendamento simulado!",
          description: "Em um agendamento real, o booking seria criado e o tatuador notificado.",
        });
        setSubmitting(false);
        return;
      }

      const validReferences = tattooDetails.references.filter(
        (r) => !r.startsWith("blob:")
      );

      const bookingData: Record<string, unknown> = {
        userId: artistInfo?.id || artistId,
        firstName: personalInfo.firstName,
        lastName: personalInfo.lastName,
        phone: personalInfo.phone,
        tattooType: mapEnum(tattooDetails.type),
        tattooWidth: tattooDetails.size.width,
        tattooHeight: tattooDetails.size.height,
        shadingType: mapEnum(tattooDetails.shading),
        colorType: mapEnum(tattooDetails.colors),
        bodyLocation: tattooDetails.bodyLocation,
        hasCompanion: companion.hasCompanion,
        companionPurpose: companion.companionPurpose || null,
        promotion: mapEnum(promotion.type),
      };

      if (personalInfo.email) bookingData.email = personalInfo.email;
      if (personalInfo.instagram) bookingData.instagram = personalInfo.instagram;
      if (geolocation) {
        bookingData.latitude = geolocation.latitude;
        bookingData.longitude = geolocation.longitude;
        bookingData.city = geolocation.city;
        bookingData.state = geolocation.state;
      }
      if (tattooDetails.description) bookingData.description = tattooDetails.description;
      if (scheduling.date) bookingData.scheduledDate = scheduling.date;
      if (scheduling.time) bookingData.scheduledTime = scheduling.time;
      if (validReferences.length > 0) bookingData.referenceImages = validReferences;

      const { data: bookingResult } = await api.post("/bookings", bookingData);

      // Send WhatsApp confirmation via Evolution API
      try {
        await api.post("/notifications/whatsapp/booking-confirmation", {
          bookingId: bookingResult.id,
          clientPhone: personalInfo.phone,
          clientName: `${personalInfo.firstName} ${personalInfo.lastName}`,
          artistId: artistInfo?.id || artistId,
          scheduledDate: scheduling.date,
          scheduledTime: scheduling.time,
          tattooType: tattooDetails.type,
          bodyLocation: tattooDetails.bodyLocation,
        });
      } catch (whatsappError) {
        console.error("WhatsApp notification failed:", whatsappError);
        // Non-blocking - booking still succeeds
      }

      setSubmitted(true);
      toast({
        title: "Agendamento realizado com sucesso!",
        description:
          "Você receberá uma confirmação via WhatsApp com os detalhes do seu agendamento.",
      });
    } catch (error: unknown) {
      console.error("Error creating booking:", error);
      const axiosError = error as { response?: { data?: { message?: string | string[] } } };
      const errorMessage = axiosError.response?.data?.message;
      const description = Array.isArray(errorMessage)
        ? errorMessage.join(", ")
        : errorMessage || "Ocorreu um erro ao criar o agendamento. Tente novamente.";

      toast({
        variant: "destructive",
        title: "Erro ao agendar",
        description,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!submitted) {
    return (
      <div className="container max-w-2xl mx-auto px-4">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-primary">
              Confirmar Agendamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-border">
                <Text className="text-muted-foreground">Nome</Text>
                <Text className="text-foreground">
                  {personalInfo.firstName} {personalInfo.lastName}
                </Text>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <Text className="text-muted-foreground">Telefone</Text>
                <Text className="text-foreground">{personalInfo.phone}</Text>
              </div>
              {personalInfo.email && (
                <div className="flex justify-between py-2 border-b border-border">
                  <Text className="text-muted-foreground">Email</Text>
                  <Text className="text-foreground">{personalInfo.email}</Text>
                </div>
              )}
              <div className="flex justify-between py-2 border-b border-border">
                <Text className="text-muted-foreground">Tipo</Text>
                <Text className="text-foreground capitalize">
                  {tattooDetails.type || "-"}
                </Text>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <Text className="text-muted-foreground">Tamanho</Text>
                <Text className="text-foreground">
                  {tattooDetails.size.width}x{tattooDetails.size.height}cm
                </Text>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <Text className="text-muted-foreground">Local</Text>
                <Text className="text-foreground capitalize">
                  {tattooDetails.bodyLocation || "-"}
                </Text>
              </div>
              {companion.hasCompanion && (
                <div className="flex justify-between py-2 border-b border-border">
                  <Text className="text-muted-foreground">Acompanhante</Text>
                  <Text className="text-foreground">
                    {companion.companionPurpose === "will-tattoo"
                      ? "Sim - vai tatuar"
                      : "Sim - apenas acompanhar"}
                  </Text>
                </div>
              )}
              <div className="flex justify-between py-2 border-b border-border">
                <Text className="text-muted-foreground">Data</Text>
                <Text className="text-foreground">
                  {scheduling.date || "-"}
                </Text>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <Text className="text-muted-foreground">Horario</Text>
                <Text className="text-foreground">
                  {scheduling.time || "-"}
                </Text>
              </div>
              {priceCalculation && (
                <div className="flex justify-between py-2 border-b border-border">
                  <Text className="text-muted-foreground">Valor Total</Text>
                  <Text className="text-primary font-semibold font-mono">
                    {formatPrice(priceCalculation.totalPrice)}
                  </Text>
                </div>
              )}
            </div>

            {/* WhatsApp notice */}
            <div className="flex items-start gap-3 p-3 rounded-sm bg-emerald-50 border border-emerald-300">
              <MessageCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <Text className="text-xs text-muted-foreground">
                Ao confirmar, você receberá uma mensagem via WhatsApp com todos os detalhes
                do agendamento e o contato do tatuador.
              </Text>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => router.back()}
                disabled={submitting}
              >
                Voltar
              </Button>
              <Button
                onClick={handleSubmitBooking}
                disabled={submitting}
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando...
                  </span>
                ) : (
                  "Confirmar Agendamento"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto px-4">
      <Card className="border-border bg-card">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <CheckCircle className="w-16 h-16 text-emerald-600" />
          </div>
          <CardTitle className="text-primary">
            Agendamento Confirmado!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <Text className="text-muted-foreground">
            Seu agendamento foi confirmado com sucesso. Você receberá uma
            mensagem via WhatsApp com todos os detalhes.
          </Text>

          <div className="p-4 rounded-sm bg-emerald-50 border border-emerald-300">
            <div className="flex items-center justify-center gap-2 mb-2">
              <MessageCircle className="w-5 h-5 text-emerald-600" />
              <Text className="text-sm font-medium text-emerald-600">
                Confirmação enviada via WhatsApp
              </Text>
            </div>
            <Text className="text-xs text-muted-foreground">
              Verifique seu WhatsApp ({personalInfo.phone}) para os detalhes completos.
            </Text>
          </div>

          <div className="flex justify-center space-x-4 pt-4">
            <Button
              variant="outline"
              onClick={() => router.push(`/t/${artistId}`)}
            >
              Novo Agendamento
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
