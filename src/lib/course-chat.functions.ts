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
        : `In the context of the course "${data.courseTitle}"${
            data.courseSummary ? ` (${data.courseSummary})` : ""
          }, answer the following question for a learner:\n\n${data.question}`;

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
    return { answer };
  });
