import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  FlaskConical,
  Lightbulb,
  FileText,
  Images,
  BarChart3,
  UserCircle2,
  Settings,
  LogOut,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/calendar", label: "Content Calendar", icon: CalendarDays },
  { to: "/research", label: "Research", icon: FlaskConical },
  { to: "/opportunities", label: "Content Opportunities", icon: Lightbulb },
  { to: "/drafts", label: "Drafts", icon: FileText },
  { to: "/visuals", label: "Visuals", icon: Images },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/brand-profile", label: "Brand Profile", icon: UserCircle2 },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        <div className="flex items-center gap-3 px-5 py-6">
          <div className="flex size-9 items-center justify-center rounded-md bg-primary font-display text-sm font-bold text-primary-foreground">
            NP
          </div>
          <div className="leading-tight">
            <p className="font-display text-sm font-semibold text-sidebar-foreground">
              Content Intelligence
            </p>
            <p className="text-xs text-muted-foreground">Ntein Praises</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3 pb-4">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              activeProps={{
                className:
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm bg-sidebar-accent text-sidebar-accent-foreground font-medium",
              }}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-sidebar-border px-3 py-4">
          <Button variant="ghost" className="w-full justify-start gap-3" onClick={handleSignOut}>
            <LogOut className="size-4" />
            Sign out
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-border bg-card/50 px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-xl font-semibold">{title}</h1>
              {description ? (
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              ) : null}
            </div>
            <Button variant="outline" size="sm" className="md:hidden" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
          <nav className="mt-4 flex gap-2 overflow-x-auto md:hidden">
            {NAV.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="whitespace-nowrap rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
                activeProps={{
                  className:
                    "whitespace-nowrap rounded-full border border-primary px-3 py-1 text-xs text-primary",
                }}
              >
                {label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
