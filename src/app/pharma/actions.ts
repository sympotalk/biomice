"use server";

import { Resend } from "resend";

export type InquiryState = { ok: boolean; message: string } | null;

export async function submitPharmaInquiry(
  _prev: InquiryState,
  formData: FormData,
): Promise<InquiryState> {
  const company = String(formData.get("company") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const interest = String(formData.get("interest") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!company || !name || !email) {
    return { ok: false, message: "회사명, 담당자명, 이메일은 필수입니다." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: "올바른 이메일 형식을 입력해 주세요." };
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    // 내부 알림 발송 (sympotalk@gmail.com)
    await resend.emails.send({
      from: "biomice <noreply@biomice.xyz>",
      to: ["sympotalk@gmail.com"],
      subject: `[biomice 광고문의] ${company} · ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;padding:24px">
          <h2 style="color:#1A6FAA;margin:0 0 20px">새 광고·스폰서십 문의</h2>
          <table style="width:100%;border-collapse:collapse">
            ${[
              ["회사명", company],
              ["담당자", name],
              ["이메일", email],
              ["전화번호", phone || "-"],
              ["관심 상품", interest || "-"],
            ]
              .map(
                ([k, v]) => `
              <tr>
                <td style="padding:10px;background:#f9fafb;border:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#6b7280;width:120px">${k}</td>
                <td style="padding:10px;border:1px solid #e5e7eb;font-size:14px;color:#111827">${v}</td>
              </tr>`,
              )
              .join("")}
            <tr>
              <td style="padding:10px;background:#f9fafb;border:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#6b7280;vertical-align:top">문의 내용</td>
              <td style="padding:10px;border:1px solid #e5e7eb;font-size:14px;color:#111827;white-space:pre-wrap">${message || "-"}</td>
            </tr>
          </table>
        </div>
      `,
    });

    // 자동 응답 발송 (문의자에게)
    await resend.emails.send({
      from: "biomice <noreply@biomice.xyz>",
      to: [email],
      subject: "[biomice] 광고·스폰서십 문의가 접수되었습니다",
      html: `
        <div style="font-family:sans-serif;max-width:600px;padding:24px">
          <h2 style="color:#1A6FAA;margin:0 0 16px">문의 접수 완료</h2>
          <p style="color:#374151;line-height:1.7">안녕하세요, <strong>${name}</strong>님.<br/>
          <strong>${company}</strong>의 광고·스폰서십 문의가 정상적으로 접수되었습니다.</p>
          <p style="color:#374151;line-height:1.7">영업일 기준 <strong>1~2일 내</strong>에 담당자가 연락드릴 예정입니다.</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
          <p style="color:#9ca3af;font-size:13px">biomice — 의학 학술대회 정보 플랫폼<br/>biomice.xyz</p>
        </div>
      `,
    });

    return { ok: true, message: "문의가 접수되었습니다. 빠른 시일 내 연락드리겠습니다." };
  } catch (e) {
    console.error("pharma inquiry email error:", e);
    return { ok: false, message: "발송 중 오류가 발생했습니다. 직접 이메일로 문의해 주세요." };
  }
}
