/**
 * ADA Scientific Sessions 어댑터.
 * 출처: https://professional.diabetes.org/scientific-sessions
 */

import * as cheerio from "cheerio";
import type { IntlAdapter, IntlEvent } from "../types";
import { parseDateRange, parseLocation, safeFetch, slugify } from "../helpers";

const SOURCE_URL = "https://professional.diabetes.org/scientific-sessions";

export const adaAdapter: IntlAdapter = {
  key: "ada",
  label: "ADA Scientific Sessions",
  defaultSpecialty: "내과",
  priority: "P0",
  async fetchEvents(): Promise<IntlEvent[]> {
    let html: string;
    try {
      html = await safeFetch(SOURCE_URL);
    } catch {
      return [];
    }
    const $ = cheerio.load(html);
    const events: IntlEvent[] = [];

    const title = $("h1, .meeting-title, .hero-title").first().text().trim();
    const dateText =
      $(".meeting-date, .session-date, .date, time").first().text().trim();
    const location =
      $(".meeting-location, .venue, .location").first().text().trim();

    const dates = parseDateRange(dateText);
    if (title && dates) {
      const loc = parseLocation(location);
      const year = dates.startDate.slice(0, 4);
      events.push({
        sourceId: `ada-ss-${year}`,
        title,
        acronym: "ADA",
        societyName: "American Diabetes Association",
        societyUrl: "https://diabetes.org",
        startDate: dates.startDate,
        endDate: dates.endDate,
        city: loc.city,
        countryCode: loc.countryCode || "US",
        countryName: loc.country || "United States",
        detailUrl: SOURCE_URL,
        registrationUrl: SOURCE_URL,
        mode: "hybrid",
        primarySpecialty: "내과",
        topics: ["diabetes", "endocrinology"],
      });
    }

    // 카드형 이벤트
    $(".event-card, .meeting-card, article.event").each((_idx, el) => {
      const $el = $(el);
      const t = $el.find("h2, h3").first().text().trim();
      const d = $el.find(".date, time").first().text().trim();
      const dRange = parseDateRange(d);
      if (!t || !dRange) return;
      const loc = parseLocation($el.find(".location, .venue").first().text().trim());
      const year = dRange.startDate.slice(0, 4);
      const href = $el.find("a").first().attr("href");
      events.push({
        sourceId: slugify(t, year),
        title: t,
        societyName: "American Diabetes Association",
        societyUrl: "https://diabetes.org",
        startDate: dRange.startDate,
        endDate: dRange.endDate,
        city: loc.city,
        countryCode: loc.countryCode || "US",
        countryName: loc.country || "United States",
        detailUrl: href?.startsWith("http") ? href : SOURCE_URL,
        primarySpecialty: "내과",
      });
    });

    return events;
  },
};
