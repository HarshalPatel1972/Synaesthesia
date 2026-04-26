"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface NeonButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  variant?: "primary" | "danger" | "accent";
  className?: string;
}

export default function NeonButton({
  children,
  variant = "primary",
  className,
  ...props
}: NeonButtonProps) {
  const variantStyles = {
    primary: "border-neon-violet text-text-primary hover:bg-neon-violet/15 hover:shadow-[0_0_24px_rgba(123,47,255,0.4)]",
    danger: "border-magenta text-text-primary hover:bg-magenta/15 hover:shadow-[0_0_24px_rgba(255,41,117,0.4)]",
    accent: "border-cyan text-text-primary hover:bg-cyan/15 hover:shadow-[0_0_24px_rgba(0,245,255,0.4)]",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "px-6 py-2.5 rounded-full border bg-transparent font-ui text-sm uppercase tracking-widest transition-all duration-300",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
