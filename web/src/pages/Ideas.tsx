import PageHeader from "@/components/system/PageHeader"
import { Button } from "@/components/ui/button"

export default function Ideas() {
  return (
    <section className="space-y-6">
      <PageHeader
        title="Ideas"
        description="Collect, score, and prioritize your best ideas."
        actions={
          <>
            <Button variant="outline">Advanced Filters</Button>
            <Button>New Idea</Button>
          </>
        }
      />

      <p className="text-muted-foreground">
        List & filters land in Phase 3.
      </p>
    </section>
  )
}
