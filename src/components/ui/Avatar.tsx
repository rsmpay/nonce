"use client";

import Image from "next/image";
import { cn, getInitials } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs rounded-md",
  md: "w-10 h-10 text-sm rounded-lg",
  lg: "w-12 h-12 text-base rounded-lg",
  xl: "w-16 h-16 text-lg rounded-xl",
};

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const initials = getInitials(name);

  if (src) {
    return (
      <div
        className={cn(
          "relative overflow-hidden bg-glass flex-shrink-0",
          "ring-1 ring-steel-500/50",
          "transition-all duration-200 ease-out",
          "hover:ring-2 hover:ring-gold/50",
          sizeClasses[size],
          className
        )}
      >
        <Image src={src} alt={name} fill className="object-cover" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center font-semibold flex-shrink-0",
        "bg-gradient-to-br from-gold to-gold-dark text-obsidian",
        "ring-1 ring-gold/30",
        "transition-all duration-200 ease-out",
        "hover:ring-2 hover:ring-gold/50",
        sizeClasses[size],
        className
      )}
    >
      {initials}
    </div>
  );
}
