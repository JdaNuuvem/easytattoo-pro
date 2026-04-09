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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Clock, Plus, Trash2, CalendarOff, Calendar, Loader2, Unlink, Save } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ScheduleSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { redirectToGoogleAuth, isGoogleAuthConfigured } from "@/lib/google-auth";
import { GoogleIcon } from "@/components/ui/google-icon";

interface WorkHour {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface SpecialDate {
  id: string;
  date: string;
  isBlocked: boolean;
  notes: string;
}

const dayNames = [
  "Domingo",
  "Segunda-feira",
  "Terca-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sabado",
];

interface GoogleCalendarStatus {
  connected: boolean;
  email?: string;
}

const DEFAULT_SCHEDULES: Omit<WorkHour, "id">[] = [
  { dayOfWeek: 0, startTime: "09:00", endTime: "18:00", isAvailable: false },
  { dayOfWeek: 1, startTime: "09:00", endTime: "18:00", isAvailable: true },
  { dayOfWeek: 2, startTime: "09:00", endTime: "18:00", isAvailable: true },
  { dayOfWeek: 3, startTime: "09:00", endTime: "18:00", isAvailable: true },
  { dayOfWeek: 4, startTime: "09:00", endTime: "18:00", isAvailable: true },
  { dayOfWeek: 5, startTime: "09:00", endTime: "18:00", isAvailable: true },
  { dayOfWeek: 6, startTime: "10:00", endTime: "14:00", isAvailable: false },
];

export default function HorariosPage() {
  const [workHours, setWorkHours] = useState<WorkHour[]>([]);
  const [specialDates, setSpecialDates] = useState<SpecialDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isNewSchedule, setIsNewSchedule] = useState(false);
  const [specialDateOpen, setSpecialDateOpen] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newNote, setNewNote] = useState("");
  const [gcalStatus, setGcalStatus] = useState<GoogleCalendarStatus>({ connected: false });
  const [gcalLoading, setGcalLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
    fetchGoogleCalendarStatus();
  }, []);

  async function fetchGoogleCalendarStatus() {
    try {
      const response = await api.get("/google-calendar/status");
      setGcalStatus(response.data);
    } catch {
      // Not connected or endpoint not available
    }
  }

  async function disconnectGoogleCalendar() {
    setGcalLoading(true);
    try {
      await api.delete("/google-calendar/disconnect");
      setGcalStatus({ connected: false });
      toast({
        title: "Desconectado",
        description: "Google Calendar foi desconectado",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao desconectar Google Calendar",
      });
    } finally {
      setGcalLoading(false);
    }
  }

  function connectGoogleCalendar() {
    const ok = redirectToGoogleAuth("artist-calendar", [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events",
    ]);
    if (!ok) {
      toast({
        variant: "destructive",
        title: "Google nao configurado",
        description: "O Google OAuth nao esta configurado no sistema.",
      });
    }
  }

  async function fetchData() {
    try {
      const response = await api.get("/schedule/me");
      const data = response.data;
      const schedules = data.workSchedules || [];
      setSpecialDates(data.specialDates || []);

      if (schedules.length === 0) {
        // Generate local defaults for editing - not saved yet
        const localDefaults: WorkHour[] = DEFAULT_SCHEDULES.map((s, i) => ({
          ...s,
          id: `local-${i}`,
        }));
        setWorkHours(localDefaults);
        setIsNewSchedule(true);
      } else {
        setWorkHours(schedules);
        setIsNewSchedule(false);
      }
    } catch (error) {
      console.error("Erro ao carregar horarios:", error);
      // Still show defaults so user can configure
      const localDefaults: WorkHour[] = DEFAULT_SCHEDULES.map((s, i) => ({
        ...s,
        id: `local-${i}`,
      }));
      setWorkHours(localDefaults);
      setIsNewSchedule(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveSchedule() {
    setSaving(true);
    try {
      if (isNewSchedule) {
        // Create all work hours
        const created: WorkHour[] = [];
        for (const wh of workHours) {
          const response = await api.post("/schedule/work-hours", {
            dayOfWeek: wh.dayOfWeek,
            startTime: wh.startTime,
            endTime: wh.endTime,
            isAvailable: wh.isAvailable,
          });
          created.push(response.data);
        }
        setWorkHours(created);
        setIsNewSchedule(false);
      } else {
        // Update all existing work hours
        for (const wh of workHours) {
          await api.put(`/schedule/work-hours/${wh.id}`, {
            dayOfWeek: wh.dayOfWeek,
            startTime: wh.startTime,
            endTime: wh.endTime,
            isAvailable: wh.isAvailable,
          });
        }
      }
      toast({
        title: "Horarios salvos",
        description: "Seus horarios de trabalho foram atualizados",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao salvar horarios",
      });
    } finally {
      setSaving(false);
    }
  }

  function updateWorkHour(
    id: string,
    field: string,
    value: string | boolean
  ) {
    setWorkHours((prev) =>
      prev.map((w) => (w.id === id ? { ...w, [field]: value } : w))
    );
  }

  async function addSpecialDate() {
    if (!newDate) return;
    try {
      const response = await api.post("/schedule/special-dates", {
        date: newDate,
        isBlocked: true,
        notes: newNote,
      });
      setSpecialDates((prev) => [...prev, response.data]);
      setSpecialDateOpen(false);
      setNewDate("");
      setNewNote("");
      toast({
        title: "Data especial adicionada",
        description: "A data foi bloqueada com sucesso",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao adicionar data especial",
      });
    }
  }

  async function removeSpecialDate(id: string) {
    try {
      await api.delete(`/schedule/special-dates/${id}`);
      setSpecialDates((prev) => prev.filter((sd) => sd.id !== id));
      toast({
        title: "Removido",
        description: "Data especial removida",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao remover data especial",
      });
    }
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Horarios" description="Configure seus horarios de trabalho" />
        <ScheduleSkeleton />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Horarios"
        description="Configure seus horarios de trabalho"
      >
        <Button
          onClick={handleSaveSchedule}
          disabled={saving}
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono uppercase tracking-wider"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </PageHeader>

      {/* Google Calendar Integration */}
      <Card className="border-border mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle className="text-sm">Google Calendar</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {gcalStatus.connected ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <div>
                  <p className="text-sm font-medium">Conectado</p>
                  {gcalStatus.email && (
                    <p className="text-xs text-muted-foreground">{gcalStatus.email}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Seus agendamentos serao sincronizados automaticamente
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={disconnectGoogleCalendar}
                disabled={gcalLoading}
                className="border-border text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                {gcalLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Unlink className="h-4 w-4 mr-2" />
                    Desconectar
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Conecte seu Google Calendar para sincronizar agendamentos automaticamente
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={connectGoogleCalendar}
                className="border-border flex items-center gap-2"
              >
                <GoogleIcon />
                Conectar Google Calendar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Schedule Notice */}
      {isNewSchedule && (
        <div className="mb-4 p-3 rounded-sm bg-yellow-500/10 border border-yellow-500/20 text-sm text-yellow-700 dark:text-yellow-400">
          Configure seus horarios abaixo e clique em <strong>Salvar</strong> para confirmar.
        </div>
      )}

      {/* Work Hours Grid */}
      <Card className="border-border mb-6">
        <CardHeader>
          <CardTitle className="text-sm">Horario de Trabalho</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead>Dia</TableHead>
                <TableHead>Inicio</TableHead>
                <TableHead>Fim</TableHead>
                <TableHead className="text-center">Ativo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workHours.map((wh) => (
                <TableRow key={wh.id} className="border-border">
                  <TableCell className="font-medium">
                    {dayNames[wh.dayOfWeek]}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="time"
                      value={wh.startTime}
                      onChange={(e) =>
                        updateWorkHour(wh.id, "startTime", e.target.value)
                      }
                      className="w-32 bg-background border-border"
                      disabled={!wh.isAvailable}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="time"
                      value={wh.endTime}
                      onChange={(e) =>
                        updateWorkHour(wh.id, "endTime", e.target.value)
                      }
                      className="w-32 bg-background border-border"
                      disabled={!wh.isAvailable}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={wh.isAvailable}
                      onCheckedChange={(checked) =>
                        updateWorkHour(wh.id, "isAvailable", checked)
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
              {workHours.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Clock className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Erro ao carregar horarios.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Special Dates */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Datas Especiais / Bloqueios</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSpecialDateOpen(true)}
            className="border-border"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </CardHeader>
        <CardContent>
          {specialDates.length === 0 ? (
            <div className="flex flex-col items-center py-8 gap-2">
              <CalendarOff className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Nenhuma data especial cadastrada
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {specialDates.map((sd) => (
                <div
                  key={sd.id}
                  className="flex items-center justify-between p-3 rounded-sm bg-muted/50 border border-border"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {new Date(sd.date).toLocaleDateString("pt-BR")}
                    </p>
                    {sd.notes && (
                      <p className="text-xs text-muted-foreground">{sd.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 bg-destructive/20 text-destructive rounded-sm">
                      Bloqueado
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeSpecialDate(sd.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Special Date Dialog */}
      <Dialog open={specialDateOpen} onOpenChange={setSpecialDateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Data Especial</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Data</Label>
              <Input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="bg-background border-border"
              />
            </div>
            <div>
              <Label>Observacao (opcional)</Label>
              <Input
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="bg-background border-border"
                placeholder="Ex: Feriado, Viagem, etc."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSpecialDateOpen(false)}
              className="border-border"
            >
              Cancelar
            </Button>
            <Button
              onClick={addSpecialDate}
              disabled={!newDate}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
