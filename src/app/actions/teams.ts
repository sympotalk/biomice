"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type Team = {
  id: number;
  name: string;
  owner_id: string;
  invite_code: string;
  created_at: string;
};

export type TeamMember = {
  id: number;
  team_id: number;
  user_id: string;
  role: string;
  joined_at: string;
  users_profile?: { display_name: string | null; user_type: string | null } | null;
};

export type TeamPin = {
  id: number;
  team_id: number;
  conference_id: number;
  pinned_by: string;
  created_at: string;
  conferences?: { id: number; title: string; start_date: string | null } | null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any;

export async function getMyTeams(): Promise<(Team & { role: string; memberCount: number })[]> {
  const sb: AnyClient = await createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return [];

  const { data: memberships } = await sb
    .from("team_members")
    .select("role, teams ( id, name, owner_id, invite_code, created_at )")
    .eq("user_id", auth.user.id);

  if (!memberships?.length) return [];

  const teamIds = memberships
    .map((m: { teams: { id: number } }) => m.teams?.id)
    .filter(Boolean) as number[];

  const { data: memberCounts } = await sb
    .from("team_members")
    .select("team_id")
    .in("team_id", teamIds);

  const countMap = new Map<number, number>();
  for (const mc of (memberCounts ?? [])) {
    countMap.set(mc.team_id, (countMap.get(mc.team_id) ?? 0) + 1);
  }

  return memberships.map((m: { role: string; teams: Team }) => ({
    ...m.teams,
    role: m.role,
    memberCount: countMap.get(m.teams?.id) ?? 1,
  }));
}

export async function createTeam(name: string): Promise<{ team?: Team; error?: string }> {
  const sb: AnyClient = await createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return { error: "로그인이 필요합니다." };

  const { data: team, error: teamErr } = await sb
    .from("teams")
    .insert({ name, owner_id: auth.user.id })
    .select()
    .single();
  if (teamErr) return { error: teamErr.message };

  await sb.from("team_members").insert({ team_id: team.id, user_id: auth.user.id, role: "owner" });

  revalidatePath("/team");
  return { team };
}

export async function joinTeamByCode(inviteCode: string): Promise<{ error?: string }> {
  const sb: AnyClient = await createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return { error: "로그인이 필요합니다." };

  const { data: team } = await sb
    .from("teams")
    .select("id")
    .eq("invite_code", inviteCode.trim())
    .maybeSingle();
  if (!team) return { error: "초대 코드가 올바르지 않습니다." };

  const { error } = await sb
    .from("team_members")
    .upsert({ team_id: team.id, user_id: auth.user.id, role: "member" }, { onConflict: "team_id,user_id" });
  if (error) return { error: error.message };

  revalidatePath("/team");
  return {};
}

export async function leaveTeam(teamId: number): Promise<{ error?: string }> {
  const sb: AnyClient = await createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return { error: "로그인이 필요합니다." };

  const { error } = await sb
    .from("team_members")
    .delete()
    .eq("team_id", teamId)
    .eq("user_id", auth.user.id);
  if (error) return { error: error.message };

  revalidatePath("/team");
  return {};
}

export async function getTeamMembers(teamId: number): Promise<TeamMember[]> {
  const sb: AnyClient = await createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return [];

  const { data } = await sb
    .from("team_members")
    .select("id, team_id, user_id, role, joined_at, users_profile ( display_name, user_type )")
    .eq("team_id", teamId);

  return (data ?? []) as TeamMember[];
}

export async function getTeamPins(teamId: number): Promise<TeamPin[]> {
  const sb: AnyClient = await createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return [];

  const { data } = await sb
    .from("team_pins")
    .select("id, team_id, conference_id, pinned_by, created_at, conferences ( id, title, start_date )")
    .eq("team_id", teamId)
    .order("created_at", { ascending: false });

  return (data ?? []) as TeamPin[];
}

export async function pinConference(teamId: number, conferenceId: number): Promise<{ error?: string }> {
  const sb: AnyClient = await createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return { error: "로그인이 필요합니다." };

  const { error } = await sb
    .from("team_pins")
    .upsert({ team_id: teamId, conference_id: conferenceId, pinned_by: auth.user.id }, { onConflict: "team_id,conference_id" });
  if (error) return { error: error.message };

  revalidatePath(`/team/${teamId}`);
  return {};
}

export async function unpinConference(teamId: number, conferenceId: number): Promise<{ error?: string }> {
  const sb: AnyClient = await createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return { error: "로그인이 필요합니다." };

  const { error } = await sb
    .from("team_pins")
    .delete()
    .eq("team_id", teamId)
    .eq("conference_id", conferenceId);
  if (error) return { error: error.message };

  revalidatePath(`/team/${teamId}`);
  return {};
}
