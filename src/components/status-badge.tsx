import { Badge } from "@/components/ui/badge";

const TONE: Record<string, string> = {
  done: "bg-success/15 text-success border-success/30",
  completed: "bg-success/15 text-success border-success/30",
  published: "bg-success/15 text-success border-success/30",
  approved: "bg-success/15 text-success border-success/30",
  ready: "bg-success/15 text-success border-success/30",
  running: "bg-primary/15 text-primary border-primary/30",
  generating: "bg-primary/15 text-primary border-primary/30",
  new: "bg-primary/15 text-primary border-primary/30",
  planned: "bg-muted text-muted-foreground border-border",
  pending: "bg-warning/15 text-warning border-warning/30",
  draft: "bg-warning/15 text-warning border-warning/30",
  failed: "bg-destructive/15 text-destructive border-destructive/30",
  error: "bg-destructive/15 text-destructive border-destructive/30",
};

export function StatusBadge({ status }: { status?: string | null }) {
  if (!status) return <span className="text-muted-foreground">—</span>;
  const tone = TONE[status.toLowerCase()] ?? "bg-secondary text-secondary-foreground border-border";
  return (
    <Badge variant="outline" className={`font-mono text-[11px] uppercase ${tone}`}>
      {status}
    </Badge>
  );
}
