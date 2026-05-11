import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Brain, Headphones, PlayCircle, Sparkles, Target } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

const courses = [
  { slug: "dsa", title: "Data Structures & Algorithms", blurb: "Arrays, sorting, complexity." },
  { slug: "dbms", title: "Database Management", blurb: "SQL, joins, normalization." },
  { slug: "networks", title: "Computer Networks", blurb: "OSI, TCP/IP, sockets." },
  { slug: "se", title: "Software Engineering", blurb: "SDLC, agile, patterns." },
  { slug: "ai", title: "Introduction to AI", blurb: "Search, ML fundamentals." },
];

function LandingPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 opacity-60 [background:radial-gradient(60%_50%_at_50%_0%,oklch(0.78_0.16_70/0.18),transparent_70%)]" />
          <div className="container mx-auto max-w-6xl px-4 pt-20 pb-16 md:pt-28 md:pb-24">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mx-auto max-w-3xl text-center"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3 text-accent" /> Adaptive · Multimodal · Open-source
              </span>
              <h1 className="mt-5 font-display text-5xl leading-[1.05] md:text-7xl">
                Learn CS the way <em className="text-accent">you</em> learn best.
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
                AceTutor adapts every lesson to your VARK learning style — switching between text,
                video, and audio — and tests what you know with quizzes that get smarter as you do.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button asChild size="lg" className="h-12 px-6 text-base">
                  <Link to="/signup">
                    Start learning <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 px-6 text-base">
                  <Link to="/courses">Browse courses</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Pillars */}
        <section className="container mx-auto max-w-6xl px-4 py-12">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: Brain, title: "VARK-aware", body: "A quick intake classifies how you process information — visual, aural, read/write, or kinesthetic." },
              { icon: PlayCircle, title: "Three modalities", body: "Every topic ships as readable notes, an explainer video, and a focused audio lesson." },
              { icon: Target, title: "Adaptive quizzes", body: "Question difficulty scales with your rolling accuracy so you're always working the right edge." },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-border bg-card p-6">
                <Icon className="h-6 w-6 text-accent" />
                <h3 className="mt-4 text-lg font-medium text-foreground">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Courses preview */}
        <section className="container mx-auto max-w-6xl px-4 py-16">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="font-display text-4xl">Five university courses, ready now.</h2>
              <p className="mt-2 text-muted-foreground">Hand-curated topics for the BSc CS / IT curriculum.</p>
            </div>
            <Link to="/courses" className="hidden text-sm text-muted-foreground hover:text-foreground md:inline-flex md:items-center">
              See all <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c, i) => (
              <motion.div
                key={c.slug}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Link
                  to="/courses/$slug"
                  params={{ slug: c.slug }}
                  className="group block h-full rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>
                  <h3 className="mt-4 font-display text-2xl">{c.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{c.blurb}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="container mx-auto max-w-6xl px-4 py-16">
          <div className="rounded-3xl border border-border bg-card p-8 md:p-12">
            <h2 className="font-display text-3xl md:text-4xl">How AceTutor works</h2>
            <ol className="mt-8 grid gap-6 md:grid-cols-3">
              {[
                { n: "01", t: "Tell us how you learn", d: "Answer 16 short questions to discover your VARK style.", Icon: Brain },
                { n: "02", t: "Study in your modality", d: "Lessons default to your preferred medium. Switch any time.", Icon: Headphones },
                { n: "03", t: "Quiz, review, repeat", d: "Adaptive quizzes diagnose gaps with plain-language feedback.", Icon: Target },
              ].map(({ n, t, d, Icon }) => (
                <li key={n} className="rounded-2xl border border-border/60 p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-3xl text-muted-foreground/50">{n}</span>
                    <Icon className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="mt-3 text-lg font-medium">{t}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{d}</p>
                </li>
              ))}
            </ol>
            <div className="mt-8">
              <Button asChild size="lg">
                <Link to="/signup">Create your free account</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
