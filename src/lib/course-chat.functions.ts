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
      "You are AceTutor, a friendly university tutor. Explain clearly with short paragraphs, bullet points, and concrete examples. Use Markdown formatting.";

    const userPrompt =
      data.mode === "general"
        ? `Give me a clear, well-structured general overview of the course "${data.courseTitle}". Cover: what it is, the key topics, why it matters, and how someone should approach learning it.${
            data.courseSummary ? `\n\nCourse summary for context: ${data.courseSummary}` : ""
          }`
        : `You are tutoring a learner in the course "${data.courseTitle}"${
            data.courseSummary ? ` (${data.courseSummary})` : ""
          }.

First, decide whether the learner's question below is reasonably related to this course's subject matter. Be generous — adjacent concepts, prerequisites, applications, and tools commonly used in the course all count as related.

If the question is NOT related to the course at all, respond with EXACTLY this single line and nothing else:
NOT_RELATED: <one short sentence telling the user the question isn't related to ${data.courseTitle} and to ask something about the course instead>

Otherwise, answer the question clearly and helpfully using Markdown.

Learner's question:
${data.question}`;

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
    if (trimmed.startsWith("NOT_RELATED:")) {
      const reason = trimmed.replace(/^NOT_RELATED:\s*/, "");
      return { answer: "", related: false as const, reason };
    }
    return { answer, related: true as const };
  });
