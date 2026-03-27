"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/typography";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useBookingStore } from "@/stores/booking";
import { useBookingNavigation } from "@/hooks/useBookingNavigation";
import { useGeolocation } from "@/hooks/useGeolocation";
import { getStoredUser } from "@/lib/auth";
import { api } from "@/lib/api";
import { MapPin } from "lucide-react";

const personalInfoSchema = z.object({
  firstName: z.string().min(1, "Nome é obrigatório"),
  lastName: z.string().min(1, "Sobrenome é obrigatório"),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  email: z.string().email("Email inválido"),
  instagram: z.string().default(""),
  birthDate: z.string().min(1, "Data de nascimento é obrigatória"),
});

type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;

export function PersonalInfo() {
  const { personalInfo, updatePersonalInfo, updateGeolocation } = useBookingStore();
  const { goToNextStep } = useBookingNavigation();
  const { location: geoLocation, loading: geoLoading } = useGeolocation();
  const [autoFilled, setAutoFilled] = useState(false);

  const form = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: personalInfo.firstName,
      lastName: personalInfo.lastName,
      phone: personalInfo.phone,
      email: personalInfo.email,
      instagram: personalInfo.instagram ?? "",
      birthDate: personalInfo.birthDate ?? "",
    },
  });

  useEffect(() => {
    const user = getStoredUser();
    if (user?.role === "CLIENT") {
      api
        .get("/auth/me")
        .then(({ data }) => {
          if (data.clientProfile) {
            const profile = data.clientProfile;
            form.reset({
              firstName: profile.firstName || "",
              lastName: profile.lastName || "",
              phone: profile.phone || "",
              email: profile.email || data.email || "",
              instagram: profile.instagram || "",
              birthDate: profile.birthDate || "",
            });
            setAutoFilled(true);
          }
        })
        .catch(() => {
          // Silently fail - user can fill manually
        });
    }
  }, [form]);

  const onSubmit = form.handleSubmit((data) => {
    updatePersonalInfo({
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      email: data.email,
      instagram: data.instagram ?? "",
      birthDate: data.birthDate,
    });
    if (geoLocation) {
      updateGeolocation({
        latitude: geoLocation.latitude,
        longitude: geoLocation.longitude,
        city: geoLocation.city ?? "",
        state: geoLocation.state ?? "",
        country: geoLocation.country ?? "",
      });
    }
    goToNextStep();
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        <Text className="text-muted-foreground">
          Para começarmos, precisamos de algumas informações básicas sobre você.
        </Text>

        {autoFilled && (
          <div className="text-xs text-primary/70 bg-primary/5 border border-primary/20 rounded-md px-3 py-2">
            Dados preenchidos automaticamente da sua conta
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="bg-card border-border focus-visible:ring-primary focus-visible:border-primary"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sobrenome</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="bg-card border-border focus-visible:ring-primary focus-visible:border-primary"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone (WhatsApp)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="(11) 99999-9999"
                  className="bg-card border-border focus-visible:ring-primary focus-visible:border-primary"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  className="bg-card border-border focus-visible:ring-primary focus-visible:border-primary"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="birthDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de Nascimento</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="date"
                  className="bg-card border-border focus-visible:ring-primary focus-visible:border-primary"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="instagram"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instagram</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="@seuusername"
                  className="bg-card border-border focus-visible:ring-primary focus-visible:border-primary"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Geolocation indicator */}
        {geoLoading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 animate-pulse" />
            Detectando sua localização...
          </div>
        )}
        {geoLocation && (
          <div className="flex items-center gap-2 text-xs text-primary/70 bg-primary/5 border border-primary/20 rounded-md px-3 py-2">
            <MapPin className="h-3 w-3 shrink-0" />
            {geoLocation.city && geoLocation.state
              ? `${geoLocation.city}, ${geoLocation.state}`
              : "Localização detectada"}
          </div>
        )}

        <Button type="submit" className="w-full">
          Continuar
        </Button>
      </form>
    </Form>
  );
}
