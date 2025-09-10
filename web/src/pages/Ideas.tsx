import { useEffect, useMemo, useState } from "react"
import PageHeader from "@/components/system/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  const [form, setForm] = useState({
    title: "",
    description: "",
    scalability: 3,
    ease_to_build: 3,
    uses_ai: false,
    ai_complexity: 0,
  })

  async function onCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Please fill in title and description")
      return
    }
    const t = toast.loading("Creating idea…")
    const res = await api.ideas.create({
      ...form,
      ai_complexity: form.uses_ai ? form.ai_complexity : 0,
    })
    toast.dismiss(t)
    if (!res.ok) {
      toast.error("Could not create idea", { description: res.error.message })
      return
    }
    toast.success("Idea created")
    setOpen(false)
    setForm({ title: "", description: "", scalability: 3, ease_to_build: 3, uses_ai: false, ai_complexity: 0 })
    // reload first page so the new one is visible quickly
    setOffset(0)
    load()
  }

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

                <form onSubmit={onCreate} className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" value={form.title} onChange={e => setForm(v => ({ ...v, title: e.target.value }))} required />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="desc">Description</Label>
                    <Textarea id="desc" value={form.description} onChange={e => setForm(v => ({ ...v, description: e.target.value }))} required />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="scal">Scalability (1–5)</Label>
                      <Input
                        id="scal"
                        type="number"
                        min={1}
                        max={5}
                        value={form.scalability}
                        onChange={e => setForm(v => ({ ...v, scalability: Number(e.target.value) }))}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="ease">Ease to build (1–5)</Label>
                      <Input
                        id="ease"
                        type="number"
                        min={1}
                        max={5}
                        value={form.ease_to_build}
                        onChange={e => setForm(v => ({ ...v, ease_to_build: Number(e.target.value) }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={form.uses_ai}
                        onChange={e => setForm(v => ({ ...v, uses_ai: e.target.checked, ai_complexity: e.target.checked ? v.ai_complexity : 0 }))}
                      />
                      <span>Uses AI</span>
                    </label>

                    <div className="space-y-1">
                      <Label htmlFor="ai">AI Complexity (0–5)</Label>
                      <Input
                        id="ai"
                        type="number"
                        min={0}
                        max={5}
                        value={form.ai_complexity}
                        onChange={e => setForm(v => ({ ...v, ai_complexity: Number(e.target.value) }))}
                        disabled={!form.uses_ai}
                        aria-disabled={!form.uses_ai}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button type="submit">Create</Button>
                  </DialogFooter>
                </form>
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
