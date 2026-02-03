# Nonce Community Messenger

블록체인/크립토 커뮤니티 "논스"를 위한 모바일 웹 기반 메신저 서비스입니다.

## 기술 스택

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Backend**: Supabase (Auth, Database, Realtime, Storage)

## 기능

### 인증
- Google, Apple, Kakao 소셜 로그인
- 프로필 설정 (닉네임, 프로필 이미지)

### 메시징
- 1:1 DM (개인 메시지)
- 그룹 채팅
- 채널 (관리자만 글 작성)
- 실시간 메시지 동기화
- 이미지 전송

### 관리
- 멤버 관리 (역할 변경)
- 초대 링크 생성/관리
- 권한 기반 접근 제어 (Owner, Admin, Moderator, Member)

## 설정 방법

### 1. 의존성 설치

```bash
npm install
```

### 2. Supabase 프로젝트 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. 프로젝트 URL과 anon key 복사

### 3. 환경 변수 설정

`.env.local` 파일 생성:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. 데이터베이스 마이그레이션

Supabase Dashboard > SQL Editor에서 다음 파일들을 순서대로 실행:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_storage_buckets.sql`

### 5. Supabase 인증 설정

Supabase Dashboard > Authentication > Providers에서 다음 OAuth 프로바이더 활성화:

- **Google**: Google Cloud Console에서 OAuth 클라이언트 생성
- **Apple**: Apple Developer에서 Sign in with Apple 설정
- **Kakao**: Kakao Developers에서 앱 생성

각 프로바이더의 Redirect URL을 `{SUPABASE_URL}/auth/v1/callback`으로 설정

### 6. Storage 버킷 생성

Supabase Dashboard > Storage에서:

1. `avatars` 버킷 생성 (public)
2. `messages` 버킷 생성 (public)

### 7. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router 페이지
│   ├── auth/              # 인증 관련
│   ├── chat/              # 메인 채팅 화면
│   ├── invite/            # 초대 링크 처리
│   ├── profile/           # 프로필 설정
│   └── admin/             # 관리자 페이지
├── components/
│   ├── chat/              # 채팅 관련 컴포넌트
│   ├── layout/            # 레이아웃 컴포넌트
│   └── ui/                # 공통 UI 컴포넌트
├── hooks/                  # React 커스텀 훅
├── lib/
│   └── supabase/          # Supabase 클라이언트
├── stores/                 # Zustand 스토어
└── types/                  # TypeScript 타입 정의
```

## 배포

### Vercel 배포

1. GitHub에 리포지토리 푸시
2. Vercel에서 프로젝트 import
3. 환경 변수 설정
4. 배포

배포 후 Supabase의 OAuth Redirect URL을 프로덕션 URL로 업데이트해야 합니다.

## 라이선스

Private - Nonce Community
