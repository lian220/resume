# 임도영 (Lian) — Resume

백엔드 시니어 엔지니어 임도영의 이력서 저장소. **하나의 경력을 3가지 포맷 + 제출용 요약본**으로 관리합니다.

📧 lian.dy220@gmail.com ｜ 💻 [github.com/lian220](https://github.com/lian220) ｜ 📦 포트폴리오: [Alpha Foundry](https://github.com/lian220/quant-jump-stock-portfolio)

---

## 📄 이력서 본문 (목적별 4종)

| 포맷 | 파일 | 용도 | 비고 |
|---|---|---|---|
| **① 시간순 커리어** | [`resume-career.html`](resume-career.html) | 실제 제출 (원티드/점핏 스타일) | 스마트푸드네트웍스 포함 통합본 |
| **② STAR** | [`resume-star.md`](resume-star.md) · [`.html`](resume-star.html) | 깊이 어필 / 면접 대비 | Situation·Task·Action·Result 전개 |
| **③ PAAR** | [`resume-paar.md`](resume-paar.md) · [`.html`](resume-paar.html) | 문제·의사결정·수치 중심 서술 | P(문제)·A(분석)·A(실행)·R(수치) |
| **④ 제출용 요약본** | [`resume-summary.md`](resume-summary.md) · [`.html`](resume-summary.html) | 2페이지 압축 제출본 | ⌘P → PDF 저장 |

> ⚙️ **`resume-*` 4종은 자동 생성 파일입니다 — 직접 수정하지 마세요.** 모든 내용은 [`base/resume-data.mjs`](base/resume-data.mjs) **한 곳**에서 관리하고 `npm run build`로 4개 포맷을 한 번에 생성합니다. (드리프트 0 — 수치 한 번만 채우면 전부 반영)
>
> **포맷 선택 가이드**: 채용 플랫폼 제출 → ①, 깊이 어필/면접 대비 → ②, "왜·트레이드오프" 강조 → ③, 첨부 1~2p → ④.

### 🛠 수정 방법 (단일 소스 빌드)
```bash
# 1) base/resume-data.mjs 한 곳만 수정 (수치·문구·경험)
# 2) 빌드 → resume-{career,star,paar,summary} 전부 갱신
npm run build
```
- `results`의 `ok: false` = `[확인 필요]`(본인만 채울 수치) → 빌드 시 노란 표시. 채운 뒤 `ok: true`로 바꾸면 끝.
- 의존성 없음 (Node 18+ 만 필요).

---

## 📁 폴더 구조

```
resume/
├── README.md                  ← 현재 문서 (인덱스)
├── base/resume-data.mjs       ★ 단일 소스 (여기만 수정)
├── scripts/build.mjs          빌드 스크립트
├── package.json               npm run build
├── resume-career.html         ① 시간순 커리어   ┐
├── resume-star.md / .html     ② STAR            │ 자동 생성
├── resume-paar.md / .html     ③ PAAR            │ (수정 금지)
├── resume-summary.md / .html  ④ 제출용 요약본    ┘
├── interview/                 면접 준비
├── reference/                 작성법·전략 학습 자료
├── reviews/                   전문가 리뷰 산출물
├── side-projects/             사이드 프로젝트 이력
└── _meta/                     작업 관리 (제출 무관)
```

### interview/ — 면접 준비
- [`questions-by-project.md`](interview/questions-by-project.md) — **프로젝트별 예상 질문** (머스트잇·SFN 직전경력 위주, 2026 트렌드 반영)
- [`questions-by-tech.md`](interview/questions-by-tech.md) — 기술 개념별 예상 질문 + 답변 포인트
- [`ai-trend-notes.md`](interview/ai-trend-notes.md) — AI 시대 기술면접 트렌드 + 답변 스크립트
- [`ai-practice-guide.md`](interview/ai-practice-guide.md) — AI 활용 면접 대응 연습 가이드
- [`star4-membership-notes.md`](interview/star4-membership-notes.md) — 멤버십 추천인 시스템 면접 노트

### reference/ — 작성법·전략 학습
- [`par-writing-guide.md`](reference/par-writing-guide.md) — PAR 구조 이력서 작성법 (영상 요약)
- [`portfolio-topic-strategy.md`](reference/portfolio-topic-strategy.md) — 포트폴리오 주제 선정 전략
- [`portfolio-apply-check.md`](reference/portfolio-apply-check.md) — 전략 → 실제 프로젝트 적용 체크
- [`tech-study-resources.md`](reference/tech-study-resources.md) — 기술 스펙 학습 자료

### reviews/ — 전문가 리뷰
- [`expert-panel-report.md`](reviews/expert-panel-report.md) · [`expert-review-2026-05-31.md`](reviews/expert-review-2026-05-31.md) · [`tech-review.html`](reviews/tech-review.html)

### side-projects/
- [`alpha-foundry-star.md`](side-projects/alpha-foundry-star.md) — Alpha Foundry(AI 퀀트 플랫폼) STAR

### _meta/ — 작업 관리
- [`PROGRESS.md`](_meta/PROGRESS.md) · [`jira-work-summary.md`](_meta/jira-work-summary.md) · [`checklist-todo.md`](_meta/checklist-todo.md)

---

## ✅ 남은 작업
- STAR 2·3·4 / 요약본 / career의 `[확인 필요]` 정량 수치 채우기 (본인만 가능) → [`_meta/checklist-todo.md`](_meta/checklist-todo.md)
- 스마트푸드네트웍스 정확 입사 연월·총 경력 개월 수 확정
