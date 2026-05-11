import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/courses/$slug")({
  component: CourseDetail,
});

function CourseDetail() {
  const { slug } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["course", slug],
    queryFn: async () => {
      const { data: course, error: e1 } = await supabase
        .from("courses")
        .select("id, slug, title, summary")
        .eq("slug", slug)
        .maybeSingle();
      if (e1) throw e1;
      if (!course) throw notFound();
      const { data: topics, error: e2 } = await supabase
        .from("topics")
        .select("id, slug, title, summary, order_index")
        .eq("course_id", course.id)
        .order("order_index");
      if (e2) throw e2;
      return { course, topics: topics ?? [] };
    },
  });

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto max-w-4xl px-4 py-12">
        {isLoading || !data ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Course</p>
            <h1 className="mt-2 font-display text-5xl">{data.course.title}</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">{data.course.summary}</p>

            <h2 className="mt-12 font-display text-2xl">Topics</h2>
            <ul className="mt-4 divide-y divide-border rounded-2xl border border-border bg-card">
              {data.topics.map((t, i) => (
                <li key={t.id}>
                  <Link
                    to="/topic/$topicId"
                    params={{ topicId: t.id }}
                    className="flex items-center justify-between gap-4 p-5 transition-colors hover:bg-muted/50"
                  >
                    <div>
                      <p className="text-xs text-muted-foreground">Topic {i + 1}</p>
                      <p className="mt-0.5 font-medium">{t.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{t.summary}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
