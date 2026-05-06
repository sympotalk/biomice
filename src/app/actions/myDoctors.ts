"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type MyDoctor = {
  id: number;
  doctor_id: number;
  visit_grade: string | null;
  is_active: boolean;
  memo: string | null;
  created_at: string;
  hospital_doctors: {
    id: number;
    name: string;
    department: string | null;
    specialty: string | null;
    position: string | null;
    profile_url: string | null;
    hospitals: {
      code: string;
      name: string;
    } | null;
  } | null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any;

export async function addMyDoctor(doctorId: number, grade?: string): Promise<{ error?: string }> {
  const sb: AnyClient = await createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return { error: "로그인이 필요합니다." };

  const { error } = await sb.from("my_doctors").upsert(
    { user_id: auth.user.id, doctor_id: doctorId, visit_grade: grade ?? null },
    { onConflict: "user_id,doctor_id" },
  );
  if (error) return { error: error.message };

  revalidatePath("/my-doctors");
  return {};
}

export async function removeMyDoctor(doctorId: number): Promise<{ error?: string }> {
  const sb: AnyClient = await createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return { error: "로그인이 필요합니다." };

  const { error } = await sb
    .from("my_doctors")
    .delete()
    .eq("user_id", auth.user.id)
    .eq("doctor_id", doctorId);
  if (error) return { error: error.message };

  revalidatePath("/my-doctors");
  return {};
}

export async function updateDoctorGrade(doctorId: number, grade: string): Promise<{ error?: string }> {
  const sb: AnyClient = await createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return { error: "로그인이 필요합니다." };

  const { error } = await sb
    .from("my_doctors")
    .update({ visit_grade: grade, updated_at: new Date().toISOString() })
    .eq("user_id", auth.user.id)
    .eq("doctor_id", doctorId);
  if (error) return { error: error.message };

  revalidatePath("/my-doctors");
  return {};
}

export async function updateDoctorMemo(doctorId: number, memo: string): Promise<{ error?: string }> {
  const sb: AnyClient = await createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return { error: "로그인이 필요합니다." };

  const { error } = await sb
    .from("my_doctors")
    .update({ memo, updated_at: new Date().toISOString() })
    .eq("user_id", auth.user.id)
    .eq("doctor_id", doctorId);
  if (error) return { error: error.message };

  revalidatePath("/my-doctors");
  return {};
}

export async function getMyDoctors(): Promise<MyDoctor[]> {
  const sb: AnyClient = await createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return [];

  const { data } = await sb
    .from("my_doctors")
    .select(`
      id, doctor_id, visit_grade, is_active, memo, created_at,
      hospital_doctors (
        id, name, department, specialty, position, profile_url,
        hospitals ( code, name )
      )
    `)
    .eq("user_id", auth.user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (data ?? []) as MyDoctor[];
}
