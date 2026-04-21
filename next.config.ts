import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 외부 이미지 도메인 (placehold.co 샘플 배너용 + 추후 CDN)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "vmbctjfygimsbirlsaxk.supabase.co" },
    ],
  },
};

export default nextConfig;

// Initialize Cloudflare context during `next dev` so that getCloudflareContext()
// works for middleware/server actions when testing locally.
// In production, the context is injected by the OpenNext worker entry.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
