import React from "react"
import { Button } from "@/components/ui/button"

type State = { hasError: boolean; error?: unknown }

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{ fallbackTitle?: string }>
> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: unknown, info: unknown) {
    // later: send to Sentry/LogRocket etc.
    console.error("ErrorBoundary caught", error, info)
  }

  private reset = () => this.setState({ hasError: false, error: undefined })

  render() {
    if (!this.state.hasError) return this.props.children

    const message =
      (this.state.error as any)?.message ??
      (typeof this.state.error === "string" ? this.state.error : "Something went wrong.")

    return (
      <div className="max-w-2xl mx-auto mt-16 rounded-xl border bg-card p-6 text-card-foreground">
        <h2 className="text-lg font-semibold">
          {this.props.fallbackTitle ?? "Unexpected error"}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{String(message)}</p>

        <div className="mt-4 flex items-center gap-2">
          <Button onClick={() => location.reload()}>Reload</Button>
          <Button variant="outline" onClick={this.reset}>
            Try again
          </Button>
        </div>
      </div>
    )
  }
}
