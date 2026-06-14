# 사이드 프로젝트 STAR 초안 — Alpha Foundry (quant-jump-stock)

> **검토용 초안.** 모든 내용은 `quant-jump-stock` 프로젝트의 문서(ADR·테스트결과·인프라문서)·git 히스토리에 실제로 기록된 사실에 근거함. 추측·미확인 항목은 `[확인]` / `[추론]`으로 표기. **사용자 확인 후 메인 이력서(lian-resume-star.md)에 병합** 예정.
>
> 원칙: [[feedback_resume_factbased]] — 확인된 사실만, 임의 추정치 금지.

---

## 프로젝트 한 줄 소개 (이력서 사이드 프로젝트 섹션 헤더용)

> **Alpha Foundry (alphafoundry.app)** — AI 기반 퀀트 투자 플랫폼을 **기획·설계·개발·배포·운영까지 1인 풀스택**으로 구축. Spring Boot/Kotlin(Core API) + FastAPI/Python(Data/ML Engine) + Next.js(웹·백오피스) 4개 서비스를 **GCP Cloud Run 서버리스**로 운영 중 (2026-02~, 약 1,000 파일·100K+ LOC, 214 커밋). **회사 업무와 동일한 Spring Boot/Kotlin 스택을 오너십 끝까지** 경험.

---

## STAR A. 추천 점수 모델 SSoT 재설계 (0~100 정규화 가중합) ⭐⭐ — **메인 추천**

> **한 줄 헤드라인**
> 운영 중 발견한 "점수 산식 결함 6종 + Python↔Kotlin 이중정의 드리프트"를 **ADR로 근거화 → 단일 SSoT(scoring_spec.yaml)로 재설계** → 462 표본 실측 재보정 + 회귀 테스트 200+로 검증한 **데이터 기반 의사결정 경험**

**Situation**
- 운영 데이터(alphafoundry.app, 2026-05-20~28, 189 종목-일) 기준 **전 종목이 B·C 등급, 최고 종목도 52/100점**으로 추천 점수가 비정상적으로 낮았고, **모바일/PC 점수 기준이 달라 보이는** 사용자 신고 발생.
- 원인 분석 결과 점수 모델에 구조적 결함 6종 확인 (ADR 0006 기록):
  - **만점 도달 불가** (composite_max=7.4지만 실효 상한 ~5.45),
  - **weight 모순** (tech가 weight 0.4로 최대인데 실제 기여도는 최소),
  - **이중 스케일 버그** (숫자는 0~100 display인데 색·등급은 0~7.4 원점수 → "52점인데 녹색"),
  - **0점 쏠림** (0.5 컷오프로 ai 21/42·sentiment 18/42가 0점),
  - **sentiment 분모 불일치** (실범위 ±0.35인데 분모 10),
  - **SSoT 드리프트** (yaml(Python) ↔ Kotlin 중복정의, `PredictionService.kt`의 `*7.5` vs yaml 7.4 등 값 분기).

**Task**
- 산식을 **단일 원천(SSoT)으로 통합**하고, 0~100 직관적 스케일로 재정규화하며, 결함 6종을 모두 해소하되 **회귀 없이** 배포.

**Action**
- **결정의 근거화 (ADR)**: 문제·대안·결정을 [[ADR 0006: 추천 점수 모델 재설계]]로 문서화 (2026-06-07 Accepted). 기존 ADR 0002(Negative AI Veto)를 superseded 처리하며 의사결정 이력을 체계적으로 관리.
- **산식 재설계**: 축별 max 제각각(10/3.5/10)·컷오프 방식 → **축별 0~1 정규화 후 weight 가중합 → ×100** 구조로 전환. `composite_100 = (w_tech·(tech/3.5) + w_ai·(ai/10) + w_sent·(sent/10)) × 100`, weight 재조정(tech 0.5 / ai 0.3 / sentiment 0.2).
- **컷오프 제거 → 선형 매핑**: sentiment `(clip(raw,±0.35)+0.35)/0.7`, ai `clip(0.5+rise_pct/40,0,1)` — 하락 종목도 0점 대신 연속적 저점수. **결측은 0점이 아니라 축 제외 후 weight 재정규화**로 처리.
- **SSoT 단일화**: `scoring_spec.yaml`(v2.1.0)을 유일 원천으로 삼고 Kotlin/FE는 pass-through, 등급 임계(S≥82/A≥77/B≥68/C≥58)는 fallback만 보유 → Python↔Kotlin↔FE **값 분기 0건**.
- **데이터 기반 재보정**: 11거래일 × 42종목 = **462 표본**(2026-05-12~06-04) percentile로 등급 임계 보정 ("상위 ~10% = S").
- **회귀 안전망**: 점수 SSoT를 **PR 5건(#109~#114)으로 분할**, golden CSV 50건 frozen + property test(Hypothesis) 5건 포함한 테스트 계획 수립 후 단계 배포.

**Result**
- **0점 쏠림 해소**: present 축 0점 비율 sentiment 0.4%·ai 2% (AS-IS는 ai 50%·sent 43%) → <10% 목표 충족.
- **이중 스케일 버그 0건**: 모바일(390px)/PC(1280px) 전 화면 동일 스케일 (Playwright E2E 검증). 홈 평균 AI 점수 표시 버그(구 스케일 100점 잔존)도 발견·수정.
- **등급 분포 정상화**: 462표본 기준 S 11%·A 13%·B 25%·C 24%·D 27% (mean 65.97 / std 15.1), 기존 "S·A 영구 전무" 해소.
- **회귀 검증 통과**: Python pytest **200 passed**, Kotlin gradle BUILD SUCCESSFUL, Frontend vitest 19 passed + tsc/eslint 에러 0.
- **SSoT 일치 0 분기**: yaml↔Kotlin↔FE 산식·등급 경계 완전 일치 → 이중정의 드리프트 재발 차단.

**키워드**: `데이터 기반 의사결정` · `ADR (Architecture Decision Record)` · `SSoT (Single Source of Truth)` · `점수 정규화 모델 설계` · `회귀 테스트 (pytest 200 / golden CSV / property test)` · `percentile 재보정` · `Playwright E2E` · `Python↔Kotlin 산식 일치성`

---

## STAR B. 1인 운영 서버리스 클라우드 아키텍처 전환 + 비용 최적화 ⭐⭐

> **한 줄 헤드라인**
> Kafka·Quartz·GCE VM 기반 상시가동 구조를 **GCP Pub/Sub + Cloud Scheduler + Cloud Run(scale-to-zero)** 서버리스로 전면 전환 — **월 운영비 ~$30 → ~$5 (약 83% 절감)**, `git push` 자동 배포까지 1인 운영 가능한 구조로 재설계

**Situation**
- 1인 개발·운영 환경에서 초기 구조(Kafka+Zookeeper, Quartz Scheduler, GCE VM)는 **상시 가동 자원**을 요구해 비용·운영 부담이 컸음.
  - Kafka+Zookeeper: 합산 메모리 1GB+ 상시 점유, 1인 환경에서 브로커 장애 대응 불가, scale-to-zero 불가.
  - Quartz: JVM 스레드풀 상시 점유 + QRTZ_* 메타 테이블 11개 PostgreSQL 점유, 스케줄 변경마다 재배포.
  - GCE VM(e2-medium): 월 ~$30 고정비, SSH 수동 배포(git pull→빌드→재시작), OS 패치 등 인프라 관리 부담.

**Task**
- Cloud Run scale-to-zero와 양립하는 **완전 서버리스 아키텍처**로 전환하고, 고정비를 제거하며, 배포를 자동화.

**Action**
- **메시징 전환 (ADR 0001)**: Kafka → **GCP Pub/Sub** 관리형으로 전환 → 브로커 운영 부담 제거 + 사용량 과금 + Cloud Run과 통합.
- **스케줄러 전환 (ADR 0003)**: Quartz → **GCP Cloud Scheduler** 전환, Quartz 라이브러리·스레드풀·QRTZ_* 테이블 11개 완전 제거. 스케줄을 **Terraform(IaC)**으로 관리.
- **컴퓨팅 전환 (ADR 0004)**: GCE VM → **All Cloud Run**(Frontend·Backoffice·Core API·Data Engine 4서비스 동일 배포 모델). `git push origin main` → 자동 빌드·배포(~10분), revision 기반 즉시 롤백.
- **세부 비용 튜닝**: Google LB → Cloudflare Free($18/월↓), pd-ssd → pd-standard($4/월↓), Data Engine cpu-throttling($15/월↓), VM 완전 제거($7/월↓) 등 항목별 최적화.
- **시작 성능 최적화**: Core API에 **GraalVM Native Image** 적용 — 시작 ~2초, RSS ~170MB로 scale-to-zero 콜드스타트 부담 완화 `[확인: 콜드스타트 체감 효과 정량]`.

**Result**
- **월 운영비 ~$30 → ~$5 (약 83% 절감)**. 누적 항목별 절감 약 $52/월 (LB $18 + cpu-throttling $15 + VM $7 + storage $4 등).
- **배포 자동화**: 수동 SSH 배포 → `git push` 트리거 CI/CD(~10분), revision 롤백.
- **운영 부담 제거**: 브로커·스케줄러 스레드풀·VM OS관리 제거 → 1인 운영 지속 가능.
- **현재 4개 서비스 프로덕션 운영 중** (alphafoundry.app, scale-to-zero).

**키워드**: `GCP Cloud Run (scale-to-zero)` · `Cloud Pub/Sub` · `Cloud Scheduler` · `Terraform (IaC)` · `GraalVM Native Image` · `Cloudflare` · `비용 최적화 (83%↓)` · `CI/CD 자동 배포` · `서버리스 아키텍처 전환` · `ADR`

---

## STAR C. 운영 장애 대응 → fail-fast 설계 + 운영 규칙·모니터링 체계화 ⭐

> **한 줄 헤드라인**
> 추천 서비스 장애(DB connection pool stale 등)를 **사후 회고로 근본원인 분석 → fail-fast 부팅 차단 설계 + Cloud Run 운영 규칙(R1~R9) + Cloud Monitoring 알림 체계**로 재발 방지까지 마무리한 **장애 대응 풀사이클**

**Situation**
- 2026-05 운영 중 추천 기능 장애 2건 발생:
  - **2026-05-22**: qjs-core가 MongoDB localhost로 fallback → 1~2시간 추천 서비스 마비 (connection pool stale).
  - **2026-05-18~28**: Vertex AI v24 stale package + PostgreSQL pool stale로 추천 마비 `[확인: "8일 마비"가 상시 장애인지 단속적 장애인지 — 사고 문서 재확인 필요]`.

**Task**
- 단순 복구를 넘어 **근본 원인을 회고로 규명**하고, 동일 유형 장애가 재발하지 않도록 설계·운영 규칙·모니터링을 정비.

**Action**
- **fail-fast 설계**: prod 프로파일에서 `DB_PASSWORD`·`MONGODB_URI`를 **기본값 없이 선언** → 환경변수 누락 시 부팅 즉시 실패(localhost fallback로 잘못 뜨는 것 차단). 암호화 키 미설정 시에도 prod 부팅 차단.
- **운영 규칙 문서화**: 사고 회고 기반 **Cloud Run 운영 규칙 R1~R7(2026-05-22)** 수립, 이후 **R8(CI/CD 일관성)·R9(PostgreSQL pool pre-ping) 추가(2026-05-29)**.
- **모니터링 체계 구축**: Cloud Monitoring **alert 4개 + log metric 2개 + uptime check 5개**를 gcloud CLI로 구성, ERROR/WARNING을 **Slack webhook**으로 발송(HTTP 200 검증 완료).
- **보안 강화 병행**: 장애 대응 과정에서 시크릿 암호화를 **AES-CBC → AES-GCM(ADR 0005)**으로 전환, V1(ECB)→V2(GCM) 마이그레이션 진행.

**Result**
- **fail-fast 도입으로 "잘못된 fallback으로 조용히 뜨는" 장애 패턴 차단** — 설정 오류는 배포 즉시 표면화.
- **운영 규칙 R1~R9 + 모니터링 알림**으로 장애 가시성 확보(로그 grep 의존 → 능동 알림).
- 1인 운영 환경에서 **사고 → 회고 → 규칙화 → 자동 감지**의 SRE 사이클을 실제로 정착.

**키워드**: `장애 대응 (Incident Response)` · `Post-mortem 회고` · `fail-fast 설계` · `Cloud Monitoring (alert/uptime/log metric)` · `Slack 알림` · `운영 규칙(Runbook) 체계화` · `AES-GCM 암호화 전환` · `Connection Pool 안정화` · `SRE`

---

## 정량 근거 부족 / STAR 부적합 (참고)

| 주제 | 상태 |
|------|------|
| 스케줄러 레이스 컨디션 (CPI/NFP 타이밍) | 문서에 정량 분석 없음 → 면접 구두 소재로는 가능, STAR 부적합 |
| AI 예측 정확도 / 백테스트 수익률 | 지표 미발견 → 수치 인용 금지 |
| VIX 거시 게이트 효과 | KPI 측정 "예정" 언급만, 실측 통계 없음 |
| Hexagonal 아키텍처 | 코드엔 구현돼 있으나 별도 ADR 없음 → 포트폴리오 본문 소재로 활용 |

---

## 다음 단계 (검토 요청 사항)

1. **STAR 3개 중 이력서에 넣을 것 선택** — A(점수 재설계)는 데이터 기반 의사결정으로 가장 강력, B(비용/아키텍처)는 정량 효과 명확. C는 SRE 역량. 2개 권장(A + B 또는 A + C).
2. **`[확인]` 표기 항목**(8일 장애 성격, 콜드스타트 효과 등) 사실관계 확정.
3. 확정되면 `lian-resume-star.md`에 정식 STAR로 병합.
