import { Link, useNavigate } from "@tanstack/react-router";
import { GraduationCap, LogOut, Moon, Sun } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

export function Header() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-4 z-40 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex h-14 items-center justify-between rounded-full border border-border bg-background/80 px-3 pl-5 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-4 w-4" />
            </span>
            <span className="text-base font-bold tracking-tight">AceTutor</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link to="/courses" className="text-muted-foreground transition-colors hover:text-foreground" activeProps={{ className: "text-foreground" }}>
              Courses
            </Link>
            {user && (
              <Link to="/dashboard" className="text-muted-foreground transition-colors hover:text-foreground" activeProps={{ className: "text-foreground" }}>
                Dashboard
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-1.5">
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            {!loading && !user && (
              <>
                <Button asChild variant="ghost" size="sm" className="rounded-full">
                  <Link to="/login">Log in</Link>
                </Button>
                <Button asChild size="sm" className="rounded-full px-4">
                  <Link to="/signup">Get started</Link>
                </Button>
              </>
            )}
            {user && (
              <>
                <Button asChild variant="ghost" size="sm" className="rounded-full">
                  <Link to="/profile">Profile</Link>
                </Button>
                <Button onClick={signOut} variant="outline" size="sm" className="rounded-full">
                  <LogOut className="mr-1.5 h-4 w-4" /> Sign out
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
