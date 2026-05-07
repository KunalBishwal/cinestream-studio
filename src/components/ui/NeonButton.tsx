import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface NeonButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  children: ReactNode;
  variant?: "primary" | "ghost" | "accent";
  size?: "sm" | "md" | "icon";
  active?: boolean;
}

export function NeonButton({
  children,
  variant = "ghost",
  size = "md",
  active,
  className,
  ...props
}: NeonButtonProps) {
  const base =
    "relative inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none select-none";
  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
    icon: "h-10 w-10",
  };
  const variants = {
    primary:
      "bg-primary text-primary-foreground hover:brightness-110 shadow-[0_0_24px_oklch(0.82_0.17_195/0.45)]",
    accent:
      "bg-accent text-accent-foreground hover:brightness-110 shadow-[0_0_24px_oklch(0.7_0.2_305/0.5)]",
    ghost:
      "bg-white/5 text-foreground border border-white/10 hover:bg-white/10 backdrop-blur-md",
  };

  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      className={cn(
        base,
        sizes[size],
        variants[variant],
        active && "ring-2 ring-primary/70",
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
