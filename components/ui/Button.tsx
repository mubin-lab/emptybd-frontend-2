import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center cursor-pointer font-averia-gruesa-libre justify-center gap-2 whitespace-nowrap rounded-[4px] md:rounded-md text-[13px] md:text-base  font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "text-white border-t border-l border-b border-r border-t-primary/40 border-l-primary/40 border-b-primary/5 border-r-primary/5 bg-gradient-to-br from-primary/20 to-primary/5 hover:from-primary/30 hover:to-primary/10 shadow-[inset_1.5px_1.5px_3px_rgba(255,255,255,0.1),_inset_-1.5px_-1.5px_3px_rgba(0,0,0,0.8),_0_2px_4px_rgba(0,0,0,0.4)] hover:shadow-[inset_1.5px_1.5px_3px_rgba(255,255,255,0.15),_0_0_12px_rgba(59,130,246,0.3)] transition-all duration-300 active:scale-95",
        destructive:
          "text-white border-t border-l border-b border-r border-t-red-500/40 border-l-red-500/40 border-b-red-500/5 border-r-red-500/5 bg-gradient-to-br from-red-500/20 to-red-500/5 hover:from-red-500/30 hover:to-red-500/10 shadow-[inset_1.5px_1.5px_3px_rgba(255,255,255,0.1),_inset_-1.5px_-1.5px_3px_rgba(0,0,0,0.8),_0_2px_4px_rgba(0,0,0,0.4)] hover:shadow-[inset_1.5px_1.5px_3px_rgba(255,255,255,0.15),_0_0_12px_rgba(239,68,68,0.3)] transition-all duration-300 active:scale-95",
        outline:
          "text-white border-t border-l border-b border-r border-t-white/[0.12] border-l-white/[0.12] border-b-white/[0.02] border-r-white/[0.02] bg-gradient-to-br from-white/[0.03] to-white/[0.005] hover:bg-white/[0.06] shadow-[inset_1.5px_1.5px_3px_rgba(255,255,255,0.08),_inset_-1.5px_-1.5px_3px_rgba(0,0,0,0.8),_0_2px_4px_rgba(0,0,0,0.4)] hover:border-t-white/[0.2] hover:border-l-white/[0.2] transition-all duration-300 active:scale-95",
        secondary:
          "text-white border-t border-l border-b border-r border-t-secondary/40 border-l-secondary/40 border-b-secondary/5 border-r-secondary/5 bg-gradient-to-br from-secondary/20 to-secondary/5 hover:from-secondary/30 hover:to-secondary/10 shadow-[inset_1.5px_1.5px_3px_rgba(255,255,255,0.1),_inset_-1.5px_-1.5px_3px_rgba(0,0,0,0.8),_0_2px_4px_rgba(0,0,0,0.4)] hover:shadow-[inset_1.5px_1.5px_3px_rgba(255,255,255,0.15),_0_0_12px_rgba(234,179,8,0.3)] transition-all duration-300 active:scale-95",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "md:h-9 px-3 md:px-4 py-2 md:py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
