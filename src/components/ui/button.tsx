import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap font-display font-semibold transition-all duration-300 ease-[var(--ease-luxe)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-[1.1em] [&_svg]:shrink-0 cursor-pointer select-none",
  {
    variants: {
      variant: {
        gold:
          "bg-gradient-gold text-ink shadow-glow hover:shadow-glow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-glow",
        dark:
          "bg-ink text-cream hover:bg-graphite hover:-translate-y-0.5 active:translate-y-0",
        outline:
          "border border-ink/15 bg-transparent text-ink hover:border-gold-500 hover:bg-gold-50 hover:-translate-y-0.5 active:translate-y-0",
        ghost: "text-ink hover:bg-ink/5",
        glass: "glass text-ink border border-white/40 hover:bg-white/80",
        link: "text-gold-600 underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm: "h-9 rounded-full px-4 text-sm",
        md: "h-11 rounded-full px-6 text-sm",
        lg: "h-13 rounded-full px-8 text-base",
        xl: "h-14 rounded-full px-10 text-base",
        icon: "size-11 rounded-full",
      },
    },
    defaultVariants: { variant: "gold", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
