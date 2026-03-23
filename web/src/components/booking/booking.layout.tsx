import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import type { PropsWithChildren } from "react";

type BookingLayoutProps = PropsWithChildren;

export default function BookingLayout({ children }: BookingLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background items-center noise">
      <header className="sticky top-0 z-50 w-full border-b border-border/50 glass">
        <div className="container flex h-14 items-center justify-between mx-auto px-4">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink className="font-mono uppercase tracking-wider font-bold text-xl gradient-text hover:opacity-80 transition-opacity">
                  EasyTattoo
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink className="text-muted-foreground hover:text-primary transition-colors text-sm font-mono uppercase tracking-wider">
                  Agendar
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink className="text-muted-foreground hover:text-primary transition-colors text-sm font-mono uppercase tracking-wider">
                  Sobre
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </header>

      <main className="flex-1 container py-8 px-4">{children}</main>

      <footer className="border-t border-border/50 py-6 glass w-full">
        <div className="container flex justify-between text-sm text-muted-foreground mx-auto px-4">
          <p className="font-mono text-xs">
            2024 EasyTattoo. Todos os direitos reservados.
          </p>
          <nav className="flex gap-4">
            <a
              href="#"
              className="hover:text-primary transition-colors text-xs font-mono uppercase tracking-wider"
            >
              Termos
            </a>
            <a
              href="#"
              className="hover:text-primary transition-colors text-xs font-mono uppercase tracking-wider"
            >
              Privacidade
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
