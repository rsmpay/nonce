import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/chat");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-obsidian to-onyx">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Logo */}
        <div className="space-y-4">
          <div className="relative">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-gold to-gold-dark rounded-2xl flex items-center justify-center shadow-gold-lg">
              <span className="text-4xl font-bold text-obsidian font-display">N</span>
            </div>
            {/* Subtle glow effect */}
            <div className="absolute inset-0 w-24 h-24 mx-auto bg-gold/20 rounded-2xl blur-xl -z-10" />
          </div>
          <h1 className="text-4xl font-bold text-steel-100 font-display">Nonce</h1>
          <p className="text-steel-400 text-lg">
            블록체인/크립토 커뮤니티를 위한<br />
            프라이빗 메신저
          </p>
        </div>

        {/* Features */}
        <div className="space-y-4 text-left">
          <div className="flex items-start gap-3 p-4 bg-onyx rounded-xl border border-steel-500/30 vault-shadow">
            <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center flex-shrink-0 border border-gold-hairline">
              <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-steel-100">실시간 채팅</h3>
              <p className="text-sm text-steel-400">1:1 대화, 그룹 채팅, 채널 운영</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-onyx rounded-xl border border-steel-500/30 vault-shadow">
            <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center flex-shrink-0 border border-gold-hairline">
              <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-steel-100">초대 전용</h3>
              <p className="text-sm text-steel-400">초대 링크로만 참여 가능한 프라이빗 커뮤니티</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-onyx rounded-xl border border-steel-500/30 vault-shadow">
            <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center flex-shrink-0 border border-gold-hairline">
              <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-steel-100">모바일 최적화</h3>
              <p className="text-sm text-steel-400">앱 설치 없이 브라우저에서 바로 사용</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-4 pt-4">
          <Link
            href="/auth/login"
            className="block w-full py-4 px-6 bg-gradient-to-b from-gold to-gold-dark hover:from-gold-light hover:to-gold text-obsidian font-semibold rounded-xl transition-all shadow-gold-md hover:shadow-gold-lg"
          >
            시작하기
          </Link>
          <p className="text-sm text-steel-500">
            초대 링크가 있으신가요?{" "}
            <Link href="/invite" className="text-gold hover:underline">
              여기서 입력
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
