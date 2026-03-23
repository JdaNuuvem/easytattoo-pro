"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Users,
  DollarSign,
  Image,
  Clock,
  UserCog,
  BarChart3,
  LogOut,
  Menu,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { logout } from "@/lib/auth";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", title: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/agenda", title: "Agenda", icon: Calendar },
  { href: "/dashboard/clientes", title: "Clientes", icon: Users },
  { href: "/dashboard/precos", title: "Precos", icon: DollarSign },
  { href: "/dashboard/portfolio", title: "Portfolio", icon: Image },
  { href: "/dashboard/horarios", title: "Horarios", icon: Clock },
  { href: "/dashboard/leads", title: "Leads", icon: Target },
  { href: "/dashboard/perfil", title: "Perfil", icon: UserCog },
  { href: "/dashboard/relatorios", title: "Relatorios", icon: BarChart3 },
];

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-6 border-b border-border">
        <h2 className="text-xl font-mono uppercase tracking-widest text-primary font-bold">
          EasyTattoo Pro
        </h2>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary border-l-2 border-primary glow-magenta"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="px-2 py-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sair
        </button>
      </div>
    </div>
  );
}

export function SidebarNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile sidebar trigger */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="border-border bg-card"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-card border-border">
            <SheetTitle className="sr-only">Menu de navegacao</SheetTitle>
            <NavContent onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:border-border lg:bg-card lg:min-h-screen lg:fixed lg:inset-y-0 lg:left-0">
        <NavContent />
      </aside>
    </>
  );
}
