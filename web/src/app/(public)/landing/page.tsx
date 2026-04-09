"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  Calculator,
  Image,
  Users,
  BarChart3,
  Link2,
  ArrowRight,
  CheckCircle,
  Eye,
} from "lucide-react";

function FadeInUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

const features = [
  {
    icon: Calendar,
    title: "Agendamento Online",
    description:
      "Clientes agendam direto pelo seu link, com confirmação automática e notificações",
  },
  {
    icon: Calculator,
    title: "Calculadora de Preços",
    description:
      "Calcule preços automaticamente com base em tamanho, localização e estilo",
  },
  {
    icon: Image,
    title: "Portfólio Digital",
    description:
      "Galeria profissional para exibir seus melhores trabalhos aos clientes",
  },
  {
    icon: Users,
    title: "Gestão de Clientes",
    description:
      "Histórico completo de cada cliente com preferências e agendamentos",
  },
  {
    icon: BarChart3,
    title: "Dashboard Inteligente",
    description:
      "Métricas em tempo real sobre receita, agendamentos e desempenho",
  },
  {
    icon: Link2,
    title: "Link Personalizado",
    description:
      "Seu link único para compartilhar com clientes e redes sociais",
  },
];

const steps = [
  { number: "01", title: "Crie sua conta", description: "Cadastro rápido e gratuito para tatuadores" },
  { number: "02", title: "Configure seus preços", description: "Defina sua tabela de preços personalizada" },
  { number: "03", title: "Compartilhe seu link", description: "Envie seu link para clientes e redes sociais" },
  { number: "04", title: "Receba agendamentos", description: "Clientes agendam direto pelo seu link" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32 lg:py-40">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <FadeInUp>
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-mono uppercase tracking-widest font-bold text-primary mb-6 glow-magenta-strong">
                EasyTattoo Pro
              </h1>
              <p className="text-lg sm:text-xl font-mono uppercase tracking-wider text-foreground/80 mb-4">
                Sistema profissional para tatuadores
              </p>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
                Gerencie seu estúdio de tatuagem com agendamento online,
                calculadora de preços, portfólio digital e muito mais. Seus
                clientes agendam direto pelo seu link personalizado.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono uppercase tracking-wider text-base px-8 glow-magenta"
                  >
                    Comece Gratis
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/t/demo" target="_blank">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-primary/50 hover:bg-primary/10 font-mono uppercase tracking-wider text-base px-8"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Ver Demo
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-border hover:border-primary/50 font-mono uppercase tracking-wider text-base px-8"
                  >
                    Já tenho conta
                  </Button>
                </Link>
              </div>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-28">
        <div className="container mx-auto px-4">
          <FadeInUp>
            <div className="text-center mb-16">
              <h2 className="text-2xl sm:text-3xl font-mono uppercase tracking-wider font-bold text-foreground mb-4">
                Tudo que você precisa
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Ferramentas profissionais para gerenciar seu estúdio de
                tatuagem
              </p>
            </div>
          </FadeInUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <FadeInUp key={feature.title} delay={index * 0.1}>
                  <Card className="border-border bg-card hover:border-primary/30 transition-all duration-300 hover:glow-magenta group h-full">
                    <CardContent className="p-6">
                      <div className="h-12 w-12 rounded-sm bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-mono uppercase tracking-wider font-semibold mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </FadeInUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Timeline */}
      <section className="py-20 sm:py-28 bg-card/50">
        <div className="container mx-auto px-4">
          <FadeInUp>
            <div className="text-center mb-16">
              <h2 className="text-2xl sm:text-3xl font-mono uppercase tracking-wider font-bold text-foreground mb-4">
                Como Funciona
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Comece em minutos e transforme a forma como você gerencia seu
                estúdio
              </p>
            </div>
          </FadeInUp>

          <div className="max-w-3xl mx-auto">
            {steps.map((step, index) => (
              <FadeInUp key={step.number} delay={index * 0.15}>
                <div className="flex items-start gap-6 mb-12 last:mb-0">
                  <div className="flex-shrink-0 h-14 w-14 rounded-sm bg-primary/10 border border-primary/30 flex items-center justify-center">
                    <span className="text-lg font-mono font-bold text-primary">
                      {step.number}
                    </span>
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className="text-lg font-mono uppercase tracking-wider font-semibold mb-1">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden sm:block absolute left-[2.25rem] mt-14 w-px h-12 bg-border" />
                  )}
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 sm:py-28">
        <div className="container mx-auto px-4">
          <FadeInUp>
            <div className="text-center mb-16">
              <h2 className="text-2xl sm:text-3xl font-mono uppercase tracking-wider font-bold text-foreground mb-4">
                Galeria
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Inspire-se com trabalhos incriveis de tatuadores profissionais
              </p>
            </div>
          </FadeInUp>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <FadeInUp key={index} delay={index * 0.1}>
                <Card className="border-border bg-card aspect-square overflow-hidden hover:border-primary/30 transition-colors">
                  <div className="w-full h-full flex items-center justify-center bg-muted/50">
                    <div className="text-center">
                      <Image className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">
                        Imagem {index + 1}
                      </p>
                    </div>
                  </div>
                </Card>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28 bg-card/50">
        <div className="container mx-auto px-4">
          <FadeInUp>
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-mono uppercase tracking-wider font-bold text-foreground mb-4">
                Pronto para profissionalizar seu estúdio?
              </h2>
              <p className="text-muted-foreground mb-8">
                Junte-se a centenas de tatuadores que já usam o EasyTattoo Pro
                para gerenciar seus estúdios.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono uppercase tracking-wider text-base px-8 glow-magenta"
                  >
                    Criar Conta Gratis
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Gratis para comecar
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Sem cartao de credito
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Suporte 24/7
                </span>
              </div>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-mono uppercase tracking-widest text-primary font-bold text-sm">
                EasyTattoo Pro
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Sistema profissional para tatuadores
              </p>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link
                href="/login"
                className="hover:text-primary transition-colors"
              >
                Login Tatuador
              </Link>
              <Link
                href="/register"
                className="hover:text-primary transition-colors"
              >
                Criar Conta
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
