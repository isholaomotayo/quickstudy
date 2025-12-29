import type React from "react"
import { cn } from "@/lib/utils"
import { forwardRef } from "react"

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "gradient-blue" | "gradient-purple" | "gradient-emerald" | "gradient-amber"
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "bg-card/80 backdrop-blur-sm border border-border shadow-sm",
    "gradient-blue": "relative overflow-hidden border border-border bg-card text-foreground shadow-sm",
    "gradient-purple": "relative overflow-hidden border border-border bg-card text-foreground shadow-sm",
    "gradient-emerald": "relative overflow-hidden border border-border bg-card text-foreground shadow-sm",
    "gradient-amber": "relative overflow-hidden border border-border bg-card text-foreground shadow-sm",
  }

  const overlays: Record<string, string> = {
    "gradient-blue": "bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.18),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.16),transparent_40%)] dark:bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.18),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.16),transparent_40%)]",
    "gradient-purple": "bg-[radial-gradient(circle_at_15%_20%,rgba(147,51,234,0.2),transparent_42%),radial-gradient(circle_at_80%_0%,rgba(109,40,217,0.16),transparent_42%)]",
    "gradient-emerald": "bg-[radial-gradient(circle_at_15%_20%,rgba(16,185,129,0.18),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(45,212,191,0.14),transparent_40%)]",
    "gradient-amber": "bg-[radial-gradient(circle_at_15%_20%,rgba(245,158,11,0.18),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(251,191,36,0.14),transparent_40%)]",
  }

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg p-6 transition-all duration-300 hover:shadow-md",
        variants[variant],
        className
      )}
      {...props}
    >
      {variant !== "default" && (
        <div
          className={cn(
            "pointer-events-none absolute inset-0 opacity-90",
            overlays[variant]
          )}
        />
      )}
      <div className={variant !== "default" ? "relative z-10" : undefined}>
        {props.children}
      </div>
    </div>
  )
})
GlassCard.displayName = "GlassCard"

export { GlassCard }
