import { useEffect, useMemo, useState } from "react"
import PageHeader from "@/components/system/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import NewIdeaForm from "@/components/ideas/NewIdeaForm"
import type { NewIdeaPayload } from "@/components/ideas/NewIdeaForm"
import { IdeaCard } from "@/components/ideas/IdeaCard"
import { toast } from "sonner"
import * as api from "@/lib/api"

type View = "cards" | "board" | "table"

export default function Ideas() {
  const [items, setItems] = useState<api.Idea[]>([])
  const [total, setTotal] = useState(0)
  const [q, setQ] = useState("")
  const [view, setView] = useState<View>("cards")
  const [loading, setLoading] = useState(false)

  // paging
  const [limit] = useState(12)
  const [offset, setOffset] = useState(0)
  const page = useMemo(() => Math.floor(offset / limit) + 1, [offset, limit])
  const pages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit])

  async function load() {
    setLoading(true)
    try {
      const res = await api.ideas.list({ limit, offset, q, sort: "created_at", order: "desc" })
      if (!res.ok) {
        toast.error("Failed to load ideas", { description: res.error.message })
        return
      }
      setItems(res.data.items)
      setTotal(res.data.total)
    } catch (err: any) {
      toast.error("Network error", { description: err?.message ?? "Please try again." })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset]) // (search is submit-driven)

  // ----- Create dialog state -----
  const [open, setOpen] = useState(false)

  // creation now handled by NewIdeaForm

  async function onDelete(id: string) {
    const t = toast.loading("Deleting…")
    const res = await api.ideas.del(id)
    toast.dismiss(t)
    if (!res.ok) {
      toast.error("Delete failed", { description: res.error.message })
      return
    }
    toast.success("Deleted")
    load()
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Ideas"
        description="Collect, score, and prioritize your best ideas."
        actions={
          <>
            {/* View toggles (Cards active for MVP) */}
            <div className="hidden sm:flex items-center gap-1 mr-2">
              <Button variant={view === "cards" ? "default" : "outline"} size="sm" onClick={() => setView("cards")}>
                Cards
              </Button>
              <Button variant="outline" size="sm" disabled title="Coming soon">Board</Button>
              <Button variant="outline" size="sm" disabled title="Coming soon">Table</Button>
            </div>
            <Button variant="outline" onClick={() => toast("Filters coming soon")}>Advanced Filters</Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>New Idea</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Idea</DialogTitle>
                  <DialogDescription>Keep it simple—add more fields later.</DialogDescription>
                </DialogHeader>
                <NewIdeaForm
                  onCreate={async (p: NewIdeaPayload) => {
                    const res = await api.ideas.create({
                      ...p,
                      ai_complexity: p.uses_ai ? p.ai_complexity : 0,
                    })
                    if (res.ok) {
                      setOpen(false)
                      setOffset(0)
                      load()
                    }
                    return res.ok ? { ok: true } : { ok: false, error: res.error }
                  }}
                  onCancel={() => setOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </>
        }
      />

      {/* Search row */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Input
            placeholder="Search ideas…"
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { setOffset(0); load() } }}
          />
        </div>
        <Button variant="outline" onClick={() => { setOffset(0); load() }}>Search</Button>
      </div>

      {/* Results */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          No ideas yet. Click <span className="font-medium">New Idea</span> to create your first one.
        </div>
      ) : view === "cards" ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map(it => (
            <IdeaCard key={it.id} idea={it} onDelete={onDelete} />
          ))}
        </div>
      ) : null}

      {/* Pagination */}
      {items.length > 0 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-muted-foreground">
            Page {page} of {pages} • {total} total
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - limit))}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={offset + limit >= total}
              onClick={() => setOffset(offset + limit)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}
