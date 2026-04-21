# 의학 학술대회 플랫폼 프로젝트

## 프로젝트 개요

국내 전체 의학 학술대회 정보를 한 곳에서 검색·관리할 수 있는 플랫폼. 마이페어(myfair.co)의 메디컬 섹션 구조를 레퍼런스로 하며, 주 타겟은 의사·학회·제약사 직원이다.

### 핵심 목적

1. **단기**: 제약사가 학술 지원 명목으로 집행할 광고비 유치
2. **중기**: 학술대회 정보 플랫폼으로 자생 가능한 트래픽 확보
3. **장기**: 국내 의학계의 "학술대회 공식 허브"로 포지셔닝

### 레퍼런스 사이트

- UI/구조: https://myfair.co/popular-exhibition/details?category=27
- 데이터 소스: https://www.kams.or.kr/bbs/?code=ws (대한의학회 학술대회 일정)

---

## 기술 스택

### 확정 사항

- **프론트엔드**: Next.js (React)
- **DB/인증**: Supabase (PostgreSQL)
- **배포**: Cloudflare Pages
- **레포 관리**: GitHub
- **개발 도구**: Claude Code (서버사이드·크롤러), Claude 디자인 (UI 컴포넌트)

### 디렉토리 구조 (권장)

```
├── app/                    # Next.js App Router
│   ├── page.tsx           # 메인 페이지
│   ├── conferences/       # 학술대회 목록·상세
│   ├── societies/         # 학회별 프로필
│   └── api/               # API Routes
│       ├── crawl/         # KAMS 크롤러
│       └── banners/       # 배너 관리
├── components/            # UI 컴포넌트
├── lib/                   # Supabase 클라이언트, 유틸
├── scripts/               # 크롤러 로직
└── PROJECT.md            # 이 파일 (Claude Code 참조용)
```

---

## 데이터베이스 스키마 (Supabase)

### conferences 테이블

```sql
CREATE TABLE conferences (
  id BIGSERIAL PRIMARY KEY,
  kams_id TEXT UNIQUE,              -- KAMS의 number 파라미터 (중복 방지)
  society_name TEXT NOT NULL,       -- 학회명 (예: 대한내과학회)
  society_url TEXT,                 -- 학회 공식 홈페이지
  event_name TEXT NOT NULL,         -- 행사명
  start_date DATE NOT NULL,
  end_date DATE,
  venue TEXT,                       -- 개최 장소
  city TEXT,                        -- 서울·부산 등 도시 추출
  category TEXT,                    -- 진료과 분류
  detail_url TEXT,                  -- KAMS 상세 페이지
  registration_url TEXT,            -- 사전등록 외부 링크
  description TEXT,
  is_featured BOOLEAN DEFAULT FALSE, -- 프리미엄 상단 고정 (유료)
  sponsor_id BIGINT,                -- 스폰서 제약사 (있을 때)
  view_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conferences_start_date ON conferences(start_date);
CREATE INDEX idx_conferences_category ON conferences(category);
```

### banners 테이블

```sql
CREATE TABLE banners (
  id BIGSERIAL PRIMARY KEY,
  slot_name TEXT NOT NULL,          -- main_top, list_sidebar, detail_bottom 등
  image_url TEXT NOT NULL,
  link_url TEXT NOT NULL,
  advertiser_name TEXT,
  start_date DATE,
  end_date DATE,
  view_count INT DEFAULT 0,
  click_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  priority INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### bookmarks 테이블 (회원 즐겨찾기)

```sql
CREATE TABLE bookmarks (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  conference_id BIGINT REFERENCES conferences(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, conference_id)
);
```

### users_profile 테이블 (의사/제약사 구분)

```sql
CREATE TABLE users_profile (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type TEXT CHECK (user_type IN ('doctor', 'pharma', 'other')),
  specialty TEXT,                   -- 의사: 전공과목 / 제약사: 담당 분야
  organization TEXT,                -- 병원명 / 회사명
  newsletter_opt_in BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## KAMS 크롤러 명세

### 대상 URL 패턴

- **목록**: `https://www.kams.or.kr/bbs/index.php?code=ws&start_y={YEAR}&start_m=ALL&page={N}`
- **상세**: `https://www.kams.or.kr/bbs/index.php?code=ws&number={ID}&mode=view`

### 크롤러 구현

- **기술**: Node.js + axios + cheerio (정적 HTML, Puppeteer 불필요)
- **API Route**: `app/api/crawl/route.ts` (Next.js App Router 기준)
- **실행 주기**: 매일 새벽 3시 (Cloudflare Cron Triggers)
- **요청 간 딜레이**: 페이지 당 1~2초 (서버 부담 방지)

### 추출 필드

1. 학회명 + 학회 공식 홈페이지 URL
2. 행사명
3. 개최일 (시작 ~ 종료)
4. 장소
5. 상세 페이지 URL + 내부 KAMS ID
6. 상세 페이지 접근 시: 사전등록 링크, 행사 설명 추가 수집

### 중복 처리

- `kams_id` UNIQUE 제약으로 중복 방지
- 기존 레코드 있으면 UPDATE, 없으면 INSERT (upsert)
- 삭제된 학술대회는 `is_deleted` 플래그로 soft delete

---

## 개발 단계 로드맵

### Phase 1 — MVP (1~2주)

핵심 기능만 구현해서 거래처 시연 + 제약사 초기 영업 가능한 수준.

- [ ] Next.js 프로젝트 셋업 + Supabase 연동
- [ ] conferences 테이블 + 샘플 데이터 수동 입력
- [ ] KAMS 크롤러 작성 (1회 실행 가능)
- [ ] 메인 페이지: 학술대회 카드형 목록 + 진료과별 필터
- [ ] 상세 페이지: 학술대회 정보 + 사전등록 외부 링크
- [ ] 배너 슬롯 3곳 (메인 상단, 목록 사이드, 상세 하단)
- [ ] 관리자 기본 (Supabase 대시보드 직접 사용)

### Phase 2 — 활성화 (1~2개월)

회원가입 유도 + 재방문 유도 + 본격 수익화.

- [ ] 회원가입 (의사/제약사 구분, 전공 선택)
- [ ] 학술대회 즐겨찾기 + 내 캘린더 탭
- [ ] D-Day 카운터, 이번 주/이번 달 섹션
- [ ] 구글 캘린더 내보내기 (.ics 다운로드)
- [ ] Cloudflare Cron으로 크롤러 자동 실행
- [ ] 이메일 알림 시스템 (Resend API)
- [ ] Excel 학술대회 일정 다운로드

### Phase 3 — 성장기 (3개월~)

차별화 기능 + 고단가 광고 상품.

- [ ] 제약사 전용 대시보드 (광고 성과 리포트)
- [ ] 학회별 프로필 페이지
- [ ] 지도 뷰 (카카오맵 연동)
- [ ] 연자/강연자 DB
- [ ] 카카오톡 채널 연동 + 알림톡 광고
- [ ] 학술대회 후기/평점 (UGC)
- [ ] 해외 학술대회 섹션 확장

---

## 수익 모델

### 광고 상품

| 상품 | 단가 (추정) | 구현 난이도 |
|------|----------|-----------|
| Featured 상단 고정 | 50~200만원/건 | 쉬움 |
| 학술대회 스폰서 배지 | 100~300만원/건 | 쉬움 |
| 메인 배너 (월 단위) | 50~150만원/월 | 쉬움 |
| 제약사 부스 등재 | 20~50만원/건 | 보통 |
| 이메일 광고 삽입 | 10~30만원/발송 | 보통 |
| 연간 구독 패키지 | 500~1000만원/사 | 복잡 |

### 제약사 영업 타이밍

- 제약사 마케팅 예산 확정기: 8~10월
- 학회 시즌: 봄(3~5월), 가을(9~11월)
- 선판매 전략: 연간 패키지로 학회 시즌 상품 미리 계약

---

## 디자인 가이드

### 톤

- 청결하고 전문적 (의료계 타겟이므로)
- 마이페어와 유사한 카드형 그리드
- 과도한 장식 금지 (정보 전달이 최우선)

### 컬러 레퍼런스

- 메인: 파란색 계열 (의료·신뢰)
- 보조: 흰색 배경 + 옅은 회색 구분선
- 강조: Featured 학술대회만 다른 색 배지

### 반응형

- 모바일 우선 설계 (의사들이 스마트폰으로 많이 확인)
- PWA로 제작해 홈 화면 추가 가능하게

---

## 중요 제약사항

### 법적·윤리적

- KAMS는 공공 데이터이나 크롤링 시 서버 부담 최소화 필수
- 사전등록은 각 학회 공식 페이지로 외부 링크만 연결 (직접 결제 처리 X)
- 제약사 광고 시 "광고" 또는 "스폰서" 명확히 표시 (의료법 준수)
- 개인정보 수집 동의 명확히 받기 (의사 면허번호 등 수집 X)

### 기술적

- Cloudflare Pages + Workers 조합 사용
- Workers는 Edge Runtime이므로 Node.js 전용 라이브러리 호환성 주의
- 크롤러는 Workers Cron Trigger로 실행
- Supabase Edge Functions를 크롤러 실행 장소로 활용 가능

---

## Claude Code 작업 지침

이 프로젝트에서 작업할 때 다음 원칙을 따른다.

1. **타입스크립트 사용**: 모든 파일은 .ts / .tsx
2. **Supabase 클라이언트**: `lib/supabase.ts`에 초기화 후 import
3. **서버 컴포넌트 우선**: 가능한 한 React Server Components 활용
4. **환경변수**: `.env.local`에 보관, `NEXT_PUBLIC_` 접두사 주의
5. **컴포넌트 분리**: UI는 `components/` 하위에 기능별 디렉토리
6. **에러 처리**: 크롤러는 학회별로 try-catch, 하나 실패해도 다음 진행
7. **커밋 메시지**: feat/fix/docs/refactor 접두사 사용

---

## 참고 링크

- 마이페어 메디컬 목록: https://myfair.co/popular-exhibition/details?category=27
- KAMS 학술대회 일정: https://www.kams.or.kr/bbs/?code=ws
- 메디칼업저버 (경쟁 매체): https://www.monews.co.kr/

---

*마지막 업데이트: 2026년 4월*
