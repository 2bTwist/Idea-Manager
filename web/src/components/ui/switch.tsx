export default function Switch({
  checked,
  onChange,
  ariaLabel,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  ariaLabel?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onChange(!checked)
        }
      }}
      className={`w-12 h-7 rounded-full p-1 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 ${checked ? 'bg-primary' : 'bg-muted/30'}`}
    >
      <span className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  )
}
