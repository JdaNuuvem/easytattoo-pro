"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  studio: {
    name: string;
    address: string;
  } | null;
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
    label: "Concluido",
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

function BookingSkeleton() {
  return (
    <Card className="border-border bg-card animate-pulse">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-muted" />
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-3 bg-muted rounded w-1/2" />
            <div className="h-3 bg-muted rounded w-1/4" />
          </div>
          <div className="h-6 w-20 bg-muted rounded" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function MeusAgendamentosPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBookings() {
      try {
        const { data } = await api.get("/my-bookings");
        setBookings(data.bookings);
      } catch {
        // Error handled silently - empty state shown
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold font-mono uppercase tracking-wider text-primary">
          Meus Agendamentos
        </h2>
        <div className="space-y-4">
          <BookingSkeleton />
          <BookingSkeleton />
          <BookingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold font-mono uppercase tracking-wider text-primary">
        Meus Agendamentos
      </h2>

      {bookings.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="p-12 text-center">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-semibold mb-2">
              Voce ainda nao tem agendamentos
            </h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Para agendar uma tatuagem, acesse o link do seu tatuador
              preferido. O agendamento aparecera aqui automaticamente.
            </p>
          </CardContent>
        </Card>
      ) : (
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
                    {/* Artist avatar */}
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

                    {/* Booking info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">
                          {booking.user.name}
                        </h3>
                        {booking.user.instagram && (
                          <span className="text-xs text-muted-foreground">
                            @{booking.user.instagram}
                          </span>
                        )}
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
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "Aguardando agendamento"}
                          {booking.scheduledTime && ` as ${booking.scheduledTime}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">
                          R$ {booking.totalPrice.toFixed(2)}
                        </span>
                        <span className="text-xs">
                          {booking.depositPaid ? (
                            <span className="text-emerald-600">
                              Sinal pago
                            </span>
                          ) : (
                            <span className="text-amber-600">
                              Sinal pendente (R${" "}
                              {booking.depositAmount.toFixed(2)})
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Status badge */}
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
