/**
 * ACC Scientific Session 어댑터.
 * 출처: https://accscientificsession.acc.org
 */

import * as cheerio from "cheerio";
import type { IntlAdapter, IntlEvent } from "../types";
import { parseDateRange, parseLocation, safeFetch, slugify } from "../helpers";

const SOURCE_URL = "https://accscientificsession.acc.org";

export const accAdapter: IntlAdapter = {
  key: "acc",
  label: "ACC Scientific Session",
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

    // ACC 페이지는 hero에 다음 회차 정보. h1 또는 .session-info에서 추출.
    const titleText = $("h1, h2.session-title, .meeting-title")
      .first()
      .text()
      .trim();
    const dateText =
      $(".session-date, .meeting-date, .date").first().text().trim() ||
      $("time").first().text().trim();
    const locationText =
      $(".session-location, .meeting-location, .venue, .location")
        .first()
        .text()
        .trim();

    if (titleText && dateText) {
      const dates = parseDateRange(dateText);
      if (dates) {
        const loc = parseLocation(locationText);
        const year = dates.startDate.slice(0, 4);
        const yearShort = year.slice(2);
        events.push({
          sourceId: `acc-ss-${year}`,
          title: titleText,
          acronym: `ACC.${yearShort}`,
          societyName: "American College of Cardiology",
          societyUrl: "https://www.acc.org",
          startDate: dates.startDate,
          endDate: dates.endDate,
          city: loc.city,
          countryCode: loc.countryCode || "US",
          countryName: loc.country || "United States",
          detailUrl: SOURCE_URL,
          registrationUrl: SOURCE_URL,
          mode: "hybrid",
          primarySpecialty: "심장내과",
          topics: ["cardiology"],
        });
      }
    }

    // 추가 카드형 이벤트 (있으면)
    $(".event-card, article.event, .meeting-card").each((_idx, el) => {
      const $el = $(el);
      const title = $el.find("h2, h3").first().text().trim();
      const dateText = $el.find(".date, time").first().text().trim();
      const dates = parseDateRange(dateText);
      if (!title || !dates) return;
      const year = dates.startDate.slice(0, 4);
      const loc = parseLocation($el.find(".location, .venue").first().text().trim());
      const href = $el.find("a").first().attr("href");
      events.push({
        sourceId: slugify(title, year),
        title,
        societyName: "American College of Cardiology",
        societyUrl: "https://www.acc.org",
        startDate: dates.startDate,
        endDate: dates.endDate,
        city: loc.city,
        countryCode: loc.countryCode || "US",
        countryName: loc.country || "United States",
        detailUrl: href?.startsWith("http") ? href : SOURCE_URL,
        primarySpecialty: "심장내과",
      });
    });

    return events;
  },
};
