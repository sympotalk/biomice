"use client";

import { useActionState, useRef, useState } from "react";
import { createBanner } from "./actions";

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
  const [state, action, pending] = useActionState(createBanner, { error: null });
  const formRef = useRef<HTMLFormElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string | null>(null);
  const [previewSize, setPreviewSize] = useState<number | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState("");

  // Reset on success
  if (state?.error === null && formRef.current?.dataset.submitted === "true") {
    formRef.current.reset();
    delete formRef.current.dataset.submitted;
    setPreviewUrl(null);
    setPreviewName(null);
    setPreviewSize(null);
    setImageUrlInput("");
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setPreviewUrl(null);
      setPreviewName(null);
      setPreviewSize(null);
      return;
    }
    setPreviewName(file.name);
    setPreviewSize(file.size);
    setPreviewUrl(URL.createObjectURL(file));
  }

  return (
    <form
      ref={formRef}
      action={(fd) => {
        if (formRef.current) formRef.current.dataset.submitted = "true";
        action(fd);
      }}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "16px 24px",
      }}
    >
      <div style={{ gridColumn: "1 / -1" }}>
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
          ℹ️ 배너 슬롯은 <strong>우측 사이드바 (right_sidebar)</strong> 한 가지만
          사용합니다. 권장 비율: <strong>3:5 (예: 300×500)</strong>. 형식: PNG /
          JPEG / WebP / <strong>GIF</strong> / SVG · 최대 10MB.
        </div>
      </div>

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

      {/* 파일 업로드 + 미리보기 */}
      <div style={{ gridColumn: "1 / -1" }}>
        <label style={labelStyle}>이미지 파일 업로드 (PNG/JPEG/WebP/GIF/SVG)</label>
        <div
          style={{
            display: "flex",
            gap: 16,
            alignItems: "flex-start",
            padding: 14,
            background: "var(--bm-bg-muted)",
            border: "1px dashed var(--bm-border-strong)",
            borderRadius: 8,
          }}
        >
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
            {previewUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={previewUrl}
                alt="preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
              />
            ) : (
              <div>미리보기</div>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
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
            {previewName && (
              <div style={{ marginTop: 8, fontSize: 11, color: "var(--bm-text-tertiary)" }}>
                <strong style={{ color: "var(--bm-text-primary)" }}>
                  {previewName}
                </strong>
                {previewSize != null && (
                  <span> · {(previewSize / 1024).toFixed(1)} KB</span>
                )}
              </div>
            )}
            <div
              style={{
                marginTop: 12,
                fontSize: 11,
                color: "var(--bm-text-tertiary)",
                lineHeight: 1.5,
              }}
            >
              GIF 애니메이션 지원. 업로드 후 자동으로 Supabase Storage에
              저장되고 CDN으로 서빙됩니다.
            </div>
          </div>
        </div>
      </div>

      {/* fallback: 외부 URL */}
      <details style={{ gridColumn: "1 / -1" }}>
        <summary
          style={{
            cursor: "pointer",
            fontSize: 11,
            color: "var(--bm-text-tertiary)",
            padding: "4px 0",
          }}
        >
          또는 이미지 외부 URL 직접 입력 (파일 업로드 대신)
        </summary>
        <div style={{ marginTop: 8 }}>
          <input
            name="image_url"
            type="url"
            value={imageUrlInput}
            onChange={(e) => setImageUrlInput(e.target.value)}
            style={inputStyle}
            placeholder="https://example.com/banner.png (파일 업로드 시 무시됨)"
          />
        </div>
      </details>

      {state?.error && (
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
          {state.error}
        </div>
      )}

      <div style={{ gridColumn: "1 / -1" }}>
        <button
          type="submit"
          disabled={pending}
          style={{
            padding: "10px 24px",
            borderRadius: 6,
            border: "none",
            background: "var(--bm-primary)",
            color: "#fff",
            fontWeight: 600,
            fontSize: 14,
            cursor: pending ? "default" : "pointer",
            opacity: pending ? 0.7 : 1,
          }}
        >
          {pending ? "업로드 중…" : "배너 등록"}
        </button>
      </div>
    </form>
  );
}
