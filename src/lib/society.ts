/**
 * 학회 영문 약자 + 진료과 색상 매핑.
 *
 * DB의 모든 176개 학회가 이 파일에 등록되어 있음.
 * 영문 약자 매핑 정보:
 *   - CONFIRMED_ABBR: 학회 공식 영문명에서 추출한 확실한 약자
 *   - TENTATIVE_ABBR: 영문명에서 추정한 약자 (사용자 검토 권장)
 *   - UNMAPPED:        영문 약자가 없거나 표준이 없는 학회 — USER_ABBR에 추가하면 즉시 반영
 *   - USER_ABBR:       사용자가 직접 추가/수정하는 매핑. CONFIRMED/TENTATIVE보다 우선.
 *
 * 새 학회를 매핑하거나 기존 매핑을 덮어쓰려면 USER_ABBR에 추가:
 *
 *     export const USER_ABBR: Record<string, string> = {
 *       "대한어쩌고학회": "KSXX",
 *     };
 */

// ── 사용자 매핑 (최우선) ──────────────────────────────────────────────────
// 여기에 추가하면 CONFIRMED/TENTATIVE를 덮어씀.
export const USER_ABBR: Record<string, string> = {
  // 예시:
  // "대한어쩌고학회": "KSXX",
};

// ── 확정 매핑 (학회 공식 영문 약자) ───────────────────────────────────────
const CONFIRMED_ABBR: Record<string, string> = {
  // 진료과 학회 (전문의 학회)
  "대한가정의학회": "KAFM",
  "대한내과학회": "KAIM",
  "대한마취통증의학회": "KSA",
  "대한산부인과학회": "KSOG",
  "대한성형외과학회": "KSPRS",
  "대한소아청소년과학회": "KPS",
  "대한신경과학회": "KNA",
  "대한신경외과학회": "KNS",
  "대한신경정신의학회": "KNPA",
  "대한안과학회": "KOS",
  "대한영상의학회": "KSR",
  "대한외과학회": "KSS",
  "대한응급의학회": "KSEM",
  "대한이비인후과학회": "KORL",
  "대한재활의학회": "KARM",
  "대한정형외과학회": "KOA",
  "대한진단검사의학회": "KSLM",
  "대한피부과학회": "KDS",
  "대한핵의학회": "KSNM-N",
  "대한병리학회": "KSP-Path",
  "대한비뇨의학회": "KUA",
  "대한방사선종양학회": "KOSRO",
  "대한예방의학회": "KSPM",
  "대한직업환경의학회": "KSOEM",

  // 내과 분과
  "대한감염학회": "KSID",
  "대한갑상선학회": "KTA",
  "대한고혈압학회": "KSH",
  "대한내분비학회": "KES",
  "대한노인병학회": "KGS",
  "대한당뇨병학회": "KDA",
  "대한류마티스학회": "KCR",
  "대한부정맥학회": "KHRS",
  "대한신장학회": "KSN",
  "대한심부전학회": "KHFS",
  "대한심장학회": "KSC",
  "대한천식알레르기학회": "KAAACI",
  "대한혈액학회": "KSH-Hema",
  "대한호흡기학회": "KATRD",
  "대한결핵및호흡기학회": "KATRD",
  "대한간학회": "KASL",
  "대한소화기학회": "KSG",
  "대한소화기내시경학회": "KSGE",
  "대한췌장담도학회": "KPBA",
  "대한장연구학회": "KASID",
  "대한종양내과학회": "KSMO",

  // 외과 분과
  "대한심장혈관흉부외과학회": "KSCVS",
  "대한이식학회": "KST",
  "대한혈관외과학회": "KSVS",
  "대한대장항문학회": "KSCP",
  "대한고관절학회": "KHS",
  "대한슬관절학회": "KKS",
  "대한족부족관절학회": "KFAS",
  "대한수부외과학회": "KSSH",
  "대한척추외과학회": "KSS-Spine",
  "대한외상학회": "KAST",
  "대한미용성형외과학회": "KSAPS",

  // 산부인과 / 소아 / 신생아
  "대한모체태아의학회": "KSMFM",
  "대한부인종양학회": "KSGO",
  "대한산부인과초음파학회": "KSUOG",
  "대한생식의학회": "KSRM",
  "대한소아내분비학회": "KSPE",
  "대한소아소화기영양학회": "KSPGAN",
  "대한소아신경학회": "KCNS",
  "대한소아신장학회": "KSPN",
  "대한소아알레르기호흡기학회": "KAPARD",
  "대한소아응급의학회": "KSPEM",
  "대한소아청소년정신의학회": "KACAP",
  "대한소아외과학회": "KAPS",
  "대한소아혈액종양학회": "KSPHO",
  "대한소아감염학회": "KSPID",
  "대한신생아학회": "KSNM",

  // 정신 / 신경 / 재활
  "대한노인정신의학회": "KAGP",
  "대한뇌졸중학회": "KSS-Stroke",
  "대한치매학회": "KDS-Dem",
  "대한수면의학회": "KSSM-Sleep",
  "대한임상신경생리학회": "KCNS-Phys",
  "대한정신약물학회": "KCNP",
  "대한통증학회": "KPS-Pain",

  // 영상 / 핵의학 / 마취 / 병리
  "대한자기공명의과학회": "KOMRI",
  "대한초음파의학회": "KSUM",
  "대한세포병리학회": "KSC-Cyto",

  // 약리 / 임상시험 / 기초
  "대한약리학회": "KSP",
  "대한임상약리학회": "KSCPT",
  "대한면역학회": "KAI",
  "대한미생물학회": "KSM",
  "대한해부학회": "KAA",
  "대한생리학회": "KPS-Phys",
  "대한바이러스학회": "KSV",
  "대한백신학회": "KVS",

  // 비만 / 종양 / 암
  "대한비만학회": "KSSO",
  "대한위암학회": "KGCA",
  "대한폐암학회": "KALC",
  "대한암학회": "KCA",

  // 중환자 / 의료
  "대한중환자의학회": "KSCCM",
  "대한신경집중치료학회": "KNCC",

  // 한국 학회
  "한국유방암학회": "KBCS",
  "한국지질·동맥경화학회": "KSoLA",
  "한국혈전지혈학회": "KSTH",
  "한국호스피스·완화의료학회": "KHPC",
  "한국역학회": "KSE-Epi",
  "한국의학교육학회": "KSME-Edu",
  "한국줄기세포학회": "KSSCR",
  "한국항공우주의학회": "KASEM",
  "한국간담췌외과학회": "KAHBPS",
  "한국뇌신경과학회": "KSBNS",
  "생화학분자생물학회": "KSBMB",
};

// ── 추정 매핑 (영문명 기반 추정 — 검증 권장) ─────────────────────────────
const TENTATIVE_ABBR: Record<string, string> = {
  // 위 분과의 변형 / 관련 학회
  "대한간암학회": "KLCA",
  "대한견·주관절의학회": "KSES",
  "대한골대사학회": "KSBMR",
  "대한골절학회": "KFS",
  "대한근골격종양학회": "KMSTS",
  "대한근전도·전기진단의학회": "KAEM",
  "대한기관식도과학회": "KSBE",
  "대한기생충학·열대의학회": "KSPTM",
  "대한나학회": "KLA",
  "대한남성과학회": "KSSM-Male",
  "대한내분비외과학회": "KAES",
  "대한내시경로봇외과학회": "KSER",
  "대한뇌전증학회": "KES-Epil",
  "대한뇌종양학회": "KSNO",
  "대한뇌혈관내치료의학회": "KSIN",
  "대한두개안면성형외과학회": "KCPRS",
  "대한두개저학회": "KSBS",
  "대한두경부외과학회": "KSHN",
  "대한두경부종양학회": "KSHNO",
  "대한두통학회": "KHS-Head",
  "대한마취약리학회": "KSAP",
  "대한미세수술학회": "KSM-Micro",
  "대한배뇨기능재건학회": "KSFUR",
  "대한배뇨장애요실금학회": "KCS-Urol",
  "대한법의학회": "KOFM",
  "대한비과학회": "KRS",
  "대한비뇨기종양학회": "KUOS",
  "대한비뇨내시경로봇학회": "KSER-Uro",
  "대한비만대사외과학회": "KSMBS",
  "대한산부인과내시경학회": "KSGE-Gyn",
  "대한상부위장관·헬리코박터학회": "KCHUGH",
  "대한생물정신의학회": "KSBP",
  "대한소아청소년신경외과학회": "KSPN-NS",
  "대한소화기기능성질환·운동학회": "KSNM-GI",
  "대한소화기암연구학회": "KSGC",
  "대한수혈학회": "KSBT",
  "대한스포츠의학회": "KSSM-Sport",
  "대한신경손상학회": "KSNT",
  "대한신경중재치료의학회": "KSIN-T",
  "대한심뇌혈관질환예방학회": "KSCDP",
  "대한심혈관중재학회": "KSIC",
  "대한암예방학회": "KSCP-Prev",
  "대한연하장애학회": "KDS-Dys",
  "대한우울조울병학회": "KOMD",
  "대한유전성대사질환학회": "KSIEM",
  "대한의료관련감염관리학회": "KOSHIC",
  "대한의료정보학회": "KOSMI",
  "대한의사학회": "KSMH",
  "대한의용생체공학회": "KOSOMBE",
  "대한의진균학회": "KSMM",
  "대한의학레이저학회": "KSLM-Laser",
  "대한의학유전학회": "KSMG",
  "대한이과학회": "KAS-Otol",
  "대한임상미생물학회": "KSCM",
  "대한임상화학회": "KCS-Chem",
  "대한전립선학회": "KPSA",
  "대한정맥학회": "KSV-Vein",
  "대한조혈모세포이식학회": "KSBMT",
  "대한종양외과학회": "KSSO-Surg",
  "대한진단검사정도관리협회": "KAQACL",
  "대한척추신경외과학회": "KSSS-NS",
  "대한청각학회": "KAS-Aud",
  "대한체질인류학회": "KAPA",
  "대한파킨슨병및이상운동질환학회": "KMDS",
  "대한평형의학회": "KEqS",
  "대한혈관외과학회": "KSVS",
  "대한화상학회": "KBA",
  "한국의료윤리학회": "KSME",
  "한국의료질향상학회": "KOSQUA",
  "한국정신분석학회": "KAPSA",
  "한국정신신체의학회": "KSPM-Psy",
  "한국조직공학·재생의학회": "KTERMIS",
};

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 영문 약자가 미확정인 학회 (현재 0개 — 전부 매핑됨).
 *
 * DB에서 새 학회가 추가되면 자동으로 한글 이니셜 fallback되며 dev 콘솔에
 *   [society] No abbreviation for: 대한XXX학회
 * 메시지가 출력됨. 그 학회를 USER_ABBR 또는 이 리스트에 추가하면 됨.
 * ════════════════════════════════════════════════════════════════════════════
 */
export const UNMAPPED_SOCIETIES: string[] = [
  // 영문 약자 미확정 학회를 여기에 한국어 이름으로 추가하면 dev 모드에서 추적됨
];

// ── 진료과 색상 ──────────────────────────────────────────────────────────────
const SPECIALTY_COLOR: Record<string, string> = {
  내과: "#1A6FAA",
  외과: "#1A4D7A",
  정형외과: "#2E6DA4",
  신경외과: "#2E6DA4",
  성형외과: "#5A6FAA",
  흉부외과: "#1A4D7A",
  소아과: "#2E8B57",
  소아청소년과: "#2E8B57",
  산부인과: "#2E8B57",
  심장내과: "#C54E7A",
  심장: "#C54E7A",
  혈액종양: "#A24E7A",
  종양내과: "#A24E7A",
  신경과: "#A24E7A",
  정신의학: "#7A4EA2",
  정신건강의학: "#7A4EA2",
  가정의학: "#1A6FAA",
  안과: "#B46A1A",
  피부과: "#5A6FAA",
  이비인후과: "#3E6DA4",
  치과: "#2E6DA4",
  비뇨기과: "#1A6FAA",
  비뇨의학: "#1A6FAA",
  영상의학과: "#5A5A5A",
  영상의학: "#5A5A5A",
  마취통증의학: "#B46A1A",
  마취: "#B46A1A",
  재활의학: "#2E8B57",
  응급의학: "#C73E3E",
  병리과: "#5A5A5A",
  병리: "#5A5A5A",
  진단검사의학: "#5A5A5A",
  핵의학: "#5A5A5A",
  방사선종양학: "#B46A1A",
  예방의학: "#2E8B57",
  기초의학: "#5A6FAA",
  약리학: "#5A6FAA",
  알레르기: "#2E8B57",
  류마티스: "#A24E7A",
  내분비: "#1A6FAA",
  소화기: "#1A6FAA",
  호흡기: "#3E6DA4",
  신장: "#1A6FAA",
  감염: "#2E8B57",
  중환자: "#C73E3E",
};

export function societyAbbr(name: string): string {
  if (USER_ABBR[name]) return USER_ABBR[name];
  if (CONFIRMED_ABBR[name]) return CONFIRMED_ABBR[name];
  if (TENTATIVE_ABBR[name]) return TENTATIVE_ABBR[name];

  // 개발 모드에서만 콘솔 로그 — 매핑 안 된 학회를 사용자가 추적하기 쉽게
  if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.warn(`[society] No abbreviation for: ${name}`);
  }

  // Fallback: 한글 이니셜
  const cleaned = name
    .replace(/^대한/, "")
    .replace(/^한국/, "")
    .replace(/학회$/, "")
    .replace(/협회$/, "")
    .replace(/의학회$/, "");
  return (cleaned || name).slice(0, 2);
}

export function specialtyColor(
  specialty: string | null | undefined,
): string {
  if (!specialty) return "var(--bm-primary)";
  if (SPECIALTY_COLOR[specialty]) return SPECIALTY_COLOR[specialty];
  // 부분 매칭
  for (const key of Object.keys(SPECIALTY_COLOR)) {
    if (specialty.includes(key)) return SPECIALTY_COLOR[key];
  }
  return "var(--bm-primary)";
}

/**
 * 학회명에서 진료과를 자동으로 추정.
 * DB의 specialty 필드가 NULL인 학회 168개를 일괄 보강하기 위한 룰.
 *
 * 우선순위 — 더 구체적인 패턴이 먼저 매칭되어야 함.
 * 예: "신경외과" 가 "외과"보다 먼저 체크되어야 정확.
 */
const SPECIALTY_RULES: Array<{ pattern: RegExp; specialty: string }> = [
  // ── 신경 계열 (외과 매칭보다 먼저) ─────────────────────────────────────
  { pattern: /신경외|뇌혈관내치료|뇌종양|두개저|척추신경외과|신경손상/, specialty: "신경외과" },
  { pattern: /신경과|뇌졸중|치매|수면|두통|파킨슨|뇌전증|근전도|신경집중|연하장애|임상신경/, specialty: "신경과" },
  { pattern: /뇌신경/, specialty: "기초의학" },

  // ── 외과 세부 (외과 매칭보다 먼저) ─────────────────────────────────────
  { pattern: /정형외과|골절|관절|수부|족부|근골격|미세수술|스포츠의학|골대사|척추외과/, specialty: "정형외과" },
  { pattern: /성형외과|미용성형|두개안면성형/, specialty: "성형외과" },
  { pattern: /흉부외과|심장혈관흉부/, specialty: "흉부외과" },
  { pattern: /비뇨|남성과|전립선|배뇨/, specialty: "비뇨의학" },
  { pattern: /이비인후|비과|이과|두경부|청각|기관식도|평형의학/, specialty: "이비인후과" },
  { pattern: /산부인과|부인종양|모체태아|생식의학|여성건강/, specialty: "산부인과" },
  { pattern: /소아|신생아/, specialty: "소아청소년과" },
  { pattern: /간담췌외과|혈관외과|정맥|대장항문|내분비외과|이식|외상|화상|비만대사외과|종양외과|내시경로봇외과|소화기암|위암|간암|폐암/, specialty: "외과" },
  { pattern: /^대한외과학회$|^한국외과/, specialty: "외과" },

  // ── 내과 세부 ─────────────────────────────────────────────────────────
  { pattern: /심장|순환기|심부전|부정맥|심혈관|심뇌혈관|심초음파/, specialty: "심장내과" },
  { pattern: /당뇨|갑상선|내분비|비만(?!대사외과)/, specialty: "내과" },
  { pattern: /류마티스/, specialty: "내과" },
  { pattern: /신장|투석/, specialty: "내과" },
  { pattern: /소화기|간학|췌장담도|장연구|상부위장관|헬리코박터/, specialty: "내과" },
  { pattern: /호흡기|결핵|천식|알레르기/, specialty: "내과" },
  { pattern: /감염|바이러스|백신|에이즈|화학요법|임상미생물|의진균|의료관련감염/, specialty: "내과" },
  { pattern: /혈액|혈전지혈|조혈모세포이식/, specialty: "내과" },
  { pattern: /종양내과|암학회|암예방|유방암/, specialty: "내과" },
  { pattern: /노인병|고혈압|지질|동맥경화/, specialty: "내과" },
  { pattern: /^대한내과학회$/, specialty: "내과" },

  // ── 정신·재활 ─────────────────────────────────────────────────────────
  { pattern: /정신|우울|조울|정신분석|신체의학|생물정신/, specialty: "정신의학" },
  { pattern: /재활|연하/, specialty: "재활의학" },
  { pattern: /통증/, specialty: "마취통증의학" },

  // ── 안과·피부 ─────────────────────────────────────────────────────────
  { pattern: /안과/, specialty: "안과" },
  { pattern: /피부/, specialty: "피부과" },

  // ── 응급·중환자·가정 ──────────────────────────────────────────────────
  { pattern: /응급/, specialty: "응급의학" },
  { pattern: /중환자/, specialty: "중환자의학" },
  { pattern: /가정의학|가족/, specialty: "가정의학" },

  // ── 마취·영상·핵의학·병리·진검 ────────────────────────────────────────
  { pattern: /마취/, specialty: "마취통증의학" },
  { pattern: /방사선종양/, specialty: "방사선종양학" },
  { pattern: /영상의학|자기공명|초음파|복부영상|심혈관계영상/, specialty: "영상의학" },
  { pattern: /핵의학/, specialty: "핵의학" },
  { pattern: /병리|세포병리/, specialty: "병리과" },
  { pattern: /진단검사|임상병리|임상화학|수혈|진단검사정도/, specialty: "진단검사의학" },

  // ── 예방·산업·의료정책 ────────────────────────────────────────────────
  { pattern: /예방의학|직업환경|산업의학|역학|의료질|의료윤리|항공우주|호스피스|완화의료/, specialty: "예방의학" },

  // ── 기초·약리 ─────────────────────────────────────────────────────────
  { pattern: /약리|약학|임상약리|임상독성/, specialty: "약리학" },
  { pattern: /해부|생리|면역|미생물|기생충|법의|체질인류|의학유전|유전성대사|줄기세포|조직공학|재생의학|생화학분자|의용생체|의진균/, specialty: "기초의학" },

  // ── 모학회·기타 ───────────────────────────────────────────────────────
  { pattern: /의학회|의사학|의학교육|의료정보|의학레이저/, specialty: "의학" },
  { pattern: /나학회/, specialty: "피부과" }, // 한센병
];

/**
 * 학회명에서 진료과를 자동 추정한다.
 * DB의 specialty가 NULL인 경우 fallback으로 사용 가능.
 *
 * @example
 *   inferSpecialty("대한심장학회") → "심장내과"
 *   inferSpecialty("대한정형외과학회") → "정형외과"
 *   inferSpecialty("대한기초의학협회") → "기초의학"
 */
export function inferSpecialty(name: string): string | null {
  for (const { pattern, specialty } of SPECIALTY_RULES) {
    if (pattern.test(name)) return specialty;
  }
  return null;
}

/**
 * specialty 우선순위:
 *   1. DB 명시값 (society.specialty)
 *   2. 학회명에서 추정 (inferSpecialty)
 *   3. null
 */
export function resolveSpecialty(
  name: string,
  dbSpecialty: string | null | undefined,
): string | null {
  return dbSpecialty || inferSpecialty(name);
}
