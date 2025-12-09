"use client"

import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface AnimatedProgressProps {
  value: number
  className?: string
  color?: "blue" | "emerald" | "purple" | "amber"
  showLabel?: boolean
}

export function AnimatedProgress({ value, className, color = "blue", showLabel = false }: AnimatedProgressProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setProgress(value), 300)
    return () => clearTimeout(timer)
  }, [value])

  const colorVariants = {
    blue: "bg-blue-500",
    emerald: "bg-emerald-500",
    purple: "bg-purple-500",
    amber: "bg-amber-500",
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="w-full bg-white/30 rounded-full h-2 backdrop-blur-sm">
        <div
          className={cn("h-2 rounded-full transition-all duration-1000 ease-out", colorVariants[color])}
          style={{ width: `${progress}%` }}
        />
      </div>
      {showLabel && <div className="text-sm text-gray-600 text-right">{progress}%</div>}
    </div>
  )
}
