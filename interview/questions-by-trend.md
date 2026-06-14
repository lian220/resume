# 최신 트렌드 · 연차별 · 기본지식 · AI 에이전트 면접 질문 (2026)

> 출처: 2026 면접 트렌드 웹검색 (하단 Sources) · 짝 문서: [`questions-by-project.md`](questions-by-project.md)(경험별), [`questions-by-tech.md`](questions-by-tech.md)(기술 개념별)
> 대상: **7년 차 백엔드 시니어**. 답변 *포인트*는 본인 경험(SFN·머스트잇·Alpha Foundry)과 **반드시 연결**할 것.

---

## A. 2026 최신 트렌드 질문 (공통)

**Q. AI 도구를 개발 워크플로우에 어떻게 활용하나? (가점 질문, 감점 없음)**
- *포인트*: 솔직하게. 코드 생성·리뷰 보조로 쓰되 "AI를 잘 쓰려면 결국 설계·검증을 잘해야 한다"는 관점. Alpha Foundry에서 LLM/Vertex AI를 **프로덕트 기능**으로 통합한 경험 연결.

**Q. LLM을 실제 프로덕트 기능에 넣어본 경험이 있나?**
- *포인트*: Alpha Foundry — ChatGPT(머스트잇 시리얼 추출)·Vertex AI(예측). 핵심은 **환각 방어·검증·결정론적 경계** 설계.

**Q. 비용을 의식한 설계 경험은? (cost-per-request가 latency만큼 중요)**
- *포인트*: Cloud Run scale-to-zero($30→$5), SigNoz self-hosted(변동비→고정비), Redis 캐시 TTL 차등. "돈 안 태우고 스케일하는 시스템".

**Q. 키워드 나열이 아니라 — 가장 깊게 고민한 아키텍처 의사결정 하나는?**
- *포인트*: 게이트웨이 중앙 RBAC(SPOF vs 단순성), 결제 멱등(분산락 vs DB), 관측성(SaaS 변동비 vs self-hosted 고정비) 중 1개를 트레이드오프 중심으로.

---

## B. AI 에이전트 / LLM 엔지니어링 질문 (2026 hot) 🔥

> "eval 방법론이 새로운 시스템 설계다." 빌드 경험(환각 안 나는 RAG, 데드락 안 나는 멀티에이전트, 회귀 잡는 eval)을 묻는다.

**Q. RAG 시스템을 설계하라 (예: 고객지원 챗봇). 구성요소와 트레이드오프는?**
- *포인트*: 임베딩→벡터검색(top-k)→리랭킹→컨텍스트 주입→생성. 트레이드오프: chunk 크기(정밀도 vs 맥락), top-k(recall vs 노이즈/비용), 인덱스(HNSW vs IVF).

**Q. RAG/LLM 출력의 환각을 어떻게 막고 평가하나?**
- *포인트*: **검증 레이어**(출처 grounding, faithfulness), 결정론적 값은 LLM 밖에서 계산. 평가는 **golden set + LLM-as-judge**, RAGAS(Faithfulness/Answer Relevance), NDCG·MRR·precision@k. → Alpha Foundry 점수 검증(golden CSV·property test)과 동일 사고.

**Q. Tool use(function calling)와 agentic RAG의 차이는?**
- *포인트*: 전통 RAG = 1회 수동 lookup. **Agentic** = 검색을 tool로 두고 에이전트가 다단계·추론적으로 호출. 실패 모드(루프·데드락·tool 오용)와 guardrail 필요.

**Q. 프런티어 모델을 매 호출 쓰면서 latency를 800ms 이하로 어떻게?**
- *포인트*: 캐싱(프롬프트·결과), 작은 모델 라우팅, 병렬 tool 호출, 스트리밍, 불필요 단계 제거.

**Q. 멀티 에이전트 시스템의 실패 모드와 방지책은?**
- *포인트*: 무한 루프·교착·컨텍스트 폭증·tool 오용 → 단계 상한·타임아웃·검증 에이전트·결정론적 게이트. (워크플로우식 결정론 + LLM 판단 분리)

**Q. MCP(Model Context Protocol) / 도구 표준화에 대해 아나?**
- *포인트*: 에이전트가 외부 도구·데이터에 표준 인터페이스로 접근하는 프로토콜. 도구 스키마를 온디맨드 로드해 컨텍스트 절약. (개념 수준이라도 인지)

**Q. LLM 비용·토큰을 어떻게 관리하나?**
- *포인트*: 프롬프트 캐싱, 컨텍스트 최소화, 모델 티어링(쉬운 건 작은 모델), 배치, rate limit.

---

## C. 7년 차 시니어 레벨 질문

> 평가 포인트: **아키텍처 리더십 · 운영 성숙도 · 모호성 대처 · 트레이드오프 명료화**. "컴포넌트만 나열하고 트레이드오프 안 하면 탈락."

**Q. (시스템 설계) X를 10배 트래픽으로 확장한다면? (결제/추천/소통관리 중)**
- *포인트*: 병목 식별 → 파티셔닝·비동기·캐시·읽기복제. **SQL vs NoSQL, 일관성 vs 가용성, 동기 vs 비동기**를 명시적으로 저울질. 멱등성 유지.

**Q. 기술 스택·설계를 어떻게 선정하나? 설계 문서는 쓰나?**
- *포인트*: Alpha Foundry **ADR(0001~0006)**로 대안·결정·결과 기록한 실제 사례. "왜 안 골랐나"까지.

**Q. 후배 멘토링·코드리뷰는 어떻게 하나?**
- *포인트*: SFN 관측성을 **팀 표준으로 전파**(자발 제안→정착)한 경험. 리뷰에서 "왜 이렇게"를 묻는 문화.

**Q. 출시 후 운영(오너십)을 어떻게 책임지나?**
- *포인트*: fail-fast, 실패 격리+수동 게이트, 운영 규칙 R1~R9, 사고→회고→규칙화→자동감지(SRE 사이클). 회귀 0건.

**Q. 모호한 요구사항이나 촉박한 일정은 어떻게 대처했나? (SOAR)**
- *포인트*: ROS 신규 도메인을 제로에서 BE 단독 구축한 사례를 Obstacle 중심으로.

**Q. 기술 부채를 언제 갚고 언제 미루나?**
- *포인트*: 리스크×빈도로 우선순위. 예: 결제 멱등은 즉시(돈), 30일 클로백은 백로그(빈도·영향 낮음) — 실제 판단 사례.

---

## D. 기본 지식 (CS/백엔드, 트렌드·내 경험 연결)

> 각 답변을 **본인 프로젝트와 연결**하면 "외운 지식"이 아니라 "쓴 지식"이 된다.

| 주제 | 예상 질문 | 내 경험 연결 |
|---|---|---|
| **트랜잭션 격리** | 격리 수준·팬텀/더티리드, 데드락 회피 | 결제 트랜잭션 경계 분리 |
| **멱등성** | at-least-once에서 정확히 1회 보장? | 결제 idempotency 키, 리워드 조건부 UPDATE |
| **인덱스** | 복합/커버링 인덱스, 실행계획, N+1 | ROS N+1 제거 + 복합 인덱스 |
| **캐시 전략** | write-through/back/aside, 무효화·정합성 | 찜하기 write-back, RBAC Redis 무효화 |
| **분산 트랜잭션** | 2PC vs Saga vs Outbox | ROS Transactional Outbox(dual-write 유실 방지) |
| **MSA** | 서비스 분리 기준, gRPC/REST, 장애 전파 | Alpha Foundry 4서비스, 게이트웨이 |
| **컨테이너/오케스트레이션** | Docker·k8s, 무중단 배포·롤백 | Cloud Run revision 롤백, K8s/ArgoCD(머스트잇) |
| **분산 일관성** | CAP, 최종 일관성, 합의 | Pub/Sub 비동기, ERP 재시도 큐 |
| **동시성** | 락·CAS, 비동기 I/O | 크롤링 동기→비동기(8H→1H) |
| **메시징** | Kafka/Pub/Sub, 순서·중복·백프레셔 | Kafka→Pub/Sub 전환(ADR 0001), MSK 커넥터 |

---

## Sources (2026 트렌드)
- [AI Engineer Interview Questions 2026 — Medium(100+ interviews)](https://adilshamim8.medium.com/every-ai-engineer-interview-question-you-need-to-know-in-2026-from-100-real-interviews-b5b7ae4b961a)
- [RAG Interview Questions 2026 — DataCamp](https://www.datacamp.com/blog/rag-interview-questions)
- [LLM & RAG Questions (OpenAI/Anthropic/Google) — CallSphere](https://callsphere.ai/blog/llm-rag-interview-questions-2026-openai-anthropic-google)
- [Agentic AI Interview Questions 2026 — AEM Institute](https://aemonline.net/blog/25-advanced-agentic-ai-interview-questions-for-2026-with-answer-updated-february-2026/)
- [System Design Interview Questions for Senior Engineers 2026 — KORE1](https://www.kore1.com/system-design-interview-questions/)
- [Google Senior SWE Interview 2026 — Interview Kickstart](https://interviewkickstart.com/interview-questions/companies/google/senior-software-engineer)
