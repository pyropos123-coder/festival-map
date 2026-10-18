// TourAPI(행사정보조회) → festivals.json  (Node 18+)
// 실행: TOUR_API_KEY=발급키 node scripts/fetch-festivals.mjs
import { writeFileSync } from "node:fs";

let key = process.env.TOUR_API_KEY;
if (!key) { console.error("TOUR_API_KEY 환경변수가 필요합니다."); process.exit(1); }
if (key.includes("%")) key = decodeURIComponent(key); // 인코딩된 키를 넣어도 동작

const BASE = "https://apis.data.go.kr/B551011/KorService2/searchFestival2";
const ymd = d => d.toISOString().slice(0, 10).replace(/-/g, "");
const today = new Date(Date.now() + 9 * 3600e3); // KST
const from = new Date(today.getTime() - 60 * 864e5); // 진행 중인 행사까지 포함하려고 60일 전부터

const KW = {
  food: /음식|먹거리|맥주|치킨|커피|김치|막걸리|와인|미식|밥|한우|굴|젓갈|수산|딸기|감귤|사과|전어|대하|꽃게|한과|차\s?축제|푸드/,
  nature: /꽃|단풍|억새|벚꽃|매화|국화|갈대|튤립|장미|유채|코스모스|철쭉|해바라기|은행|눈꽃|산천어|일출|노을|바다|해변|숲|계곡/
};
const classify = t => KW.food.test(t) ? "food" : KW.nature.test(t) ? "nature" : "culture";
const fmtDate = s => `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;

async function page(n) {
  const u = new URL(BASE);
  u.search = new URLSearchParams({ serviceKey: key, MobileOS: "ETC", MobileApp: "festival-map", _type: "json",
    numOfRows: "500", pageNo: String(n), arrange: "A", eventStartDate: ymd(from) });
  const r = await fetch(u);
  const text = await r.text();
  let j; try { j = JSON.parse(text); } catch { throw new Error("JSON이 아닌 응답: " + text.slice(0, 300)); }
  const b = j.response?.body;
  if (!b) throw new Error("응답 오류: " + JSON.stringify(j).slice(0, 300));
  const items = b.items?.item ?? [];
  return { items: Array.isArray(items) ? items : [items], total: b.totalCount ?? 0 };
}

const out = []; let n = 1, total = 0;
do {
  const p = await page(n++); total = p.total; out.push(...p.items);
  if (!p.items.length) break;
} while (out.length < total && n < 20);

const items = out
  .filter(x => x.mapx && x.mapy && x.eventstartdate && x.eventenddate && ymd(today) <= x.eventenddate)
  .map(x => ({
    id: x.contentid, name: x.title.trim(), type: classify(x.title),
    start: fmtDate(x.eventstartdate), end: fmtDate(x.eventenddate),
    place: [x.addr1, x.addr2].filter(Boolean).join(" ").trim(),
    lat: +x.mapy, lng: +x.mapx, img: (x.firstimage || "").replace(/^http:/, "https:"), tel: x.tel || ""
  }));

writeFileSync("festivals.json", JSON.stringify({ updated: new Date().toISOString(), items }, null, 1));
console.log(`저장 완료: ${items.length}개 (API 전체 ${total}개)`);
