"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { Text } from "@/components/ui/typography";
import { Loader2 } from "lucide-react";

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code) {
      setError("Código de autorização não recebido");
      return;
    }

    async function exchangeCode() {
      try {
        const { data } = await api.post("/auth/google/callback", {
          code,
          redirectUri: `${window.location.origin}/auth/google/callback`,
        });

        // Store Google access token for Calendar API
        if (data.googleAccessToken) {
          localStorage.setItem("google_access_token", data.googleAccessToken);
        }

        // If it's a login flow, also store auth token
        if (data.access_token) {
          localStorage.setItem("token", data.access_token);
          localStorage.setItem("user", JSON.stringify(data.user));
        }

        // If artist connecting calendar, save to profile
        if (state === "artist-calendar" && data.googleAccessToken) {
          try {
            await api.post("/users/profile/google-calendar/connect", {
              accessToken: data.googleAccessToken,
            });
          } catch (calendarError) {
            console.error("Failed to save calendar connection:", calendarError);
          }
        }

        // Redirect based on state
        if (state === "booking-calendar") {
          window.history.go(-2);
        } else if (state === "artist-calendar") {
          router.push("/dashboard/perfil");
        } else if (state === "login" || state === "register") {
          const role = data.user?.role;
          if (role === "CLIENT") {
            router.push("/meus-agendamentos");
          } else {
            router.push("/dashboard");
          }
        } else {
          router.push("/dashboard");
        }
      } catch (err) {
        console.error("Google auth error:", err);
        setError("Erro ao autenticar com Google. Tente novamente.");
        setTimeout(() => {
          window.history.go(-2);
        }, 3000);
      }
    }

    exchangeCode();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        {error ? (
          <Text className="text-destructive">{error}</Text>
        ) : (
          <>
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
            <Text className="text-muted-foreground">
              Conectando com Google...
            </Text>
          </>
        )}
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  );
}
