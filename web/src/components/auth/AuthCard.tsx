import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type Props = {
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export default function AuthCard({
  title,
  subtitle,
  children,
  footer,
  className,
}: Props) {
  return (
    <div className="min-h-[calc(100vh-7rem)] grid place-items-center">
      <Card
        className={cn(
          "w-full max-w-md h-[32rem] sm:h-[28rem] flex flex-col justify-center border-border/60 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/50",
          className
        )}
      >
        <CardContent className="flex-1 flex flex-col justify-center p-6 sm:p-8">
          <div className="text-center space-y-1">
            <h1 className="text-base font-semibold">{title}</h1>
            {subtitle ? (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>

          <div className="mt-6 space-y-4 flex-1 flex flex-col justify-center">{children}</div>

          {footer ? (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              {footer}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
