/**
 * ESC (European Society of Cardiology) 어댑터.
 * 출처: https://www.escardio.org/Congresses-Events
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

const SOURCE_URL = "https://www.escardio.org/Congresses-Events";

export const escAdapter: IntlAdapter = {
  key: "esc",
  label: "ESC (European Society of Cardiology)",
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

    $(
      ".event-card, .congress-card, .esc-event, article.event, .views-row",
    ).each((_idx, el) => {
      const $el = $(el);
      const title = $el.find("h2, h3, .event-title").first().text().trim();
      if (!title || title.length > 200) return;

      const dateText = $el
        .find(".event-date, .date, time, .field--name-field-event-date")
        .first()
        .text()
        .trim();
      const location = $el
        .find(".event-location, .location, .venue")
        .first()
        .text()
        .trim();
      const href = $el.find("a").first().attr("href");
      const detailUrl = href
        ? href.startsWith("http")
          ? href
          : `https://www.escardio.org${href}`
        : undefined;

      const dates = parseDateRange(dateText);
      if (!dates) return;
      const loc = parseLocation(location);
      const year = dates.startDate.slice(0, 4);

      events.push({
        sourceId: slugify(title, year),
        title,
        acronym: extractAcronym(title),
        societyName: "European Society of Cardiology",
        societyUrl: "https://www.escardio.org",
        startDate: dates.startDate,
        endDate: dates.endDate,
        city: loc.city,
        countryCode: loc.countryCode,
        countryName: loc.country,
        detailUrl,
        registrationUrl: detailUrl,
        mode: "hybrid",
        primarySpecialty: "심장내과",
        topics: ["cardiology", "cardiovascular"],
      });
    });

    return events;
  },
};
