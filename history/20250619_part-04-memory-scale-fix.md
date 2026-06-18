# part-04-memory.html 작게 표시되는 버그 수정

**날짜:** 2025-06-19
**요청:** part-04-memory.html 슬라이드가 다른 슬라이드보다 작게 표시되는 문제 진단 및 수정

## 원인 분석

hermes-guide/1/ 디렉토리의 4개 슬라이드 덱 중 part-01, part-02, part-03은 `<script src="./presenter.js"></script>`를 사용하는 반면, **part-04만 인라인 `<script>` 블록**을 사용하고 있었음.

### 버그 메커니즘 (인라인 스크립트)

```javascript
function present(){
    const sw=1280*scale,sh=720*scale;   // scale=1.5 → sw=1920
    const s=Math.min(vw/sw,vh/sh);       // s = 뷰포트 핏 값 (예: 0.6)
    deck.style.setProperty('--scale',s);
    scale=s;
    document.documentElement.style.setProperty('--deck-scale',s);  // ← 문제 지점
}
```

`--deck-scale`이 `s`(약 0.6)로 덮어쓰이면서:
1. 슬라이드 실제 크기: `1280 * 0.6 = 768px` (CSS `calc()` 기준)
2. 시각적 스케일: `transform: scale(0.6)` ( `--scale` 변수)
3. **최종 표시 크기: 768 × 0.6 ≈ 461px** → 이중 스케일링으로 매우 작게 표시됨

### 정상 동작 (presenter.js)

```javascript
// presenter.js는 --deck-scale을 절대 건드리지 않음
const slideWidth = slide.offsetWidth || 1920;   // 실제 렌더링된 크기 (1920px)
const sx = vw / slideWidth;                      // 뷰포트 기준 스케일
slide.style.setProperty('--scale', scale);       // 개별 slide에만 --scale 설정
```

슬라이드 실제 크기는 1920px(`--deck-scale: 1.5` 유지)로 유지하고, `transform: scale()`만 뷰포트에 맞춤.

## 수정 내용

part-04-memory.html의 인라인 `<script>` 블록(35줄)을 제거하고 `<script src="./presenter.js"></script>`로 대체.

- **파일:** `hermes-guide/1/part-04-memory.html`
- **변경:** 563줄 → 528줄, 37,010B → 34,945B

## 결과

다른 파트(01, 02, 03)와 동일한 presenter.js를 사용하게 되어 슬라이드 크기가 일관되게 표시됨.
