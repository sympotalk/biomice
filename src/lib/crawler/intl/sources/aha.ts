/**
 * AHA Scientific Sessions 어댑터.
 * 출처: https://professional.heart.org/en/meetings/scientific-sessions
 *
 * AHA는 매년 11월 정기 — 회차당 1개 행사라 fallback으로 다음 회차 hardcoded.
 */

import * as cheerio from "cheerio";
import type { IntlAdapter, IntlEvent } from "../types";
import { parseDateRange, parseLocation, safeFetch, slugify } from "../helpers";

const SOURCE_URL =
  "https://professional.heart.org/en/meetings/scientific-sessions";

export const ahaAdapter: IntlAdapter = {
  key: "aha",
  label: "AHA Scientific Sessions",
  defaultSpecialty: "심장내과",
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

    // AHA 페이지는 hero에 다음 회차 표시 + 하단에 calendar of events
    const heroDate = $("h1, h2")
      .filter((_, el) => /Scientific Sessions \d{4}/.test($(el).text()))
      .first()
      .text()
      .trim();
    const heroDateText = $(".event-date, .date").first().text().trim();
    const heroLocation = $(".event-location, .location, .venue").first().text().trim();

    const dates = parseDateRange(heroDateText);
    if (heroDate && dates) {
      const loc = parseLocation(heroLocation);
      const year = dates.startDate.slice(0, 4);
      events.push({
        sourceId: `aha-ss-${year}`,
        title: heroDate,
        acronym: "AHA SS",
        societyName: "American Heart Association",
        societyUrl: "https://professional.heart.org",
        startDate: dates.startDate,
        endDate: dates.endDate,
        city: loc.city,
        countryCode: loc.countryCode || "US",
        countryName: loc.country || "United States",
        detailUrl: SOURCE_URL,
        registrationUrl: SOURCE_URL,
        mode: "hybrid",
        primarySpecialty: "심장내과",
        topics: ["cardiology", "cardiovascular"],
      });
    }

    // 추가 calendar items (있으면)
    $(".calendar-item, .event-card, article.event").each((_idx, el) => {
      const $el = $(el);
      const title = $el.find("h2, h3, .event-title").first().text().trim();
      if (!title) return;
      const dateText = $el.find(".event-date, .date, time").first().text().trim();
      const dRange = parseDateRange(dateText);
      if (!dRange) return;
      const loc = parseLocation($el.find(".location, .venue").first().text().trim());
      const year = dRange.startDate.slice(0, 4);
      const href = $el.find("a").first().attr("href");
      events.push({
        sourceId: slugify(title, year),
        title,
        societyName: "American Heart Association",
        societyUrl: "https://professional.heart.org",
        startDate: dRange.startDate,
        endDate: dRange.endDate,
        city: loc.city,
        countryCode: loc.countryCode || "US",
        countryName: loc.country || "United States",
        detailUrl: href?.startsWith("http")
          ? href
          : href
          ? `https://professional.heart.org${href}`
          : SOURCE_URL,
        primarySpecialty: "심장내과",
      });
    });

    return events;
  },
};
