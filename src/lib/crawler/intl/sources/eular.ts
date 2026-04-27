/**
 * EULAR Congress 어댑터.
 * 출처: https://congress.eular.org
 */

import * as cheerio from "cheerio";
import type { IntlAdapter, IntlEvent } from "../types";
import { parseDateRange, parseLocation, safeFetch } from "../helpers";

const SOURCE_URL = "https://congress.eular.org";

export const eularAdapter: IntlAdapter = {
  key: "eular",
  label: "EULAR Congress",
  defaultSpecialty: "내과",
  priority: "P1",
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
      $("h1, .congress-title, .hero-title").first().text().trim() ||
      $("title").first().text().trim();
    const dateText =
      $(".congress-date, .date, time").first().text().trim();
    const location =
      $(".congress-location, .venue, .location").first().text().trim();

    const dates = parseDateRange(dateText);
    if (title && dates) {
      const loc = parseLocation(location);
      const year = dates.startDate.slice(0, 4);
      events.push({
        sourceId: `eular-${year}`,
        title: title.length > 100 ? `EULAR Congress ${year}` : title,
        acronym: "EULAR",
        societyName:
          "European Alliance of Associations for Rheumatology",
        societyUrl: "https://www.eular.org",
        startDate: dates.startDate,
        endDate: dates.endDate,
        city: loc.city,
        countryCode: loc.countryCode,
        countryName: loc.country,
        detailUrl: SOURCE_URL,
        registrationUrl: SOURCE_URL,
        mode: "hybrid",
        primarySpecialty: "내과",
        topics: ["rheumatology", "autoimmune"],
      });
    }

    return events;
  },
};
