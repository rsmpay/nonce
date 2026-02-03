"use client";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = "로딩 중..." }: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-obsidian">
      <div className="flex flex-col items-center gap-6">
        {/* Vault logo with gold gradient */}
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-gold to-gold-dark rounded-2xl flex items-center justify-center shadow-gold-lg">
            <span className="text-2xl font-bold text-obsidian font-display">N</span>
          </div>
          {/* Pulsing ring */}
          <div className="absolute inset-0 rounded-2xl border-2 border-gold/30 animate-ping" />
        </div>

        {/* Gold spinner */}
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-steel-500/30" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-gold animate-spin" />
        </div>

        {/* Loading text */}
        <p className="text-steel-400 text-sm">{message}</p>
      </div>
    </div>
  );
}
