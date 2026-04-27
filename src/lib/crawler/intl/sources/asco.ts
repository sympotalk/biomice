/**
 * ASCO 어댑터.
 * 출처: https://conferences.asco.org (Annual Meeting + GU Symposium 등)
 */

import * as cheerio from "cheerio";
import type { IntlAdapter, IntlEvent } from "../types";
import {
  parseDateRange,
  parseLocation,
  safeFetch,
  extractAcronym,
  slugify,
} from "../helpers";

const SOURCE_URL = "https://conferences.asco.org";

export const ascoAdapter: IntlAdapter = {
  key: "asco",
  label: "ASCO (American Society of Clinical Oncology)",
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

    // ASCO 페이지는 .conference-card 또는 .event-listing 형태
    $(
      ".conference-card, .event-listing, .meeting-card, article.conference",
    ).each((_idx, el) => {
      const $el = $(el);
      const title = $el.find("h2, h3, .conference-title").first().text().trim();
      if (!title || title.length < 5) return;

      const dateText = $el
        .find(".conference-date, .date, time")
        .first()
        .text()
        .trim();
      const location = $el
        .find(".conference-location, .location, .venue")
        .first()
        .text()
        .trim();

      const dates = parseDateRange(dateText);
      if (!dates) return;
      const loc = parseLocation(location);
      const year = dates.startDate.slice(0, 4);
      const href = $el.find("a").first().attr("href");

      events.push({
        sourceId: slugify(title, year),
        title,
        acronym: extractAcronym(title) || "ASCO",
        societyName: "American Society of Clinical Oncology",
        societyUrl: "https://www.asco.org",
        startDate: dates.startDate,
        endDate: dates.endDate,
        city: loc.city,
        countryCode: loc.countryCode || "US",
        countryName: loc.country || "United States",
        detailUrl: href?.startsWith("http")
          ? href
          : href
          ? `https://conferences.asco.org${href}`
          : SOURCE_URL,
        registrationUrl: href?.startsWith("http") ? href : SOURCE_URL,
        mode: "hybrid",
        primarySpecialty: "내과",
        topics: ["oncology", "clinical oncology"],
      });
    });

    return events;
  },
};
