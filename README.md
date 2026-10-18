# 우리나라 축제 지도

카카오맵 + 한국관광공사 TourAPI. 서버 없이 정적 파일만으로 동작하고, 데이터는 매일 자동 갱신됩니다.

## 구성
- `index.html` 화면 전체 (지도·목록·필터·상세·공유·내 주변순)
- `festivals.json` 축제 데이터 (처음에는 샘플. 자동 갱신되면 실제 데이터로 교체됨)
- `scripts/fetch-festivals.mjs` TourAPI → festivals.json 변환
- `.github/workflows/update.yml` 매일 새벽 자동 갱신

## 설정 (약 30분)
1. **TourAPI 키**: data.go.kr에서 "한국관광공사_국문 관광정보 서비스" 활용 신청 → 일반 인증키 확인
2. **카카오 키**: developers.kakao.com → 앱 만들기 → JavaScript 키 복사 → 플랫폼(Web)에 배포 주소 등록
3. `index.html` 맨 위 `CONFIG.KAKAO_KEY`에 JavaScript 키 입력 (JS 키는 공개돼도 되며, 등록 도메인으로 보호됨)
4. GitHub 저장소 생성 후 파일 업로드 → Settings → Secrets → `TOUR_API_KEY` 등록 (**TourAPI 키는 절대 index.html에 넣지 마세요**)
5. Settings → Pages에서 main 브랜치 배포 → Actions 탭에서 "축제 데이터 갱신"을 한 번 수동 실행
6. 나온 주소를 지인에게 공유

## 로컬 테스트
```
TOUR_API_KEY=키 node scripts/fetch-festivals.mjs
npx serve .
```

## 문제 해결
- API 오류가 나면 data.go.kr 상세 페이지의 "행사정보조회" 요청 주소·파라미터가 스크립트의 `BASE`와 같은지 확인하세요. (이 주소는 작성 시점에 직접 호출해 검증하지 못했습니다.)
- 지도가 안 뜨면: JS 키 오타, 카카오 "Web 플랫폼 도메인 등록", 카카오맵 서비스 활성화 여부를 확인하세요.
- 교통 정보는 API에 없어 길찾기 버튼(카카오맵/네이버지도)으로 연결합니다. 필요하면 festivals.json에 `transit` 문장을 직접 추가하세요.
