import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-obsidian p-6">
      <div className="text-center space-y-4 max-w-md">
        <div className="w-16 h-16 mx-auto bg-glass rounded-xl flex items-center justify-center border border-steel-500/30">
          <span className="text-3xl">🔍</span>
        </div>
        <h2 className="text-xl font-semibold text-steel-100 font-display">
          페이지를 찾을 수 없습니다
        </h2>
        <p className="text-steel-400">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-gradient-to-b from-gold to-gold-dark hover:from-gold-light hover:to-gold text-obsidian font-medium rounded-xl transition-all shadow-gold-sm hover:shadow-gold-md"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
