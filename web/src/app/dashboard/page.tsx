"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Users, CheckCircle, Play, Link2, Copy, Check, ExternalLink } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { MetricCard } from "@/components/dashboard/MetricCard";
import {
  MetricCardSkeleton,
  ChartSkeleton,
} from "@/components/dashboard/DashboardSkeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface DashboardMetrics {
  bookingsToday: number;
  monthRevenue: number;
  newClients: number;
  confirmationRate: number;
}

const defaultMetrics: DashboardMetrics = {
  bookingsToday: 0,
  monthRevenue: 0,
  newClients: 0,
  confirmationRate: 0,
};

export default function DashboardPage() {
  const user = useAuth((state) => state.user);
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<DashboardMetrics>(defaultMetrics);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const artistId = user?.id ?? "demo";
  const myLink = typeof window !== "undefined"
    ? `${window.location.origin}/t/${artistId}`
    : `/t/${artistId}`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(myLink);
    setCopied(true);
    toast({ title: "Link copiado!", description: "Compartilhe com seus clientes." });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenDemo = () => {
    window.open(`/t/${artistId}`, "_blank", "noopener,noreferrer");
  };
  const [revenueChartData, setRevenueChartData] = useState<
    Array<{ date: string; revenue: number }>
  >([]);
  const [bookingChartData, setBookingChartData] = useState<
    Array<{ name: string; value: number; fill: string }>
  >([]);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const [revenueRes, bookingsRes, clientsRes] = await Promise.all([
          api.get("/analytics/revenue").catch(() => ({ data: {} })),
          api.get("/analytics/bookings").catch(() => ({ data: {} })),
          api.get("/analytics/clients").catch(() => ({ data: {} })),
        ]);

        const bookingsData = bookingsRes.data;
        const revenueData = revenueRes.data;
        const clientsData = clientsRes.data;

        setMetrics({
          bookingsToday: bookingsData.total ?? 0,
          monthRevenue: revenueData.totalRevenue ?? 0,
          newClients: clientsData.newClients ?? 0,
          confirmationRate: bookingsData.conversionRate ?? 0,
        });

        // Process revenue chart data
        const revenueByDay = revenueData.revenueByDay || {};
        const chartData = Object.entries(revenueByDay)
          .map(([date, revenue]) => ({
            date: new Date(date).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
            }),
            revenue: revenue as number,
          }))
          .sort((a, b) => a.date.localeCompare(b.date));
        setRevenueChartData(chartData);

        // Process booking chart data
        const bookingStats = [
          {
            name: "Pendentes",
            value: bookingsData.pending ?? 0,
            fill: "#FBBF24",
          },
          {
            name: "Confirmados",
            value: bookingsData.confirmed ?? 0,
            fill: "#34D399",
          },
          {
            name: "Em Andamento",
            value: bookingsData.inProgress ?? 0,
            fill: "#38BDF8",
          },
          {
            name: "Concluidos",
            value: bookingsData.completed ?? 0,
            fill: "#34D399",
          },
          {
            name: "Cancelados",
            value: bookingsData.cancelled ?? 0,
            fill: "#EF4444",
          },
        ].filter((item) => item.value > 0);
        setBookingChartData(bookingStats);
      } catch (error) {
        console.error("Erro ao carregar metricas:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, []);

  const metricCards = [
    {
      title: "Agendamentos Hoje",
      value: String(metrics.bookingsToday),
      icon: Calendar,
    },
    {
      title: "Receita do Mes",
      value: `R$ ${metrics.monthRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
    },
    {
      title: "Clientes Novos",
      value: String(metrics.newClients),
      icon: Users,
    },
    {
      title: "Taxa de Confirmacao",
      value: `${metrics.confirmationRate}%`,
      icon: CheckCircle,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Visao geral do seu estudio"
      >
        <Button
          onClick={handleOpenDemo}
          variant="outline"
          className="font-mono uppercase tracking-wider border-primary text-primary hover:bg-primary hover:text-primary-foreground"
        >
          <Play className="mr-2 h-4 w-4" />
          Demo Fluxo Cliente
        </Button>
      </PageHeader>

      {/* Meu Link */}
      <Card className="border-primary/30 bg-primary/[0.02] mb-6">
        <CardContent className="py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <Link2 className="h-5 w-5 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Meu Link de Agendamento</p>
              <p className="text-sm font-medium truncate">{myLink}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="border-border font-mono uppercase tracking-wider"
            >
              {copied ? (
                <><Check className="h-4 w-4 mr-1" /> Copiado</>
              ) : (
                <><Copy className="h-4 w-4 mr-1" /> Copiar</>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenDemo}
              className="border-border font-mono uppercase tracking-wider"
            >
              <ExternalLink className="h-4 w-4 mr-1" /> Abrir
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <MetricCardSkeleton key={i} />
            ))
          : metricCards.map((card) => (
              <MetricCard
                key={card.title}
                title={card.title}
                value={card.value}
                icon={card.icon}
              />
            ))}
      </div>

      {/* Charts */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-sm">Receita Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              {revenueChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={256}>
                  <BarChart data={revenueChartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(0, 0%, 90%)"
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "hsl(0, 0%, 45%)", fontSize: 12 }}
                      axisLine={{ stroke: "hsl(0, 0%, 90%)" }}
                    />
                    <YAxis
                      tick={{ fill: "hsl(0, 0%, 45%)", fontSize: 12 }}
                      axisLine={{ stroke: "hsl(0, 0%, 90%)" }}
                      tickFormatter={(value) => `R$${value}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(0, 0%, 100%)",
                        border: "1px solid hsl(0, 0%, 90%)",
                        borderRadius: "2px",
                        color: "hsl(0, 0%, 10%)",
                      }}
                      formatter={(value) => [
                        `R$ ${Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
                        "Receita",
                      ]}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="hsl(340, 60%, 50%)"
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center border border-dashed border-muted-foreground/20 rounded-sm">
                  <p className="text-sm text-muted-foreground">
                    Sem dados de receita para o periodo
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-sm">
                Agendamentos por Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bookingChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={256}>
                  <PieChart>
                    <Pie
                      data={bookingChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {bookingChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(0, 0%, 100%)",
                        border: "1px solid hsl(0, 0%, 90%)",
                        borderRadius: "2px",
                        color: "hsl(0, 0%, 10%)",
                      }}
                    />
                    <Legend
                      formatter={(value) => (
                        <span
                          style={{
                            color: "hsl(0, 0%, 45%)",
                            fontSize: 12,
                          }}
                        >
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center border border-dashed border-muted-foreground/20 rounded-sm">
                  <p className="text-sm text-muted-foreground">
                    Sem dados de agendamentos
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
