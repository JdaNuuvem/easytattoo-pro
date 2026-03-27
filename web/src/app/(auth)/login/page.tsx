"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { login, getHomeRouteForRole } from "@/lib/auth";
import Link from "next/link";
import { GoogleIcon } from "@/components/ui/google-icon";
import { redirectToGoogleAuth, isGoogleAuthConfigured } from "@/lib/google-auth";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const { user } = await login(data.email, data.password);
      router.push(getHomeRouteForRole(user.role));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao entrar",
        description: "Email ou senha incorretos",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-[400px] mx-4 border-border bg-card">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto mb-4">
          <h2 className="text-2xl font-mono uppercase tracking-widest text-primary font-bold">
            EasyTattoo Pro
          </h2>
        </div>
        <CardTitle className="text-xl">Bem-vindo de volta</CardTitle>
        <CardDescription>
          Entre com seu email e senha para acessar sua conta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      className="bg-background border-border focus:ring-primary focus:border-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="******"
                      className="bg-background border-border focus:ring-primary focus:border-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-mono uppercase tracking-wider"
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </Form>

        {isGoogleAuthConfigured() && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">ou</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center gap-3"
              onClick={() => {
                const ok = redirectToGoogleAuth("login");
                if (!ok) {
                  toast({
                    variant: "destructive",
                    title: "Google não configurado",
                    description: "O login via Google não está disponível no momento.",
                  });
                }
              }}
            >
              <GoogleIcon />
              Entrar com Google
            </Button>
          </>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Não tem uma conta?{" "}
          <Link
            href="/register"
            className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
          >
            Criar conta
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
