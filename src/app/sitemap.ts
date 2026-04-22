import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://biomice.xyz";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sb = await createClient();

  // Conferences (upcoming + recent 90 days past)
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const from = ninetyDaysAgo.toISOString().slice(0, 10);

  const [{ data: conferences }, { data: societies }] = await Promise.all([
    sb
      .from("conferences")
      .select("id, updated_at")
      .gte("start_date", from)
      .eq("is_deleted", false)
      .order("start_date", { ascending: true }),
    sb
      .from("societies")
      .select("slug, updated_at")
      .order("name", { ascending: true }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/conferences`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/societies`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  const conferenceRoutes: MetadataRoute.Sitemap = (conferences ?? []).map((c) => ({
    url: `${BASE_URL}/conferences/${c.id}`,
    lastModified: new Date(c.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const societyRoutes: MetadataRoute.Sitemap = (societies ?? []).map((s) => ({
    url: `${BASE_URL}/societies/${s.slug}`,
    lastModified: new Date(s.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...conferenceRoutes, ...societyRoutes];
}
