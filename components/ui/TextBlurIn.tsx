"use client";
import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TextBlurInProps {
  children: string;
  className?: string;
  duration?: number;
  delay?: number;
  by?: "character" | "word";
  staggerDelay?: number;
}

export function TextBlurIn({
  children,
  className,
  duration = 0.8,
  delay = 0,
  by = "word",
  staggerDelay = 0.04,
}: TextBlurInProps) {
  const units = by === "word" ? children.split(" ") : children.split("");
  return (
    <motion.p className={cn(className)}>
      {units.map((unit, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration, delay: delay + index * staggerDelay, ease: "easeOut" }}
          style={{ display: "inline-block", whiteSpace: "pre" }}
        >
          {unit === " " ? "\u00A0" : unit}
          {by === "word" && index < units.length - 1 ? "\u00A0" : ""}
        </motion.span>
      ))}
    </motion.p>
  );
}

export default TextBlurIn;