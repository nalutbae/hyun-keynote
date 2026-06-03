# HYUN KEYNOTE

강의 프리젠테이션 아카이브. 카테고리 → 회차 → 파트 3단계로 탐색하는 슬라이드 데크 모음입니다.

## 구조

```
hyun-keynote/
├── index.html                  카테고리 선택
├── vercel.json                 배포 설정 (GitHub Pages / Vercel)
└── agentic-coding/             Category 01: 에이전틱 코딩
    ├── index.html              회차 선택 (1회차, 2회차…)
    └── 1/                      1회차
        ├── index.html          파트 목록 (Part 1~4)
        ├── part-01-glossary.html
        ├── part-02-git.html
        ├── part-03-agentic.html
        ├── part-04-hermes.html
        ├── hyun-keynote.css
        └── presenter.js
```

## 네비게이션

3단계 구조: **카테고리 → 회차 → 파트 → 슬라이드**

- 루트 `index.html`에서 카테고리 선택
- 카테고리 `index.html`에서 회차 선택
- 회차 `index.html`에서 파트 선택 후 슬라이드 탐색
- 빵부스러기로 상위 페이지 이동

## 카테고리

- **에이전틱 코딩** — 파이썬 + AI 에이전트 실무 자동화 커리큘럼
- **공개 강의 · 컨퍼런스** — (예정)
- **내부 워크숍 · 트레이닝** — (예정)

## 조작법

- **← / →** 슬라이드 이동
- **P** 발표 모드
- **N** 발표자 노트
- **ESC** 발표 모드 종료

## 배포

GitHub Pages 또는 Vercel에 연결된 Git 저장소에 푸시하면 자동 배포됩니다.

© 2026 정태현
