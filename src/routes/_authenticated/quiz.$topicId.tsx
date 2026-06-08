import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { GraduationCap, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

type Q = { id: string; prompt: string; choices: string[]; difficulty: number };

export const Route = createFileRoute("/_authenticated/quiz/$topicId")({
  component: QuizRunner,
});

function QuizRunner() {
  const { topicId } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Q[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [topicTitle, setTopicTitle] = useState("");
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: topic } = await supabase.from("topics").select("title").eq("id", topicId).maybeSingle();
      setTopicTitle(topic?.title ?? "");

      const { data: qs, error } = await supabase.rpc("get_quiz_questions", { _topic_id: topicId, _limit: 5 });
      if (error) {
        toast.error("Could not load questions");
        return;
      }
      setQuestions((qs ?? []) as Q[]);

      const { data: attempt, error: aErr } = await supabase
        .from("quiz_attempts")
        .insert({ user_id: user.id, topic_id: topicId })
        .select("id")
        .single();
      if (aErr) toast.error(aErr.message);
      else setAttemptId(attempt.id);
    })();
  }, [user, topicId]);

  const submit = async () => {
    if (!attemptId) return;
    setSubmitting(true);
    const { error } = await supabase.rpc("grade_quiz", { _attempt_id: attemptId, _answers: answers });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    navigate({ to: "/result/$attemptId", params: { attemptId } });
  };

  const q = questions[current];
  const isLast = current === questions.length - 1;
  const hasAnswer = q ? answers[q.id] !== undefined : false;

  const next = () => {
    if (!hasAnswer) {
      toast.error("Pick an answer to continue");
      return;
    }
    if (isLast) submit();
    else setCurrent((c) => c + 1);
  };

  const close = () => navigate({ to: "/dashboard" });

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Top bar */}
      <header className="flex h-16 items-center justify-between border-b border-border px-6">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-4 w-4" />
          </span>
          <span className="text-base font-semibold tracking-tight">AceTutor</span>
        </div>
        <button
          onClick={close}
          aria-label="Close quiz"
          className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      {/* Question */}
      <main className="flex flex-1 flex-col items-center px-6 pt-16">
        {!q ? (
          <p className="text-sm text-muted-foreground">Loading quiz…</p>
        ) : (
          <div className="w-full max-w-2xl">
            <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
              <span>Question</span>
              <span className="grid h-7 w-7 place-items-center rounded-full bg-muted text-xs font-medium text-foreground">
                {current + 1}
              </span>
              <span className="text-xs">of {questions.length}</span>
            </div>

            <h1 className="mt-8 text-center font-display text-2xl font-bold leading-snug md:text-3xl">
              {q.prompt}
            </h1>
            {topicTitle && (
              <p className="mt-2 text-center text-xs uppercase tracking-widest text-muted-foreground">
                {topicTitle}
              </p>
            )}

            <div className="mx-auto mt-10 grid max-w-md grid-cols-2 gap-3">
              {q.choices.map((c, ci) => {
                const selected = answers[q.id] === ci;
                return (
                  <button
                    key={ci}
                    type="button"
                    onClick={() => setAnswers({ ...answers, [q.id]: ci })}
                    className={`rounded-xl border px-4 py-3 text-sm transition-all ${
                      selected
                        ? "border-foreground bg-foreground/5 shadow-sm"
                        : "border-border bg-background hover:border-foreground/40 hover:bg-muted/40"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>

            <div className="mx-auto mt-8 max-w-md">
              <Button
                onClick={next}
                disabled={submitting || !attemptId}
                className="h-12 w-full rounded-xl bg-foreground text-background hover:bg-foreground/90"
              >
                {submitting ? "Grading…" : isLast ? "Submit answers" : "Next question"}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
