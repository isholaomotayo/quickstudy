import type React from "react"
import { cn } from "@/lib/utils"
import { forwardRef } from "react"
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react"

interface GlassAlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "error"
}

const GlassAlert = forwardRef<HTMLDivElement, GlassAlertProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variants = {
      default: {
        container: "bg-blue-500/10 border-blue-300/20 text-blue-800",
        icon: Info,
      },
      success: {
        container: "bg-emerald-500/10 border-emerald-300/20 text-emerald-800",
        icon: CheckCircle,
      },
      warning: {
        container: "bg-amber-500/10 border-amber-300/20 text-amber-800",
        icon: AlertTriangle,
      },
      error: {
        container: "bg-red-500/10 border-red-300/20 text-red-800",
        icon: XCircle,
      },
    }

    const { container, icon: Icon } = variants[variant]

    return (
      <div
        ref={ref}
        className={cn("relative w-full rounded-lg border p-4 backdrop-blur-sm", container, className)}
        {...props}
      >
        <div className="flex items-start gap-3">
          <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1">{children}</div>
        </div>
      </div>
    )
  },
)
GlassAlert.displayName = "GlassAlert"

export { GlassAlert }
