import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Idea } from "@/lib/api"
import { Sparkles, Trash2 } from "lucide-react"

function Bar({ value, max = 10 }: { value: number; max?: number }) {
  const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)))
  return (
    <div className="h-2 w-full rounded-full bg-white/10">
      <div className="h-2 rounded-full bg-white" style={{ width: `${pct}%` }} />
    </div>
  )
}

function Stars({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(5, Math.round(value)))
  return (
    <div className="flex gap-1" aria-label={`Score ${value.toFixed(1)} / 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={cn("size-2 rounded-full", i < clamped ? "bg-primary" : "bg-border")} />
      ))}
    </div>
  )
}

export function IdeaCard({
  idea,
  onDelete,
}: {
  idea: Idea
  onDelete?: (id: string) => void
}) {
  const createdStr = new Date(idea.created_at).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return (
    <Card className="w-full rounded-2xl border border-border/60 bg-card/60 shadow-sm">
      <CardHeader className="pb-0">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-lg md:text-[1.15rem] font-semibold">{idea.title}</CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-2">{idea.description}</p>
          </div>
          <div className="flex items-center gap-2">
            {idea.uses_ai ? (
              <Badge className="gap-1"><Sparkles className="size-3" /> AI</Badge>
            ) : (
              <Badge variant="secondary">Idea</Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-2 text-sm">
          <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-emerald-500" /> Scalability</span>
          <Bar value={idea.scalability} max={5} />
          <span className="tabular-nums">{idea.scalability}/5</span>

          <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-blue-500" /> Ease</span>
          <Bar value={idea.ease_to_build} max={5} />
          <span className="tabular-nums">{idea.ease_to_build}/5</span>

          <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-purple-500" /> AI Complexity</span>
          <Bar value={idea.uses_ai ? idea.ai_complexity : 0} max={5} />
          <span className="tabular-nums">{idea.uses_ai ? idea.ai_complexity : 0}/5</span>
        </div>
      </CardContent>

      <CardFooter className="pt-4 border-t border-border/30">
        <div className="mt-2 flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <time dateTime={idea.created_at} className="text-xs text-muted-foreground">{createdStr}</time>
            {idea.tags?.length ? (
              <span className="ml-2 truncate max-w-[12rem] text-xs">
                {idea.tags.slice(0, 3).map(t => <Badge key={t} variant="outline" className="mr-1 text-xs">{t}</Badge>)}
                {idea.tags.length > 3 ? "…" : null}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="mr-1 text-xs">Avg:</span>
            <Stars value={idea.score} />
            <Button
              variant="ghost"
              size="icon"
              className="ml-2 text-muted-foreground"
              onClick={() => onDelete?.(idea.id)}
              aria-label="Delete idea"
              title="Delete"
            >
              <Trash2 className="size-4" />
            </Button>
           </div>
        </div>
      </CardFooter>
    </Card>
  )
}
