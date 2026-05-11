import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
    if (Object.keys(answers).length < questions.length) {
      toast.error("Answer every question before submitting");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.rpc("grade_quiz", { _attempt_id: attemptId, _answers: answers });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    navigate({ to: "/result/$attemptId", params: { attemptId } });
  };

  return (
    <main className="container mx-auto max-w-3xl px-4 py-12">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">Quiz</p>
      <h1 className="mt-2 font-display text-4xl">{topicTitle}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Answer all questions, then submit for instant feedback.</p>

      <ol className="mt-10 space-y-8">
        {questions.map((q, idx) => (
          <li key={q.id} className="rounded-2xl border border-border bg-card p-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Question {idx + 1}</p>
            <p className="mt-2 text-lg">{q.prompt}</p>
            <div className="mt-4 grid gap-2">
              {q.choices.map((c, ci) => (
                <label
                  key={ci}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                    answers[q.id] === ci ? "border-accent bg-accent/10" : "border-border hover:bg-muted/40"
                  }`}
                >
                  <input
                    type="radio"
                    name={q.id}
                    checked={answers[q.id] === ci}
                    onChange={() => setAnswers({ ...answers, [q.id]: ci })}
                    className="h-4 w-4 accent-primary"
                  />
                  <span className="text-sm">{c}</span>
                </label>
              ))}
            </div>
          </li>
        ))}
      </ol>

      <Button onClick={submit} disabled={submitting || !attemptId} size="lg" className="mt-10">
        {submitting ? "Grading…" : "Submit answers"}
      </Button>
    </main>
  );
}
