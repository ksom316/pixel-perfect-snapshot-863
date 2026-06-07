import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const schema = z.object({
  courseTitle: z.string().min(1).max(200),
  courseSummary: z.string().max(2000).optional(),
  mode: z.enum(["general", "ask"]),
  question: z.string().max(1000).optional(),
});

export const askCourse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const system =
      `You are AceTutor, a friendly university tutor strictly scoped to the course "${data.courseTitle}"${
        data.courseSummary ? ` (${data.courseSummary})` : ""
      }.

RELEVANCE RULES — follow exactly:
- If the user's question is NOT clearly related to the course "${data.courseTitle}" (its concepts, theory, practice, history, tools, or typical curriculum), respond with EXACTLY this single line and nothing else:
NOT_RELEVANT: <one short sentence explaining the question is outside the scope of ${data.courseTitle}>
- Otherwise, answer clearly using Markdown — short paragraphs, bullet points, and concrete examples.`;

    const userPrompt =
      data.mode === "general"
        ? `Give a clear, well-structured general overview of "${data.courseTitle}": what it is, key topics, why it matters, and how to approach learning it.`
        : `Question from a learner: ${data.question}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`AI gateway error (${res.status}): ${text.slice(0, 300)}`);
    }
    const json = await res.json();
    const answer: string = json.choices?.[0]?.message?.content ?? "No response.";
    const trimmed = answer.trim();
    if (data.mode === "ask" && trimmed.startsWith("NOT_RELEVANT")) {
      const reason = trimmed.replace(/^NOT_RELEVANT:?\s*/i, "").trim();
      return { answer: "", notRelevant: true, reason: reason || `That question doesn't seem related to ${data.courseTitle}.` };
    }
    return { answer, notRelevant: false as const };
  });
