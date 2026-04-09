"use client";

import { useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Text } from "@/components/ui/typography";
import { Upload, Save, MessageCircle, Check, X, Mail, CreditCard } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ProfileSkeleton } from "@/components/dashboard/DashboardSkeleton";

interface Profile {
  name: string;
  phone: string;
  instagram: string;
  bio: string;
  profilePhoto: string;
  acceptsCompanion: boolean;
  maxCompanions: number;
  evolutionApiUrl: string;
  evolutionApiKey: string;
  evolutionInstanceName: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
  paymentMethods: string[];
}

const defaultProfile: Profile = {
  name: "",
  phone: "",
  instagram: "",
  bio: "",
  profilePhoto: "",
  acceptsCompanion: false,
  maxCompanions: 1,
  evolutionApiUrl: "",
  evolutionApiKey: "",
  evolutionInstanceName: "",
  smtpHost: "",
  smtpPort: 587,
  smtpUser: "",
  smtpPass: "",
  smtpFrom: "",
  paymentMethods: ["PIX"],
};

export default function PerfilPage() {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingWhatsapp, setTestingWhatsapp] = useState(false);
  const [testingSmtp, setTestingSmtp] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const response = await api.get("/users/profile");
      const data = response.data;
      setProfile({
        name: data.name ?? "",
        phone: data.phone ?? "",
        instagram: data.instagram ?? "",
        bio: data.bio ?? "",
        profilePhoto: data.profilePhoto ?? "",
        acceptsCompanion: data.acceptsCompanion ?? false,
        maxCompanions: data.maxCompanions ?? 1,
        evolutionApiUrl: data.evolutionApiUrl ?? "",
        evolutionApiKey: data.evolutionApiKey ?? "",
        evolutionInstanceName: data.evolutionInstanceName ?? "",
        smtpHost: data.smtpHost ?? "",
        smtpPort: data.smtpPort ?? 587,
        smtpUser: data.smtpUser ?? "",
        smtpPass: data.smtpPass ?? "",
        smtpFrom: data.smtpFrom ?? "",
        paymentMethods: data.paymentMethods ?? ["PIX"],
      });
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await api.put("/users/profile", {
        name: profile.name,
        phone: profile.phone,
        instagram: profile.instagram,
        bio: profile.bio,
        acceptsCompanion: profile.acceptsCompanion,
        maxCompanions: profile.maxCompanions,
        evolutionApiUrl: profile.evolutionApiUrl,
        evolutionApiKey: profile.evolutionApiKey,
        evolutionInstanceName: profile.evolutionInstanceName,
        smtpHost: profile.smtpHost,
        smtpPort: profile.smtpPort,
        smtpUser: profile.smtpUser,
        smtpPass: profile.smtpPass,
        smtpFrom: profile.smtpFrom,
        paymentMethods: profile.paymentMethods,
      });
      toast({
        title: "Perfil atualizado",
        description: "Suas alteracoes foram salvas com sucesso",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao salvar perfil",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handlePhotoUpload(file: File) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await api.post("/upload/image", formData);
      setProfile({ ...profile, profilePhoto: response.data.url });
      toast({ title: "Foto atualizada" });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao fazer upload da foto" });
    }
  }

  async function testWhatsapp() {
    setTestingWhatsapp(true);
    try {
      await api.post("/notifications/whatsapp/test", {
        evolutionApiUrl: profile.evolutionApiUrl,
        evolutionApiKey: profile.evolutionApiKey,
        evolutionInstanceName: profile.evolutionInstanceName,
        phone: profile.phone,
      });
      toast({ title: "Teste enviado!", description: "Verifique seu WhatsApp" });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao enviar teste" });
    } finally {
      setTestingWhatsapp(false);
    }
  }

  async function testSmtp() {
    setTestingSmtp(true);
    try {
      await api.post("/notifications/email/test", {
        smtpHost: profile.smtpHost,
        smtpPort: profile.smtpPort,
        smtpUser: profile.smtpUser,
        smtpPass: profile.smtpPass,
        smtpFrom: profile.smtpFrom,
      });
      toast({ title: "Email teste enviado!", description: "Verifique sua caixa de entrada" });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao enviar email teste" });
    } finally {
      setTestingSmtp(false);
    }
  }

  function togglePaymentMethod(method: string) {
    setProfile((prev) => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(method)
        ? prev.paymentMethods.filter((m) => m !== method)
        : [...prev.paymentMethods, method],
    }));
  }

  function updateField(field: keyof Profile, value: string | boolean | number | string[]) {
    setProfile({ ...profile, [field]: value });
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Perfil" description="Gerencie suas informacoes" />
        <ProfileSkeleton />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Perfil" description="Gerencie suas informacoes">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono uppercase tracking-wider"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </PageHeader>

      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
          <TabsTrigger value="integracoes">Integrações</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Info */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-sm">Informacoes Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-sm bg-muted flex items-center justify-center overflow-hidden border border-border">
                {profile.profilePhoto ? (
                  <img src={profile.profilePhoto} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl text-muted-foreground font-mono">
                    {profile.name.charAt(0).toUpperCase() || "?"}
                  </span>
                )}
              </div>
              <div>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePhotoUpload(file);
                  }}
                  className="hidden"
                />
                <Button variant="outline" size="sm" onClick={() => photoInputRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Alterar Foto
                </Button>
              </div>
            </div>
            <Separator className="bg-border" />
            <div>
              <Label>Nome</Label>
              <Input value={profile.name} onChange={(e) => updateField("name", e.target.value)} className="bg-background border-border" />
            </div>
            <div>
              <Label>Telefone (WhatsApp)</Label>
              <Input value={profile.phone} onChange={(e) => updateField("phone", e.target.value)} className="bg-background border-border" placeholder="(11) 99999-9999" />
            </div>
            <div>
              <Label>Instagram</Label>
              <Input value={profile.instagram} onChange={(e) => updateField("instagram", e.target.value)} className="bg-background border-border" placeholder="@seuinstagram" />
            </div>
            <div>
              <Label>Bio</Label>
              <Input value={profile.bio} onChange={(e) => updateField("bio", e.target.value)} className="bg-background border-border" placeholder="Breve descricao..." />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Business Settings */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-sm">Configuracoes do Estudio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Aceita Acompanhante</Label>
                  <p className="text-xs text-muted-foreground">Permite que o cliente leve acompanhante</p>
                </div>
                <Switch checked={profile.acceptsCompanion} onCheckedChange={(checked) => updateField("acceptsCompanion", checked)} />
              </div>
              {profile.acceptsCompanion && (
                <>
                  <Separator className="bg-border" />
                  <div>
                    <Label>Máximo de Acompanhantes</Label>
                    <p className="text-xs text-muted-foreground mb-2">Quantas pessoas o cliente pode levar</p>
                    <Input
                      type="number"
                      value={profile.maxCompanions}
                      onChange={(e) => updateField("maxCompanions", Number(e.target.value))}
                      className="bg-background border-border w-24"
                      min={1}
                      max={5}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
        </TabsContent>

        <TabsContent value="integracoes" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolution API - WhatsApp */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              WhatsApp (Evolution API)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Text className="text-xs text-muted-foreground">
              Configure a Evolution API para enviar confirmacoes automaticas via WhatsApp aos seus clientes.
            </Text>
            <div>
              <Label>URL da API</Label>
              <Input value={profile.evolutionApiUrl} onChange={(e) => updateField("evolutionApiUrl", e.target.value)} className="bg-background border-border" placeholder="https://sua-evolution-api.com" />
            </div>
            <div>
              <Label>API Key</Label>
              <Input type="password" value={profile.evolutionApiKey} onChange={(e) => updateField("evolutionApiKey", e.target.value)} className="bg-background border-border" placeholder="Sua chave de API" />
            </div>
            <div>
              <Label>Nome da Instancia</Label>
              <Input value={profile.evolutionInstanceName} onChange={(e) => updateField("evolutionInstanceName", e.target.value)} className="bg-background border-border" placeholder="Ex: meu-estudio" />
            </div>
            <Button variant="outline" size="sm" onClick={testWhatsapp} disabled={testingWhatsapp || !profile.evolutionApiUrl}>
              {testingWhatsapp ? "Enviando..." : "Testar Conexao"}
            </Button>
          </CardContent>
        </Card>

        {/* SMTP Config */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              SMTP - Emails
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Text className="text-xs text-muted-foreground">
              Configure o SMTP para enviar codigos de verificacao e confirmacoes por email.
            </Text>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Host SMTP</Label>
                <Input value={profile.smtpHost} onChange={(e) => updateField("smtpHost", e.target.value)} className="bg-background border-border" placeholder="smtp.gmail.com" />
              </div>
              <div>
                <Label>Porta</Label>
                <Input type="number" value={profile.smtpPort} onChange={(e) => updateField("smtpPort", Number(e.target.value))} className="bg-background border-border w-24" />
              </div>
            </div>
            <div>
              <Label>Usuario</Label>
              <Input value={profile.smtpUser} onChange={(e) => updateField("smtpUser", e.target.value)} className="bg-background border-border" placeholder="seu@email.com" />
            </div>
            <div>
              <Label>Senha</Label>
              <Input type="password" value={profile.smtpPass} onChange={(e) => updateField("smtpPass", e.target.value)} className="bg-background border-border" />
            </div>
            <div>
              <Label>Email Remetente</Label>
              <Input value={profile.smtpFrom} onChange={(e) => updateField("smtpFrom", e.target.value)} className="bg-background border-border" placeholder="noreply@seuestudio.com" />
            </div>
            <Button variant="outline" size="sm" onClick={testSmtp} disabled={testingSmtp || !profile.smtpHost}>
              {testingSmtp ? "Enviando..." : "Enviar Email Teste"}
            </Button>
          </CardContent>
        </Card>
        </TabsContent>

        <TabsContent value="pagamentos" className="grid grid-cols-1 gap-6">
        {/* Payment Methods */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />
              Formas de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Text className="text-xs text-muted-foreground">
              Selecione as formas de pagamento que você aceita para o restante do valor (após o sinal).
            </Text>
            <div className="flex flex-wrap gap-2">
              {["PIX", "Dinheiro", "Cartão de Crédito", "Cartão de Débito", "Transferência Bancária"].map((method) => {
                const isEnabled = profile.paymentMethods.includes(method);
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => togglePaymentMethod(method)}
                    className={`px-3 py-1.5 rounded-sm text-xs font-medium transition-colors border ${
                      isEnabled
                        ? "bg-primary/10 text-primary border-primary/30"
                        : "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {isEnabled ? <Check className="w-3 h-3 inline mr-1" /> : <X className="w-3 h-3 inline mr-1" />}
                    {method}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
