import { Resend } from "resend";
import type { Conference } from "./database.types";
import { formatKoreanDate, computeDDay } from "./dates";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const FROM = "biomice <noreply@biomice.xyz>";
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://biomice.xyz";

export type SendResult = { ok: true } | { ok: false; error: string };

export async function sendConferenceReminder({
  to,
  conference,
  daysBefore,
}: {
  to: string;
  conference: Conference;
  daysBefore: number;
}): Promise<SendResult> {
  const resend = getResend();
  const dd = computeDDay(conference.start_date);
  const dateStr = formatKoreanDate(conference.start_date);
  const detailUrl = `${BASE_URL}/conferences/${conference.id}`;

  const subject =
    daysBefore === 1
      ? `[biomice] ⏰ 내일 개최! ${conference.event_name}`
      : `[biomice] 📅 ${daysBefore}일 후 개최 — ${conference.event_name}`;

  const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:'Apple SD Gothic Neo','Noto Sans KR',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fa;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06);">
        <!-- Header -->
        <tr>
          <td style="background:#1A6FAA;padding:24px 32px;">
            <span style="color:#fff;font-size:20px;font-weight:700;letter-spacing:-0.5px;">biomice</span>
            <span style="color:rgba(255,255,255,.7);font-size:13px;margin-left:8px;">의학 학술대회 알림</span>
          </td>
        </tr>
        <!-- D-day badge -->
        <tr>
          <td style="padding:32px 32px 0;">
            <div style="display:inline-block;background:${daysBefore === 1 ? "#fef3e2" : "#e8f4fd"};color:${daysBefore === 1 ? "#B46A1A" : "#1A6FAA"};font-size:13px;font-weight:700;padding:4px 12px;border-radius:20px;margin-bottom:16px;">
              D-${Math.abs(dd ?? daysBefore)}
            </div>
            <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;line-height:1.4;">
              ${conference.event_name}
            </h1>
            <p style="margin:0;font-size:14px;color:#6b7280;">${conference.society_name}</p>
          </td>
        </tr>
        <!-- Info grid -->
        <tr>
          <td style="padding:24px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;">
              <tr>
                <td style="padding:16px 20px;border-bottom:1px solid #e5e7eb;">
                  <span style="font-size:11px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:.5px;">일정</span><br/>
                  <span style="font-size:15px;color:#111827;font-weight:500;margin-top:4px;display:block;">${dateStr}${conference.end_date ? ` – ${formatKoreanDate(conference.end_date)}` : ""}</span>
                </td>
              </tr>
              ${
                conference.venue
                  ? `<tr>
                <td style="padding:16px 20px;">
                  <span style="font-size:11px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:.5px;">장소</span><br/>
                  <span style="font-size:15px;color:#111827;font-weight:500;margin-top:4px;display:block;">${conference.venue}${conference.city ? ` · ${conference.city}` : ""}</span>
                </td>
              </tr>`
                  : ""
              }
            </table>
          </td>
        </tr>
        <!-- CTA -->
        <tr>
          <td style="padding:0 32px 32px;">
            <a href="${detailUrl}" style="display:inline-block;background:#1A6FAA;color:#fff;font-size:15px;font-weight:600;padding:14px 28px;border-radius:8px;text-decoration:none;margin-right:8px;">
              자세히 보기
            </a>
            ${
              conference.registration_url
                ? `<a href="${conference.registration_url}" style="display:inline-block;border:1px solid #1A6FAA;color:#1A6FAA;font-size:15px;font-weight:600;padding:14px 28px;border-radius:8px;text-decoration:none;">
              사전등록
            </a>`
                : ""
            }
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
              이 메일은 biomice에서 즐겨찾기한 학술대회의 알림입니다.<br/>
              알림을 받지 않으려면 <a href="${BASE_URL}/mypage" style="color:#1A6FAA;text-decoration:none;">내 페이지</a>에서 설정을 변경하세요.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
  `.trim();

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "unknown" };
  }
}
