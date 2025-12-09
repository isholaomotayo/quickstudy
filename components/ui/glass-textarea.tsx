import type React from "react"
import { cn } from "@/lib/utils"
import { forwardRef } from "react"

interface GlassTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const GlassTextarea = forwardRef<HTMLTextAreaElement, GlassTextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[80px] w-full rounded-md bg-white/70 backdrop-blur-sm border border-white/20 px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300",
        className,
      )}
      {...props}
    />
  )
})
GlassTextarea.displayName = "GlassTextarea"

export { GlassTextarea }
