"use client";

import { useActionState, useRef, useState } from "react";
import { createBanner, uploadBannerFile } from "./actions";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: 6,
  border: "1px solid var(--bm-border)",
  fontSize: 13,
  background: "var(--bm-bg)",
  color: "var(--bm-text-primary)",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "var(--bm-text-secondary)",
  marginBottom: 6,
};

const ALLOWED_EXT = ".png,.jpg,.jpeg,.webp,.gif,.svg";

export function BannerCreateForm() {
  // 등록 폼 — meta + image_url
  const [createState, createAction, createPending] = useActionState(
    createBanner,
    { error: null },
  );
  const formRef = useRef<HTMLFormElement>(null);

  // 파일 업로드 — 별도 server action
  const [uploadState, uploadAction, uploadPending] = useActionState(
    uploadBannerFile,
    {} as { url?: string; name?: string; size?: number; error?: string },
  );
  const uploadFormRef = useRef<HTMLFormElement>(null);

  // 클라이언트 미리보기 (선택만 했을 때 — 업로드 전)
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [localName, setLocalName] = useState<string | null>(null);
  const [localSize, setLocalSize] = useState<number | null>(null);

  // 업로드된 URL은 등록 폼의 hidden input과 연결됨
  const uploadedUrl = uploadState?.url ?? "";
  const isUploaded = !!uploadedUrl;

  // 등록 성공 시 reset
  if (
    createState?.error === null &&
    formRef.current?.dataset.submitted === "true"
  ) {
    formRef.current.reset();
    delete formRef.current.dataset.submitted;
    setLocalPreview(null);
    setLocalName(null);
    setLocalSize(null);
    // 업로드 상태도 초기화하려면 페이지 새로고침이 필요 — useActionState 한계
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setLocalPreview(null);
      setLocalName(null);
      setLocalSize(null);
      return;
    }
    setLocalName(file.name);
    setLocalSize(file.size);
    setLocalPreview(URL.createObjectURL(file));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* 안내문 */}
      <div
        style={{
          padding: "10px 14px",
          background: "var(--bm-primary-subtle)",
          border: "1px solid var(--bm-primary)",
          borderRadius: 6,
          fontSize: 12,
          color: "var(--bm-primary)",
          lineHeight: 1.6,
        }}
      >
        ℹ️ 배너는 우측 사이드바 (right_sidebar) 슬롯 한 가지만 사용합니다.
        권장 비율 <strong>3:5 (예: 300×500)</strong> · PNG / JPEG / WebP /{" "}
        <strong>GIF</strong> / SVG · 최대 10MB.
      </div>

      {/* ── Step 1: 파일 업로드 ───────────────────────────────────────── */}
      <form
        ref={uploadFormRef}
        action={uploadAction}
        style={{
          padding: 16,
          background: "var(--bm-bg-muted)",
          border: "1px dashed var(--bm-border-strong)",
          borderRadius: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 22,
              height: 22,
              borderRadius: 11,
              background: isUploaded ? "var(--bm-success)" : "var(--bm-primary)",
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              fontFamily: "var(--font-mono)",
            }}
          >
            1
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--bm-text-primary)" }}>
            이미지 파일 업로드
          </span>
          {isUploaded && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--bm-success)",
                background: "var(--bm-success-subtle)",
                padding: "2px 8px",
                borderRadius: 999,
              }}
            >
              ✓ 업로드 완료
            </span>
          )}
        </div>

        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          {/* 미리보기 */}
          <div
            style={{
              width: 120,
              height: 200,
              flexShrink: 0,
              borderRadius: 6,
              border: "1px solid var(--bm-border)",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              color: "var(--bm-text-tertiary)",
              fontSize: 11,
              textAlign: "center",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {uploadedUrl ? (
              <img
                src={uploadedUrl}
                alt="uploaded"
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
              />
            ) : localPreview ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={localPreview}
                alt="preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                  opacity: 0.65,
                }}
              />
            ) : (
              <div>미리보기</div>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            <input
              name="file"
              type="file"
              accept={ALLOWED_EXT}
              onChange={onFileChange}
              style={{
                fontSize: 12,
                fontFamily: "inherit",
                color: "var(--bm-text-secondary)",
                width: "100%",
              }}
            />
            {(localName || uploadState?.name) && (
              <div style={{ fontSize: 11, color: "var(--bm-text-tertiary)" }}>
                <strong style={{ color: "var(--bm-text-primary)" }}>
                  {uploadState?.name ?? localName}
                </strong>
                {(uploadState?.size ?? localSize) != null && (
                  <span> · {(((uploadState?.size ?? localSize) as number) / 1024).toFixed(1)} KB</span>
                )}
              </div>
            )}
            <div
              style={{
                fontSize: 11,
                color: "var(--bm-text-tertiary)",
                lineHeight: 1.5,
              }}
            >
              GIF 애니메이션 지원. 업로드 후 Supabase Storage에 저장되고 CDN으로
              서빙됩니다.
            </div>

            {/* 업로드 버튼 — 즉시 Storage 업로드 */}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button
                type="submit"
                disabled={uploadPending || !localName}
                style={{
                  padding: "8px 18px",
                  borderRadius: 6,
                  border: "none",
                  background: localName ? "var(--bm-primary)" : "var(--bm-bg-muted)",
                  color: localName ? "#fff" : "var(--bm-text-tertiary)",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: uploadPending || !localName ? "default" : "pointer",
                  opacity: uploadPending ? 0.7 : 1,
                  fontFamily: "inherit",
                }}
              >
                {uploadPending ? "업로드 중…" : isUploaded ? "다시 업로드" : "업로드"}
              </button>
              {isUploaded && (
                <a
                  href={uploadedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 11,
                    color: "var(--bm-primary)",
                    textDecoration: "underline",
                  }}
                >
                  새 탭에서 보기
                </a>
              )}
            </div>

            {uploadState?.error && (
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: 6,
                  background: "var(--bm-danger-subtle)",
                  color: "var(--bm-danger)",
                  fontSize: 12,
                }}
              >
                {uploadState.error}
              </div>
            )}
          </div>
        </div>
      </form>

      {/* ── Step 2: 메타 입력 + 등록 ───────────────────────────────────── */}
      <form
        ref={formRef}
        action={(fd) => {
          if (formRef.current) formRef.current.dataset.submitted = "true";
          createAction(fd);
        }}
        style={{
          padding: 16,
          background: "var(--bm-surface)",
          border: "1px solid var(--bm-border)",
          borderRadius: 8,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px 24px",
        }}
      >
        <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 22,
              height: 22,
              borderRadius: 11,
              background: "var(--bm-primary)",
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              fontFamily: "var(--font-mono)",
            }}
          >
            2
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--bm-text-primary)" }}>
            광고주 정보 + 등록
          </span>
        </div>

        {/* 업로드된 URL을 hidden으로 전달 */}
        <input type="hidden" name="image_url" value={uploadedUrl} />

        <div>
          <label style={labelStyle}>광고주명</label>
          <input
            name="advertiser_name"
            type="text"
            style={inputStyle}
            placeholder="예: SK 케미칼 (SK Chemicals)"
          />
        </div>

        <div>
          <label style={labelStyle}>우선순위 (높을수록 먼저)</label>
          <input
            name="priority"
            type="number"
            defaultValue={50}
            min={0}
            style={inputStyle}
          />
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelStyle}>배너 제목 / 부제 (선택)</label>
          <input
            name="title"
            type="text"
            style={inputStyle}
            placeholder="예: Life Science Biz"
          />
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelStyle}>링크 URL *</label>
          <input
            name="link_url"
            type="url"
            required
            style={inputStyle}
            placeholder="https://www.skchemicals.com/..."
          />
        </div>

        {!isUploaded && (
          <div
            style={{
              gridColumn: "1 / -1",
              padding: "10px 14px",
              borderRadius: 6,
              background: "var(--bm-warning-subtle)",
              color: "var(--bm-warning)",
              fontSize: 12,
              border: "1px solid var(--bm-warning)",
            }}
          >
            ⚠️ Step 1에서 이미지를 먼저 업로드해야 등록할 수 있습니다.
          </div>
        )}

        {createState?.error && (
          <div
            style={{
              gridColumn: "1 / -1",
              padding: "10px 14px",
              borderRadius: 6,
              background: "var(--bm-danger-subtle, #fdecea)",
              color: "var(--bm-danger, #d92b3a)",
              fontSize: 13,
            }}
          >
            {createState.error}
          </div>
        )}

        {createState?.error === null && formRef.current?.dataset.submitted !== "true" && (
          <div
            style={{
              gridColumn: "1 / -1",
              padding: "8px 12px",
              borderRadius: 6,
              background: "var(--bm-success-subtle)",
              color: "var(--bm-success)",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            ✓ 배너가 등록되었습니다.
          </div>
        )}

        <div style={{ gridColumn: "1 / -1" }}>
          <button
            type="submit"
            disabled={createPending || !isUploaded}
            style={{
              padding: "10px 24px",
              borderRadius: 6,
              border: "none",
              background:
                isUploaded && !createPending
                  ? "var(--bm-primary)"
                  : "var(--bm-bg-muted)",
              color: isUploaded && !createPending ? "#fff" : "var(--bm-text-tertiary)",
              fontWeight: 600,
              fontSize: 14,
              cursor: createPending || !isUploaded ? "default" : "pointer",
              opacity: createPending ? 0.7 : 1,
              fontFamily: "inherit",
            }}
          >
            {createPending ? "저장 중…" : "배너 등록"}
          </button>
        </div>
      </form>
    </div>
  );
}
