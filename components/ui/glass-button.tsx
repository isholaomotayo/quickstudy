import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { type VariantProps } from "class-variance-authority";

interface GlassButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  glassVariant?: "default" | "primary" | "secondary" | "success" | "warning";
  asChild?: boolean;
}

const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  (
    { className, glassVariant = "default", variant, size, asChild, ...props },
    ref
  ) => {
    const glassVariants = {
      default:
        "bg-white/20 hover:bg-white/30 backdrop-blur-sm border-white/20 text-white",
      primary:
        "bg-blue-500/20 hover:bg-blue-500/30 backdrop-blur-sm border-blue-300/20 text-blue-100",
      secondary:
        "bg-purple-500/20 hover:bg-purple-500/30 backdrop-blur-sm border-purple-300/20 text-purple-100",
      success:
        "bg-emerald-500/20 hover:bg-emerald-500/30 backdrop-blur-sm border-emerald-300/20 text-emerald-100",
      warning:
        "bg-amber-500/20 hover:bg-amber-500/30 backdrop-blur-sm border-amber-300/20 text-amber-100",
    };

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        asChild={asChild}
        className={cn(
          "transition-all duration-300 hover:shadow-lg",
          glassVariants[glassVariant],
          className
        )}
        {...props}
      />
    );
  }
);
GlassButton.displayName = "GlassButton";

export { GlassButton };
