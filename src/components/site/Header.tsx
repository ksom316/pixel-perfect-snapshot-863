import { Link, useNavigate } from "@tanstack/react-router";
import { GraduationCap, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function Header() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="font-display text-2xl font-medium tracking-tight">AceTutor</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm md:flex">
          <Link to="/courses" className="text-muted-foreground transition-colors hover:text-foreground" activeProps={{ className: "text-foreground" }}>
            Courses
          </Link>
          {user && (
            <Link to="/dashboard" className="text-muted-foreground transition-colors hover:text-foreground" activeProps={{ className: "text-foreground" }}>
              Dashboard
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {!loading && !user && (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/signup">Get started</Link>
              </Button>
            </>
          )}
          {user && (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/profile">Profile</Link>
              </Button>
              <Button onClick={signOut} variant="outline" size="sm">
                <LogOut className="mr-1.5 h-4 w-4" /> Sign out
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
