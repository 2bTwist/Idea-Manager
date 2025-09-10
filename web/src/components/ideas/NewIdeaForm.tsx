import React, { useEffect, useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import * as api from "@/lib/api"
import Switch from "@/components/ui/switch"
import TagPill from "@/components/ui/tag-pill"

export type NewIdeaPayload = {
  title: string
  description: string
  scalability: number
  ease_to_build: number
  uses_ai: boolean
  ai_complexity: number
  tags?: string[]
}

export default function NewIdeaForm({
  onCreate,
  onSuccess,
  onCancel,
}: {
  onCreate: (p: NewIdeaPayload) => Promise<{ ok: boolean; error?: any }>
  onSuccess?: () => void
  onCancel?: () => void
}) {
  const [form, setForm] = useState<NewIdeaPayload>({
    title: "",
    description: "",
    scalability: 3,
    ease_to_build: 3,
    uses_ai: false,
    ai_complexity: 0,
    tags: [],
  })
  const [loading, setLoading] = useState(false)
  const [availableTags, setAvailableTags] = useState<string[]>([])

  // score weights mirror backend (app/core/config.py)
  const W = {
    SCAL: 0.35,
    EASE: 0.25,
    AI_FLAG: 0.10,
    AI_COMPLEX: 0.30,
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const res = await api.ideas.listAvailableTags()
      if (res.ok && mounted) setAvailableTags(res.data.available)
    })()
    return () => { mounted = false }
  }, [])

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!form.title.trim() || !form.description.trim()) return
    setLoading(true)
    try {
      const res = await onCreate(form)
      if (res.ok) {
        onSuccess?.()
      }
    } finally {
      setLoading(false)
    }
  }

  function calcScorePercent(p: NewIdeaPayload) {
    // backend: norm15 maps 1..5 -> 0..1 as (v-1)/4
    const norm15 = (v: number) => (v - 1.0) / 4.0
    const norm05 = (v: number) => v / 5.0
    const base =
      W.SCAL * norm15(p.scalability) +
      W.EASE * norm15(p.ease_to_build) +
      W.AI_FLAG * (p.uses_ai ? 1.0 : 0.0) +
      W.AI_COMPLEX * norm05(p.ai_complexity)
    return Math.round(base * 100)
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="title">Idea Title</Label>
        <Input id="title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
      </div>

      <div className="space-y-1">
        <Label htmlFor="desc">Description</Label>
        <Textarea id="desc" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Scalability (1–5)</Label>
          <div className="text-sm">{form.scalability}/5</div>
        </div>
        <input
          type="range"
          min={1}
          max={5}
          value={form.scalability}
          onChange={e => setForm({ ...form, scalability: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Ease of Build (1–5)</Label>
          <div className="text-sm">{form.ease_to_build}/5</div>
        </div>
        <input
          type="range"
          min={1}
          max={5}
          value={form.ease_to_build}
          onChange={e => setForm({ ...form, ease_to_build: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      <div className="flex items-center justify-between py-2">
        <div>
          <div className="text-sm font-medium">Uses AI Technology</div>
          <div className="text-xs text-muted-foreground">Enable AI-specific scoring and complexity</div>
        </div>
        <Switch
          checked={form.uses_ai}
          onChange={v => setForm(s => ({ ...s, uses_ai: v, ai_complexity: v ? s.ai_complexity : 0 }))}
          ariaLabel="Toggle Uses AI"
        />
      </div>

      {form.uses_ai && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>AI Complexity (0–5)</Label>
            <div className="text-sm">{form.ai_complexity}/5</div>
          </div>
          <input
            type="range"
            min={0}
            max={5}
            value={form.ai_complexity}
            onChange={e => setForm({ ...form, ai_complexity: Number(e.target.value) })}
            className="w-full accent-primary"
          />
        </div>
      )}

      <div className="space-y-1">
        <Label>Tags</Label>
        <div className="flex gap-2 flex-wrap">
          {availableTags.map(t => {
            const selected = form.tags?.includes(t)
            return (
              <TagPill
                key={t}
                label={t}
                selected={!!selected}
                onToggle={() => setForm(v => ({ ...v, tags: selected ? v.tags?.filter(x => x !== t) : [...(v.tags || []), t] }))}
              />
            )
          })}
        </div>
      </div>

      <div className="mt-3">
        <div className="text-sm text-muted-foreground">Calculated Score</div>
        <div className="mt-1 inline-flex items-center gap-3 px-3 py-2 rounded-md bg-muted w-full justify-between">
          <div className="text-sm">Based on scalability, feasibility, and AI</div>
          <div className="text-lg font-medium">{calcScorePercent(form)}/100</div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" type="button" onClick={() => { onCancel?.(); }} disabled={loading}>Cancel</Button>
        <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Save Idea"}</Button>
      </div>
    </form>
  )
}
