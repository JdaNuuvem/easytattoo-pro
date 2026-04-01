"use client";

import { useState } from "react";
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
import { api } from "@/lib/api";
import Link from "next/link";

const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      await api.post("/auth/forgot-password", { email: data.email });
      setSent(true);
      toast({
        title: "Email enviado",
        description: "Se o email estiver cadastrado, você receberá um link para redefinir sua senha.",
      });
    } catch {
      toast({
        title: "Email enviado",
        description: "Se o email estiver cadastrado, você receberá um link para redefinir sua senha.",
      });
      setSent(true);
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
        <CardTitle className="text-xl">Esqueci minha senha</CardTitle>
        <CardDescription>
          {sent
            ? "Verifique seu email para o link de redefinição de senha."
            : "Digite seu email para receber um link de redefinição de senha."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!sent ? (
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
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-mono uppercase tracking-wider"
                disabled={isLoading}
              >
                {isLoading ? "Enviando..." : "Enviar link de redefinição"}
              </Button>
            </form>
          </Form>
        ) : (
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Caso não receba o email em alguns minutos, verifique sua pasta de spam.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setSent(false)}
            >
              Enviar novamente
            </Button>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Lembrou a senha?{" "}
          <Link
            href="/login"
            className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
          >
            Voltar para login
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
