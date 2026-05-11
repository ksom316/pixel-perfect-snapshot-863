import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/result/$attemptId")({
  component: ResultPage,
});

function ResultPage() {
  const { attemptId } = Route.useParams();
  const { data } = useQuery({
    queryKey: ["result", attemptId],
    queryFn: async () => {
      const { data: attempt } = await supabase
        .from("quiz_attempts")
        .select("id, score, total, topic_id, topics(title)")
        .eq("id", attemptId)
        .maybeSingle();
      const { data: answers } = await supabase
        .from("attempt_answers")
        .select("question_id, selected_index, is_correct, questions(prompt, choices, correct_index, explanation)")
        .eq("attempt_id", attemptId);
      return { attempt, answers: answers ?? [] };
    },
  });

  if (!data?.attempt) {
    return <main className="container mx-auto max-w-3xl px-4 py-12 text-sm text-muted-foreground">Loading…</main>;
  }

  const pct = data.attempt.total ? Math.round((data.attempt.score / data.attempt.total) * 100) : 0;

  return (
    <main className="container mx-auto max-w-3xl px-4 py-12">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">Results</p>
      <h1 className="mt-2 font-display text-4xl">{(data.attempt as any).topics?.title}</h1>

      <div className="mt-6 rounded-2xl border border-border bg-card p-8 text-center">
        <p className="font-display text-7xl text-primary">{pct}%</p>
        <p className="mt-1 text-muted-foreground">
          {data.attempt.score} of {data.attempt.total} correct
        </p>
      </div>

      <ol className="mt-10 space-y-6">
        {data.answers.map((a: any) => {
          const correctIdx = a.questions.correct_index;
          return (
            <li key={a.question_id} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-start justify-between gap-3">
                <p className="text-base">{a.questions.prompt}</p>
                {a.is_correct ? (
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-success" />
                ) : (
                  <XCircle className="mt-1 h-5 w-5 shrink-0 text-destructive" />
                )}
              </div>
              <div className="mt-4 grid gap-2 text-sm">
                {(a.questions.choices as string[]).map((c, i) => (
                  <div
                    key={i}
                    className={`rounded-lg border p-2.5 ${
                      i === correctIdx
                        ? "border-success/60 bg-success/10"
                        : i === a.selected_index
                        ? "border-destructive/50 bg-destructive/10"
                        : "border-border"
                    }`}
                  >
                    {c}
                  </div>
                ))}
              </div>
              {a.questions.explanation && (
                <p className="mt-4 rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Why:</span> {a.questions.explanation}
                </p>
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-10 flex gap-3">
        <Button asChild>
          <Link to="/quiz/$topicId" params={{ topicId: data.attempt.topic_id }}>
            <RotateCcw className="mr-1.5 h-4 w-4" /> Retry
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </main>
  );
}
