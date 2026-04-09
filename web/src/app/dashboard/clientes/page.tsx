"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Users, Search, Instagram } from "lucide-react";
import api from "@/lib/api";
import { TableSkeleton } from "@/components/dashboard/DashboardSkeleton";
import {
  BOOKING_STATUS_LABELS as statusLabels,
  BOOKING_STATUS_COLORS as statusColors,
} from "@/lib/constants";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  instagram: string | null;
  bookings: Array<{
    id: string;
    status: string;
    totalPrice: number;
    scheduledDate: string | null;
    createdAt: string;
  }>;
  _count: { bookings: number };
}

interface ClientDetails {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  instagram: string | null;
  _count: { bookings: number };
  bookingsHistory: Array<{
    id: string;
    status: string;
    totalPrice: number;
    scheduledDate: string | null;
    description: string | null;
    bodyLocation: string;
  }>;
}

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<ClientDetails | null>(
    null
  );
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    fetchClients();
  }, [search]);

  async function fetchClients() {
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      const response = await api.get("/clients", { params });
      const result = response.data;
      setClients(Array.isArray(result) ? result : result.data || []);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleViewClient(clientId: string) {
    try {
      const [clientRes, bookingsRes] = await Promise.all([
        api.get(`/clients/${clientId}`),
        api.get(`/clients/${clientId}/bookings`),
      ]);
      setSelectedClient({
        ...clientRes.data,
        bookingsHistory: bookingsRes.data,
      });
      setDetailsOpen(true);
    } catch (error) {
      console.error("Erro ao carregar detalhes do cliente:", error);
    }
  }

  return (
    <div>
      <PageHeader title="Clientes" description="Gerencie seus clientes" />

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background border-border"
          />
        </div>
      </div>

      {/* Clients Table */}
      <Card className="border-border">
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[650px]">
            <TableHeader>
              <TableRow className="border-border">
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Instagram</TableHead>
                <TableHead>Agendamentos</TableHead>
                <TableHead>Ultimo Agendamento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="p-0">
                    <TableSkeleton rows={5} cols={6} />
                  </TableCell>
                </TableRow>
              ) : clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Nenhum cliente encontrado
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((client) => {
                  const lastBookingDate =
                    client.bookings?.[0]?.scheduledDate ||
                    client.bookings?.[0]?.createdAt ||
                    null;

                  return (
                    <TableRow
                      key={client.id}
                      className="border-border cursor-pointer hover:bg-muted/30"
                      onClick={() => handleViewClient(client.id)}
                    >
                      <TableCell className="font-medium">
                        {`${client.firstName} ${client.lastName}`}
                      </TableCell>
                      <TableCell>{client.phone}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {client.email}
                      </TableCell>
                      <TableCell>
                        {client.instagram && (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Instagram className="h-3 w-3" />
                            {client.instagram}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-primary font-medium">
                          {client._count.bookings}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {lastBookingDate
                          ? new Date(lastBookingDate).toLocaleDateString(
                              "pt-BR"
                            )
                          : "-"}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Client Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedClient
                ? `${selectedClient.firstName} ${selectedClient.lastName}`
                : ""}
            </DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium">{selectedClient.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedClient.email || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Instagram</p>
                  <p className="font-medium">
                    {selectedClient.instagram || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total de Agendamentos
                  </p>
                  <p className="font-medium text-primary">
                    {selectedClient._count.bookings}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-mono uppercase tracking-wider text-sm mb-3">
                  Historico
                </h4>
                <div className="space-y-2">
                  {selectedClient.bookingsHistory?.length > 0 ? (
                    selectedClient.bookingsHistory.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-3 rounded-sm bg-muted/50 border border-border"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            {booking.description || booking.bodyLocation}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {booking.scheduledDate
                              ? new Date(
                                  booking.scheduledDate
                                ).toLocaleDateString("pt-BR")
                              : "-"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            R${" "}
                            {booking.totalPrice.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </p>
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${statusColors[booking.status] || ""}`}
                          >
                            {statusLabels[booking.status] || booking.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Nenhum agendamento registrado
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
