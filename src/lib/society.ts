/**
 * 학회 영문 약자 + 진료과 색상 매핑.
 * 매핑 없는 학회는 학회명에서 자동으로 한글 이니셜로 fallback.
 */

const ENGLISH_ABBR: Record<string, string> = {
  // 내과·소화기·심장·내분비
  "대한내과학회": "KAIM",
  "대한심장학회": "KSC",
  "대한심장혈관흉부외과학회": "KSCVS",
  "대한고혈압학회": "KSH",
  "대한당뇨병학회": "KDA",
  "대한갑상선학회": "KTA",
  "대한내분비학회": "KES",
  "대한신장학회": "KSN",
  "대한소화기학회": "KSG",
  "대한간학회": "KASL",
  "대한췌장담도학회": "KPBA",
  "대한혈액학회": "KSH-Hema",
  "대한종양내과학회": "KSMO",
  "대한감염학회": "KSID",
  "대한류마티스학회": "KCR",
  "대한천식알레르기학회": "KAAACI",
  "대한호흡기학회": "KATRD",
  "대한노년의학회": "KGS",

  // 외과·정형·신경외과
  "대한외과학회": "KSS",
  "대한정형외과학회": "KOA",
  "대한신경외과학회": "KNS",
  "대한성형외과학회": "KSPRS",
  "대한대장항문학회": "KSCP",
  "대한혈관외과학회": "KSVS",
  "대한이식학회": "KST",

  // 소아·산부인과·신생아
  "대한소아청소년과학회": "KPS",
  "대한신생아학회": "KSNM",
  "대한산부인과학회": "KSOG",
  "대한가정의학회": "KAFM",

  // 두경부·이비인후·안과·치과
  "대한이비인후과학회": "KORL",
  "대한안과학회": "KOS",
  "대한치과의사협회": "KDA-D",

  // 피부·정신·재활·마취·영상·병리
  "대한피부과학회": "KDS",
  "대한정신건강의학회": "KNPA",
  "대한신경정신의학회": "KNPA",
  "대한재활의학회": "KARM",
  "대한마취통증의학회": "KSA",
  "대한영상의학회": "KSR",
  "대한병리학회": "KSP-Path",

  // 응급·중환자·예방
  "대한응급의학회": "KSEM",
  "대한중환자의학회": "KSCCM",
  "대한외과중환자의학회": "KSSCC",
  "대한예방의학회": "KSPM",
  "대한산업의학회": "KSOEM",
  "대한가족의학회": "KAFM",

  // 약리·기초·의학
  "대한약리학회": "KSP",
  "대한기초의학협회": "KAMS",
  "대한의학회": "KAMS-K",
  "대한의사협회": "KMA",

  // 비뇨기·여러 기타
  "대한비뇨의학회": "KUA",
  "대한핵의학회": "KSNM-N",
  "대한방사선종양학회": "KOSRO",
  "대한임상종양학회": "KOSCO",
  "대한치매학회": "KDS-Dem",
  "대한뇌졸중학회": "KSS-Stroke",
  "대한신경과학회": "KNA",
  "대한수면학회": "KSSM",
  "대한비만학회": "KSSO",
  "대한골대사학회": "KSBMR",
  "대한슬관절학회": "KKS",
  "대한고관절학회": "KHS",
  "대한견주관절학회": "KSES",
  "대한족부족관절학회": "KFAS",
  "대한수부외과학회": "KSSH",
};

const SPECIALTY_COLOR: Record<string, string> = {
  내과: "#1A6FAA",
  외과: "#1A4D7A",
  정형외과: "#2E6DA4",
  신경외과: "#2E6DA4",
  소아과: "#2E8B57",
  산부인과: "#2E8B57",
  심장내과: "#C54E7A",
  심장: "#C54E7A",
  신경과: "#A24E7A",
  정신의학: "#7A4EA2",
  가정의학: "#1A6FAA",
  안과: "#B46A1A",
  피부과: "#5A6FAA",
  이비인후과: "#3E6DA4",
  치과: "#2E6DA4",
  비뇨기과: "#1A6FAA",
  영상의학과: "#5A5A5A",
  마취통증의학: "#B46A1A",
  재활의학: "#2E8B57",
  응급의학: "#C73E3E",
  병리과: "#5A5A5A",
  진단검사의학: "#5A5A5A",
  핵의학: "#5A5A5A",
  방사선종양학: "#B46A1A",
  예방의학: "#2E8B57",
  기초의학: "#5A6FAA",
  약리학: "#5A6FAA",
};

export function societyAbbr(name: string): string {
  if (ENGLISH_ABBR[name]) return ENGLISH_ABBR[name];
  // Fallback: 한글 이니셜
  const cleaned = name
    .replace(/^대한/, "")
    .replace(/^한국/, "")
    .replace(/학회$/, "")
    .replace(/협회$/, "");
  return (cleaned || name).slice(0, 2);
}

export function specialtyColor(
  specialty: string | null | undefined,
): string {
  if (!specialty) return "var(--bm-primary)";
  return SPECIALTY_COLOR[specialty] || "var(--bm-primary)";
}
