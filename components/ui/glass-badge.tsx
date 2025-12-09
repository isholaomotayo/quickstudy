import type React from "react"
import { cn } from "@/lib/utils"
import { forwardRef } from "react"

interface GlassBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "error" | "info"
}

const GlassBadge = forwardRef<HTMLDivElement, GlassBadgeProps>(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "bg-gray-500/20 text-gray-700 border-gray-300/20",
    success: "bg-emerald-500/20 text-emerald-700 border-emerald-300/20",
    warning: "bg-amber-500/20 text-amber-700 border-amber-300/20",
    error: "bg-red-500/20 text-red-700 border-red-300/20",
    info: "bg-blue-500/20 text-blue-700 border-blue-300/20",
  }

  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold backdrop-blur-sm transition-colors",
        variants[variant],
        className,
      )}
      {...props}
    />
  )
})
GlassBadge.displayName = "GlassBadge"

export { GlassBadge }
