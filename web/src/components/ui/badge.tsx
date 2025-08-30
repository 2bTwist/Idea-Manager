import { cn } from "@/lib/utils"

export function Badge({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"span"> & {
  variant?: "default" | "secondary" | "outline" | "destructive"
}) {
  const base =
    "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border"

  const styles = {
    default: "bg-primary text-primary-foreground border-transparent",
    secondary: "bg-secondary text-secondary-foreground border-transparent",
    outline: "bg-transparent text-foreground border-border",
    destructive: "bg-destructive text-white border-transparent",
  } as const

  return <span className={cn(base, styles[variant], className)} {...props} />
}
