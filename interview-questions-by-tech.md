# 기술별 면접 예상 질문 + 답변 포인트 (심화)

> 작성일: 2026-05-31 · 출처: 전문가 패널 5인
> ⚠️ 이력서 하단 기존 Q&A(34개)와 **중복되지 않는 더 깊은 질문**만 모음.
> 형식: **Q** / 왜 묻는가 / 좋은 답변의 핵심
> 🔥 = 이력서 빈칸·허점과 직결돼 거의 확실히 나올 질문

---

## 1. 인증·인가 (OAuth / JWT / Spring Auth Server / RBAC)

### 🔥 Q1-1. Spring Authorization Server에서 카카오 로그인 후 자체 JWT 발급까지, 어떤 컴포넌트를 직접 커스터마이징했나?
- **왜**: 키워드만 쓴 사람 vs 실제로 다룬 사람 구분.
- **핵심**: `AuthenticationSuccessHandler`에서 OAuth2User → 내부 User 매핑(JIT Provisioning) → `OAuth2TokenCustomizer<JwtEncodingContext>`로 role·권한 플래그 커스텀 클레임 주입. Authorization Server(토큰 발급)와 `oauth2Login()`(Resource Owner 인증)의 역할 분리 설명하면 가점.

### 🔥 Q1-2. 운영자 권한 검증은 정확히 어느 레이어에서 일어나나? (실제 코드 기반)
- **왜**: "DB/캐시 확인한다"는 말만으론 부족. OWASP API1/API3 방어 증명.
- **핵심 (3중 집행으로 답)**: ① **게이트웨이** `RbacAuthorizationFilter`가 `ENDPOINT_{METHOD}:{PATH}` 권한을 `AntPathMatcher`로 중앙 인가(+화이트리스트) → ② 다운스트림 **함수레벨** `@PreAuthorize hasPermission(...)` `CustomPermissionEvaluator` → ③ **객체레벨** `DomainPermissionEvaluator`로 대상 객체 역할 재검증. JWT 클레임은 FE UI용, 실제 인가는 이 3중 + Redis 권한캐시. "어느 레이어냐"에 코드 경로로 답 가능 = 강점.

### Q1-3. JWT Access Token을 클라이언트 어디에 저장하나? (localStorage vs httpOnly cookie)
- **왜**: XSS vs CSRF 트레이드오프 = JWT 보안의 절반.
- **핵심**: httpOnly+Secure+SameSite=Lax 쿠키 → XSS 탈취 불가(대신 CSRF는 SameSite로 차단). localStorage → JS 접근 가능해 XSS 즉시 탈취. 모바일은 Keychain/Keystore. "우리는 [선택]+[위협모델 근거]" 구조로.

### Q1-4. 강제 무효화(계정 정지)는 어떻게? — 앱측 JTI vs BO측 경로 (실제 코드)
- **왜**: stateless JWT의 강제 무효화 한계를 어떻게 풀었는지. ※ 정직성: caribbean-api(BO)엔 JTI 블랙리스트 테이블이 **없음** — 경로가 다름.
- **핵심 (경로 분리로 답)**: **BO측**은 계정 정지·권한 박탈 시 `oauth2_authorization` 레코드 폐기 + Redis 권한 캐시 무효화로 즉시 차단. **앱측**은 JTI 블랙리스트(Redis TTL)로 차단(별도 레포). JTI TTL은 AT 만료시각 기준 + skew 마진 5~60초로 역산하면 블랙리스트 소멸 후 통과 버그를 막음. "두 서비스가 무효화 책임을 각자 맞는 방식으로 가진다"가 정답.

### Q1-5. RTR에서 동시 Refresh 요청(race condition)이 들어오면?
- **왜**: RTR의 이론적 약점. 동시 두 요청이 같은 토큰으로 갱신 → 한쪽이 reuse로 오인돼 세션 전체 무효화.
- **핵심**: Redis `SET NX`/분산 락 또는 DB `SELECT FOR UPDATE`로 직렬화. 규모가 작으면 "발생 빈도 낮고 재로그인으로 복구 가능한 수용된 위험"이라 정직하게.

### Q1-6. Apple `.p8` 개인키는 어디에 저장하고 유출되면 어떻게 되나?
- **왜**: 비대칭키 관리 = PKI 보안 핵심. 유출 시 임의 `client_secret` 생성으로 인증 우회.
- **핵심**: Parameter Store(SecureString)/Secrets Manager + IAM Role 접근 제어. 유출 시 Apple 포털에서 즉시 폐기+새 키 발급+배포. 기존 "N일 전 자동 재생성 스케줄"로 긴급 교체도 동일 파이프라인.

### Q1-7. 자체 JWT 서명 키(RS256/ES256)의 생성·저장·교체 정책은?
- **왜**: 자체 발급 서버는 서명 키가 단일 장애점이자 최대 자산.
- **핵심**: Spring Auth Server `JWKSource`. 기본 인메모리는 재시작마다 키 변경(토큰 무효화) → 프로덕션은 KMS/Secrets Manager 로드 커스텀 `JWKSource`. 교체 시 JWKS에 신구 키 동시 게시(grace period).

### 🔥 Q1-8. SUPERVISOR가 SUPER_ADMIN 계정을 수정·삭제하는 수직 권한 상승은 어떻게 막나? (IDOR, 실제 코드)
- **왜**: OWASP API1(BOLA/IDOR). 함수 권한만 있으면 "누구의 계정인지"는 안 보는 흔한 구멍.
- **핵심**: `@PreAuthorize hasPermission(#rosUserId, 'TYPE_ROS_USER', 'UPDATE_ACCOUNT')`가 ① 호출자 기능권한 + ② **대상 유저의 역할을 조회해 `HQ.{대상역할}.UPDATE_ACCOUNT` 권한 보유 여부**까지 객체 단위 재검증(`CustomPermissionEvaluator`+`DomainPermissionEvaluator`). `role_priority` 계층으로 하위 역할이 상위 역할 객체를 건드리지 못하게 코드로 차단. **실제 구현이라 자신 있게 답할 수 있는 항목.**
- **⚠️ 2차 보강 (수평 IDOR)**: `role_priority`는 **수직 상승만** 막음. BRAND_MANAGER가 *다른 브랜드* STORE_OWNER를 건드리는 **수평 테넌트 침범**은 별개 → 객체레벨에서 **테넌트 스코프(brandId/storeId) 일치**도 함께 검증("내 관할 산하만"). B2B는 수평 IDOR가 더 흔함. 이력서가 수직만 강조하면 면접관이 수평으로 찌름.

### 🔥 Q1-9. (실제 코드) API 게이트웨이를 단일 RBAC 관문으로 둔 이유와, 게이트웨이 우회/SPOF 리스크는?
- **왜**: 중앙 집행은 깔끔하지만 SPOF·우회가 단골 반론.
- **핵심**: 권한 해석 책임을 게이트웨이로 단일화(다운스트림 JWT 재파싱 제거, 일관성). 우회 방어 = 다운스트림이 `X-Gateway-Header` 신뢰 마커로 게이트웨이 경유 여부 판별, **미경유 시 자체 `RbacHeaderInjectingFilter` fallback**으로 무인가 통과 차단. SPOF는 게이트웨이 다중화로 대응. "게이트웨이 없이 직접 호출하면?" → 마커 없으면 fallback 인가가 동작.

### 🔥 Q1-10. (실제 코드) 클라이언트가 `X-Function-Permissions` 같은 권한 헤더를 위조해서 보내면?
- **왜**: 헤더 기반 권한 전파의 핵심 공격 벡터. 못 막으면 전체 RBAC 무력화.
- **핵심**: **게이트웨이가 클라이언트가 보낸 권한 헤더를 권위 값(authoritative)으로 덮어쓴다** — 외부에서 주입한 `X-*-Permissions`는 게이트웨이 진입 시 폐기되고 토큰 해석 결과로 재설정. 다운스트림은 `X-Gateway-Header` 신뢰 마커가 있는 요청만 신뢰. 위조 시도는 게이트웨이에서 무효화.

### 🔥 Q1-11. (실제 코드) 객체레벨 인가가 **목록 API(유저 100건)**에서 N+1 인가 쿼리를 유발하지 않나? <span>(2차 심화)</span>
- **왜**: 단건은 괜찮지만 목록에서 행 단위로 돌리면 "대상 역할 조회" N번. `permissionByRole`는 *역할→권한*만 캐시하지 *유저→역할*은 못 흡수.
- **핵심**: 단건(상세·수정 `#rosUserId`)은 1건 조회라 문제없음. **목록은 객체레벨을 행 단위로 돌리지 않고 권한 조건을 WHERE로 pushdown**(권한 있는 행만 조회) 또는 유저→역할 매핑도 캐시. "함수레벨로 1차 거른 뒤 객체레벨은 단건에만"이 깔끔. — *흡수 못 한다는 사실을 먼저 인정하는 게 핵심.*

### 🔥 Q1-12. (실제 코드) 토큰 RBAC 캐시 10분 — "즉시 무효화(0초)"라 했는데 SHA-256 키라 어떤 토큰을 지울지 역추적 되나? <span>(논리 모순 보강)</span>
- **왜**: Result의 "즉시 0초" 주장과 토큰 캐시 10분이 충돌. 면접관이 정확히 찌름.
- **핵심**: `permissionByRole`(역할→권한, 1분)은 `@CacheEvict`로 즉시. 단 **토큰 RBAC 캐시(10분, SHA-256 키)는 토큰을 역추적 못 하므로 "유저→토큰해시 역인덱스(Redis Set)"로 함께 evict**해야 "0초"가 참이 됨. 그게 없으면 최대 10분 stale → **JTI 블랙리스트 교차 체크로 캐시 적중이어도 거부**가 보안 보강. "캐시는 성능, 블랙리스트는 보안 — 보안 우선." (현 구현에 역인덱스가 있는지 본인 확인 필요)

### Q1-13. (실제 코드) 응답 PII 마스킹을 진입점 인가가 아니라 AOP(`@MaskIfNoPermission`)로 한 이유는?
- **왜**: "인가는 진입점에서 끝"이라는 통념을 넘어서는지.
- **핵심**: 진입점 인가는 "이 API 호출 가능?"만 판단 — 응답 본문의 특정 필드(전화번호)는 통과시킨다. 권한 없는 운영자에게도 목록은 보여주되 PII만 `010-****-5678`로 가려야 하는 요구 → 응답 직렬화 시점 `DtoMaskingAspect`로 필드 단위 마스킹. **인가를 다층(진입점+응답)으로 적용**한 사례.

### Q1-14. (실제 코드) 3단 권한 모델(ROOT/FUNCTION/ENDPOINT)과 와일드카드 매칭 — 과도 부여(privilege creep) 위험은?
- **왜**: 와일드카드는 편하지만 `HQ.*` 한 방에 과권한이 새기 쉬움.
- **핵심**: `PERMISSION_*`/`HQ.*`/단건의 계층을 `matchesPermission()`로 명시 관리, 부여는 최소 단위 우선. 와일드카드는 역할 설계 시 신중히, 감사(`ros_permission_deleted` JSONB 스냅샷)로 변경 추적. "편의 vs 최소권한"의 균형을 의식했다고 답.

### Q1-15. OAuth 콜백 `state` CSRF 방어 — 단순 nonce인가 세션 바인딩인가?
- **왜**: RFC 9700이 CSRF 방어 필수 규정. 세션 바인딩 없는 nonce는 replay 취약.
- **핵심**: state = CSRF토큰+세션식별자 조합을 서버/Redis 저장 후 콜백 시 비교. 1회용(사용 즉시 삭제). Spring Security `OAuth2AuthorizationRequestRepository` 기본 처리.

### Q1-16. (트렌드) 토큰 탈취 후 다른 클라이언트 재사용 방어는? DPoP 고려했나?
- **왜**: RFC 9700이 sender-constraining(mTLS/DPoP) 권고. bearer 모델의 한계.
- **핵심**: 현재 bearer면 "DPoP 미적용, bearer+RTR+JTI 블랙리스트 조합으로 방어" 명시적 포지셔닝. DPoP가 뭔지(proof-of-possession) 설명 가능하면 가점.

---

## 2. 관측성 (OpenTelemetry / SigNoz / SRE)

### 🔥 Q2-1. OTel Java Agent와 `@WithSpan` SDK 동시 사용 시 GlobalOpenTelemetry 중복 초기화는?
- **왜**: 이력서에 "주의사항"으로 적음 → 실제 겪었는지 검증.
- **핵심**: Agent가 부트스트랩에서 이미 초기화 → SDK 재초기화 시 `IllegalStateException`. **정답은 SDK 초기화 코드를 아예 안 쓰는 것.** `@WithSpan`/`tracer`는 Agent가 만든 `GlobalOpenTelemetry`를 자동 사용.

### 🔥 Q2-2. P95 알람 임계값을 어떻게 정했나? SLO와 어떻게 연결되나?
- **왜**: 임의 숫자 vs SLO 역산은 SRE 성숙도의 결정적 차이. (이력서 SLO 부재 = Critical)
- **핵심**: SLI(P95 응답시간) → SLO(P95<1000ms, 30일 99%) → 알람은 SLO 위반 전 조기경고(burn rate). SLO 정의 안 했으면 솔직히 인정 + "에러버짓 기반 알람으로 발전시키고 싶다"는 방향 제시. RED 메서드 언급하면 깊이.

### 🔥 Q2-3. OTel Collector가 다운되면 애플리케이션에 무슨 일이? 어떻게 방어했나?
- **왜**: 관측성이 서비스 critical path에 있으면 안 된다는 원칙. (Critical 9)
- **핵심**: OTLP exporter 비동기 queue+retry. `BatchSpanProcessor`의 maxQueueSize·exporterTimeout 설정으로 블로킹 방지. `OTEL_EXPORTER_OTLP_TIMEOUT` 짧게(5초). telemetry는 유실되나 서비스 가용성 영향 없음 = "관측성 다운 ≠ 서비스 다운"의 실제 구현.

### Q2-4. 커스텀 span attribute에 userId/orderId 같은 고카디널리티 값 썼나? ClickHouse 문제는?
- **왜**: 카디널리티 폭증 = ClickHouse 디스크/쿼리 성능 최대 위협.
- **핵심**: 고카디널리티는 span attribute 대신 span event/로그에. attribute는 enum 수준(`order.status`, `payment.method`)으로 제한. Collector `filter processor`로 인제스트 전 제거.

### Q2-5. 샘플링 전략 — head-based vs tail-based? 무엇을 썼나?
- **왜**: 이력서 "샘플링=[실제 구성]" 미완성. (Critical 10)
- **핵심**: SigNoz 기본 docker-compose = head-based 100%. head 한계(에러/slow trace 놓침). tail은 Collector 버퍼링·메모리 부담. 소규모는 100% 수집+TTL 관리가 합리적. 트래픽 증가 시 tail sampling 전환 경로.

### Q2-6. traceId를 MDC에 넣었는데 비동기(@Async, CompletableFuture, 배치)에서 전파됐나?
- **왜**: MDC는 ThreadLocal → 새 스레드에서 context 소실 → 상관관계 끊김.
- **핵심**: OTel Agent가 `ExecutorService` 계측으로 자동 전파하나, 커스텀 스레드풀·Kotlin coroutine은 명시적 전달 필요. 배치 각 아이템 span이 root span의 child로 연결됐는지 확인 경험 서술하면 강함.

### Q2-7. ClickHouse 보존을 트레이스/메트릭/로그별로 다르게 한 이유와 기준은?
- **왜**: 비용 vs 디버깅 가치 트레이드오프. "그냥 7일"과 차이.
- **핵심**: 트레이스(단기 디버깅) < 메트릭(트렌드/용량계획) < 로그(감사/컴플라이언스). EBS 용량·EC2 비용 함께 고려. ClickHouse TTL이 MergeTree 백그라운드 정리로 동작함 이해하면 가점.

### 🔥 Q2-8. 로그 grep만 하다가 SigNoz로 실제 해결한 장애 사례 하나 말해달라.
- **왜**: 도구 도입보다 도구로 문제 해결한 경험. 수치 없는 이력서에서 최다 파고듦.
- **핵심**: 구체 내러티브 — "카카오 OAuth 콜백 간헐 5초 지연 → trace에서 JWKS 외부호출 span 4.8초 + MDC 로그로 cache miss 직후 재조회 확인 → TTL 조정." flamegraph에서 뭘 보고 뭘 결론냈는지.

### Q2-9. SLO/에러버짓을 도입 안 한 이유는? 향후 도입한다면?
- **왜**: Critical 부재를 직접 짚는 질문. 모르는 것 vs "알지만 선택 안 함" 구분.
- **핵심**: "팀 규모·초기 단계라 기본 관측성 확보가 우선이었다." 향후: 가용성 SLI(99.5%/30일)+레이턴시 SLI(P95<1000ms) 정의, 알람을 burn rate alert로 전환.

### 🔥 Q2-10. 게이트웨이가 권한 헤더는 주입하는데, 분산 trace는 게이트웨이 건너 다운스트림까지 이어지나? <span>(2차 — STAR1/2 일관성)</span>
- **왜**: STAR1이 분산 시스템(게이트웨이+6서비스)인데 STAR2 관측이 모놀리식 서사면 불일치. trace 끊기면 "외부 호출 지연 즉시 식별" 주장이 무너짐.
- **핵심**: 게이트웨이가 `X-*` 권한 헤더 주입 시 **W3C `traceparent`/`tracestate`도 보존 전파**해야 게이트웨이 span과 6서비스 span이 한 trace로 이어짐. SCG는 reactor-netty 비동기 경계라 OTel context 누수 주의 → "게이트웨이 경유 trace 연속성 검증"이 포인트. (미확인이면 정직하게 "검증 예정 항목")

### Q2-11. 인가 단일점인 게이트웨이의 자체 SLI는 무엇을 보나? <span>(2차)</span>
- **왜**: 모든 인증 요청이 거치는 직렬 의존성인데 STAR2 대시보드엔 "API별 에러율·P95" 일반 지표만.
- **핵심**: ① **게이트웨이 인가 필터 P95 (캐시 hit/miss 분리** — 섞으면 miss의 auth 왕복 tail이 평균에 묻힘) ② `/rbac/permissions` **의존성 성공률**(떨어지면 전 서비스 인가 장애) ③ **Redis** hit율·연결성(권한캐시+JTI+결제멱등성 공유 → cross-STAR blast radius). Redis 다운 시 fallback의 auth 호출 폭증(thundering herd) 동반 모니터링.

---

## 3. 도메인 설계 + DB 성능 (JPA / 인덱스)

### 🔥 Q3-1. N+1이 실제 발생한 걸 어떻게 진단했나?
- **왜**: 코드 리뷰로 추측 vs APM/로그로 실측의 수준 차이.
- **핵심**: SigNoz 트레이스에서 단일 요청 DB span 수 비정상(목록 20건에 쿼리 21개) 확인 + `show_sql` 로그 + EXPLAIN ANALYZE로 인덱스 미사용 확인.

### 🔥 Q3-2. Fetch Join과 @BatchSize 중 언제 뭘 쓰나? STAR 3엔 뭘 적용했나?
- **왜**: 상호 대체 아님. 차이 모르는 경우 많음.
- **핵심**: Fetch Join=단건 상세, 컬렉션 작고 페이지네이션 없을 때(카르테시안 주의). @BatchSize=목록(Pageable) 또는 컬렉션 클 때. **목록에 Pageable 있으면 Fetch Join 단독은 HHH90003004 경고** → @BatchSize/DTO projection.

### 🔥 Q3-3. Fetch Join에 Pageable 붙이면 무슨 일이?
- **왜**: 이 함정을 아는지로 즉각 수준 판별.
- **핵심**: Hibernate가 SQL LIMIT 적용 못 하고 **전체 결과를 메모리에 올린 뒤 애플리케이션에서 자름**(HHH90003004) → 데이터 많으면 OOM. 해결: 목록 @BatchSize/DTO+별도 count, 상세 Fetch Join.

### 🔥 Q3-4. 복합 인덱스 컬럼 순서를 어떻게 정했나? 저카디널리티 컬럼(content_type, status)을 넣은 이유는?
- **왜**: 컬럼 순서가 플래너의 인덱스 사용 결정 핵심. "WHERE 다 넣음"과 "쿼리패턴 기반"은 다름.
- **핵심**: 등치(=) 필터 앞, 범위(BETWEEN) 뒤. 저카디널리티라도 항상 WHERE에 포함되고 고카디널리티와 결합하면 선두 가능(예: `(franchisor_id, content_type, created_at DESC)`). MySQL은 선두 컬럼 매칭 원칙 절대적.

### Q3-5. 필터링을 DB로 위임했다는데, ORDER BY 컬럼이 인덱스 밖이면?
- **왜**: "DB 위임"과 "인덱스 탐"은 다름. filesort 병목 인지 확인.
- **핵심**: 인덱스 밖 ORDER BY → `Using filesort`. 복합 인덱스 마지막 컬럼을 ORDER BY 컬럼(`created_at DESC`)으로 잡아 제거. EXPLAIN Extra에서 filesort 사라졌는지 검증.

### Q3-6. (STAR 3) 3종 컨텐츠(Notice/Agreement/Document)를 어떻게 테이블 모델링했나?
- **왜**: 공통 라이프사이클 다형 엔티티 모델링 = JPA 실무 검증 전형.
- **핵심**: STI(단일테이블)=null 컬럼 많으나 조인 없어 조회 빠름(타입별 차별 컬럼 적고 목록 중심이면 합리). 조인테이블=정규화 좋으나 조인 비용. "어떤 걸 골랐고 왜 그게 쿼리 패턴에 맞는지".

### Q3-7. 배치에서 `findAll()`로 다 올리면? 대량 처리 방어는?
- **왜**: 배치 OOM은 최다 장애.
- **핵심**: `findAll()` → 건수 비례 메모리 → OOM. 방어: `Pageable` 청크(Spring Batch ItemReader식)/`Stream`/`ScrollQuery` 커서. 현재 수백~수천이면 OK지만 규모 대비 설계.

### 🔥 Q3-8. 알림톡 발송 실패 시 "게시글 상태 일관성 유지"라 했는데, 게시글 커밋 직후·발송 전 서버가 죽으면 알림 유실 아닌가? (dual-write) <span>(2차)</span>
- **왜**: "트랜잭션 경계 분리"가 진짜 dual-write를 푼 건지, 단순 try-catch인지 가름.
- **핵심**: **Transactional Outbox**면 → 게시글 + outbox 레코드를 *한 트랜잭션*에 커밋, 별도 relay가 폴링 발송(at-least-once → 멱등 처리). 단순 `@Async` retry면 커밋 후 발송 전 크래시 시 **유실 노출**을 인정하고 "발송 상태 PENDING 선기록 후 배치 재처리"로 보강. 본인 구현이 어느 쪽인지 정확히 — outbox면 그 단어를 쓰는 순간 격이 오름.

### Q3-9. 1:1 문의 thread를 어떻게 모델링했나? <span>(2차)</span>
- **왜**: "점주 등록·본부 응답" 기능 나열만으론 도메인 깊이 안 보임.
- **핵심**: **Inquiry(aggregate root) 1 : N Reply(내부 엔티티)** 구조. 문의 헤더에 `answered` 상태 + 답변 N개 → "본부향 목록에 미답변 개수 노출"이 이 구조에서 자연스럽게 나옴. Aggregate 경계로 설명하면 DDD 시그널.

---

## 4. 결제·빌링 (토스페이먼츠 / 멱등성 / PCI)

### 🔥 Q4-1. `(memberId, billingDate)` 유니크 제약 — 두 스레드 동시 INSERT면?
- **왜**: 유니크 제약은 race를 "막는" 게 아니라 "한쪽에 에러를 줌". 예외처리가 멱등성 완성.
- **핵심**: 위반 시 `DataIntegrityViolationException`/`DuplicateKeyException` → catch → "이미 처리됨" skip. 또는 `INSERT ... ON CONFLICT DO NOTHING`. (이력서에 이 한 줄 추가 필요 = Critical 4)

### 🔥 Q4-2. 결제 일배치가 PG 성공 후 DB 저장 실패(partial failure)면 멱등성은?
- **왜**: DB 유니크는 이 케이스를 못 막음. 인지 여부 테스트.
- **핵심**: 토스 빌링 API에 `Idempotency-Key` 헤더로 `(memberId+billingDate)` 키 전달 → 동일 키 재호출 시 PG가 중복 차단+이전 결과 반환. **DB 유니크 + PG idempotency 이중 방어**가 완전.

### 🔥 Q4-3. 멀티 인스턴스에서 일배치가 두 인스턴스 동시 실행되면?
- **왜**: Spring Scheduler 단독 = 인스턴스마다 실행. DB 유니크만으론 동시 PG 호출 못 막음.
- **핵심**: 방어1=DB 유니크(결과 중복). 방어2=토스 Idempotency-Key(PG 레벨). 근본=**ShedLock** `@SchedulerLock`으로 단일 실행 보장(lockAtMostFor=deadlock 방지, lockAtLeastFor=조기 재실행 방지). "현재 단일이면 인지하고 ShedLock 도입 고려" 정직하게.

### Q4-4. 유니크 제약 vs 비관적 락 — 결제 배치에 왜 유니크 제약을?
- **왜**: 중복 방지 여러 패턴 중 선택 근거.
- **핵심**: 비관적 락=SELECT FOR UPDATE, 충돌 잦을 때 유효하나 락 대기·커넥션 hold·deadlock 위험. 유니크 제약=DB 원자 보장, retry-safe, 단방향 INSERT에 적합. 일배치는 충돌 빈도 낮고 재실행 안전성 중요 → 유니크 제약.

### Q4-5. 빌링키가 DB에서 탈취되면? (카드정보 안 저장한다고 끝이 아님)
- **왜**: 빌링키도 결제 유발 가능한 민감 자산.
- **핵심**: 빌링키 단독으로는 토스 secret key 없으면 결제 불가(두 자산 동시 탈취 필요). 추가로 DB 컬럼 암호화(AES-256). secret key는 Secrets Manager 분리+최소권한 IAM. 탈취 감지 시 토스 API로 빌링키 폐기+카드 재등록.

### Q4-6. 토스 Webhook(결제 이벤트) 위조 방지는?
- **왜**: webhook 위조 = 실제 청구 없이 멤버십 활성화. 결제 핵심 공격벡터.
- **핵심**: 토스 제공 서명(HMAC-SHA256)으로 바디 검증, 불일치 즉시 거부. + 토스 IP 화이트리스트. 미적용이면 "개선 계획 있다" 정직하게.

### Q4-7. 안분 환불 시 월별 일수 차이(28/29/30/31)와 윤년은?
- **왜**: 결제 도메인 날짜 계산은 버그 빈발 지점.
- **핵심**: 기준일수를 당월 실제일수(`ChronoUnit.DAYS`)로 했는지 30일 고정인지 명확히. 윤년·31일 결제일의 다음달 처리 설명. "비즈니스 합의 정책, 변경 시 Calculator 수정 구조".

### Q4-8. 무료체험 중 빌링키 등록했다가 종료 직전 삭제로 결제 회피 가능한가?
- **왜**: 비즈니스 로직 취약점(OWASP Business Logic).
- **핵심**: 자동전환 시점 빌링키 존재 사전검증, 없으면 결제 없이 `cancelled`. "종료 N일 전 결제수단 등록 필수 알림 + 없으면 자동 해지" 정책으로 UX+보안 동시.

### 🔥 Q4-9. 추천인 리워드 멱등 지급을 어떻게 보장했나? <span>(실코드 정정 — cancun-api)</span>
- **왜**: 돈이 걸린 지급의 "정확히 1회"를 분산락 없이 어떻게 하는지.
- **핵심 (정정됨)**: ~~`(memberId, rewardDate)` 유니크~~ 가 아니라 **조건부 `UPDATE ... SET GRANTED WHERE status=PENDING`의 row count로 선점 → 같은 트랜잭션에서 포인트/쿠폰 발급**. 동시 배치 2개가 돌아도 진 쪽은 row 0 → skip. 외부 분산락·outbox 불필요. PK는 `(membershipId, promotionId)`(1딜=1리워드). "정확히 1회는 모두 한 트랜잭션에서 커밋되기 때문."

### Q4-10. 리워드 D+8 기준과 환불 처리는? <span>(실코드)</span>
- **왜**: 결제·리워드 엣지 케이스를 정책 수준에서 고민했는지.
- **핵심**: D+8 = 첫 결제 + 8일(전액환불 가능기간 종료) + 1h 마진. **D+8 이내 환불이면 배치 지급 대상에서 제외**(첫 결제 `MIN(paidAt)` 기준 `PAYMENT_CANCEL` 검사). **지급 후 환수(클로백)는 미구현 — 단일 USER_REFERRAL 채널은 D+8로 충분히 방어, 30일 클로백은 백로그로 인지.** "버그 아니라 범위 결정"으로 답할 것.

### 🔥 Q4-11. 추천코드 셀프 추천·가짜 피추천인 자가파밍(Sybil)은? <span>(실코드)</span>
- **왜**: "그로스 루프 = 어뷰징 루프". B2B referral fraud의 핵심.
- **핵심**: 자기추천 차단(추천인==본인 userId), 추천 트랙 쿨다운 **999개월(생애 1회)**, 키=`(사업자번호, 종사업자번호, plan)` NULL-safe(`coalesce ''`). **B2B 사업자번호 유니크가 구조적 방어.** ⚠️ 잔존 약점 선제 인정: *같은 운영자가 다른 사업자번호 shell 가입자*를 만들어 자가소비+D+8후 환불 = userId만으론 못 막음 → **fraud 휴리스틱(카드BIN·기기·IP·사업자 군집) + 클로백**이 개선안. **블랭킷 캡은 정상 파워추천인(어필리에이트 의도)을 훼손하므로 정답 아님.**

### Q4-12. 환불 자체의 멱등성(이중 환불)은? <span>(논리 비대칭 보강)</span>
- **왜**: 결제는 `(memberId,billingDate)` 유니크로 막았는데 환불은? 더블클릭·재시도 시 이중 환불 = 금전 손실.
- **핵심**: 환불도 **토스 Idempotency-Key 헤더 + DB측 `paymentKey당 누적 환불액 ≤ 결제액` 불변식을 비관락으로 검증**. 부분환불 history가 단일 진실 원천. "결제 멱등성과 대칭으로 설계"가 정답. (현재 이력서에 환불 멱등성 서술이 없으니 답변 준비 필수)

### Q4-13. 정액 할인이 정가를 초과하면? <span>(실코드)</span>
- **왜**: 결제 금액 경계 처리 디테일.
- **핵심**: 음수 방지 **0원 클램프**(1원 아님 — PG가 1원 결제를 거부하므로 0원). 무료 처리 흐름과 정합.

---

## 5. 아키텍처 공통 (시니어 판별)

### Q5-1. "비동기 재시도 큐"가 알림톡·ERP·Deauth 3곳에 등장 — 같은 구현체 공유? 별도?
- **왜**: 횡단 관심사 공통화 설계 능력. 시니어는 반복 패턴 인식.
- **핵심**: 별도면 "중복 인식했으나 범위 달라 추상화 비용 높아 개별 구현, 공통 모듈화는 다음 단계." 공통화면 "RetryQueue 도메인 서비스 만들고 어댑터별 주입." "얼마나 했나"보다 "반복을 봤을 때 반응".

### Q5-2. 상태 전이(SOCIAL_CREATED→...) guard 로직은 서비스 if문인가 도메인 객체 내부인가?
- **왜**: 서비스 레이어 if = 빈혈 도메인 모델. 시니어가 차이 인식하는지.
- **핵심**: enum `transitionTo(next)`/`allowedTransitions()`로 도메인 레이어 차단이 이상적. 서비스 if면 "현재 전이 단순해 선택, 복잡해지면 Spring State Machine 고려" 근거 제시.

### Q5-3. 멤버십 해지예약 상태에서 권한(canOrder 등) 회수 시점은? (STAR1↔STAR4 연결)
- **왜**: 상태머신과 권한 모델의 결합 지점을 설계한 사람만 정확히 답함.
- **핵심**: 해지예약=이미 결제한 기간이라 권한 유지, 실제 cancelled 전환 시 회수. 회수 메커니즘=JTI 블랙리스트(즉시) vs 만료(1h) 중 무엇·왜. "연체→자동해지 시 즉시 회수=JTI 블랙리스트"와 연결.

### Q5-4. 트래픽 10배면 이 아키텍처에서 먼저 병목 되는 곳은?
- **왜**: 현재 규모엔 맞다 인정하면서 한계를 아는지(종합 질문).
- **핵심**: SigNoz EC2 단독→ClickHouse 쓰기·디스크(수직 스케일/클러스터). Redis 단일→ElastiCache 클러스터/Read Replica. Scheduler 배치→처리시간이 다음 배치 전 미완료(Spring Batch 청크/파티셔닝). 확장 경로를 명확히.

### Q5-5. Redis가 RBAC 캐시의 단일 진실 원천인데 Redis 장애 나면?
- **왜**: Redis 가용성 = RBAC 가용성. fallback 없으면 전체 접근 불가.
- **핵심**: DB 직접조회 fallback 또는 circuit breaker. ElastiCache Multi-AZ replica 자동 failover. 단일이면 "인지한 트레이드오프". 권한캐시 Redis와 JTI 블랙리스트 Redis 분리 여부로 장애 범위 다름.

---

> 📌 **모의면접 추천 순서**: 🔥 표시(11개)부터. 특히 빈칸과 직결된 Q2-2(SLO), Q3-1~3(N+1), Q4-1~3(멱등성/멀티인스턴스)은 답변을 글로 써보고 입으로 1번 말해볼 것. "모르면 정직하게 + 향후 방향 제시"가 시니어 면접의 안전한 패턴.
