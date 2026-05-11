import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import { FileText, Headphones, PlayCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

type Modality = "text" | "video" | "audio";

const VARK_TO_MODALITY: Record<string, Modality> = {
  visual: "video",
  aural: "audio",
  read_write: "text",
  kinesthetic: "text",
};

export const Route = createFileRoute("/_authenticated/topic/$topicId")({
  component: TopicPage,
});

function TopicPage() {
  const { topicId } = Route.useParams();
  const { user } = useAuth();
  const [modality, setModality] = useState<Modality>("text");

  const { data } = useQuery({
    queryKey: ["topic", topicId],
    queryFn: async () => {
      const { data: topic } = await supabase.from("topics").select("id, title, summary, courses(title, slug)").eq("id", topicId).maybeSingle();
      const { data: lessons } = await supabase
        .from("lessons")
        .select("id, modality, title, body_md, media_url, duration_sec")
        .eq("topic_id", topicId)
        .order("order_index");
      return { topic, lessons: lessons ?? [] };
    },
  });

  const { data: profile } = useQuery({
    queryKey: ["profile-modality", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("vark_primary").eq("id", user!.id).maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    if (profile?.vark_primary) setModality(VARK_TO_MODALITY[profile.vark_primary] ?? "text");
  }, [profile?.vark_primary]);

  const lesson = useMemo(() => data?.lessons.find((l: any) => l.modality === modality), [data, modality]);

  return (
    <main className="container mx-auto max-w-4xl px-4 py-12">
      {data?.topic && (
        <>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            <Link to="/courses/$slug" params={{ slug: (data.topic as any).courses?.slug ?? "" }} className="hover:underline">
              {(data.topic as any).courses?.title}
            </Link>
          </p>
          <h1 className="mt-2 font-display text-5xl">{data.topic.title}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{data.topic.summary}</p>
        </>
      )}

      <div className="mt-8 inline-flex rounded-full border border-border bg-card p-1 text-sm">
        {([
          { k: "text", Icon: FileText, label: "Read" },
          { k: "video", Icon: PlayCircle, label: "Watch" },
          { k: "audio", Icon: Headphones, label: "Listen" },
        ] as { k: Modality; Icon: any; label: string }[]).map(({ k, Icon, label }) => (
          <button
            key={k}
            onClick={() => setModality(k)}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 transition-colors ${
              modality === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" /> {label}
            {profile?.vark_primary && VARK_TO_MODALITY[profile.vark_primary] === k && (
              <Sparkles className="ml-0.5 h-3 w-3 text-accent" />
            )}
          </button>
        ))}
      </div>

      <section className="mt-8 rounded-2xl border border-border bg-card p-6 md:p-8">
        {lesson ? (
          <>
            <h2 className="font-display text-2xl">{lesson.title}</h2>
            <div className="mt-5">
              {lesson.modality === "text" && (
                <div className="prose-lesson max-w-none text-foreground">
                  <ReactMarkdown>{lesson.body_md ?? ""}</ReactMarkdown>
                </div>
              )}
              {lesson.modality === "video" && lesson.media_url && (
                <div className="aspect-video w-full overflow-hidden rounded-xl">
                  <iframe
                    src={lesson.media_url}
                    title={lesson.title}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
              {lesson.modality === "audio" && lesson.media_url && (
                <audio controls src={lesson.media_url} className="w-full" />
              )}
              {lesson.modality !== "text" && lesson.body_md && (
                <p className="mt-4 text-sm text-muted-foreground">{lesson.body_md}</p>
              )}
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Loading lesson…</p>
        )}
      </section>

      <div className="mt-8">
        <Button asChild size="lg">
          <Link to="/quiz/$topicId" params={{ topicId }}>
            Take the quiz
          </Link>
        </Button>
      </div>
    </main>
  );
}
