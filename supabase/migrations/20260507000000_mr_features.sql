-- ============================================================
-- MR Features: 교육코드·분야배지·세션 + 의료진 검색 + 메모 + 팀
-- ============================================================

-- ─── 1. conferences 테이블 확장 ────────────────────────────────

ALTER TABLE conferences
  ADD COLUMN IF NOT EXISTS event_code      TEXT,
  ADD COLUMN IF NOT EXISTS kma_category    TEXT,
  ADD COLUMN IF NOT EXISTS departments     TEXT[],
  ADD COLUMN IF NOT EXISTS lectures        JSONB;

CREATE INDEX IF NOT EXISTS idx_conferences_event_code
  ON conferences (event_code);

CREATE INDEX IF NOT EXISTS idx_conferences_departments
  ON conferences USING GIN (departments);

-- ─── 2. users_profile 테이블 확장 ────────────────────────────

ALTER TABLE users_profile
  ADD COLUMN IF NOT EXISTS pharma_sub_type TEXT;
-- pharma_sub_type: 'pharma' | 'device' | null
-- user_type = 'pharma' 인 경우에만 의미있음 (제약사/의료기기 구분)

-- ─── 3. hospitals 테이블 ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS hospitals (
  id                  SERIAL PRIMARY KEY,
  code                TEXT        UNIQUE NOT NULL,
  name                TEXT        NOT NULL,
  region              TEXT        NOT NULL,
  homepage            TEXT,
  doctor_list_url     TEXT,
  crawl_selector      JSONB,
  last_crawled_at     TIMESTAMPTZ,
  doctor_count        INT         DEFAULT 0,
  is_active           BOOLEAN     DEFAULT TRUE,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 4. hospital_doctors 테이블 ──────────────────────────────

CREATE TABLE IF NOT EXISTS hospital_doctors (
  id                          SERIAL PRIMARY KEY,
  hospital_id                 INT         NOT NULL REFERENCES hospitals (id) ON DELETE CASCADE,
  external_id                 TEXT        NOT NULL,
  name                        TEXT        NOT NULL,
  department                  TEXT,
  specialty                   TEXT,
  position                    TEXT,
  profile_url                 TEXT,
  schedule_raw                JSONB,
  last_schedule_crawled_at    TIMESTAMPTZ,
  notes                       TEXT,
  created_at                  TIMESTAMPTZ DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (hospital_id, external_id)
);

CREATE INDEX IF NOT EXISTS idx_hospital_doctors_hospital
  ON hospital_doctors (hospital_id);

CREATE INDEX IF NOT EXISTS idx_hospital_doctors_department
  ON hospital_doctors (department);

-- ─── 5. my_doctors 테이블 ────────────────────────────────────

CREATE TABLE IF NOT EXISTS my_doctors (
  id          SERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  doctor_id   INT  NOT NULL REFERENCES hospital_doctors (id) ON DELETE CASCADE,
  visit_grade TEXT,         -- 'A' | 'B' | 'C' | 'D'
  is_active   BOOLEAN  DEFAULT TRUE,
  memo        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, doctor_id)
);

CREATE INDEX IF NOT EXISTS idx_my_doctors_user
  ON my_doctors (user_id);

-- ─── 6. visit_memos 테이블 ───────────────────────────────────

CREATE TABLE IF NOT EXISTS visit_memos (
  id              SERIAL PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  doctor_id       INT  REFERENCES hospital_doctors (id) ON DELETE SET NULL,
  team_id         INT,
  memo_type       TEXT NOT NULL DEFAULT 'visit', -- 'visit' | 'meeting' | 'note'
  visit_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  content         TEXT NOT NULL,
  conference_id   INT  REFERENCES conferences (id) ON DELETE SET NULL,
  is_shared       BOOLEAN  DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visit_memos_user
  ON visit_memos (user_id);

CREATE INDEX IF NOT EXISTS idx_visit_memos_doctor
  ON visit_memos (doctor_id);

CREATE INDEX IF NOT EXISTS idx_visit_memos_date
  ON visit_memos (visit_date DESC);

-- ─── 7. teams 테이블 ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS teams (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  owner_id    UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  invite_code TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 8. team_members 테이블 ──────────────────────────────────

CREATE TABLE IF NOT EXISTS team_members (
  id        SERIAL PRIMARY KEY,
  team_id   INT  NOT NULL REFERENCES teams (id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  role      TEXT DEFAULT 'member',  -- 'owner' | 'member'
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (team_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_team_members_team
  ON team_members (team_id);

CREATE INDEX IF NOT EXISTS idx_team_members_user
  ON team_members (user_id);

-- ─── 9. team_pins 테이블 ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS team_pins (
  id              SERIAL PRIMARY KEY,
  team_id         INT  NOT NULL REFERENCES teams (id) ON DELETE CASCADE,
  conference_id   INT  NOT NULL REFERENCES conferences (id) ON DELETE CASCADE,
  pinned_by       UUID REFERENCES auth.users (id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (team_id, conference_id)
);

-- visit_memos.team_id FK (teams 생성 후 추가)
ALTER TABLE visit_memos
  ADD CONSTRAINT visit_memos_team_id_fkey
  FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE SET NULL
  NOT VALID;

ALTER TABLE visit_memos
  VALIDATE CONSTRAINT visit_memos_team_id_fkey;

-- ─── 10. RLS 활성화 ──────────────────────────────────────────

ALTER TABLE my_doctors          ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_memos         ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams               ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members        ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_pins           ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_doctors    ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals           ENABLE ROW LEVEL SECURITY;

-- ─── 11. RLS 정책 ────────────────────────────────────────────

-- my_doctors: 본인만 CRUD
CREATE POLICY IF NOT EXISTS "my_doctors_owner"
  ON my_doctors FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- visit_memos: 본인 소유 또는 같은 팀의 공유 메모 읽기
CREATE POLICY IF NOT EXISTS "visit_memos_owner"
  ON visit_memos FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "visit_memos_team_read"
  ON visit_memos FOR SELECT
  USING (
    is_shared = TRUE
    AND EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.user_id = auth.uid()
        AND tm.team_id = visit_memos.team_id
    )
  );

-- teams: 소유자 full, 멤버 읽기
CREATE POLICY IF NOT EXISTS "teams_owner"
  ON teams FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY IF NOT EXISTS "teams_member_read"
  ON teams FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.user_id = auth.uid()
        AND tm.team_id = teams.id
    )
  );

-- team_members: 본인 행 또는 같은 팀 읽기
CREATE POLICY IF NOT EXISTS "team_members_self"
  ON team_members FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "team_members_same_team_read"
  ON team_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members me
      WHERE me.user_id = auth.uid()
        AND me.team_id = team_members.team_id
    )
  );

-- team_pins: 같은 팀 멤버 읽기, 멤버만 insert
CREATE POLICY IF NOT EXISTS "team_pins_member_read"
  ON team_pins FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.user_id = auth.uid()
        AND tm.team_id = team_pins.team_id
    )
  );

CREATE POLICY IF NOT EXISTS "team_pins_member_write"
  ON team_pins FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.user_id = auth.uid()
        AND tm.team_id = team_pins.team_id
    )
  );

CREATE POLICY IF NOT EXISTS "team_pins_member_delete"
  ON team_pins FOR DELETE
  USING (
    auth.uid() = pinned_by
    OR EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = team_pins.team_id
        AND t.owner_id = auth.uid()
    )
  );

-- hospital_doctors: 인증된 pharma 유저만 읽기
CREATE POLICY IF NOT EXISTS "hospital_doctors_pharma_read"
  ON hospital_doctors FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users_profile up
      WHERE up.id = auth.uid()
        AND up.user_type = 'pharma'
    )
  );

-- hospitals: 인증된 유저 읽기 (pharma 아니어도 목록은 공개)
CREATE POLICY IF NOT EXISTS "hospitals_authenticated_read"
  ON hospitals FOR SELECT
  USING (auth.role() = 'authenticated');
