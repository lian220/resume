# 본문 `[확인]` 항목 검증 체크리스트

> 작성: 2026-06-07 · 2차 전문가 검토에서 본문에 `[확인]` 마커로 단 8개 항목.
> 코드 repo(caribbean-api / caribbean-api-gateway / cancun-api)가 로컬에 없어 본인이 IDE에서 직접 확인용.
> 판정 후: **사실이면 `[확인]` 마커 삭제 + .html 반영 / 다르면 본문 수정**.

---

## STAR 1 — caribbean-api / caribbean-api-gateway

### ① 토큰 RBAC 캐시(10분) 역인덱스 무효화 — "즉시 0초" 주장 검증
- **어디**: 권한 전체 무효화 API + 토큰 RBAC 캐시(SHA-256 키) 정의부 (gateway 또는 auth)
- **grep**: `@CacheEvict` · `tokenHash` · `SHA-256`/`sha256` · 무효화 API 메서드 · `userToToken`/역인덱스(Redis `SADD`/`SMEMBERS`)
- **판정**:
  - 무효화 시 **토큰 캐시까지 evict**(유저→토큰해시 역인덱스로) → "즉시(0초)" 유지, 마커 삭제
  - role 캐시만 evict, 토큰 캐시는 TTL 대기 → 본문을 **"역할 캐시 즉시 / 토큰 캐시 최대 10분, JTI 블랙리스트 교차 차단으로 보강"** 으로 수정

### ② 수평 테넌트(brandId) 검증 — IDOR 방어 범위
- **어디**: `DomainPermissionEvaluator` 체인 / `TargetRosUserPermissionLevelEvaluator`
- **grep**: `brandId` · `storeId` · `tenant` · `role_priority` 비교 주변
- **판정**:
  - 대상 객체 검증 시 `role_priority`(수직) + **brandId/storeId 일치(수평)** 둘 다 → 마커 삭제
  - 수직만 → 본문에서 수평 문장 제거하고 **"수평 테넌트 격리는 개선점"** 으로 (또는 면접 답변용으로만)

### ③ 목록 API 권한 필터 방식 — N+1 인가 회피
- **어디**: 운영자 유저/계정 **목록 조회** Controller·Service·QueryDSL
- **grep**: `@PostFilter` · `hasPermission` (목록 경로) · 목록 쿼리 `where(` 권한 조건
- **판정**:
  - 권한 조건을 **WHERE로 쿼리에 포함**(행별 평가 없음) → "N+1 회피" 유지
  - 응답 후 행별 `hasPermission`/`@PostFilter` → 본문에서 회피 문장 빼고 **"단건만 객체평가"** 로

### ④ fallback(`RbacHeaderInjectingFilter`) 토큰 자체 재검증 여부
- **어디**: `RbacHeaderInjectingFilter`
- **grep**: `X-Gateway-Header` 체크 분기 · 토큰 파싱/검증 호출(`JwtDecoder`·`parse`·`/rbac/permissions`)
- **판정**:
  - 미경유 시 헤더 불신 + **토큰 직접 검증 후 권한 재생성** → "토큰 자체 재검증" 유지(우회 차단 OK)
  - 헤더를 그대로 신뢰 → ⚠️ **보안 갭** — 본문 수정 + 면접 시 "네트워크 격리 전제" 명확히

### ⑤ 게이트웨이 마커 서명 / traceparent 전파
- **어디**: `RbacAuthorizationFilter` 헤더 주입부
- **grep**: `X-Gateway-Header` 값 설정(정적 문자열 `"true"` vs HMAC/서명/JWT) · `traceparent` · `tracestate`
- **판정 a (마커)**: 정적 문자열 → 본문 "서명 기반 강화는 백로그"로 정직하게 / 서명·mTLS면 그 사실 명시
- **판정 b (trace)**: `traceparent` 전파 코드 있거나 OTel Agent가 reactor 자동 전파 확인 → 유지 / 없으면 "검증 예정"

---

## STAR 3 — caribbean-api (notes 모듈)

### ⑦ 3종 컨텐츠 STI / 1:1 문의 Inquiry aggregate
- **어디**: Notice/Agreement/Document 엔티티, 1:1 문의(Inquiry/Reply) 엔티티
- **grep**: `@Inheritance` · `@DiscriminatorColumn` · `@DiscriminatorValue` · `Notice`/`Agreement`/`Document` 클래스 · `Inquiry`/`Reply`/`@OneToMany`
- **판정 a (상속)**:
  - `@Inheritance(strategy = SINGLE_TABLE)` → "STI" 유지
  - 별도 테이블 3개(`JOINED`/`TABLE_PER_CLASS`/독립 엔티티) → 본문을 실제 전략으로 수정
  - 단일 엔티티 + `type` enum 컬럼(상속 아님) → "단일 엔티티 + 타입 구분"으로 수정
- **판정 b (thread)**: Inquiry 1:N Reply면 "aggregate" 유지 / 단일 레코드+상태면 수정

### ⑧ 알림톡 Transactional Outbox 여부
- **어디**: 알림톡 발송 서비스
- **grep**: `outbox`/`Outbox` 테이블·엔티티 · `@TransactionalEventListener` · `@Async` · 발송상태(`PENDING`/`SENT`) 컬럼 · 폴링 배치
- **판정**:
  - 게시글 트랜잭션에 outbox 레코드 같이 저장 + 별도 relay/배치 발송 → "Transactional Outbox" 유지
  - `@Async`/직접 호출 + retry만 → 본문을 **"발송상태 PENDING 선기록 후 배치 재처리"** 로 (Outbox 단어 빼기) — dual-write 유실 가능성 정직 인정

---

## STAR 4 — cancun-api

### ⑥ 환불 멱등 처리
- **어디**: 멤버십 환불/결제취소 서비스 (토스 cancel API 호출부)
- **grep**: `cancel`/`refund` · `Idempotency`/`idempotencyKey` · `PAYMENT_CANCEL` · `누적`/`cumulative` 환불액 · `@Lock`/`for update` · 이미환불 상태 체크
- **판정**:
  - 토스 Idempotency-Key OR 환불상태 유니크 OR 누적환불액 검증/락 중 하나라도 → "환불 멱등" 유지(어느 방식인지로 문구 정정)
  - 아무 방어 없음 → 본문에서 환불 멱등 문장 제거 + **"환불 멱등성은 개선점"**(이중환불 가능성 인지)

---

## 판정 요약 템플릿 (확인 후 채우기)
| # | 항목 | 결과(O/X/부분) | 실제 구현 | 본문 조치 |
|---|---|---|---|---|
| ① | 토큰캐시 역인덱스 무효화 | | | |
| ② | 수평 테넌트 brandId | | | |
| ③ | 목록 권한 WHERE pushdown | | | |
| ④ | fallback 토큰 재검증 | | | |
| ⑤ | 게이트웨이 마커 서명/trace | | | |
| ⑥ | 환불 멱등 | | | |
| ⑦ | 3종 STI / Inquiry aggregate | | | |
| ⑧ | 알림톡 Outbox | | | |
