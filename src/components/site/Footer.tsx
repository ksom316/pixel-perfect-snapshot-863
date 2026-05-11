export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-background/40">
      <div className="container mx-auto max-w-6xl px-4 py-10 text-sm text-muted-foreground">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <p>
            <span className="font-display text-lg text-foreground">AceTutor</span> · An intelligent multimodal AI tutoring system
          </p>
          <p>KNUST · BSc Computer Science Project</p>
        </div>
      </div>
    </footer>
  );
}
