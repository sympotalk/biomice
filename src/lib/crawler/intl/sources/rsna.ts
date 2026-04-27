/**
 * RSNA Annual Meeting 어댑터.
 * 출처: https://www.rsna.org/annual-meeting
 */

import * as cheerio from "cheerio";
import type { IntlAdapter, IntlEvent } from "../types";
import { parseDateRange, parseLocation, safeFetch } from "../helpers";

const SOURCE_URL = "https://www.rsna.org/annual-meeting";

export const rsnaAdapter: IntlAdapter = {
  key: "rsna",
  label: "RSNA (Radiological Society of North America)",
  defaultSpecialty: "영상의학",
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

    const title =
      $("h1, .hero-title, .annual-meeting-title").first().text().trim() ||
      $("title").first().text().trim();
    const dateText =
      $(".meeting-date, .date, .annual-meeting-date, time").first().text().trim();
    const location =
      $(".meeting-location, .venue, .location").first().text().trim() ||
      "McCormick Place, Chicago, IL, United States";

    const dates = parseDateRange(dateText);
    if (title && dates) {
      const loc = parseLocation(location);
      const year = dates.startDate.slice(0, 4);
      events.push({
        sourceId: `rsna-${year}`,
        title: title.length > 100 ? `RSNA ${year} Annual Meeting` : title,
        acronym: "RSNA",
        societyName: "Radiological Society of North America",
        societyUrl: "https://www.rsna.org",
        startDate: dates.startDate,
        endDate: dates.endDate,
        city: loc.city || "Chicago, IL",
        countryCode: loc.countryCode || "US",
        countryName: loc.country || "United States",
        detailUrl: SOURCE_URL,
        registrationUrl: SOURCE_URL,
        mode: "offline",
        primarySpecialty: "영상의학",
        topics: ["radiology", "imaging"],
      });
    }

    return events;
  },
};
