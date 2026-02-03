"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      primary: cn(
        "bg-gradient-to-b from-gold to-gold-dark text-obsidian font-semibold",
        "hover:from-gold-light hover:to-gold",
        "active:from-gold-dark active:to-gold-dark",
        "shadow-gold-sm hover:shadow-gold-md",
        "disabled:from-steel-500 disabled:to-steel-500 disabled:text-steel-300 disabled:shadow-none"
      ),
      secondary: cn(
        "bg-glass text-steel-100 border border-gold-hairline",
        "hover:bg-onyx hover:border-gold-subtle hover:text-gold-light",
        "active:bg-obsidian",
        "disabled:bg-glass disabled:text-steel-400 disabled:border-steel-500"
      ),
      ghost: cn(
        "text-steel-300 hover:text-gold-light hover:bg-glass",
        "active:bg-onyx",
        "disabled:text-steel-500 disabled:bg-transparent"
      ),
      danger: cn(
        "bg-red-600 hover:bg-red-700 text-white",
        "active:bg-red-800",
        "disabled:bg-steel-500 disabled:text-steel-300"
      ),
    };

    const sizeClasses = {
      sm: "px-3 py-1.5 text-sm rounded-lg",
      md: "px-4 py-2.5 rounded-xl",
      lg: "px-6 py-3 text-lg rounded-xl",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 ease-out",
          "disabled:cursor-not-allowed",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
