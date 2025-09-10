import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Idea } from "@/lib/api"
import { Sparkles, Trash2, MoreHorizontal } from "lucide-react"

function Bar({ value, max = 10 }: { value: number; max?: number }) {
  const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)))
  return (
    <div className="h-2 w-full rounded-full bg-white/10">
      <div className="h-2 rounded-full bg-white" style={{ width: `${pct}%` }} />
    </div>
  )
}

// Stars removed — average/stars moved/removed from footer per design

export function IdeaCard({
  idea,
  onDelete,
}: {
  idea: Idea
  onDelete?: (id: string) => void
}) {
  const getScoreColor = (percent: number) => {
    // percent should be 0..100
    if (percent >= 80) return "text-green-600 dark:text-green-400 bg-muted/50"
    if (percent >= 60) return "text-yellow-600 dark:text-yellow-400 bg-muted/50"
    if (percent >= 40) return "text-orange-600 dark:text-orange-400 bg-muted/50"
    return "text-red-600 dark:text-red-400 bg-muted/50"
  }

  const createdStr = new Date(idea.created_at).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  // idea.score from the backend is 0..5 (see app/models/idea.py). Convert to 0..100 for display.
  const percentScore = idea.score > 10 ? Math.round(idea.score) : Math.round((idea.score / 5) * 100)

  return (
  <Card className="group relative bg-card border-border hover:border-accent-foreground/20 transition-all duration-200 hover:shadow-lg hover:shadow-black/5 rounded-2xl min-h-[340px] flex flex-col w-full sm:w-80 md:w-96">
      {/* AI Badge - Top Right */}
      {idea.uses_ai && (
        <div className="absolute top-3 right-3 z-10">
          <div className="px-2 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-medium rounded-full shadow flex items-center gap-1">
            <Sparkles className="size-3" />
            <span>AI</span>
          </div>
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="mb-1">
          <div className="flex items-center justify-between min-h-[3rem]">
            <CardTitle className="text-lg md:text-[1.15rem] font-semibold flex-1 pr-3">{idea.title}</CardTitle>
            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <MoreHorizontal className="size-4" />
            </Button>
          </div>
        </div>

        <div className="min-h-[3.5rem] flex items-start">
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{idea.description}</p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 flex-1 flex flex-col">
        <div className="space-y-4 flex-1">
          {/* Tags - small area */}
          <div className="min-h-[2rem] flex items-start">
            {idea.tags?.length ? (
              <div className="flex flex-wrap gap-1.5">
                {idea.tags.slice(0, 3).map(t => (
                  <Badge key={t} variant="secondary" className="text-xs font-normal px-2 py-1">{t}</Badge>
                ))}
                {idea.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs px-2 py-1">+{idea.tags.length - 3} more</Badge>
                )}
              </div>
            ) : (
              <div className="opacity-0">
                <Badge variant="secondary" className="text-xs font-normal px-2 py-1">Placeholder</Badge>
              </div>
            )}
          </div>

          {/* Metrics */}
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-xs text-muted-foreground">Scalability</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bar value={idea.scalability} max={5} />
                  <span className="text-sm font-medium min-w-[20px]">{idea.scalability}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs text-muted-foreground">Ease of Build</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bar value={idea.ease_to_build} max={5} />
                  <span className="text-sm font-medium min-w-[20px]">{idea.ease_to_build}</span>
                </div>
              </div>
            </div>

            <div className="min-h-[3rem] flex flex-col justify-start">
              {idea.uses_ai ? (
                <div className="space-y-2 pt-2 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    <span className="text-xs text-muted-foreground">AI Complexity</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bar value={idea.ai_complexity} max={5} />
                    <span className="text-sm font-medium min-w-[20px]">{idea.ai_complexity}</span>
                  </div>
                </div>
              ) : (
                <div className="pt-2 border-t border-border/50 opacity-0">
                  <div className="space-y-2">
                    <div className="text-xs">AI Complexity</div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 bg-muted rounded" />
                      <span className="text-sm font-medium min-w-[20px]">0</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-4 border-t border-border/30">
        <div className="mt-2 relative flex w-full items-center">
          <div className="flex items-center gap-2">
            <time dateTime={idea.created_at} className="text-xs text-muted-foreground">{createdStr}</time>
          </div>

          <div className="absolute left-1/2 transform -translate-x-1/2">
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium ${getScoreColor(percentScore)}`}>
              <span>{percentScore}</span>
              <span className="text-xs opacity-75">/100</span>
            </div>
          </div>

          <div className="ml-auto flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
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
