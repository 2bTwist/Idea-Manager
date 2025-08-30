import * as React from "react"
import * as Dropdown from "@radix-ui/react-dropdown-menu"
import { cn } from "@/lib/utils"

const DropdownMenu = Dropdown.Root
const DropdownMenuTrigger = Dropdown.Trigger
const DropdownMenuPortal = Dropdown.Portal

function DropdownMenuContent({
  className,
  sideOffset = 6,
  ...props
}: React.ComponentProps<typeof Dropdown.Content>) {
  return (
    <DropdownMenuPortal>
      <Dropdown.Content
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-40 rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          className
        )}
        {...props}
      />
    </DropdownMenuPortal>
  )
}

function DropdownMenuItem({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof Dropdown.Item> & { inset?: boolean }) {
  return (
    <Dropdown.Item
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
        "focus:bg-accent focus:text-accent-foreground data-[disabled]:opacity-50 data-[disabled]:pointer-events-none",
        inset && "pl-8",
        className
      )}
      {...props}
    />
  )
}

const DropdownMenuSeparator = ({ className, ...props }: React.ComponentProps<typeof Dropdown.Separator>) => (
  <Dropdown.Separator className={cn("my-1 h-px bg-border", className)} {...props} />
)

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
}
