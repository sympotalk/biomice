/** 진료과별 대표 색상 (hex). 배지·필터 탭에서 공통 사용 */
export const DEPARTMENT_COLORS: Record<string, string> = {
  가정의학과: "#8B7355",
  결핵과: "#6B5B45",
  내과: "#2D9D5A",
  노인의학과: "#7B8D6E",
  대장항문외과: "#9B6B4B",
  마취통증의학과: "#4A90D9",
  방사선종양학과: "#E8A020",
  병리과: "#7A6A8A",
  비뇨의학과: "#7B5EA7",
  산부인과: "#D4608A",
  소아청소년과: "#20B0C8",
  소화기내과: "#3BAF72",
  신경과: "#5B7FA6",
  신경외과: "#6B8FA6",
  신장내과: "#4878A0",
  안과: "#56A8CB",
  영상의학과: "#5B6FA6",
  외과: "#E05151",
  응급의학과: "#D44040",
  이비인후과: "#C07840",
  임상약리학과: "#8BA050",
  재활의학과: "#60A878",
  정신건강의학과: "#7868B8",
  정형외과: "#8B6914",
  직업환경의학과: "#6A8B6A",
  진단검사의학과: "#7060A0",
  피부과: "#C85A8A",
  핵의학과: "#5080A0",
  혈액종양내과: "#A04060",
  흉부외과: "#C04848",
};

/** 진료과 목록 (필터 탭 순서 기준) */
export const DEPARTMENT_LIST = Object.keys(DEPARTMENT_COLORS);

/** 배지 배경색 반환. 미등록 과는 기본 테마색 사용. */
export function getDepartmentColor(dept: string): string {
  return DEPARTMENT_COLORS[dept] ?? "var(--bm-primary)";
}
