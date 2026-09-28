"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function MovingBorderBtn({
  children,
  className,
  containerClassName,
  onClick,
  href,
}: {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  onClick?: () => void;
  href?: string;
}) {
  const Component = href ? "a" : "button";
  return (
    <Component
      href={href}
      onClick={onClick}
      className={cn("relative rounded-2xl p-[1px] overflow-hidden", containerClassName)}
      style={{ transform: "translateZ(0)" }}
    >
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-[-1000%] animate-spin-slow [background:conic-gradient(from_90deg_at_50%_50%,#3b82f6_0%,#a855f7_50%,#3b82f6_100%)]"
          style={{ transform: "translateZ(0)" }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <div
        className={cn(
          "relative z-10 flex items-center justify-center w-full h-full px-8 py-4 rounded-[15px] bg-black/90 text-white font-medium backdrop-blur-3xl",
          className
        )}
      >
        {children}
      </div>
    </Component>
  );
}
