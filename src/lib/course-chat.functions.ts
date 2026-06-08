import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const schema = z.object({
  courseTitle: z.string().min(1).max(200),
  courseSummary: z.string().max(2000).optional(),
  mode: z.enum(["general", "ask", "explain", "quiz", "summarize", "test", "recommend"]),
  question: z.string().max(2000).optional(),
  moduleTitle: z.string().max(200).optional(),
  moduleSummary: z.string().max(2000).optional(),
  performanceSummary: z.string().max(2000).optional(),
});

async function callGateway(messages: { role: string; content: string }[]) {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "google/gemini-2.5-flash", messages }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AI gateway error (${res.status}): ${text.slice(0, 300)}`);
  }
  const json = await res.json();
  return (json.choices?.[0]?.message?.content ?? "No response.") as string;
}

export const askCourse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data }) => {
    const system =
      "You are AceTutor, an AI course tutor embedded in a learning dashboard. You ONLY help with the specific course the student is currently studying. Always prioritize course materials and the student's performance context. Use Markdown with short paragraphs, bullet points, and concrete examples.";

    const courseCtx = `Course: "${data.courseTitle}"${data.courseSummary ? `\nCourse summary: ${data.courseSummary}` : ""}`;
    const moduleCtx = data.moduleTitle
      ? `\nFocused module: "${data.moduleTitle}"${data.moduleSummary ? ` — ${data.moduleSummary}` : ""}`
      : "";
    const perfCtx = data.performanceSummary ? `\nStudent performance:\n${data.performanceSummary}` : "";
    const fullCtx = `${courseCtx}${moduleCtx}${perfCtx}`;

    let userPrompt = "";
    switch (data.mode) {
      case "general":
        userPrompt = `${fullCtx}\n\nGive a clear, well-structured general overview of this course: what it is, key topics, why it matters, and how to approach learning it.`;
        break;
      case "explain":
        userPrompt = `${fullCtx}\n\nExplain the key concepts of ${data.moduleTitle ?? "this course"} clearly with examples a student can follow.`;
        break;
      case "quiz":
        userPrompt = `${fullCtx}\n\nGenerate a short practice quiz (5 multiple-choice questions) based on ${data.moduleTitle ?? "this course"}. After each question, on a new line, give the correct answer and a one-sentence explanation. Use Markdown.`;
        break;
      case "summarize":
        userPrompt = `${fullCtx}\n\nSummarize the lecture material for ${data.moduleTitle ?? "this course"} as concise bullet points a student can revise from.`;
        break;
      case "test":
        userPrompt = `${fullCtx}\n\nAsk the student 5 progressively harder open-ended questions to test their knowledge of ${data.moduleTitle ?? "this course"}. Do NOT give the answers — invite them to attempt first.`;
        break;
      case "recommend":
        userPrompt = `${fullCtx}\n\nBased ONLY on the student's performance data above, give 3-5 personalized study recommendations. For each: state the weak area, what to revise (reference a module if possible), and which quiz to attempt next. Be concrete and supportive. Use Markdown bullet points.`;
        break;
      case "ask":
      default:
        userPrompt = `${fullCtx}\n\nFirst, decide whether the learner's question below is reasonably related to this course. Be generous — adjacent concepts, prerequisites, applications, and tools commonly used in the course count as related.

If the question is NOT related to the course at all, respond EXACTLY with one line:
NOT_RELATED: <one short sentence telling the user the question isn't related to ${data.courseTitle} and to ask something about the course instead>

Otherwise, answer the question clearly. Prioritize this order: (1) the course materials/module above, (2) the student's performance context, (3) general knowledge only if needed. Use Markdown.

Learner's question:
${data.question}`;
        break;
    }

    const answer = await callGateway([
      { role: "system", content: system },
      { role: "user", content: userPrompt },
    ]);
    const trimmed = answer.trim();
    if (trimmed.startsWith("NOT_RELATED:")) {
      return { answer: "", related: false as const, reason: trimmed.replace(/^NOT_RELATED:\s*/, "") };
    }
    return { answer, related: true as const };
  });
