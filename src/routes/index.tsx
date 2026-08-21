import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Content Intelligence & Brand Automation - Ntein Praises" },
      {
        name: "description",
        content:
          "A private console that turns daily research into scored content opportunities, drafts, visuals and analytics - driven by n8n automation.",
      },
      {
        property: "og:title",
        content: "AI Content Intelligence & Brand Automation - Ntein Praises",
      },
      {
        property: "og:description",
        content:
          "Research intake, opportunity scoring, draft generation and visual prompts in one automated pipeline.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="grid-backdrop flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
        AI Automation Engineering
      </p>
      <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold sm:text-5xl">
        Content Intelligence & Personal Brand Automation
      </h1>
      <p className="mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
        Daily research intake, scored content opportunities, drafts, visual prompts and performance
        analytics - one pipeline, wired for n8n.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/auth"
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Enter the console
        </Link>
        <Link
          to="/dashboard"
          className="rounded-md border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
