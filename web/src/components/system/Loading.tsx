export function LoadingSpinner(props: { label?: string; className?: string }) {
  const { label = "Loading…", className } = props
  return (
    <div className={`flex items-center justify-center gap-3 py-10 ${className ?? ""}`}>
      <span
        aria-hidden
        className="inline-block size-5 rounded-full border-2 border-ring/40 border-t-ring animate-spin"
      />
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  )
}
