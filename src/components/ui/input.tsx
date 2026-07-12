import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-12 w-full rounded-xl border border-ink/10 bg-white px-4 text-[15px] text-ink shadow-[inset_0_1px_2px_rgba(11,11,12,0.03)] transition-all duration-200 placeholder:text-smoke/70 hover:border-ink/20 focus:border-gold-500 focus:shadow-[0_0_0_4px_rgba(247,181,36,0.15)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-28 w-full rounded-xl border border-ink/10 bg-white px-4 py-3 text-[15px] text-ink shadow-[inset_0_1px_2px_rgba(11,11,12,0.03)] transition-all duration-200 placeholder:text-smoke/70 hover:border-ink/20 focus:border-gold-500 focus:shadow-[0_0_0_4px_rgba(247,181,36,0.15)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "flex h-12 w-full appearance-none rounded-xl border border-ink/10 bg-white px-4 pr-10 text-[15px] text-ink transition-all duration-200 hover:border-ink/20 focus:border-gold-500 focus:shadow-[0_0_0_4px_rgba(247,181,36,0.15)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236f6f76%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_0.9rem_center] bg-no-repeat",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";

function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-1.5 block text-[13px] font-semibold tracking-wide text-graphite", className)}
      {...props}
    />
  );
}

export { Input, Textarea, Select, Label };
