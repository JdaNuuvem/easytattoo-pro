"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/typography";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Download,
  Users,
  MapPin,
  Palette,
  Mail,
  Target,
  Crown,
  ShoppingCart,
  MessageCircle,
  Instagram,
  Lock,
  Zap,
  Check,
} from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  instagram: string;
  city: string;
  state: string;
  tattooStyle: string;
  bodyLocation: string;
  createdAt: string;
}

interface LeadStats {
  totalLeads: number;
  leadsThisMonth: number;
  topStyles: Array<{ style: string; count: number }>;
  topLocations: Array<{ city: string; count: number }>;
}

type SubscriptionPlan = "free" | "basic" | "pro";

const PLANS = [
  {
    id: "free" as const,
    name: "Gratuito",
    price: "R$ 0",
    period: "",
    features: ["Até 10 leads/mês", "Visualizar nome e cidade"],
    leadsLimit: 10,
    showContacts: false,
  },
  {
    id: "basic" as const,
    name: "Básico",
    price: "R$ 29,90",
    period: "/mês",
    features: [
      "Leads ilimitados",
      "WhatsApp e Instagram dos leads",
      "Exportar CSV",
    ],
    leadsLimit: Infinity,
    showContacts: true,
  },
  {
    id: "pro" as const,
    name: "Pro",
    price: "R$ 59,90",
    period: "/mês",
    features: [
      "Tudo do Básico",
      "Leads diários por WhatsApp",
      "Lista Lookalike para Ads",
      "Leads de estúdios parceiros",
    ],
    leadsLimit: Infinity,
    showContacts: true,
  },
];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan>("free");
  const { toast } = useToast();

  const plan = PLANS.find((p) => p.id === currentPlan)!;

  useEffect(() => {
    fetchLeads();
  }, []);

  async function fetchLeads() {
    try {
      const [leadsRes, statsRes] = await Promise.all([
        api.get("/leads").catch(() => ({ data: [] })),
        api.get("/leads/stats").catch(() => ({ data: null })),
      ]);
      setLeads(leadsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  }

  async function exportLeadsCsv() {
    setExporting(true);
    try {
      const response = await api.get("/leads/export/csv", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `leads-${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast({ title: "CSV exportado com sucesso!" });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao exportar" });
    } finally {
      setExporting(false);
    }
  }

  async function exportLeadsForLookalike() {
    setExporting(true);
    try {
      const response = await api.get("/leads/export/lookalike", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `lookalike-audience-${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast({
        title: "Lista Lookalike exportada!",
        description: "Use este CSV no Facebook Ads ou Google Ads para criar audiencias semelhantes.",
      });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao exportar" });
    } finally {
      setExporting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Leads & Upsell"
        description="Gerencie seus leads e exporte listas para campanhas"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground normal-case tracking-normal">
              Total de Leads
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalLeads ?? 0}</div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground normal-case tracking-normal">
              Leads Este Mes
            </CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.leadsThisMonth ?? 0}</div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground normal-case tracking-normal">
              Estilo Top
            </CardTitle>
            <Palette className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {stats?.topStyles?.[0]?.style ?? "-"}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground normal-case tracking-normal">
              Cidade Top
            </CardTitle>
            <MapPin className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {stats?.topLocations?.[0]?.city ?? "-"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card className="border-border hover:border-primary/30 transition-colors">
          <CardContent className="p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-sm bg-primary/10 flex items-center justify-center shrink-0">
              <Download className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="font-mono uppercase tracking-wider text-sm font-semibold">
                Exportar Lista de Emails
              </h3>
              <Text className="text-xs text-muted-foreground">
                Exporte todos os emails dos seus leads em CSV para usar em campanhas de email marketing.
              </Text>
              <Button size="sm" variant="outline" onClick={exportLeadsCsv} disabled={exporting}>
                <Mail className="w-3 h-3 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/30 hover:border-primary/50 transition-colors bg-primary/5">
          <CardContent className="p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-sm bg-primary/20 flex items-center justify-center shrink-0">
              <Crown className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-mono uppercase tracking-wider text-sm font-semibold">
                  Lista Lookalike
                </h3>
                <Badge className="bg-primary/20 text-primary text-[10px]">UPSELL</Badge>
              </div>
              <Text className="text-xs text-muted-foreground">
                Exporte lista otimizada com emails, localizacao e interesses para criar audiencias
                semelhantes (Lookalike) no Facebook Ads e Google Ads. Atraia novos clientes com perfil
                similar aos seus melhores leads.
              </Text>
              <Button size="sm" onClick={exportLeadsForLookalike} disabled={exporting}>
                <ShoppingCart className="w-3 h-3 mr-2" />
                Gerar Lista Lookalike
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Plans */}
      {currentPlan === "free" && (
        <div className="mb-8 p-5 rounded-lg border-2 border-primary/30 bg-primary/5 space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <h3 className="font-mono uppercase tracking-wider font-bold text-sm text-foreground">
              Desbloqueie o contato dos leads
            </h3>
          </div>
          <Text className="text-sm text-muted-foreground">
            No plano gratuito você vê apenas nome e cidade. Assine para acessar WhatsApp, Instagram e exportar listas.
          </Text>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PLANS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  if (p.id !== "free") {
                    // TODO: integrar com gateway de pagamento
                    toast({ title: `Plano ${p.name} selecionado!`, description: "Integração com pagamento em breve." });
                  }
                  setCurrentPlan(p.id);
                }}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  currentPlan === p.id
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-foreground">{p.price}</span>
                  <span className="text-xs text-muted-foreground">{p.period}</span>
                </div>
                <span className="text-xs font-mono uppercase tracking-wider font-semibold text-primary block mt-1">
                  {p.name}
                </span>
                <ul className="mt-2 space-y-1">
                  {p.features.map((f) => (
                    <li key={f} className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Check className="w-3 h-3 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Leads Table */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-sm">Leads Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-muted rounded-sm animate-pulse" />
              ))}
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <Text className="text-muted-foreground">
                Nenhum lead capturado ainda. Os leads serão coletados automaticamente dos agendamentos.
              </Text>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[700px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Cidade</TableHead>
                    <TableHead>Estilo</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Contato</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.slice(0, plan.leadsLimit === Infinity ? 100 : plan.leadsLimit).map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">
                        {lead.firstName} {lead.lastName}
                      </TableCell>
                      <TableCell>
                        {lead.city && (
                          <Badge variant="outline" className="text-[10px]">
                            {lead.city}, {lead.state}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {lead.tattooStyle && (
                          <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                            {lead.tattooStyle}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {new Date(lead.createdAt).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        {plan.showContacts ? (
                          <div className="flex items-center justify-end gap-1.5">
                            {lead.phone && (
                              <a
                                href={`https://wa.me/55${lead.phone.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-500 hover:bg-emerald-500/10">
                                  <MessageCircle className="w-4 h-4" />
                                </Button>
                              </a>
                            )}
                            {lead.instagram && (
                              <a
                                href={`https://instagram.com/${lead.instagram.replace("@", "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-pink-500 hover:bg-pink-500/10">
                                  <Instagram className="w-4 h-4" />
                                </Button>
                              </a>
                            )}
                            {lead.email && (
                              <a href={`mailto:${lead.email}`}>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-500 hover:bg-blue-500/10">
                                  <Mail className="w-4 h-4" />
                                </Button>
                              </a>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1 text-muted-foreground">
                            <Lock className="w-3 h-3" />
                            <span className="text-[10px]">Assine para ver</span>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Limit notice for free plan */}
              {currentPlan === "free" && leads.length > plan.leadsLimit && (
                <div className="text-center py-4 border-t border-border">
                  <Text className="text-xs text-muted-foreground">
                    Mostrando {plan.leadsLimit} de {leads.length} leads.{" "}
                    <button
                      type="button"
                      className="text-primary font-semibold hover:underline"
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      Assine para ver todos
                    </button>
                  </Text>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
