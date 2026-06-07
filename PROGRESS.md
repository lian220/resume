# 이력서 작업 진행 상황

> 작업 시작: 2026-05-24
> 최종 업데이트: 2026-06-01
> 목적: Lian (임도영) 백엔드 시니어 이력서 STAR 4개 + 면접 대비

---

## 📅 작업 일지

### 2026-05-24 — 초안 작성
- Jira에서 본인(Lian) 할당 작업 전수 조회
  - UR10 (외식UP ROS): **142건** (작업 59 / 버그 33 / 하위작업 8 등)
  - CHABYULHWA (차별화상회): **123건**
  - 합계 **265건**
- `lian-jira-summary.md` 작성 — 메인 작업 6개로 그룹화 (전체 작업 인벤토리)
- `lian-resume-star.md` 초안 — STAR 4개 구성
- 전문가 패널 5인 리뷰 진행
  - 백엔드 아키텍트 / 보안 전문가 / SRE / 마케팅 / 전략 컨설턴트
  - 결과 통합본 → `expert-panel-report.md`
  - Critical 7건, Warning 11건, Good 11건, Trend Insight 8건 정리

### 2026-05-28 — 전문가 피드백 반영 + HTML 변환 + GitHub push
- **전문가 피드백 20개 항목 본문에 일괄 반영**
  - PKCE / RTR / JTI 블랙리스트 / JWKS fallback / Apple `client_secret` 만료 관리 / Rate Limiting
  - JWT 권한 플래그 trade-off 양방향 서술
  - SigNoz HA 리스크 인지 + EBS 스냅샷 + "관측성 다운 ≠ 서비스 다운"
  - 알림톡 발송 실패 재시도 (exponential backoff + 트랜잭션 경계 분리)
  - Calculator 분기 선택 사유 구체화
  - 타겟별 STAR 순서 3가지 버전
- **소셜 로그인 수치 확정**: 일 10명 → 150명 (15배)
- **RBAC 캐시 구현체 확정**: Redis 분산 캐시 (멀티 인스턴스 stale 문제 원천 차단)
- `lian-resume-star.html` 작성 — 브라우저용 디자인 (Pretendard, 색상별 STAR, 키워드 칩, 면접 Q&A 테이블)

### 2026-05-31 (오후) — 전문가 패널 기술 심화 재검토
- **전문가 5인 병렬 재검토** (백엔드아키텍트 / AppSec / DB성능 / SRE / 클라우드아키텍트)
  - 1차 리뷰는 글쓰기·구성 중심 → 이번엔 **기술 디테일·면접 내구성** 중심
  - 종합: 🔴 Critical 10 / 🟡 Warning 14 / 🟢 Good 18
- **산출물 3종 생성**:
  - `expert-review-2026-05-31.md` — 종합 평가 + 액션아이템
  - `tech-study-resources.md` — 기술별 학습자료(검증 URL, ⭐ 우선순위)
  - `interview-questions-by-tech.md` — 기술별 심화 면접질문(기존 34개와 비중복, 🔥 11개)
- **Critical 핵심**: ① 빈칸 수치 ② 외부노출방식 미확정/Collector구성 미기입 ③ 결제 멱등성(토스 Idempotency-Key + DuplicateKeyException skip) ④ N+1/인덱스 구체화 ⑤ SLO/SLI 부재 ⑥ 멀티인스턴스 배치(ShedLock)

### 2026-05-31 — STAR 4 격상 + GitHub repo 생성·push
- **멤버십 자동결제 시스템 사실 추가** (사용자 확인)
  - PG: 토스페이먼츠
  - 시스템 범위: 빌링키 정기결제 + 실패 재시도 + 라이프사이클 상태머신 + 환불·무료체험 + 일배치
- **STAR 4 격상** (보조 ⭕ → 메인 ⭐)
  - 이전: "추천인코드·리워드 시스템 (보조)"
  - 지금: **"차별화멤버십 자동결제(빌링) 시스템 + 추천인코드 그로스 루프"**
  - 6개 Action으로 재구성 (결제 도메인 풀스택)
- **면접 Q&A 13개 추가** (21개 → 34개) — 결제 도메인 단골 질문 전부 커버
- **타겟별 STAR 순서 4가지로 확장**
  - 핀테크/커머스: `4 → 1 → 3 → 2`
  - 대형 플랫폼: `1 → 4 → 2 → 3`
  - B2B SaaS 미드사이즈: `3 → 4 → 1 → 2`
  - 스타트업: `2 → 4 → 1 → 3`
- **GitHub repo 생성·push**: https://github.com/lian220/resume
- `PROGRESS.md` 작성 (현재 — 진행 일지)

### 2026-06-01 — STAR 1 RBAC 실제 코드 기반 풀 리라이트
- **`caribbean-api`(외식UP ROS 본부 백엔드) RBAC 구현을 코드로 전수 파악** (admin/api/auth/headquarter-api/share 모듈)
- STAR 1 Action ③(운영자 RBAC)를 **실제 아키텍처로 풀 리라이트** — `.md` + `.html` 동기화
  - 3단 권한 모델(ROOT/FUNCTION/ENDPOINT), 와일드카드 계층 매칭(`PermissionUtils.matchesPermission`)
  - 함수레벨+객체레벨 이중 인가(`CustomPermissionEvaluator`/`TargetRosUserPermissionLevelEvaluator`) — IDOR·수직 권한 상승 차단
  - 응답 PII 마스킹 AOP(`@MaskIfNoPermission`/`DtoMaskingAspect`, `010-****-5678`)
  - 헤더 기반 RBAC 전파(`RbacHeaderInjectingFilter` → `X-*-Permissions`, JWT 직접 파싱 컨버터 `@Deprecated`)
  - Redis 캐시 TTL **실측 확정**: permissionByRole 1분 / 토큰 RBAC 캐시 10분(SHA-256 키)
- **빈칸 2건 해소**: Redis 캐시 TTL, 권한 변경 후 BO 반영 시간
- **정직성 정정**: 이력서의 "JTI 블랙리스트"는 caribbean-api 코드에 테이블 없음 → 앱측(JTI, 별도 레포 추정) / BO측(DB 폐기+캐시 무효화)으로 **경로 분리 서술**
- 면접 Q&A 6개 추가(IDOR/3단 모델/헤더 전파/응답 마스킹/TTL 등)
- **`caribbean-api-gateway`(Spring Cloud Gateway) 파악·반영**: 중앙 RBAC 집행 관문
  - `RbacAuthorizationFilter` → Auth `/rbac/permissions` 토큰 해석(Redis 10분 캐시) + `ENDPOINT_{METHOD}:{PATH}` `AntPathMatcher` 중앙 인가 + 화이트리스트(`SecurityWhitelist`)
  - 14종 `X-*` 헤더 주입 + `X-Gateway-Header` 신뢰 마커, 클라 권한 헤더 권위 값 덮어쓰기(위조 차단), 6개 서비스 라우팅
  - "헤더 기반 RBAC 전파" 항목을 **게이트웨이 중앙 집행** 아키텍처로 격상, Q&A 2개 추가
- 면접 Q&A 총 8개 추가(STAR 1)
- **빈칸 추가 해소**: QA 안정화 건수 → Jira 집계로 **소셜 로그인 본인 담당 버그 18건(17 배포완료)** 확정. 정회원 전환율 → cancun-api 회원 모델 파악 후 **조회 쿼리/BO API 확정**(수치는 DB/BO 실행 필요, 부록 참조)

### 2026-06-02 — 정회원 전환율 수치 확정
- 사용자가 부록 SQL 실행 → **정회원 전환율 30.2%** (준회원 사전등록 9,723건 중 2,936건 전환) 확정, `.md`/`.html` 빈칸 채움
- provider/기간 코호트 쿼리 버그 수정: provider는 `social_user_link`(base_user_id) 경유, 기간은 `pre_user_registration.created_at` 사용(`base_user`엔 created_at 없음) — 부록 갱신
- **STAR 1 빈칸 전부 해소** (남은 빈칸: STAR 2/3/4 수치만)

### 2026-06-04 — STAR 4 추천인코드 시스템 실코드 정밀화 + 전문가 리뷰
- `cancun-api`(B2C 차별화상회) `feature/CHABYULHWA-4086` 추천인 멤버십 코드 **전수 분석** (저자 = 본인 lian ✅)
- **STAR 4 ⑥ 풀 정밀화**(.md/.html): 2-트랙 해석기 / 추천 결정 엔진 / 체험 1회용 슬롯 / 쿨다운(생애1회·12개월) / 리워드 스냅샷 / 멱등 지급(조건부 UPDATE) / D+8 환불제외
- **불일치 3건 정정**(정직성):
  - "정액 1원 보정" → **0원 클램프**(PG가 1원 거부)
  - "환불 시 리워드 회수" → **지급 전 환불=배치 제외 / 지급 후 환수 없음**(클로백 백로그)
  - "idempotency=(memberId,rewardDate) DB유니크" → **조건부 UPDATE(PENDING→GRANTED) 선점**
- **전문가 2인 리뷰**(백엔드 아키텍트 + 보안) + 사용자 정정 반영 → 4대 강점(멱등 선점/스냅샷/체험 슬롯/**실패 격리**) + 잔여 약점 2개(가짜피추천인Sybil·MIN(paidAt))
  - ※ "추천인당 캡 없음=취약점"은 오프레이밍 → **정상 다수추천은 의도된 어필리에이트**(캡 X). 진짜 리스크는 가짜 피추천인 자가파밍 → fraud 휴리스틱+클로백
  - ※ "재시도 상한 없음"은 **stale 커밋 기준 오판** → 현 작업본은 실패=`PENDING→FAILED` 종료 + Slack 알림 + BO 조회 + **운영자 멱등 수동 재처리**(이미 해결, 강점)
  - ※ 클로백 없음 = 버그 아니라 **D+8·무환수 현 스코프 결정**(30일 클로백은 다채널 백로그)
- **면접 노트 신규 작성** → `STAR4-멤버십-추천인-면접노트.md` (외울 숫자·강점·약점·예상질문·정정사항)
- STAR 4 Q&A 6건 정정/추가(.md/.html)

### 2026-06-07 — 2차 전문가 심화 검토 + 본문 보강
- **2차 전문가 패널 5인**(보안/백엔드/DB/SRE/클라우드) adversarial 재검증 — 1차 해소분 제외, **신규 약점 발굴 + 논리 일관성** 집중
- **논리적 균열 5곳** 도출: ① "즉시 무효화 0초" ↔ 토큰캐시 10분 stale(자기모순) ② 결제 멱등성 O ↔ 환불 멱등성 X(비대칭) ③ "IDOR 방어" ↔ 수평 테넌트 IDOR 침묵(주장 vs 구현) ④ STAR1 분산 ↔ STAR2 모놀리식 관측(불일치) ⑤ 강점만 나열, 트레이드오프 침묵
- **STAR 1 신규 Critical**: X-Gateway-Header 정적마커 우회(서명/mTLS 필요), 게이트웨이 SPOF + /rbac/permissions 동기의존, 목록 API 객체레벨 인가 N+1, fallback 토큰 재검증 명시 필요
- **STAR 4**: 실코드 정밀화로 해소·정정 확인(멱등=조건부 UPDATE 선점, 0원 클램프, D+8 환불제외), 잔존 = 가짜 피추천인 Sybil·환불 자체 멱등성
- **검토 산출물 3종 동기화**: `expert-review-2026-05-31.md`(2차 섹션), `interview-questions-by-tech.md`(신규 질문+정정), `tech-review.html`(2차 블록+STAR4 정정)
- **본문 보강(`lian-resume-star.md`)**: 수평 테넌트 인가/게이트웨이 마커·SPOF/토큰캐시 무효화/환불 멱등성/STI 모델링/알림톡 Outbox/게이트웨이 trace·SLI 등 — **구현 불명 항목은 `[확인]` 마커**로 표기(코드 확인 후 확정). 공유용 `.html`엔 미확정 마커 미반영
- ⏳ **본인 확인 필요(`[확인]`)**: 토큰캐시 역인덱스 무효화 / 수평 테넌트(brandId) 검증 위치 / 목록 권한 필터 방식 / fallback 토큰 재검증 / 게이트웨이 마커 서명 여부·trace 전파 / 환불 멱등 처리 / 3종 STI·1:1 Inquiry aggregate / 알림톡 Outbox 여부

---

## 📊 현재 STAR 구성

| # | STAR | 격 | 핵심 |
|---|---|---|---|
| 1 | 사용자 인증·인가 풀스택 (SNS 로그인 + RBAC) | ⭐⭐ 메인 | OAuth+PKCE, Spring Auth Server, RTR, JTI 블랙리스트, Redis RBAC, OWASP API3 이중 검증 |
| 2 | SigNoz 관측성 시스템 도입 | ⭐ | 자발 제안 → 팀 표준 정착, OTel self-hosted, ClickHouse, 벤더락인 회피 |
| 3 | 외식UP ROS 소통관리 신규 도메인 | ⭐ 메인 | 본부↔점주 양방향, 3종 컨텐츠 라이프사이클, 알림톡 재시도, N+1 튜닝 |
| 4 | 멤버십 자동결제 + 추천인코드 그로스 루프 | ⭐ 메인 | 토스페이먼츠 빌링키, 라이프사이클 상태머신, 안분 환불, 무료체험, ERP 연동 |

---

## ✅ 확정된 핵심 수치/사실

- 소셜 로그인 도입 후 **신규 가입자 일 10명 → 150명 (15배 / +1,400%)**
- RBAC 캐시 = **Redis 분산 캐시** (permissionByRole 1분 / 토큰 RBAC 캐시 SHA-256 키 10분)
- RBAC 권한 모델 = **3단(ROOT/FUNCTION/ENDPOINT)** + 역할 6종(`SFN_ROOT·SUPER_ADMIN·BRAND_MANAGER·SUPERVISOR·STORE_OWNER·STORE_STAFF`) + `role_priority` 계층
- RBAC 인가 = **함수레벨 + 객체레벨 이중**(`CustomPermissionEvaluator`+`DomainPermissionEvaluator`), 응답 PII 마스킹 AOP(`@MaskIfNoPermission`), 헤더 기반 전파(`X-*-Permissions`)
- 강제 무효화 = **앱측 JTI 블랙리스트 / BO측 `oauth2_authorization` DB 폐기 + 캐시 무효화**(경로 분리) — caribbean-api엔 JTI 블랙리스트 테이블 없음(BO 경로만 존재)
- PG = **토스페이먼츠 빌링 API (빌링키 기반)**
- SigNoz 도입 단계: **팀/전사 표준 정착**
- SigNoz 인프라: **EC2 단독 + docker-compose**
- SigNoz 도입 주도성: **본인 제안·설득·도입**

---

## ⏳ 남은 빈칸 (본인만 채울 수 있는 수치)

### STAR 1 (인증·인가)
- [x] ~~Redis 캐시 TTL~~ → **permissionByRole 1분 / 토큰 RBAC 캐시 10분** (caribbean-api 코드 검증) ✅
- [x] ~~정회원 전환율~~ → **30.2%** (준회원 사전등록 9,723 중 2,936 전환, cancun-api SQL 실행 확정 / 부록 Q1) ✅
- [x] ~~QA 안정화 건수~~ → **소셜 로그인 본인 담당 버그 18건 (17 배포완료/안정화)** — Jira `parent=CHABYULHWA-3296 AND issuetype=버그 AND assignee=Lian(임도영)` ✅
- [x] ~~권한 변경 후 BO 반영 시간~~ → **TTL 자연만료 최대 1분 / 무효화 API 즉시(0초)** ✅

### STAR 2 (SigNoz)
- [ ] Datadog/New Relic 예상 연 비용 vs EC2 운영비
- [ ] EC2 인스턴스 사양
- [ ] ClickHouse 보존 일수 (트레이스/메트릭/로그 각각)
- [ ] 외부 노출 차단 방식 (VPN / SG IP / 프록시)
- [ ] 디버깅 시간 단축 수치
- [ ] 계측 범위 (서비스 수, 커스텀 span 수)
- [ ] 확산 증거 (가이드 문서, 온보딩 횟수, 팀원 수)
- [ ] 알람 임계값 (P95, 에러율)

### STAR 3 (소통관리)
- [ ] 구축 기간 (제로에서 N개월)
- [ ] 본부/점주 사용자 수
- [ ] 월 알림톡 발송 건수
- [ ] P95 응답시간 개선 전/후
- [ ] N+1 제거 전/후 쿼리 수
- [ ] 인덱스 추가 대상 컬럼

### STAR 4 (멤버십 자동결제)
- [ ] 카드 등록 회원 결제 성공률 (%)
- [ ] 결제 실패 재시도 정책 구체 (1일/3일/7일 등)
- [ ] 무료체험 기간 (며칠?)
- [ ] 일배치 평균 결제 처리 건수
- [ ] 추천코드 경유 가입 비율
- [ ] 회귀 버그 건수
- [ ] 현재 진행 단계 (출시 완료?)

---

## 🎯 다음 액션 후보

1. **빈칸 수치 채우기** — 가장 우선. 사내 Grafana/CloudWatch/Slack 알람 이력 확인 필요
2. **DROP 8건 통합 결정 사유** 한 줄 정리 (면접 단골 질문)
3. **이력서 본문(자기소개 + 경력 요약 + 기술 스택)** 작성 — STAR는 이력서의 한 섹션, 풀 이력서 필요
4. **영문 이력서 / 링크드인 프로필 동기화**
5. **STAR 5번째 후보 발굴** — Jira 인벤토리(`lian-jira-summary.md`)에서 다른 핵심 작업 추가 가능 여부 검토
6. **PAR 구조 보완** (영상 2편 + 2차 검토 통합) — 자기소개 숫자 후킹화 / 각 STAR "왜 그 설계"(Analyze) 1줄 / 수치 측정과정까지. 상세 백로그 → `포트폴리오-실프로젝트-적용체크.md`
7. **포트폴리오 보강** — 아키텍처 다이어그램·k6 수치·설명 영상·AI 활용 서사 (참고: `포트폴리오-주제선정-전략-요약.md`, `이력서-PAR구조-작성법-요약.md`)

---

## 📌 정회원 전환율 조회 방법 (cancun-api 기준, 2026-06-02 실행 확정)

> **결과(전체): 30.2%** — 정회원 47,877 / 미전환 준회원 6,787 / 준→정 전환 2,936 / 준회원 사전등록 총 9,723 → 전환율 = 2,936/9,723 = **30.20%**.
> (참고: 정회원 47,877명 중 사전등록 funnel 경유는 2,936명뿐 — 나머지는 레거시/직가입. STAR 1은 신규 SNS 가입 funnel 지표이므로 9,723 기준 30.2%가 맞는 수치.)
>
> 앱 자체 정의 — `MemberCountSummary.conversionRate = convertedFromPreCount / preRegistrationTotalCount × 100`.
> 모델: `pre_user_registration`(준회원 사전등록, 정회원 전환 시 `user`로 이관·유지) ↔ `user`(정회원, base_user_id 보유) ↔ `base_user`(role_type: TEMP_USER/SOCIAL_USER=준회원, USER=정회원). **주의: `base_user`엔 `created_at` 없음 — 기간 코호트는 `pre_user_registration.created_at` 사용.**

**방법 A (권장) — BO Admin API 호출** (`UserAdminController`):
```
GET /admin/users/count-summary?signUpProvider=KAKAO&signUpStartedAt=2025-XX-XX&signUpEndedAt=2025-XX-XX
→ 응답 conversionRate 필드 그대로 사용 (provider·기간 필터 지원)
```

**방법 B — SQL 직접 (findMemberCountSummary 로직 그대로 옮김)**:
```sql
SELECT
  SUM(u.base_user_id IS NOT NULL)                                  AS full_member,        -- 정회원
  SUM(u.base_user_id IS NULL AND p.base_user_id IS NOT NULL)       AS pre_member,         -- 미전환 준회원
  SUM(u.base_user_id IS NOT NULL AND p.base_user_id IS NOT NULL)   AS converted_from_pre, -- 준→정 전환
  SUM(p.base_user_id IS NOT NULL)                                  AS pre_total,          -- 준회원 사전등록 총수
  ROUND(100 * SUM(u.base_user_id IS NOT NULL AND p.base_user_id IS NOT NULL)
            / NULLIF(SUM(p.base_user_id IS NOT NULL), 0), 2)       AS conversion_rate_pct
FROM base_user b
LEFT JOIN `user` u                ON u.base_user_id = b.id AND u.deleted_yn = 'N'
LEFT JOIN pre_user_registration p ON p.base_user_id = b.id
WHERE (u.base_user_id IS NULL OR u.status <> 'WITHDRAW');         -- 탈퇴 정회원 제외
-- 주의: 앱 BO는 '그룹 흡수 준회원(account_group)'을 제외함 → BO API 값과 미세 차이 가능
```

**provider 코호트 (수정판 — social_user엔 base_user_id 없음, link 테이블 경유)**:
```sql
LEFT JOIN social_user_link sl ON sl.base_user_id = b.id AND sl.active_yn = 'Y'
LEFT JOIN social_user s       ON s.id = sl.social_user_id
-- ... GROUP BY COALESCE(s.origin_provider, '일반(ID/PW)')   (social_user_id null = 일반/ID·PW)
```

**기간 코호트 (수정판 — base_user.created_at 없음, 준회원 등록일 사용)**:
```sql
SELECT DATE_FORMAT(p.created_at, '%Y-%m') AS pre_signup_month,
       COUNT(*) AS pre_total,
       SUM(u.base_user_id IS NOT NULL) AS converted,
       ROUND(100 * SUM(u.base_user_id IS NOT NULL) / COUNT(*), 2) AS conversion_rate_pct
FROM pre_user_registration p
LEFT JOIN `user` u ON u.base_user_id = p.base_user_id AND u.deleted_yn = 'N'
WHERE (u.base_user_id IS NULL OR u.status <> 'WITHDRAW')
GROUP BY DATE_FORMAT(p.created_at, '%Y-%m') ORDER BY pre_signup_month;
```

---

## 📁 파일 안내

| 파일 | 용도 |
|---|---|
| `lian-resume-star.html` | **이력서 STAR 4개 (브라우저용)** — 채용 담당자 공유용 |
| `lian-resume-star.md` | 동일 내용 마크다운 버전 |
| `lian-jira-summary.md` | 작업 인벤토리 (내부 참조용) |
| `STAR4-멤버십-추천인-면접노트.md` | **STAR 4 추천인 시스템 면접 치트시트** (외울 숫자·강점·약점·예상질문) |
| `면접-AI트렌드-준비노트.md` | **AI 시대 기술면접 트렌드 + 행동면접 답변 스크립트** (글로벌·국내 사례, 형태별 준비, STAR 4 기반 스크립트 A/B/C) |
| `expert-panel-report.md` | 전문가 패널 5인 리뷰 통합 |
| `PROGRESS.md` | 이 파일 — 진행 일지 |
| `README.md` | repo 소개 |
