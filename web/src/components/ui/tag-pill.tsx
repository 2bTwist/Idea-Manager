export default function TagPill({
  label,
  selected,
  onToggle,
}: {
  label: string
  selected: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onToggle()
        }
      }}
      className={
        `px-3 py-1 rounded-full text-sm transition-all duration-150 border focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary ` +
        (selected
          ? 'bg-white text-black dark:bg-slate-700 dark:text-white border-transparent shadow-sm'
          : 'bg-transparent text-muted-foreground border-border hover:bg-border/50')
      }
    >
      {label}
    </button>
  )
}
