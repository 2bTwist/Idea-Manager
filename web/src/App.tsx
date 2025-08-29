import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function App() {
  return (
    <div className="min-h-dvh bg-background text-foreground flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Tailwind + shadcn/ui ✓</CardTitle>
        </CardHeader>
        <CardContent className="space-x-2">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default App
