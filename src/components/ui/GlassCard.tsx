"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export default function GlassCard({
  children,
  className,
  hoverEffect = true,
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hoverEffect ? { scale: 1.02, boxShadow: "0 0 50px rgba(123, 47, 255, 0.15)" } : {}}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "glass-effect p-6 rounded-2xl relative overflow-hidden",
        "shadow-[0_0_40px_rgba(123,47,255,0.08),_inset_0_1px_0_rgba(255,255,255,0.05)]",
        className
      )}
      {...props}
    >
      {/* Subtle radial glow inside */}
      <div className="absolute inset-0 bg-radial-gradient from-neon-violet/5 to-transparent pointer-events-none" />
      {children}
    </motion.div>
  );
}
