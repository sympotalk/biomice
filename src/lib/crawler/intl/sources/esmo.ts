/**
 * ESMO (European Society for Medical Oncology) 어댑터.
 * 출처: https://www.esmo.org/meeting-calendar
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

const SOURCE_URL = "https://www.esmo.org/meeting-calendar";

export const esmoAdapter: IntlAdapter = {
  key: "esmo",
  label: "ESMO (European Society for Medical Oncology)",
  defaultSpecialty: "내과",
  priority: "P0",
  async fetchEvents(): Promise<IntlEvent[]> {
    const html = await safeFetch(SOURCE_URL);
    const $ = cheerio.load(html);
    const events: IntlEvent[] = [];

    $(".meeting-card, article.meeting, .calendar-item, .event-card").each(
      (_idx, el) => {
        const $el = $(el);
        const title = $el.find("h2, h3").first().text().trim();
        if (!title) return;

        const dateText = $el.find(".meeting-date, .date, time").first().text().trim();
        const location = $el.find(".meeting-location, .location").first().text().trim();
        const href = $el.find("a").first().attr("href");
        const detailUrl = href
          ? href.startsWith("http")
            ? href
            : `https://www.esmo.org${href}`
          : undefined;

        const dates = parseDateRange(dateText);
        if (!dates) return;

        const loc = parseLocation(location);
        const year = dates.startDate.slice(0, 4);

        events.push({
          sourceId: slugify(title, year),
          title,
          acronym: extractAcronym(title),
          societyName: "European Society for Medical Oncology",
          societyUrl: "https://www.esmo.org",
          startDate: dates.startDate,
          endDate: dates.endDate,
          city: loc.city,
          countryCode: loc.countryCode,
          countryName: loc.country,
          detailUrl,
          registrationUrl: detailUrl,
          mode: "hybrid",
          primarySpecialty: "내과",
          topics: ["oncology", "medical oncology"],
        });
      },
    );

    return events;
  },
};
