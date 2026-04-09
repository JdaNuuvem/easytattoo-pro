"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MetricCard } from "@/components/dashboard/MetricCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
} from "lucide-react";
import api from "@/lib/api";

interface RevenueData {
  month: string;
  revenue: number;
}

interface BookingStats {
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}

interface PopularTimesData {
  byHour: Record<string, number>;
  byDayOfWeek: Array<{ day: number; name: string; count: number }>;
}

interface ClientStatsData {
  totalClientsEver: number;
  clientsInPeriod: number;
  newClients: number;
  returningClients: number;
  returnRate: number;
}

interface AnalyticsData {
  revenue: RevenueData[];
  bookingStats: BookingStats;
  totalRevenue: number;
  totalBookings: number;
  totalClients: number;
  averageTicket: number;
  popularTimes: PopularTimesData | null;
  clientStats: ClientStatsData | null;
}

const defaultAnalytics: AnalyticsData = {
  revenue: [],
  bookingStats: { pending: 0, confirmed: 0, completed: 0, cancelled: 0 },
  totalRevenue: 0,
  totalBookings: 0,
  totalClients: 0,
  averageTicket: 0,
  popularTimes: null,
  clientStats: null,
};

const periodMap: Record<string, string> = {
  "7": "week",
  "30": "month",
  "90": "quarter",
  "365": "year",
};

export default function RelatoriosPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData>(defaultAnalytics);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30");

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  async function fetchAnalytics() {
    try {
      setLoading(true);
      const apiPeriod = periodMap[period] || "month";
      const [revenueRes, bookingsRes, clientsRes, popularTimesRes] =
        await Promise.all([
          api.get("/analytics/revenue", { params: { period: apiPeriod } }),
          api.get("/analytics/bookings", { params: { period: apiPeriod } }),
          api.get("/analytics/clients", { params: { period: apiPeriod } }),
          api.get("/analytics/popular-times"),
        ]);

      const revenueData = revenueRes.data;
      const bookingsData = bookingsRes.data;
      const clientsData = clientsRes.data;
      const popularTimesData = popularTimesRes.data;

      // Convert revenueByDay to revenue array
      const revenueEntries = Object.entries(revenueData.revenueByDay || {}).map(
        ([date, revenue]) => ({
          month: new Date(date).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
          }),
          revenue: revenue as number,
        })
      );

      setAnalytics({
        revenue: revenueEntries,
        bookingStats: {
          pending: bookingsData.pending ?? 0,
          confirmed: bookingsData.confirmed ?? 0,
          completed: bookingsData.completed ?? 0,
          cancelled: bookingsData.cancelled ?? 0,
        },
        totalRevenue: revenueData.totalRevenue ?? 0,
        totalBookings: bookingsData.total ?? 0,
        totalClients: clientsData.totalClientsEver ?? 0,
        averageTicket: revenueData.averageTicket ?? 0,
        popularTimes: popularTimesData ?? null,
        clientStats: clientsData ?? null,
      });
    } catch (error) {
      console.error("Erro ao carregar relatorios:", error);
    } finally {
      setLoading(false);
    }
  }

  const summaryCards = [
    {
      title: "Receita Total",
      value: `R$ ${analytics.totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
    },
    {
      title: "Total de Agendamentos",
      value: String(analytics.totalBookings),
      icon: Calendar,
    },
    {
      title: "Total de Clientes",
      value: String(analytics.totalClients),
      icon: Users,
    },
    {
      title: "Ticket Medio",
      value: `R$ ${analytics.averageTicket.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Relatorios"
        description="Analise o desempenho do seu estudio"
      >
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40 bg-background border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Ultimos 7 dias</SelectItem>
            <SelectItem value="30">Ultimos 30 dias</SelectItem>
            <SelectItem value="90">Ultimos 90 dias</SelectItem>
            <SelectItem value="365">Ultimo ano</SelectItem>
          </SelectContent>
        </Select>
      </PageHeader>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {summaryCards.map((card) => (
          <MetricCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            loading={loading}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-sm">Receita Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.revenue.length > 0 ? (
              <div className="space-y-3">
                {analytics.revenue.map((item) => {
                  const maxRevenue = Math.max(
                    ...analytics.revenue.map((r) => r.revenue),
                    1
                  );
                  const width = (item.revenue / maxRevenue) * 100;

                  return (
                    <div key={item.month} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.month}
                        </span>
                        <span className="font-medium">
                          R${" "}
                          {item.revenue.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center border border-dashed border-border rounded-sm">
                <p className="text-sm text-muted-foreground">
                  Sem dados de receita para o periodo
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Popular Times by Day of Week */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-sm">Horarios Populares por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.popularTimes?.byDayOfWeek &&
            analytics.popularTimes.byDayOfWeek.some((d) => d.count > 0) ? (
              <div className="space-y-3">
                {analytics.popularTimes.byDayOfWeek.map((day) => {
                  const maxCount = Math.max(
                    ...analytics.popularTimes!.byDayOfWeek.map((d) => d.count),
                    1
                  );
                  const width = (day.count / maxCount) * 100;
                  const dayNamesPtBr: Record<string, string> = {
                    Sunday: "Domingo",
                    Monday: "Segunda",
                    Tuesday: "Terca",
                    Wednesday: "Quarta",
                    Thursday: "Quinta",
                    Friday: "Sexta",
                    Saturday: "Sabado",
                  };
                  return (
                    <div key={day.day} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {dayNamesPtBr[day.name] || day.name}
                        </span>
                        <span className="font-medium">
                          {day.count} agendamento{day.count !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center border border-dashed border-border rounded-sm">
                <p className="text-sm text-muted-foreground">
                  Sem dados de horarios populares
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Client Stats */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-sm">Estatisticas de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.clientStats ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-sm bg-muted/50 border border-border">
                    <p className="text-xs text-muted-foreground">
                      Clientes no Periodo
                    </p>
                    <p className="text-xl font-bold">
                      {analytics.clientStats.clientsInPeriod}
                    </p>
                  </div>
                  <div className="p-3 rounded-sm bg-muted/50 border border-border">
                    <p className="text-xs text-muted-foreground">
                      Total Historico
                    </p>
                    <p className="text-xl font-bold">
                      {analytics.clientStats.totalClientsEver}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    {
                      label: "Novos Clientes",
                      value: analytics.clientStats.newClients,
                      color: "bg-emerald-400",
                    },
                    {
                      label: "Clientes Retornando",
                      value: analytics.clientStats.returningClients,
                      color: "bg-primary",
                    },
                  ].map((stat) => {
                    const total = analytics.clientStats!.clientsInPeriod || 1;
                    const percentage = (stat.value / total) * 100;
                    return (
                      <div key={stat.label} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {stat.label}
                          </span>
                          <span className="font-medium">
                            {stat.value} ({percentage.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${stat.color} rounded-full transition-all`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="p-3 rounded-sm bg-muted/50 border border-border">
                  <p className="text-xs text-muted-foreground">
                    Taxa de Retorno
                  </p>
                  <p className="text-xl font-bold">
                    {analytics.clientStats.returnRate}%
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center border border-dashed border-border rounded-sm">
                <p className="text-sm text-muted-foreground">
                  Sem dados de clientes para o periodo
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
