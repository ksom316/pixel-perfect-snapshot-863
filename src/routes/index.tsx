import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Brain, Headphones, PlayCircle, Sparkles, Target, CheckCircle2 } from "lucide-react";
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

const stats = [
  { value: "5", label: "Courses" },
  { value: "16", label: "VARK questions" },
  { value: "3", label: "Modalities" },
  { value: "24/7", label: "AI tutor" },
];

function LandingPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden pt-10 md:pt-16">
          <div className="absolute inset-x-0 top-0 -z-10 h-[520px] [background:radial-gradient(60%_60%_at_50%_0%,color-mix(in_oklab,var(--color-primary)_18%,transparent),transparent_70%)]" />
          <div className="container mx-auto max-w-6xl px-4 pb-16 md:pb-24">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mx-auto max-w-4xl text-center"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Sparkles className="h-3 w-3" /> Next-Gen Adaptive Tutor
              </span>
              <h1 className="mt-6 text-5xl font-bold leading-[1.02] tracking-tight md:text-7xl">
                One Tutor.{" "}
                <span className="text-primary">Three Ways</span>{" "}
                to Learn.
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
                AceTutor adapts every lesson to your VARK learning style — switching between text,
                video, and audio — and tests what you know with quizzes that get smarter as you do.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button asChild size="lg" className="h-12 rounded-full px-6 text-base">
                  <Link to="/signup">
                    Get Started Free <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 rounded-full px-6 text-base">
                  <Link to="/courses">Browse courses</Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-6 md:grid-cols-4">
                {stats.map((s) => (
                  <div key={s.label} className="text-left md:text-center">
                    <p className="text-4xl font-bold tracking-tight md:text-5xl">{s.value}</p>
                    <p className="mt-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Mock dashboard preview card */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="relative mx-auto mt-16 max-w-5xl"
            >
              <div className="rounded-2xl border border-border bg-card shadow-2xl shadow-primary/10">
                <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-accent/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
                  <span className="ml-3 text-xs text-muted-foreground">acetutor.app/dashboard</span>
                </div>
                <div className="grid gap-4 p-6 md:grid-cols-3">
                  <div className="rounded-xl border border-border bg-background p-5">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">Learning style</p>
                    <p className="mt-2 text-2xl font-bold">Visual</p>
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div className="h-full w-[72%] rounded-full bg-primary" />
                    </div>
                  </div>
                  <div className="rounded-xl border border-border bg-background p-5">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">Continue learning</p>
                    <p className="mt-2 text-base font-semibold">Binary Search Trees</p>
                    <p className="mt-1 text-xs text-muted-foreground">DSA · Lesson 4 of 9</p>
                    <button className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
                      <PlayCircle className="h-3.5 w-3.5" /> Resume
                    </button>
                  </div>
                  <div className="rounded-xl border border-border bg-background p-5">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">Rolling accuracy</p>
                    <p className="mt-2 text-2xl font-bold">87%</p>
                    <p className="mt-1 inline-flex items-center gap-1 text-xs text-success">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Difficulty: Adaptive
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Pillars */}
        <section className="container mx-auto max-w-6xl px-4 py-16">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: Brain, title: "VARK-aware", body: "A quick intake classifies how you process information — visual, aural, read/write, or kinesthetic." },
              { icon: PlayCircle, title: "Three modalities", body: "Every topic ships as readable notes, an explainer video, and a focused audio lesson." },
              { icon: Target, title: "Adaptive quizzes", body: "Question difficulty scales with your rolling accuracy so you're always working the right edge." },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/30">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Courses preview */}
        <section className="container mx-auto max-w-6xl px-4 py-16">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-4xl font-bold tracking-tight">Five university courses, ready now.</h2>
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
                  className="group block h-full rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>
                  <h3 className="mt-4 text-2xl font-semibold tracking-tight">{c.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{c.blurb}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="container mx-auto max-w-6xl px-4 py-16">
          <div className="rounded-3xl border border-border bg-card p-8 md:p-12">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">How AceTutor works</h2>
            <ol className="mt-8 grid gap-6 md:grid-cols-3">
              {[
                { n: "01", t: "Tell us how you learn", d: "Answer 16 short questions to discover your VARK style.", Icon: Brain },
                { n: "02", t: "Study in your modality", d: "Lessons default to your preferred medium. Switch any time.", Icon: Headphones },
                { n: "03", t: "Quiz, review, repeat", d: "Adaptive quizzes diagnose gaps with plain-language feedback.", Icon: Target },
              ].map(({ n, t, d, Icon }) => (
                <li key={n} className="rounded-2xl border border-border/60 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-muted-foreground/40">{n}</span>
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mt-3 text-lg font-semibold">{t}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{d}</p>
                </li>
              ))}
            </ol>
            <div className="mt-8">
              <Button asChild size="lg" className="rounded-full">
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
