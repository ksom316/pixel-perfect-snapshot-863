import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

const VARK_LABEL: Record<string, string> = {
  visual: "Visual",
  aural: "Aural",
  read_write: "Read / Write",
  kinesthetic: "Kinesthetic",
};

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: ["profile-full", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, vark_primary, vark_scores, created_at")
        .eq("id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  return (
    <main className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-5xl">Your profile</h1>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Name</p>
          <p className="mt-1 text-lg">{data?.full_name ?? user?.email}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Email</p>
          <p className="mt-1 text-lg">{user?.email}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 sm:col-span-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Learning style (VARK)</p>
          <p className="mt-1 font-display text-3xl">
            {data?.vark_primary ? VARK_LABEL[data.vark_primary] : "Not set"}
          </p>
          <Link to="/onboarding/vark" className="mt-3 inline-block text-sm underline-offset-4 hover:underline">
            {data?.vark_primary ? "Retake" : "Take"} the VARK intake
          </Link>
        </div>
      </div>
    </main>
  );
}
