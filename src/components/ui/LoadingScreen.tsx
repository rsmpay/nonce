"use client";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = "로딩 중..." }: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center animate-pulse">
          <span className="text-xl font-bold text-white">N</span>
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
        <p className="text-gray-400">{message}</p>
      </div>
    </div>
  );
}
