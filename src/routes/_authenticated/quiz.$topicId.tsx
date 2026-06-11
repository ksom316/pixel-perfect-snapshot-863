import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
  const [animKey, setAnimKey] = useState(0);

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

  const total = questions.length;
  const q = questions[current];
  const isLast = current === total - 1;
  const selected = q ? answers[q.id] : undefined;
  const hasAnswer = selected !== undefined;

  const handleNext = () => {
    if (!hasAnswer) return;
    if (isLast) {
      submit();
    } else {
      setCurrent((c) => c + 1);
      setAnimKey((k) => k + 1);
    }
  };

  const handleClose = () => navigate({ to: "/dashboard" });

  if (!q) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading quiz…</p>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-primary" />
            <span className="font-display text-lg font-semibold">{topicTitle || "Quiz"}</span>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close quiz"
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <Progress value={((current + (hasAnswer ? 1 : 0)) / total) * 100} className="h-1 rounded-none bg-muted" />
      </div>

      {/* Body */}
      <div className="mx-auto flex max-w-3xl flex-col items-center px-6 py-12 sm:py-16">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Question
          </span>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {current + 1}
          </span>
          <span className="text-sm text-muted-foreground">of {total}</span>
        </div>

        <div key={animKey} className="w-full animate-fade-in">
          <h1 className="mt-10 text-center font-display text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
            {q.prompt}
          </h1>

          <div className="mx-auto mt-12 grid w-full max-w-2xl gap-4 sm:grid-cols-2">
            {q.choices.map((c, ci) => {
              const isSelected = selected === ci;
              return (
                <button
                  key={ci}
                  onClick={() => setAnswers({ ...answers, [q.id]: ci })}
                  className={`group flex min-h-[88px] items-center justify-center rounded-2xl border-2 px-6 py-5 text-center text-base font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    isSelected
                      ? "border-primary bg-primary/10 text-foreground shadow-sm"
                      : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted/40"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground group-hover:border-primary/40"
                      }`}
                    >
                      {String.fromCharCode(65 + ci)}
                    </span>
                    <span>{c}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-14 flex justify-center">
            <Button
              size="lg"
              onClick={handleNext}
              disabled={!hasAnswer || submitting}
              className="h-12 w-full max-w-xs rounded-full text-base font-semibold"
            >
              {submitting ? "Grading…" : isLast ? "Finish Quiz" : "Next Question"}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
