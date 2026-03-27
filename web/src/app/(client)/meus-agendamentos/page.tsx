"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/typography";
import { Search, Calendar, Loader2 } from "lucide-react";

interface Booking {
  id: string;
  status: string;
  tattooType: string;
  bodyLocation: string;
  scheduledDate: string | null;
  scheduledTime: string | null;
  totalPrice: number;
  depositAmount: number;
  depositPaid: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string;
    profilePhoto: string | null;
    instagram: string | null;
  };
}

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: {
    label: "Pendente",
    className: "bg-amber-100 text-amber-600 border-amber-300",
  },
  CONFIRMED: {
    label: "Confirmado",
    className: "bg-emerald-100 text-emerald-600 border-emerald-300",
  },
  IN_PROGRESS: {
    label: "Em Andamento",
    className: "bg-sky-100 text-sky-600 border-sky-300",
  },
  COMPLETED: {
    label: "Concluído",
    className: "bg-emerald-100 text-emerald-600 border-emerald-300",
  },
  CANCELLED: {
    label: "Cancelado",
    className: "bg-destructive/20 text-destructive border-destructive/30",
  },
};

const tattooTypeLabels: Record<string, string> = {
  DRAWING: "Desenho",
  TEXT: "Texto/Escrita",
  CLOSURE: "Fechamento",
};

export default function MeusAgendamentosPage() {
  const [phone, setPhone] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (phone.length < 10) return;
    setLoading(true);
    setSearched(false);
    try {
      const { data } = await api.get(`/my-bookings/by-phone`, {
        params: { phone: phone.replace(/\D/g, "") },
      });
      setBookings(Array.isArray(data) ? data : data.bookings || []);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold font-mono uppercase tracking-wider text-primary">
          Consultar Agendamentos
        </h2>
        <Text className="text-muted-foreground">
          Digite seu telefone para consultar seus agendamentos
        </Text>
      </div>

      <Card className="border-border bg-card max-w-md mx-auto">
        <CardContent className="p-6 space-y-4">
          <div>
            <Label>Telefone (WhatsApp)</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(11) 99999-9999"
              className="bg-background border-border"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Button
            className="w-full"
            onClick={handleSearch}
            disabled={loading || phone.length < 10}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Search className="w-4 h-4 mr-2" />
            )}
            Consultar
          </Button>
        </CardContent>
      </Card>

      {searched && bookings.length === 0 && (
        <Card className="border-border bg-card max-w-md mx-auto">
          <CardContent className="p-12 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Nenhum agendamento encontrado
            </h3>
            <Text className="text-muted-foreground text-sm">
              Não encontramos agendamentos para este telefone.
              Verifique o número e tente novamente.
            </Text>
          </CardContent>
        </Card>
      )}

      {bookings.length > 0 && (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const status = statusConfig[booking.status] || statusConfig.PENDING;

            return (
              <Card
                key={booking.id}
                className="border-border bg-card hover:border-primary/30 transition-colors"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                      {booking.user.profilePhoto ? (
                        <img
                          src={booking.user.profilePhoto}
                          alt={booking.user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-bold text-muted-foreground">
                          {booking.user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">
                          {booking.user.name}
                        </h3>
                      </div>

                      <p className="text-sm text-muted-foreground">
                        {tattooTypeLabels[booking.tattooType] || booking.tattooType}
                        {" · "}
                        {booking.bodyLocation}
                      </p>

                      <div className="flex items-center gap-3 mt-2 text-sm">
                        <span className="text-muted-foreground">
                          {booking.scheduledDate
                            ? new Date(booking.scheduledDate).toLocaleDateString(
                                "pt-BR",
                                { day: "2-digit", month: "short", year: "numeric" }
                              )
                            : "Aguardando agendamento"}
                          {booking.scheduledTime && ` às ${booking.scheduledTime}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">
                          R$ {booking.totalPrice.toFixed(2)}
                        </span>
                        <span className="text-xs">
                          {booking.depositPaid ? (
                            <span className="text-emerald-600">Sinal pago</span>
                          ) : (
                            <span className="text-amber-600">
                              Sinal pendente (R$ {booking.depositAmount.toFixed(2)})
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    <Badge
                      variant="outline"
                      className={`flex-shrink-0 ${status.className}`}
                    >
                      {status.label}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
