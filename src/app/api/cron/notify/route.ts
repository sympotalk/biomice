import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendConferenceReminder } from "@/lib/email";
import type { Conference } from "@/lib/database.types";

/**
 * D-day 알림 발송 Cron 엔드포인트
 * workers/cron.ts → 매일 KST 09:00 (UTC 00:00)에 호출
 */
export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const token = process.env.CRAWLER_TOKEN;
  const sent = req.nextUrl.searchParams.get("token");
  if (!token || sent !== token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. notify_enabled=true인 프로필 목록
  const { data: profiles, error: pErr } = await admin
    .from("users_profile")
    .select("id, notify_days")
    .eq("notify_enabled", true);

  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });
  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ sent: 0, skipped: 0 });
  }

  // 2. 해당 사용자들의 auth 이메일 조회
  const { data: authData, error: aErr } = await admin.auth.admin.listUsers({
    perPage: 1000,
  });
  if (aErr) return NextResponse.json({ error: aErr.message }, { status: 500 });

  const profileIds = new Set(profiles.map((p) => p.id));
  const emailMap = new Map<string, string>(
    authData.users
      .filter((u) => profileIds.has(u.id) && !!u.email)
      .map((u) => [u.id, u.email as string]),
  );

  // 3. 위 사용자들의 즐겨찾기 학술대회 조회
  const { data: bookmarks, error: bErr } = await admin
    .from("bookmarks")
    .select("user_id, conference_id")
    .in(
      "user_id",
      profiles.map((p) => p.id),
    );

  if (bErr) return NextResponse.json({ error: bErr.message }, { status: 500 });
  if (!bookmarks || bookmarks.length === 0) {
    return NextResponse.json({ sent: 0, skipped: 0 });
  }

  // 4. 관련 학술대회 조회
  const confIds = [...new Set(bookmarks.map((b) => b.conference_id))];
  const { data: confs, error: cErr } = await admin
    .from("conferences")
    .select("id, event_name, start_date, end_date, venue, city, society_name, registration_url")
    .in("id", confIds);

  if (cErr) return NextResponse.json({ error: cErr.message }, { status: 500 });

  const confMap = new Map(
    (confs ?? []).map((c) => [c.id, c as Conference]),
  );
  const profileMap = new Map(profiles.map((p) => [p.id, p.notify_days]));

  let sentCount = 0;
  let skippedCount = 0;

  for (const bookmark of bookmarks) {
    const conf = confMap.get(bookmark.conference_id);
    if (!conf) { skippedCount++; continue; }

    const notifyDays = profileMap.get(bookmark.user_id) ?? [7, 1];
    const email = emailMap.get(bookmark.user_id);
    if (!email) { skippedCount++; continue; }

    // D-day 계산
    const confDate = new Date(conf.start_date);
    confDate.setHours(0, 0, 0, 0);
    const diffDays = Math.round(
      (confDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (!notifyDays.includes(diffDays)) continue;

    // 중복 발송 방지
    const { data: log } = await admin
      .from("notification_log")
      .select("id")
      .eq("user_id", bookmark.user_id)
      .eq("conference_id", conf.id)
      .eq("days_before", diffDays)
      .maybeSingle();

    if (log) { skippedCount++; continue; }

    // 발송
    const result = await sendConferenceReminder({
      to: email,
      conference: conf,
      daysBefore: diffDays,
    });

    if (result.ok) {
      await admin.from("notification_log").insert({
        user_id: bookmark.user_id as string,
        conference_id: conf.id,
        days_before: diffDays,
      });
      sentCount++;
    } else {
      console.error(`notify failed to=${email} conf=${conf.id}: ${result.error}`);
      skippedCount++;
    }
  }

  return NextResponse.json({ sent: sentCount, skipped: skippedCount });
}
