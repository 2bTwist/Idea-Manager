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
          "w-full max-w-4xl h-[52rem] sm:h-[48rem] flex flex-col justify-center border-border/60 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/50",
          className
        )}
      >
        <CardContent className="flex-1 flex flex-col justify-center p-16 sm:p-24">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-extrabold">{title}</h1>
            {subtitle ? (
              <p className="text-2xl text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>

          <div className="mt-16 space-y-10 flex-1 flex flex-col justify-center">{children}</div>

          {footer ? (
            <p className="mt-16 text-center text-xl text-muted-foreground">
              {footer}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
