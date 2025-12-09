import type React from "react"
import { cn } from "@/lib/utils"
import { forwardRef } from "react"

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "gradient-blue" | "gradient-purple" | "gradient-emerald" | "gradient-amber"
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "bg-white/70 backdrop-blur-sm border-0 shadow-lg",
    "gradient-blue": "bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0 shadow-xl",
    "gradient-purple": "bg-gradient-to-br from-purple-600 to-purple-700 text-white border-0 shadow-xl",
    "gradient-emerald": "bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0 shadow-xl",
    "gradient-amber": "bg-gradient-to-br from-amber-500 to-orange-600 text-white border-0 shadow-xl",
  }

  return (
    <div
      ref={ref}
      className={cn("rounded-lg p-6 transition-all duration-300 hover:shadow-xl", variants[variant], className)}
      {...props}
    />
  )
})
GlassCard.displayName = "GlassCard"

export { GlassCard }
