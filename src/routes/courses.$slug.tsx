import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import ReactMarkdown from "react-markdown";
import { ArrowUp, BookOpen, Loader2, Sparkles } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { askCourse } from "@/lib/course-chat.functions";

export const Route = createFileRoute("/courses/$slug")({
  component: CourseDetail,
});

function CourseDetail() {
  const { slug } = Route.useParams();
  const ask = useServerFn(askCourse);
  const [input, setInput] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["course", slug],
    queryFn: async () => {
      const { data: course, error } = await supabase
        .from("courses")
        .select("id, slug, title, summary")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      if (!course) throw notFound();
      return course;
    },
  });

  const mutation = useMutation({
    mutationFn: async (vars: { mode: "general" | "ask"; question?: string }) => {
      if (!data) throw new Error("Course not loaded");
      return ask({
        data: {
          courseTitle: data.title,
          courseSummary: data.summary ?? undefined,
          mode: vars.mode,
          question: vars.question,
        },
      });
    },
  });

  const submitQuestion = () => {
    const q = input.trim();
    if (!q || mutation.isPending) return;
    mutation.mutate({ mode: "ask", question: q });
  };

  const suggestions = [
    "Explain the core concepts simply",
    "What should I study first?",
    "Give me a real-world example",
    "Common mistakes beginners make",
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto max-w-3xl px-4 py-12">
        {isLoading || !data ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              <Link to="/courses" className="hover:underline">Courses</Link>
            </p>
            <h1 className="mt-2 font-display text-5xl">{data.title}</h1>
            {data.summary && <p className="mt-3 text-muted-foreground">{data.summary}</p>}

            <div className="mt-10 flex flex-col items-center text-center">
              <h2 className="font-display text-2xl">What would you like to learn?</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Ask anything about this course — or get a general overview.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submitQuestion();
                }}
                className="mt-6 w-full"
              >
                <div className="group relative flex items-end gap-2 rounded-2xl border border-border bg-card p-3 shadow-sm focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/15">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        submitQuestion();
                      }
                    }}
                    rows={1}
                    placeholder={`Ask anything about ${data.title}…`}
                    className="max-h-40 min-h-[2.25rem] flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!input.trim() || mutation.isPending}
                    className="h-9 w-9 shrink-0 rounded-full"
                    aria-label="Send"
                  >
                    {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
                  </Button>
                </div>
              </form>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  disabled={mutation.isPending}
                  onClick={() => mutation.mutate({ mode: "general" })}
                >
                  <BookOpen className="mr-1.5 h-4 w-4" /> General information
                </Button>
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={mutation.isPending}
                    onClick={() => {
                      setInput(s);
                    }}
                    className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {(mutation.isPending || mutation.data || mutation.isError) && (
              <section className="mt-10 rounded-2xl border border-border bg-card p-6 md:p-8">
                <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-primary" /> AceTutor
                </div>
                {mutation.isPending && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
                  </div>
                )}
                {mutation.isError && (
                  <p className="text-sm text-destructive">
                    Couldn't get a response: {(mutation.error as Error).message}
                  </p>
                )}
                {mutation.data && (
                  <div className="prose-lesson max-w-none text-foreground">
                    <ReactMarkdown>{mutation.data.answer}</ReactMarkdown>
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
