<!-- 자동 생성 파일 — 직접 수정 금지. base/resume-data.mjs 수정 후 `npm run build`. -->
# 임도영 (Lian) — 백엔드 시니어 엔지니어

**백엔드 시니어 · 인증/인가 · 결제(빌링) · 관측성 ｜ Spring Boot · Kotlin · AWS**

> 소셜 로그인으로 신규 가입을 **일 10명 → 150명(15배)**으로 늘리고, **결제·환불·리워드 회귀 0건**의 멤버십 빌링을 BE 단독 설계한 **6년 차 백엔드 엔지니어**. 구현보다 **"왜 이 설계를 골랐나(트레이드오프)"**를 드러내고, 관측성·장애 대응으로 운영 안정성을 끝까지 책임집니다.

📧 lian.dy220@gmail.com ｜ 💻 github.com/lian220 ｜ 📦 github.com/lian220/quant-jump-stock-portfolio

## Core Skills

| 영역 | 핵심 기술 |
|---|---|
| **인증/인가** | OAuth 2.1(PKCE S256), Spring Authorization Server, 자체 JWT + Refresh Token Rotation, RBAC 3단 모델, 객체레벨 인가(IDOR·OWASP API1/3), PII 마스킹 AOP |
| **게이트웨이/분산** | Spring Cloud Gateway 중앙 RBAC, 헤더 기반 권한 전파, Redis 분산 캐시 + 무효화 API |
| **결제 도메인** | 토스페이먼츠 빌링키 정기결제, 멱등 배치, 안분 환불, 라이프사이클 상태머신, 추천 그로스 루프 |
| **관측성** | OpenTelemetry, SigNoz(self-hosted), Distributed Tracing, ClickHouse TTL, traceId MDC 연관 |
| **데이터/신뢰성** | JPA N+1 제거·복합 인덱스·Fetch Join, Transactional Outbox, idempotency, exponential backoff |
| **언어/플랫폼** | Kotlin, Spring Boot, JPA, AWS(EC2), Redis, Kafka, Docker, Kubernetes |

## 주요 경험

### 1. 사용자 인증·인가 시스템 풀스택 (SNS 로그인 + RBAC)
> 모바일 소셜 로그인(Kakao·Apple OAuth + PKCE)부터 B2B 백오피스 RBAC까지 — 두 프로덕트의 인증·인가를 동일 원칙으로 설계·배포

**임팩트**
- 신규 가입 **일 10명 → 150명 (15배 / +1,400%)**
- 준회원 → 정회원 **전환율 30.2%** (9,723건 중 2,936건)
- 인증 관련 운영 장애 **0건**, 다운스트림 6서비스 JWT 재파싱 제거

**핵심 의사결정**
- 외부 IdP 종속 대신 **토큰을 자체 발급·통제**하기로 결정 (Implicit Grant 배제, OAuth 2.1 방향).
- OAuth 2.1 PKCE(S256) → 자체 JWT + **Refresh Token Rotation** (구 토큰 재사용 시 세션 전체 무효화)
- RBAC **3단 모델(ROOT/FUNCTION/ENDPOINT) + 와일드카드 계층 매칭 + 객체레벨 인가** (수직 권한 상승 차단, OWASP API1/3)

### 2. 멤버십 자동결제(토스 빌링) + 추천인 그로스 루프
> 토스페이먼츠 빌링키 기반 정기결제를 BE 단독 설계·구현 — 라이프사이클 상태머신, 실패 재시도, 안분 환불, 추천 리워드까지 결제 도메인 풀스택

**임팩트**
- 멤버십 자동결제 **BE 단독 출시** — 카드 1회 등록으로 매월 자동결제, 운영 개입 없이 안정 운영
- 결제·환불·리워드 회수 흐름 **회귀 0건** — 결제 도메인 안정성 = 매출 안정성
- *[확인 필요: 카드 등록 회원 결제 성공률 N%, 추천코드 경유 신규 가입 N%]*

**핵심 의사결정**
- 카드 정보 자체 보관(PCI DSS 부담)을 회피하기로 결정 — 빌링키만 보관(vault 위임).
- 토스 빌링키만 저장, **idempotency 키(memberId+billingDate) + 조건부 UPDATE**로 중복 결제 차단
- API/DB 트랜잭션 경계 분리로 외부 지연에도 일관성 유지, exponential backoff 재시도 → N회 실패 시 연체 전환

### 3. 본부↔점주 양방향 소통관리 도메인 신규 구축 (외식UP ROS)
> ROS 1.0 신규 출시에 맞춰 본부↔점주 소통관리(3종 컨텐츠 + 1:1 문의 + 알림톡) 도메인을 제로에서 BE 단독 풀스택 구축 → 출시 후 성능 튜닝까지 완수

**임팩트**
- 제로에서 **39건 API BE 단독 구축** (본부향 26 + 점주향 13, 전건 배포완료)
- QA 이슈 **14건 전건 종결** (첨부/업로드·권한·알림톡·연동 안정화)
- *[확인 필요: 구축 기간 N개월, 목록 P95 N→Mms 개선]*

**핵심 의사결정**
- 타입별 테이블 분리 대신 **공통 라이프사이클 공유 모델(STI)**로 결정 — 폴리모픽 목록 조회 최적.
- 3종 컨텐츠를 **STI(단일 테이블 상속)**로 모델링, 본부향 CRUD + 임시저장/발행, 점주향 동의·확인 흐름
- 카카오 알림톡 연동 + **Transactional Outbox**로 부분 실패 시에도 게시글 상태 일관성 유지

### 4. 관측성(Observability) 자발 도입 → 팀 표준 정착
> 운영 디버깅 병목을 스스로 발견 → OpenTelemetry 기반 self-hosted SigNoz 제안·도입 → 팀/전사 관측성 표준 정착

**임팩트**
- 로그 grep 의존 → **분산 트레이스 단일 조회로 근본원인 추적**
- **데이터 주권 확보** (사용자/매출 trace 사내 인프라 유지), 팀 표준 정착
- *[확인 필요: SaaS 대비 연 N만원 절감, 디버깅 N시간 → M분 단축, 확산 N명/N개 서비스]*

**핵심 의사결정**
- SaaS(호스트·볼륨 과금) vs OSS를 **비용·데이터 주권 기준으로 비교** 후 SigNoz 채택을 직접 설득.
- **SigNoz self-hosted (EC2 단독 + docker-compose)** 도입, EBS 스냅샷 백업 + ClickHouse TTL 보존
- OTel Java Agent 자동 계측 + 핵심 비즈니스 흐름만 **커스텀 span 선별**(폭증 방지)
