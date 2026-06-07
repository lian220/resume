# 기술 스펙 학습 자료 (한글 위주)

> 작성일: 2026-05-31 · 출처: WebSearch로 검증한 국내 컨퍼런스·유튜브·한글 블로그
> 목적: 이력서 STAR에 쓴 기술을 면접 전 깊이 보강. 영상부터 보고 블로그로 깊이 더하는 흐름 추천.
> ▶️ = 영상/유튜브 · ⭐ = 우선 정독 · 📄 = 공식문서

---

## STAR 1 — 인증·인가 (OAuth / JWT / RBAC)

- ▶️ ⭐ [토스 SLASH 개발자 컨퍼런스 (전체 플레이리스트)](https://www.youtube.com/playlist?list=PL1DJtS1Hv1PiGXmgruP1_gM2TSvQiOsFL) — 토스의 인증·결제·서버 설계 발표 모음. "토큰/인증/결제" 키워드로 골라 볼 것. 국내 최고 수준 실전 사례.
- ⭐ [Spring Security: OAuth 2.0 아키텍처 이해와 보안 취약점 사례 (이글루)](https://www.igloo.co.kr/security-information/spring-security-part2-oauth-2-0-%EC%95%84%ED%82%A4%ED%85%8D%EC%B2%98-%EC%9D%B4%ED%95%B4%EC%99%80-%EB%B3%B4%EC%95%88-%EC%B7%A8%EC%95%BD%EC%A0%90-%EC%82%AC%EB%A1%80/) — OAuth 2.0 흐름 + PKCE가 막는 공격을 한글로. "PKCE 왜 썼나" 답변 근거.
- [Spring Security 공식 문서 한글 번역 — OAuth2 (토리맘의 한글라이즈)](https://godekdls.github.io/Spring%20Security/oauth2/) — 공식 레퍼런스 한글판. `oauth2Login()`·토큰 커스터마이징 진입점.
- [서버 기반 인증 vs 토큰 기반 인증 (SK C&C)](https://engineering-skcc.github.io/security/jwt-token/) — 세션 vs JWT 트레이드오프, 토큰 저장 위치. "왜 자체 JWT" 기본 정리.
- [Caching With Redis — 캐시 전략 (jaeyeong951)](https://jaeyeong951.medium.com/caching-with-redis-888071bc1f15) — Cache-aside, 무효화 전략. RBAC 권한 캐시 + invalidation 배경.

## STAR 2 — 관측성 (OpenTelemetry / 분산추적)

- ▶️ ⭐ [우아한테크 유튜브 채널 (우아콘·우아한테크세미나)](https://www.youtube.com/@woowatech) — 관측성·모니터링·분산추적 세션 다수. "OpenTelemetry/모니터링/트레이싱" 검색.
- ⭐ [OpenTelemetry 도입기 (사람인 기술블로그, 2026)](https://saramin.github.io/2026-03-20-opentelemetry-in-action/) — 실제 회사 OTel 도입 과정·시행착오. STAR 2와 가장 유사한 한글 실전 사례.
- [OpenTelemetry 분산 트레이싱 실전 가이드 — 계측부터 시각화까지](https://www.youngju.dev/blog/observability/2026-03-03-opentelemetry-distributed-tracing) — Java 계측·context propagation 단계별. `@WithSpan` 이해.
- [OpenTelemetry 란 무엇인가? (Paul, Medium)](https://medium.com/@dudwls96/opentelemetry-%EB%9E%80-%EB%AC%B4%EC%97%87%EC%9D%B8%EA%B0%80-18b6e4fe6e36) — Trace/Metric/Log 3축, 벤더 중립 입문. "왜 OTel(벤더락인 회피)" 답변.
- [오픈텔레메트리는 무엇인가요? (OPENMARU APM)](https://www.openmaru.io/otel/) — APM 관점 OTel 구조·Collector. SLO/샘플링 개념 보강.

## STAR 3 — JPA N+1 / DB 성능·인덱스

- ▶️ ⭐ [비전공자도 이해할 수 있는 MySQL 성능 최적화 (SQL 튜닝편) — 유튜브 풀강의](https://www.youtube.com/playlist?list=PLtUgHNmvcs6rJBDOBnkDlmMFkLf-4XVl3) — 인덱스·실행계획·복합 인덱스 컬럼 순서. **복합 인덱스/EXPLAIN 면접 대비 1순위.**
- ▶️ ⭐ [[10분 테코톡] 모디의 MySQL 실행 계획 (우아한테크코스)](https://www.youtube.com/watch?v=usEsrsaSSuU) — EXPLAIN 핵심 10분. `type`·`key`·`Extra(Using filesort)` 빠르게.
- ⭐ [김영한 — 자바 ORM 표준 JPA 프로그래밍 (인프런)](https://www.inflearn.com/course/ORM-JPA-Basic) — N+1·Fetch Join·@BatchSize 정석. 활용2(성능 최적화)편이 면접 단골 그대로. **국내 JPA 표준 교재.**
- [야! 너도 할 수 있어, N+1 해결 (트렌비 기술블로그)](https://tech.trenbe.com/2022/02/23/%EC%95%BC!-%EB%84%88%EB%8F%84-%ED%95%A0-%EC%88%98-%EC%9E%88%EC%96%B4,-N+1%ED%95%B4%EA%B2%B0.html) — Fetch Join vs @BatchSize vs EntityGraph 비교 + Fetch Join+페이징 함정.
- [MySQL Workbench VISUAL EXPLAIN으로 인덱스 동작 확인 (LINE)](https://engineering.linecorp.com/ko/blog/mysql-workbench-visual-explain-index) — 인덱스 타는지 시각 확인. "어떻게 진단했나" 근거.
- [MySQL 인덱스 튜닝 (직방 기술블로그)](https://medium.com/zigbang/mysql-%EC%9D%B8%EB%8D%B1%EC%8A%A4-%ED%8A%9C%EB%8B%9D-18e183e9246d) — 실제 서비스 인덱스 튜닝. 복합 인덱스 선행 컬럼 원칙.
- [MySQL 풀 스캔 패턴 및 튜닝 — Real MySQL 스터디 (박종훈)](https://jonghoonpark.com/2024/11/03/mysql-full-scan-query-pattern) — 선행 컬럼 빠지면 인덱스 못 타는 케이스. 면접 단골 함정.

## STAR 4 — 결제·빌링 (토스페이먼츠 / 멱등성)

- ⭐ [멱등성이 뭔가요? (토스페이먼츠 개발자센터)](https://docs.tosspayments.com/blog/what-is-idempotency) — Idempotency-Key 개념을 토스 공식이 한글로. **결제 멱등성 면접 답변의 표준.**
- ⭐ [자동결제(빌링) 이해하기 (토스페이먼츠 공식)](https://docs.tosspayments.com/guides/billing/overview) — 빌링키 발급 플로우 한글 공식. "카드정보 미저장, 빌링키만" 근거.
- [구독 결제 서비스 구현 (2) 스케줄링 설정하기 (토스페이먼츠)](https://www.tosspayments.com/blog/articles/dev-subscription-2) — 정기결제 일배치 스케줄링 실전. STAR 4 결제 배치와 직접 대응.
- [정기결제 (feat. 토스페이먼츠) — 개발자 구현 후기](https://velog.io/@yoonvelog/%EC%A0%95%EA%B8%B0%EA%B2%B0%EC%A0%9C-feat.-%ED%86%A0%EC%8A%A4%ED%8E%98%EC%9D%B4%EB%A8%BC%EC%B8%A0) — 빌링키 정기결제 직접 구현 후기. 실수·고민 지점 참고.
- [인증 및 기타 헤더 설정 (토스페이먼츠 — Idempotency-Key)](https://docs.tosspayments.com/reference/using-api/authorization) — POST API에 Idempotency-Key 거는 방법. PG 레벨 중복 차단 근거.

## 공통 — 트랜잭션 아웃박스 / 분산락 / 멀티인스턴스

- ⭐ [트랜잭셔널 아웃박스 패턴의 실제 구현 사례 (29CM)](https://medium.com/@greg.shiny82/%ED%8A%B8%EB%9E%9C%EC%9E%AD%EC%85%94%EB%84%90-%EC%95%84%EC%9B%83%EB%B0%95%EC%8A%A4-%ED%8C%A8%ED%84%B4%EC%9D%98-%EC%8B%A4%EC%A0%9C-%EA%B5%AC%ED%98%84-%EC%82%AC%EB%A1%80-29cm-0f822fc23edb) — "DB 트랜잭션과 외부 호출 분리" 실제 구현. 알림톡·ERP 재시도 = Outbox 명명 근거.
- [WOOWACON 2023 리캡 (우아한형제들 기술블로그)](https://techblog.woowahan.com/15488/) — 우아콘 결제·이벤트·아웃박스(Debezium) 세션 요약. 대규모 결제 도메인 시야.
- ⭐ [멀티 서버에서 스케줄 처리하기 — ShedLock](https://velog.io/@recordsbeat/%EB%A9%80%ED%8B%B0-%EC%84%9C%EB%B2%84%EC%97%90%EC%84%9C-%EC%8A%A4%EC%BC%80%EC%A4%84-%EC%B2%98%EB%A6%AC%ED%95%98%EA%B8%B0-ShedLock) — `lockAtMostFor`/`lockAtLeastFor` 한글. 결제 일배치 멀티인스턴스 중복 방지.
- [ShedLock으로 멀티 노드 스케줄 중복 실행 방지 (JSON-OBJECT)](https://json-object.github.io/Implementing-Distributed-Schedule-Lock-using-ShedLock-in-Spring-Boot.html) — DB 유니크가 못 막는 "동시 실행"을 분산락으로. 코드 예제.
- [전체 서비스를 관통하는 도메인 모듈을 안전하게 분리하기 (우아한형제들)](https://techblog.woowahan.com/22151/) — DDD 도메인 분리·헥사고날 실전. 상태머신 guard 위치·도메인 경계 근거.

---

## 한글 공부 순서 추천
1. **토스 SLASH + 우아한테크 유튜브**로 큰 그림 잡기
2. **MySQL 튜닝 유튜브 + 김영한 JPA**로 N+1/인덱스 (면접 최다 단골)
3. **토스 멱등성 문서**로 결제 도메인
4. **ShedLock + 29CM 아웃박스**로 멀티인스턴스/재시도 보강

> 영상부터 보고 블로그로 깊이 더하는 흐름을 추천. 정확한 스펙 확인이 필요할 때만 영문 원문(RFC 9700·RFC 8725·OWASP API Top 10·OTel 공식·Spring Authorization Server 공식)을 참조.
