# 전문가 패널 재검토 리포트 (기술 심화)

> 검토일: 2026-05-31 · **갱신: 2026-06-01 (STAR 1 실제 코드 반영)**
> 검토 대상: `lian-resume-star.md` — STAR 4개
> 투입 전문가: 백엔드 아키텍트 / AppSec / DB 성능 / SRE / 클라우드 아키텍트 (5인)
> 1차 리뷰(`expert-panel-report.md`)는 글쓰기·구성 중심, 이번 리뷰는 **기술 디테일·면접 내구성** 중심.

> ### 🔄 2026-06-01 갱신 노트
> 원격에서 STAR 1을 **실제 코드(caribbean-api + caribbean-api-gateway) 기반으로 풀 리라이트**하면서 STAR 1 관련 Critical·Warning이 다수 해소됨(✅ 표기). 남은 핵심 미해결은 **STAR 2(SLO·Collector)·STAR 3(N+1·인덱스)·STAR 4(결제 멱등성)** 로 이동.

---

## 📊 종합 요약

| 등급 | 개수 | 의미 |
|------|------|------|
| 🔴 Critical | 9 (−1 해소) | 면접에서 파고들면 무너질 수 있음 / 제출 전 필수 수정 |
| 🟡 Warning | 10 (−4 해소) | 수치·근거 보강 권장 |
| 🟢 Good | 23 (+5 신규) | 시니어 신호로 충분히 강함 |

**한 줄 총평**: STAR 1은 실제 코드 반영으로 **이제 가장 강한 STAR**가 됐다(IDOR 함수/객체 이중 인가·게이트웨이 중앙 RBAC 집행·PII 마스킹 AOP). 남은 약점은 ① **STAR 2·3·4의 빈칸 수치**, ② **"왜 그 설계인가"의 depth가 SRE·DB 영역에서 얕음**. 남은 Critical은 대부분 STAR 2·3·4에 몰려 있다.

---

## 🔴 Critical (즉시 조치)

### 인증·인가 (STAR 1)
1. ✅ **[해소] JWT 권한 "서버 이중 검증" 위치 모호** → 실제 코드 반영으로 명확해짐: **게이트웨이 ENDPOINT 인가(`AntPathMatcher`) + `@PreAuthorize hasPermission` 함수레벨 + `DomainPermissionEvaluator` 객체레벨** 3중 집행. 더 이상 모호하지 않음.
2. 🟡 **[backend, 잔존-완화] Spring Authorization Server 커스터마이징 컴포넌트명** — BO측은 `oauth2_authorization` 테이블 사용이 확인됨. 단, **앱측 자체 JWT 발급 파이프라인**의 `OAuth2TokenCustomizer` 등 컴포넌트명은 여전히 한 줄 특정 권장(Critical → Warning 강등).

### 결제·빌링 (STAR 4)
3. **[security/cloud] 결제 일배치 partial failure 방어 누락.** `(memberId, billingDate)` 유니크 제약은 DB 중복만 막음. **PG 호출 성공 후 DB 저장 실패** 시 재시도하면 토스에 이중 청구 가능. → 토스 `Idempotency-Key` 헤더 전달 여부를 본문/답변에 추가.
4. **[db-perf] 유니크 제약 race condition 예외 처리 미서술.** 유니크 제약은 "한쪽에 에러를 줄" 뿐. `DuplicateKeyException` catch → skip 처리가 있어야 멱등성 완성. 이 한 문장이 빠지면 멱등성 절반만 구현한 것으로 보임.

### 소통관리 / DB (STAR 3)
5. **[db-perf] N+1 제거에 수치·실행계획·전략이 전무.** "쿼리 N→M" 빈칸 + Fetch Join인지 `@BatchSize`인지 미기재. **Fetch Join + Pageable = HHH90003004(전체 메모리 로딩)** 함정을 아는지 보여줘야 함.
6. **[db-perf] 복합 인덱스 대상 컬럼 미기재.** 컬럼 순서가 곧 설계 근거. 빈칸이면 "실제로 추가했나" 의심. → 실제 컬럼 조합 + 순서 이유(쿼리 패턴) 기재.

### 관측성 (STAR 2)
7. **[sre] SLO/SLI 정의가 전무.** "P95 알람"만 있고 왜 그 임계값인지 근거 없음. → 가용성·레이턴시를 SLI로 선정하고 목표치를 정했다는 한 문장 필요.
8. **[sre] 에러 버짓(error budget) 개념 부재.** SLO를 말했으면 따라와야 함. 없으면 "알람 Slack 통보" 수준에 머묾.
9. **[sre] Collector SPOF가 서비스에 미치는 영향 경계 미설계.** "관측성 다운 ≠ 서비스 다운"을 **OTLP exporter timeout/queue 설정**으로 어떻게 구현했는지까지 답할 수 있어야 함.

### 인프라 (STAR 2)
10. **[cloud] 외부 노출 차단 방식이 `SG / VPN / 프록시` 3개 OR 병기 = 미확정 메모 상태.** 제출 전 **실제 적용한 1개만** 남길 것. 보안 결정 미확정 노출은 치명적. (+ 면접 Q&A의 "Collector 샘플링 = [실제 구성]" 미완성 답변도 채울 것)

---

## 🟡 Warning (개선 권장)

**✅ 2026-06-01 해소된 Warning (STAR 1 실제 코드 반영)**
- ✅ Redis 권한 캐시 TTL → `permissionByRole` **1분** / 토큰 RBAC 캐시 **10분(SHA-256 키)** 확정
- ✅ 권한 변경 후 BO 반영 시간 → TTL 자연만료 최대 1분 / 무효화 API **즉시(0초)**
- ✅ QA 안정화 건수 → 소셜 로그인 본인 담당 버그 **18건(17 배포완료)**
- ✅ "서버 권한검증 위치" → 게이트웨이/함수/객체 3중 집행으로 특정됨

**수치 빈칸 (가장 시급 — 작은 실수치라도 빈칸보다 낫다) ※ STAR 2·3·4만 잔존**
- [sre/cloud] SigNoz 비용 절감액, EC2 인스턴스 사양, ClickHouse 보존 일수(트레이스/메트릭/로그)
- [sre] 디버깅 시간 단축(N시간→M분), 확산 증거(팀원 수/서비스 수), 알람 임계값
- [db-perf] STAR 3 P95 before/after — SigNoz를 직접 구축했으니 실제 수치가 있을 가능성 높음. 반드시 채울 것
- [security] 정회원 전환율 → 쿼리/BO API 준비됨(`GET /admin/users/count-summary`), 수치만 실행 필요

**보안 디테일 (STAR 4·앱측 인증 잔존)**
- [security] JTI 블랙리스트 TTL을 AT 만료시각과 동기화했는지(+clock skew 마진) — ※ BO측은 `oauth2_authorization` DB 폐기 경로로 확인됨
- [security] Apple `.p8` 키 저장 위치(Parameter Store/Secrets Manager)를 본문에도 명시
- [security] 빌링키 DB 저장 시 컬럼 암호화(AES-256) 여부
- [security] 토스 Webhook 서명 검증(HMAC) 여부 — 위조 webhook = 무료 멤버십 활성화 위험
- [security] Rate Limiting 전략(키 단위: IP/userId, 분산 카운터 위치)

**아키텍처 디테일**
- [backend] "비동기 재시도 큐"(알림톡/ERP/Deauth 3곳)의 실체 — 인메모리 vs DB 재시도 테이블 vs **Transactional Outbox**. 패턴 이름을 붙이면 강해짐
- [backend] 상태머신 전이 guard 위치 — 서비스 if문(빈혈 모델) vs enum 내부 `transitionTo()`(DDD)
- [cloud] EBS 스냅샷 RPO(24h)/RTO 수치, DLM 자동화 vs 수동 cron
- [db-perf] 결제 배치 조회 쿼리 `(billing_date, status)` 인덱스 / 대량 처리 시 청크·커서

---

## 🟢 Good (잘 된 점 — 유지)

**🆕 STAR 1 실제 코드 반영으로 입증된 강점 (2026-06-01)**
- **[security] 함수레벨 + 객체레벨 이중 인가로 IDOR/수직권한상승 차단**: `@PreAuthorize hasPermission(#rosUserId, 'TYPE_ROS_USER', 'UPDATE_ACCOUNT')`로 호출자 기능권한 + **대상 객체의 역할까지 재검증**(`CustomPermissionEvaluator`+`DomainPermissionEvaluator`). OWASP API1(BOLA) 정공법. 면접 단골 "IDOR 어떻게 막나"에 코드로 답 가능.
- **[security/backend] API 게이트웨이 중앙 RBAC 집행 + 헤더 위조 차단**: Spring Cloud Gateway `RbacAuthorizationFilter`가 단일 인가 관문. 클라이언트 권한 헤더를 게이트웨이가 권위 값으로 덮어쓰고 `X-Gateway-Header` 신뢰 마커로 우회 차단. 다운스트림은 JWT 재파싱 불필요 — 권한 해석 책임 단일화.
- **[security] 응답 PII 마스킹 AOP**: `@MaskIfNoPermission`+`DtoMaskingAspect`로 응답 직렬화 시점까지 다층 인가(`010-****-5678`). 진입점 인가만 하는 대다수와 차별화.
- **[backend] 3단 권한 모델(ROOT/FUNCTION/ENDPOINT) + 와일드카드 계층 매칭**: `matchesPermission()`으로 권한 폭증 없이 계층 부여. 모델링 성숙도.
- **[security] 감사 추적(audit trail)**: 권한 삭제 시 `ros_permission_deleted` JSONB 스냅샷 백업 + 매핑 배치 분리.

- **[security] OAuth 2.0+PKCE(S256)+Implicit 배제**: RFC 9700 / OAuth 2.1 권고와 정확히 일치
- **[security] RTR + Refresh Token Family 무효화**: RFC 9700 reuse detection 직접 구현
- **[security] JWT 권한 = FE 분기 전용 + 서버 검증 trade-off 인식**: OWASP API3 대응. 많은 후보가 생략하는 구분
- **[security] 카드정보 BE 미저장 + 빌링키만(vault 위임)**: PCI DSS v4.0 PAN 비저장 원칙. 결제 경험자/비경험자를 가르는 기본
- **[backend] Calculator Strategy 패턴 의식적 회피 + 근거 명시**: 시니어 판단력 신호
- **[db-perf] 외부 호출 ↔ DB 트랜잭션 경계 분리**: 커넥션 풀 hold time 인식 — DB 운영 경험자만 아는 포인트
- **[sre] OTel Agent(자동) + SDK span(선별) 분리 + span 폭증 방지**: 2026년 모범 사례와 일치
- **[sre] traceId MDC 로그 연관**: trace-log correlation 올바른 구현
- **[cloud] SaaS vs OSS 이중 근거(비용+데이터 주권)**: trade-off 사고 증거
- **[cloud] Redis 단일 진실 원천 선택 근거(노드별 stale 회피)**: 수평 확장 실무 고려

---

## ✅ 액션 아이템 (우선순위순)

1. [ ] **STAR 2·3·4 빈칸 수치 채우기** — 사내 Grafana/CloudWatch/Slack 이력 확인. (작은 실수치 > 빈칸) ※ STAR 1은 거의 해소
2. [ ] **외부 노출 차단 방식 1개로 확정** + Collector 구성/샘플링 실제값 기재 (Critical 10)
3. [ ] **결제 멱등성 보강 한 줄씩**: 토스 `Idempotency-Key` + `DuplicateKeyException` skip (Critical 3,4)
4. [ ] **N+1/인덱스 구체화**: Fetch Join vs @BatchSize 전략 + 실제 인덱스 컬럼·순서 (Critical 5,6)
5. [ ] **SLO/SLI 한 문장 추가** + 알람 임계값 = SLO 역산 서술 (Critical 7,8)
6. [ ] **앱측 자체 JWT 발급 컴포넌트명 특정** (`OAuth2TokenCustomizer` 등) — Warning으로 강등 (서버 권한검증 위치는 ✅ 해소)
7. [ ] "비동기 재시도 큐" → Transactional Outbox로 명명 / 상태머신 guard 위치 명확화 (Warning)
8. [x] ~~서버 권한검증 위치 특정~~ → ✅ 게이트웨이/함수/객체 3중 집행으로 해소
9. [x] ~~Redis TTL / 권한반영 시간 / QA 건수~~ → ✅ STAR 1 코드 반영으로 확정

> 면접 직전이면 1·3·4·5만 메워도 방어력이 확 오른다. 1번(STAR 2·3·4 수치)이 단일 최우선. **STAR 1은 이미 면접 방어 완성에 가까움.**

---

# 🔁 2차 심화 검토 (2026-06-07)

> 대상: STAR 1 실코드(게이트웨이 + 6서비스 + Redis) + STAR 4 추천인코드 실코드 정밀화 반영본
> 5인 패널 adversarial 재검증 — 1차 해소분은 제외, **신규 약점 발굴 + 논리 일관성**에 집중.

## 🧩 핵심: 논리적 균열 5곳 (메타-결론)
설계는 A급이나, 이력서가 **트레이드오프를 "의식적으로 선택했다"고 말하지 않아** 약점이 노출됨. 각 1줄 보강으로 해결.

| # | 유형 | 균열 | 보강 방향 |
|---|---|---|---|
| 1 | 🔴 자기모순 | STAR1 "권한 변경 즉시 무효화(0초)" ↔ 토큰 RBAC 캐시 **10분** (SHA-256 키라 역추적 불가) | 무효화 API가 **토큰 캐시까지 evict**(유저→토큰해시 역인덱스)함을 명시, 아니면 "0초"는 role 캐시 한정으로 수정 |
| 2 | 🟡 비대칭 | 결제 멱등성 O ↔ **환불 멱등성** 서술 0 | 환불도 토스 Idempotency-Key + 누적환불액 불변식 한 줄 |
| 3 | 🟡 주장 vs 구현 | "IDOR 방어" ↔ 객체인가는 **수직 상승만**, 수평(다른 브랜드) IDOR 침묵 / 마스킹 "다층" ↔ 로그·예외·엑셀 누락 | 객체인가에 **테넌트 스코프(brandId) 일치** 명시 |
| 4 | 🟡 STAR 간 불일치 | STAR1=분산(게이트웨이+6서비스) ↔ STAR2=**모놀리식 관측 서사** | STAR2에 게이트웨이/Redis SLI·traceparent 전파 추가 |
| 5 | 🟡 강점만 나열 | 게이트웨이 SPOF·3중 인가 중복·N+1 비용에 "왜 감수했나" 0줄 / STAR3 양적 성과만 | 각 트레이드오프 1줄 + STAR3 설계 결정 명시 |

## 🔴 STAR 1 — 신규 Critical (게이트웨이 아키텍처가 만든 새 공격면)
1. **`X-Gateway-Header` 정적 마커 = 인가 우회 단일 최대 약점.** 유출/SSRF/내부자 시 `X-Gateway-Header:true + X-Function-Permissions:HQ.* + X-Hq-Roles:SFN_ROOT` 위조로 다운스트림 직접 침투. (Traefik GHSA-5m6w-wvh7-57vm, oauth2-proxy GHSA-7x63-xv5r-3p2x 동일 패턴) → 본문을 **서명 마커(게이트웨이 개인키 HMAC/JWT, 수초 만료) 또는 mTLS + 네트워크 격리**로 한정 표기 필수.
2. **fallback 필터가 우회 경로를 정상 처리할 위험.** `RbacHeaderInjectingFilter`가 항상 켜져 있으면 게이트웨이 우회 직접 호출을 "경유 안 했네 → 내가 주입"으로 받아줌. fallback이 **헤더 불신 + 토큰 자체 재검증**임을 명시해야 무인증 우회 차단 성립.
3. **게이트웨이 = 새 SPOF + `/rbac/permissions` 동기 의존.** 게이트웨이/auth 다운 시 6서비스 전체 인가 불가. 다중화·헬스체크·**Resilience4j 서킷브레이커**·retry storm(backoff+jitter+request coalescing) 답변 필요.
4. **토큰 RBAC 캐시 10분 stale ↔ "즉시 무효화 0초" 모순** (= 논리균열 #1).
5. **목록 API 객체레벨 인가 N+1.** `hasPermission(#rosUserId,...)`를 목록 N건에 행 단위로 돌리면 "대상 역할 조회" N번. `permissionByRole`는 "유저→역할"을 흡수 못 함 → 권한 조건 **WHERE pushdown** 또는 유저→역할 캐시 필요.

## 🟡 STAR 1 — 신규 Warning
- **수평 테넌트 IDOR** (role_priority는 수직만, brandId 경계 미검증) = 논리균열 #3
- **응답 마스킹 AOP 누락 경로** (로그/예외 `@RestControllerAdvice`/중첩 컬렉션/엑셀 다운로드)
- **토큰 캐시 키 카디널리티 폭증** (RTR로 토큰 회전 → 키 무한 증가) → `volatile-lru` + 전용 네임스페이스 격리
- **cache stampede** (`permissionByRole` 1분, 역할 6종이라 키 카디널리티 낮음 → single-flight/PER)
- **와일드카드 매칭 이중 구현** (게이트웨이 AntPathMatcher ↔ 서비스 `matchesPermission()`) 해석 불일치 → 공용 모듈화
- **`@Deprecated` 컨버터 + fallback 이중 경로 EOL 조건 없음** → "미경유 메트릭 0 도달 시 제거" 명시

## 🟢 STAR 1 — 2차에서도 유지된 강점
- SHA-256 토큰 해시 키(평문 토큰 미저장, 충돌 비현실적) · 클라 권한 헤더 권위 덮어쓰기 · 1분/10분 차등 TTL 의식적 분리

## 🔴🟡 STAR 2 — 신규 (분산 시스템화에 따른 관측 불일치)
- 🔴 **게이트웨이 자체 SLI 부재** — 인가 필터 P95(캐시 hit/miss 분리) + `/rbac/permissions` 의존성 성공률
- 🔴 **분산 trace 전파** — 게이트웨이가 권한 헤더는 주입하면서 W3C `traceparent` 전파 안 하면 trace가 게이트웨이에서 끊김(SCG reactor-netty 비동기 경계 context 누수 주의)
- 🟡 **Redis cross-STAR blast radius** — 권한캐시+JTI+결제멱등성 공유 단일 의존, SLI·fallback 시 auth thundering herd 동반 관측
- 💡 정성 주장 입증법: "디버깅 단축"은 수치 대신 **단일 장애 Before(grep 양쪽)/After(trace 외부 span 1.2s 즉시) 내러티브**, "팀 표준"은 **제도화 artifact**(SaaS/OSS 비교 문서, 온보딩 디폴트 편입)로

## 🔴🟡 STAR 3 — 신규 (1차 지적대로 여전히 얕음, C+)
- 🔴 **3종 컨텐츠(Notice/Agreement/Document) 모델링 결정 0줄** → STI(SINGLE_TABLE, 폴리모픽 목록 조회 지배적 + 필드 발산 작음, nullable 트레이드오프) 명시 권장
- 🟡 **1:1 문의 thread = Inquiry(aggregate root) 1:N Reply** 구조 명시
- 🟡 **알림톡 재시도 = Transactional Outbox인지 단순 retry인지** 정확히 (dual-write 노출 여부 갈림)

## ✅ STAR 4 — 추천인코드 실코드 정밀화로 해소·정정 (cancun-api 기준)
- ✅ **멱등성 정정**: ~~`(memberId, rewardDate)` DB 유니크~~ → **조건부 UPDATE(`PENDING→GRANTED`, row count 선점) + 같은 트랜잭션 발급**, PK는 `(membershipId, promotionId)`. 외부 분산락 없이 정확히 1회.
- ✅ **0원 클램프** (~~1원 보정~~ → PG가 1원 거부하므로 0원)
- ✅ **환불**: D+8 이내 환불 시 배치 지급 제외(첫 결제 `MIN(paidAt)`), 지급 후 환수(클로백) 미구현은 **백로그로 명시 인지**
- ✅ **어뷰징 방어**: 자기추천 차단(userId), 추천 트랙 쿨다운 999개월(생애1회), 키=`(사업자번호,종사업자번호,plan)` NULL-safe, 리워드 스냅샷, 실패 격리(PENDING→FAILED 종료 + Slack + 수동 멱등 재처리)
- ⚠️ **잔존 약점(본인 인지 ✅)**: 가짜 피추천인 Sybil(다른 사업자번호 shell)+환불 타이밍 조합 → fraud 휴리스틱+클로백 / `MIN(paidAt)` tie·재청구 취약
- ⚠️ **환불 API 자체 멱등성**(이중 환불)은 별개 — 토스 Idempotency-Key + 누적환불액 불변식 권장 (논리균열 #2)
- ✅ **정회원 전환율 30.2%** 확정 (사전등록 9,723건 중 2,936건)

> **2차 종합**: STAR 1·4는 실코드로 디테일이 강해졌고, 본인이 약점을 선제 인지(STAR4 면접노트)한 점이 시니어 시그널. 남은 과제는 **(a) 논리 균열 5곳 1줄 보강 (b) STAR 2 분산 관측 일관성 (c) STAR 3 설계 결정 명시**. 보안 신규 Critical(게이트웨이 마커·SPOF)은 면접에서 100% 나오므로 본문/노트에 선제 방어 권장.

## 📚 2차 추가 학습 자료 (URL 검증)
- [CVE-2026-22750 — Spring Cloud Gateway SSL Bundle Bypass](https://www.herodevs.com/blog-posts/cve-2026-22750-how-to-detect-and-remediate-the-spring-cloud-gateway-4-2-0-ssl-bundle-bypass) — mTLS "설정=동작" 아님, 버전 점검
- [Traefik 신뢰헤더 우회 GHSA-5m6w-wvh7-57vm](https://github.com/traefik/traefik/security/advisories/GHSA-5m6w-wvh7-57vm) · [oauth2-proxy GHSA-7x63-xv5r-3p2x](https://github.com/oauth2-proxy/oauth2-proxy/security/advisories/GHSA-7x63-xv5r-3p2x) — X-Gateway-Header 정적 마커 위험 근거
- [토스페이먼츠 멱등키 가이드(한글)](https://docs.tosspayments.com/guides/using-api/idempotency-key) — 환불 멱등성
- [Spring Cloud 2025.0 — trusted-proxies](https://github.com/spring-cloud/spring-cloud-release/wiki/Spring-Cloud-2025.0-Release-Notes) — 프레임워크 레벨 헤더 신뢰 경계
- [Spring Batch 수백만 건 처리 — 커서/keyset](https://oneuptime.com/blog/post/2026-01-25-process-millions-records-spring-batch/view) · [Spring Batch Reader 성능(한글, cheese10yun)](https://cheese10yun.github.io/spring-batch-reader-performance/) — 결제 배치
- [AWS ElastiCache Multi-AZ failover](https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/AutoFailover.html) · [Azure Retry Storm 안티패턴(한글)](https://learn.microsoft.com/ko-kr/azure/architecture/antipatterns/retry-storm/) — Redis SPOF·retry storm
