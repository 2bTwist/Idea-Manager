import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog"
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import * as api from "@/lib/api"

export default function Playground() {
  async function ping() {
    try {
      const res = await api.health()
      if (res.ok) {
        toast.success(`API healthy: ${res.data.status}`)
      } else {
        toast.error(`Health failed (${res.error.status})`, { description: res.error.message })
      }
    } catch (err: any) {
      // Handles uncaught promise rejections (network errors, etc)
      const status = err?.status ?? "Unknown"
      const message = err?.message ?? "Network error"
      toast.error(`Health failed (${status})`, { description: message })
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h2 className="text-xl font-semibold">Design System Playground</h2>

      <section className="space-x-2">
        <Button onClick={ping}>Ping /health</Button>
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="destructive">Destructive</Badge>
      </section>

      <Separator />

      <section className="flex items-center gap-2">
        <Button onClick={() => toast("Neutral toast")}>Toast</Button>
        <Button variant="secondary" onClick={() => toast.success("Saved!")}>Success</Button>
        <Button variant="outline" onClick={() => toast.error("Something went wrong")}>Error</Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost">Dropdown</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => toast("New file")}>New File</DropdownMenuItem>
            <DropdownMenuItem inset onSelect={() => toast("Rename")}>Rename</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => toast("Delete", { description: "Moved to trash" })}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm action</DialogTitle>
              <DialogDescription>This is a sample confirmation dialog.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button onClick={() => toast.success("Confirmed")}>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>

      <Separator />

      <section className="space-y-2">
        <label className="text-sm font-medium">Notes</label>
        <Textarea placeholder="Type some text…" />
      </section>
    </div>
  )
}
