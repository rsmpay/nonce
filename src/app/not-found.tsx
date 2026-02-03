import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <div className="text-center space-y-4 max-w-md">
        <div className="w-16 h-16 mx-auto bg-surface-light rounded-full flex items-center justify-center">
          <span className="text-3xl">🔍</span>
        </div>
        <h2 className="text-xl font-semibold text-white">
          페이지를 찾을 수 없습니다
        </h2>
        <p className="text-gray-400">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
