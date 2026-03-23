"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/typography";
import { useBookingStore } from "@/stores/booking";
import { useBookingNavigation } from "@/hooks/useBookingNavigation";
import { formatPrice } from "@/components/booking/pricing/calculator";
import { api } from "@/lib/api";
import {
  CheckCircle,
  DollarSign,
  Loader2,
  Copy,
  Clock,
  MessageCircle,
} from "lucide-react";

const DEFAULT_DEPOSIT = 50;

type PaymentStatus = "pending" | "generating" | "awaiting" | "confirmed" | "error";

interface AsaasPaymentData {
  id: string;
  pixQrCode: string;
  pixCopyPaste: string;
  dueDate: string;
  value: number;
}

export function Payment() {
  const router = useRouter();
  const {
    priceCalculation,
    pricingConfig,
    updatePayment,
    artistInfo,
    personalInfo,
  } = useBookingStore();
  const { goToPreviousStep } = useBookingNavigation();
  const depositAmount = pricingConfig?.fixedDeposit ?? DEFAULT_DEPOSIT;

  const [status, setStatus] = useState<PaymentStatus>("pending");
  const [paymentData, setPaymentData] = useState<AsaasPaymentData | null>(null);
  const [copied, setCopied] = useState(false);
  const [pollingInterval, setPollingIntervalState] = useState<NodeJS.Timeout | null>(null);

  const checkPaymentStatus = useCallback(async (paymentId: string) => {
    try {
      const { data } = await api.get(`/payments/${paymentId}/status`);
      if (data.status === "RECEIVED" || data.status === "CONFIRMED") {
        setStatus("confirmed");
        updatePayment({ proofOfPayment: `asaas:${paymentId}` });
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
    }
  }, [updatePayment]);

  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const generateAsaasPayment = async () => {
    setStatus("generating");
    try {
      const { data } = await api.post("/payments/pix", {
        customerName: `${personalInfo.firstName} ${personalInfo.lastName}`,
        customerEmail: personalInfo.email,
        customerPhone: personalInfo.phone,
        value: depositAmount,
        description: `Sinal tatuagem - ${artistInfo?.name || "EasyTattoo"}`,
        artistId: artistInfo?.id,
      });

      setPaymentData({
        id: data.id,
        pixQrCode: data.pixQrCode || data.encodedImage || "",
        pixCopyPaste: data.pixCopyPaste || data.payload || "",
        dueDate: data.dueDate,
        value: depositAmount,
      });
      setStatus("awaiting");

      // Start polling for payment confirmation
      const interval = setInterval(() => {
        checkPaymentStatus(data.id);
      }, 10000); // Check every 10s
      setPollingIntervalState(interval);
    } catch (error) {
      console.error("Failed to generate Asaas payment:", error);
      setStatus("error");
    }
  };

  const copyPixCode = async () => {
    if (!paymentData?.pixCopyPaste) return;
    try {
      await navigator.clipboard.writeText(paymentData.pixCopyPaste);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  if (!priceCalculation || !pricingConfig) {
    return (
      <div className="space-y-4">
        <Text className="text-foreground">
          Nao foi possivel calcular o preco. Por favor, volte e preencha todos
          os detalhes da tatuagem.
        </Text>
        <Button variant="outline" onClick={() => goToPreviousStep()}>
          Voltar
        </Button>
      </div>
    );
  }

  // Payment confirmed - show artist contact
  if (status === "confirmed") {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h3 className="text-xl font-mono uppercase tracking-wider text-foreground">
            Pagamento Confirmado!
          </h3>
          <Text className="text-muted-foreground">
            Seu sinal de {formatPrice(depositAmount)} foi confirmado com sucesso.
          </Text>
        </div>

        {/* Artist contact - revealed after payment */}
        <Card className="p-6 space-y-4 border-primary/30 bg-primary/5">
          <h4 className="font-mono uppercase tracking-wider font-semibold text-primary text-sm flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Contato do Tatuador
          </h4>
          <Text className="text-sm text-muted-foreground">
            Agora que seu pagamento foi confirmado, entre em contato com o tatuador
            para alinhar os detalhes da sua sessao:
          </Text>

          <div className="space-y-3">
            {artistInfo?.name && (
              <div className="flex items-center gap-3 p-3 rounded-sm bg-card border border-border">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-lg text-primary font-mono">
                    {artistInfo.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <Text className="text-sm font-medium text-foreground">
                    {artistInfo.name}
                  </Text>
                  <Text className="text-xs text-muted-foreground">
                    Seu tatuador(a)
                  </Text>
                </div>
              </div>
            )}

            {artistInfo?.phone && (
              <a
                href={`https://wa.me/${artistInfo.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                  `Oi! Fiz o agendamento pelo EasyTattoo e ja paguei o sinal. Meu nome e ${personalInfo.firstName} ${personalInfo.lastName}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-sm bg-emerald-100 border border-emerald-300 hover:bg-emerald-50 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <Text className="text-sm text-emerald-600 font-medium">
                  Abrir WhatsApp do Tatuador
                </Text>
              </a>
            )}
          </div>
        </Card>

        <Card className="p-6 space-y-2 border-border bg-card">
          <h4 className="font-mono uppercase tracking-wider font-semibold text-primary text-sm">
            Resumo
          </h4>
          <div className="flex justify-between">
            <Text className="text-muted-foreground">Valor total estimado</Text>
            <Text className="text-foreground font-mono">
              {formatPrice(priceCalculation.totalPrice)}
            </Text>
          </div>
          <div className="flex justify-between">
            <Text className="text-muted-foreground">Sinal pago</Text>
            <Text className="text-emerald-600 font-mono font-semibold">
              {formatPrice(depositAmount)}
            </Text>
          </div>
          <div className="flex justify-between border-t border-border pt-2">
            <Text className="text-muted-foreground">Restante</Text>
            <Text className="text-foreground font-mono">
              {formatPrice(priceCalculation.totalPrice - depositAmount)}
            </Text>
          </div>
        </Card>

        <Button
          className="w-full"
          onClick={() => {
            const id = artistInfo?.id || "";
            router.push(`/t/${id}/confirmacao`);
          }}
        >
          Ver confirmacao completa
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="p-6 space-y-4 border-border bg-card">
        <h3 className="font-mono uppercase tracking-wider font-semibold text-primary flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Resumo do Pagamento
        </h3>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Text className="text-muted-foreground">Valor base</Text>
            <Text className="text-foreground">
              {formatPrice(priceCalculation.basePrice)}
            </Text>
          </div>

          {priceCalculation.locationPrice > 0 && (
            <div className="flex justify-between">
              <Text className="text-muted-foreground">
                Adicional por local
              </Text>
              <Text className="text-foreground">
                +{formatPrice(priceCalculation.locationPrice)}
              </Text>
            </div>
          )}

          {priceCalculation.colorPrice > 0 && (
            <div className="flex justify-between">
              <Text className="text-muted-foreground">
                Adicional por cores
              </Text>
              <Text className="text-foreground">
                +{formatPrice(priceCalculation.colorPrice)}
              </Text>
            </div>
          )}

          {priceCalculation.shadingPrice > 0 && (
            <div className="flex justify-between">
              <Text className="text-muted-foreground">
                Adicional por sombreamento
              </Text>
              <Text className="text-foreground">
                +{formatPrice(priceCalculation.shadingPrice)}
              </Text>
            </div>
          )}

          <div className="pt-2 border-t border-border">
            <div className="flex justify-between font-semibold">
              <Text className="text-foreground font-mono uppercase tracking-wider">
                Total Estimado
              </Text>
              <Text className="text-primary font-mono text-lg">
                {formatPrice(priceCalculation.totalPrice)}
              </Text>
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <div className="flex justify-between text-sm">
              <Text className="text-muted-foreground">
                Sinal (valor fixo)
              </Text>
              <Text className="text-primary font-semibold font-mono text-lg">
                {formatPrice(depositAmount)}
              </Text>
            </div>
            <Text className="text-xs text-muted-foreground mt-1">
              O restante ({formatPrice(priceCalculation.totalPrice - depositAmount)}) sera
              combinado diretamente com o tatuador.
            </Text>
          </div>
        </div>
      </Card>

      {/* Payment Generation */}
      {status === "pending" && (
        <div className="space-y-4">
          <Text className="text-foreground">
            Para confirmar seu horario, pague o sinal de {formatPrice(depositAmount)} via PIX.
            Apos o pagamento, o contato do tatuador sera liberado.
          </Text>

          <Button
            className="w-full"
            onClick={generateAsaasPayment}
          >
            Gerar PIX - {formatPrice(depositAmount)}
          </Button>
        </div>
      )}

      {/* Generating */}
      {status === "generating" && (
        <div className="flex flex-col items-center justify-center py-8 gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <Text className="text-muted-foreground">Gerando cobranca PIX...</Text>
        </div>
      )}

      {/* Awaiting Payment */}
      {status === "awaiting" && paymentData && (
        <Card className="p-6 space-y-4 border-border bg-card">
          <h4 className="font-mono uppercase tracking-wider font-semibold text-primary text-sm">
            Pague via PIX
          </h4>

          {/* QR Code */}
          {paymentData.pixQrCode && (
            <div className="flex justify-center p-4 bg-white rounded-sm">
              <img
                src={`data:image/png;base64,${paymentData.pixQrCode}`}
                alt="QR Code PIX"
                className="w-48 h-48"
              />
            </div>
          )}

          {/* Copy paste code */}
          {paymentData.pixCopyPaste && (
            <div className="space-y-2">
              <Text className="text-xs text-muted-foreground font-mono uppercase">
                Ou copie o codigo PIX:
              </Text>
              <div className="flex gap-2">
                <div className="flex-1 p-3 bg-muted rounded-sm text-xs font-mono text-muted-foreground break-all max-h-20 overflow-y-auto">
                  {paymentData.pixCopyPaste}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={copyPixCode}
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 p-3 rounded-sm bg-yellow-500/5 border border-yellow-500/20">
            <Clock className="w-4 h-4 text-yellow-500 shrink-0" />
            <Text className="text-xs text-muted-foreground">
              Aguardando confirmacao do pagamento... A pagina sera atualizada automaticamente.
            </Text>
          </div>

          <Text className="text-primary font-semibold text-center font-mono">
            {formatPrice(depositAmount)}
          </Text>
        </Card>
      )}

      {/* Error */}
      {status === "error" && (
        <Card className="p-6 space-y-4 border-destructive/30 bg-destructive/5">
          <Text className="text-sm text-foreground">
            Nao foi possivel gerar a cobranca PIX. Tente novamente ou entre em contato com o suporte.
          </Text>
          <Button onClick={generateAsaasPayment} variant="outline">
            Tentar novamente
          </Button>
        </Card>
      )}

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (pollingInterval) clearInterval(pollingInterval);
            goToPreviousStep();
          }}
        >
          Voltar
        </Button>
      </div>
    </div>
  );
}
