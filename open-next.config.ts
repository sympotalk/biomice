import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  // Regional cache: request dedup within a single colo.
  // Add `incrementalCache` / `queue` later when traffic justifies KV or R2 bindings.
});
