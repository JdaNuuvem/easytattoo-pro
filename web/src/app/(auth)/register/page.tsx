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
import { Text } from "@/components/ui/typography";
import { useToast } from "@/hooks/use-toast";
import { register, getHomeRouteForRole } from "@/lib/auth";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { GoogleIcon } from "@/components/ui/google-icon";
import { redirectToGoogleAuth, isGoogleAuthConfigured } from "@/lib/google-auth";

const passwordRequirements = [
  { regex: /.{8,}/, label: "Minimo 8 caracteres" },
  { regex: /[A-Z]/, label: "Uma letra maiuscula" },
  { regex: /[a-z]/, label: "Uma letra minuscula" },
  { regex: /[0-9]/, label: "Um numero" },
  { regex: /[^A-Za-z0-9]/, label: "Um caractere especial (!@#$%)" },
];

const registerSchema = z
  .object({
    name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
    email: z.string().email("Email inválido"),
    password: z
      .string()
      .min(8, "Senha deve ter no mínimo 8 caracteres")
      .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
      .regex(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula")
      .regex(/[0-9]/, "Senha deve conter pelo menos um número")
      .regex(/[^A-Za-z0-9]/, "Senha deve conter pelo menos um caractere especial"),
    confirmPassword: z.string().min(1, "Confirme sua senha"),
    phone: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

function PasswordStrengthIndicator({ password }: { password: string }) {
  const passedCount = passwordRequirements.filter((req) =>
    req.regex.test(password)
  ).length;
  const strength = passedCount / passwordRequirements.length;

  return (
    <div className="space-y-2 mt-2">
      {/* Strength bar */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= passedCount
                ? strength <= 0.4
                  ? "bg-red-500"
                  : strength <= 0.7
                  ? "bg-yellow-500"
                  : "bg-emerald-500"
                : "bg-muted"
            }`}
          />
        ))}
      </div>
      {/* Requirements checklist */}
      <div className="grid grid-cols-1 gap-1">
        {passwordRequirements.map((req) => {
          const passed = req.regex.test(password);
          return (
            <div key={req.label} className="flex items-center gap-1.5">
              {passed ? (
                <Check className="w-3 h-3 text-emerald-500" />
              ) : (
                <X className="w-3 h-3 text-muted-foreground" />
              )}
              <span
                className={`text-[11px] ${
                  passed ? "text-emerald-500" : "text-muted-foreground"
                }`}
              >
                {req.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
    },
  });

  const watchedPassword = form.watch("password");

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const { user } = await register(
        data.email,
        data.password,
        data.name,
        "ARTIST",
        data.phone || undefined
      );
      toast({
        title: "Conta criada",
        description: "Verifique seu email para confirmar sua conta.",
      });
      router.push(getHomeRouteForRole(user.role));
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Ocorreu um erro ao criar sua conta. Tente novamente.";
      toast({
        variant: "destructive",
        title: "Erro ao criar conta",
        description: Array.isArray(message) ? message.join(", ") : message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-[450px] mx-4 border-border bg-card">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto mb-4">
          <h2 className="text-2xl font-mono uppercase tracking-widest text-primary font-bold">
            EasyTattoo Pro
          </h2>
        </div>
        <CardTitle className="text-xl">Criar Conta de Tatuador</CardTitle>
        <CardDescription>
          Preencha os dados abaixo para criar sua conta profissional
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Seu nome"
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
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone / WhatsApp (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="(11) 99999-9999"
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
                      placeholder="********"
                      className="bg-background border-border focus:ring-primary focus:border-primary"
                      {...field}
                    />
                  </FormControl>
                  {watchedPassword && (
                    <PasswordStrengthIndicator password={watchedPassword} />
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar Senha</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="********"
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
              {isLoading ? "Criando conta..." : "Criar Conta"}
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
                const ok = redirectToGoogleAuth("register");
                if (!ok) {
                  toast({
                    variant: "destructive",
                    title: "Google não configurado",
                    description: "O cadastro via Google não está disponível no momento.",
                  });
                }
              }}
            >
              <GoogleIcon />
              Criar conta com Google
            </Button>
          </>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Já tem uma conta?{" "}
          <Link
            href="/login"
            className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
          >
            Fazer login
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
