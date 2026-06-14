// ============================================================================
//  이력서 단일 소스 (Single Source of Truth)
//  여기만 고치고 `npm run build` 하면 4개 포맷(career/star/paar/summary)이 전부 갱신됩니다.
//  - results 의 ok:false = [확인 필요] (본인만 채울 미확정 수치) → 빌드 시 노란 표시
//  - experiences = 스마트푸드네트웍스(현재) PAAR/STAR 대상
//  - career = 시간순 이력서용 회사 목록(이전 경력 포함)
// ============================================================================

export const profile = {
  name: "임도영",
  en: "Lian",
  title: "백엔드 시니어 엔지니어",
  yearsExp: "7년 차",
  email: "lian.dy220@gmail.com",
  phone: "+82 10-9936-1312",
  github: "github.com/lian220",
  portfolio: "github.com/lian220/quant-jump-stock-portfolio",
  blog: "lian220.github.io/catch-lian",
  positioning: "백엔드 시니어 · 인증/인가 · 결제(빌링) · 관측성 ｜ Spring Boot · Kotlin · AWS",
  // 숫자 후킹형 (star/paar/summary 상단)
  introHook:
    '소셜 로그인으로 신규 가입을 <b>일 10명 → 150명(15배)</b>으로 늘리고, <b>결제·환불·리워드 회귀 0건</b>의 멤버십 빌링을 BE 단독 설계한 <b>7년 차 백엔드 엔지니어</b>. 구현보다 <b>"왜 이 설계를 골랐나(트레이드오프)"</b>를 드러내고, 관측성·장애 대응으로 운영 안정성을 끝까지 책임집니다.',
  // 시간순(career) 자기소개 (문단형)
  introLong: [
    "<b>7년 차 백엔드 개발자 임도영입니다.</b> Java·Kotlin과 Spring 기반으로 커머스·핀테크·프랜차이즈 SaaS 도메인에서 웹서비스를 개발해왔습니다. 현재 <b>스마트푸드네트웍스</b>에서 B2B 식자재 이커머스(차별화상회)와 프랜차이즈 본부-점주 SaaS(외식UP ROS)의 <b>인증·인가, 결제(빌링), 신규 도메인 구축</b>을 풀스택으로 주도하고 있습니다.",
    "설계 의사결정과 트레이드오프를 명확히 남기고, 반복 작업을 자동화하며, <b>운영 안정성(관측성·장애 대응)을 끝까지 책임지는 것</b>을 중요하게 생각합니다. 실제로 팀 관측성 표준이 없던 상황에서 OpenTelemetry 기반 SigNoz를 직접 제안·도입해 팀 표준으로 정착시켰습니다.",
    "또한 LLM 기반 생성형 AI 서비스에도 관심을 두고, 개인 프로젝트로 AI 퀀트 분석 플랫폼(<b>Alpha Foundry</b>)을 1인 풀스택으로 구축·운영하고 있습니다.",
  ],
};

export const skills = [
  { cat: "인증/인가", items: "OAuth 2.1(PKCE S256), Spring Authorization Server, 자체 JWT + Refresh Token Rotation, RBAC 3단 모델, 객체레벨 인가(IDOR·OWASP API1/3), PII 마스킹 AOP" },
  { cat: "게이트웨이/분산", items: "Spring Cloud Gateway 중앙 RBAC, 헤더 기반 권한 전파, Redis 분산 캐시 + 무효화 API" },
  { cat: "결제 도메인", items: "토스페이먼츠 빌링키 정기결제, 멱등 배치, 안분 환불, 라이프사이클 상태머신, 추천 그로스 루프" },
  { cat: "관측성", items: "OpenTelemetry, SigNoz(self-hosted), Distributed Tracing, ClickHouse TTL, traceId MDC 연관" },
  { cat: "데이터/신뢰성", items: "JPA N+1 제거·복합 인덱스·Fetch Join, Transactional Outbox, idempotency, exponential backoff" },
  { cat: "언어/플랫폼", items: "Kotlin, Spring Boot, JPA, AWS(EC2), Redis, Kafka, Docker, Kubernetes" },
];

// 스킬 칩(career 하단)
export const skillChips = [
  "Java", "Kotlin", "Spring Boot", "Spring Security", "JPA", "MySQL", "Oracle", "MongoDB",
  "Redis", "Kafka", "OpenTelemetry", "Spring Cloud Gateway", "Docker", "Kubernetes", "AWS", "GCP", "Git", "JavaScript",
];

// ── 스마트푸드네트웍스 핵심 경험 (PAAR/STAR 대상) ─────────────────────────────
export const experiences = [
  {
    id: "auth",
    title: "사용자 인증·인가 시스템 풀스택 (SNS 로그인 + RBAC)",
    headline: "모바일 소셜 로그인(Kakao·Apple OAuth + PKCE)부터 B2B 백오피스 RBAC까지 — 두 프로덕트의 인증·인가를 동일 원칙으로 설계·배포",
    task: "앱 OAuth → 자체 JWT/상태머신, 백오피스 Role-Permission-User RBAC + 캐시 무효화를 한 사람이 일관 설계.",
    problem: "차별화상회는 ID/PW 6단계 가입만 있어 모바일 가입 마찰이 최대 이탈 병목. ROS 백오피스는 권한이 코드 곳곳에 흩어져 본부·점주·관리자 통제 불가.",
    analyze: [
      '토큰 — 외부 IdP 종속(SDK 결합) vs 자체 발급: 토큰 수명·강제 무효화를 직접 통제하려 <b>자체 JWT</b> 선택 (Implicit Grant 배제, OAuth 2.1 방향).',
      '권한 — JWT에 권한 전부 적재(stale·위조 위험) vs 게이트웨이 중앙집행: <b>중앙 집행 + 서버사이드 이중검증</b> 선택, JWT 권한은 FE 분기 전용으로 한정.',
    ],
    action: [
      'OAuth 2.1 PKCE(S256) → 자체 JWT + <b>Refresh Token Rotation</b> — 구 토큰 재사용 시 세션 전체 무효화로 replay 방어',
      'RBAC <b>3단 모델(ROOT/FUNCTION/ENDPOINT) + 객체레벨 인가</b>로 수직 권한 상승 차단(OWASP API1/3), 게이트웨이 중앙 RBAC + Redis 분산 캐시 + 즉시 무효화',
    ],
    results: [
      { t: "신규 가입 <b>일 10명 → 150명 (15배 / +1,400%)</b>", ok: true },
      { t: "준회원 → 정회원 <b>전환율 30.2%</b> (9,723건 중 2,936건)", ok: true },
      { t: "인증 관련 운영 장애 <b>0건</b>, 다운스트림 6서비스 JWT 재파싱 제거", ok: true },
    ],
    keywords: ["OAuth 2.1 PKCE(S256)", "자체 JWT + RTR", "RBAC 3단 모델", "객체레벨 인가(OWASP API1/3)", "Spring Cloud Gateway 중앙 RBAC", "Redis 분산 캐시 + 무효화", "PII 마스킹 AOP"],
  },
  {
    id: "billing",
    title: "멤버십 자동결제(토스 빌링) + 추천인 그로스 루프",
    headline: "토스페이먼츠 빌링키 기반 정기결제를 BE 단독 설계·구현 — 라이프사이클 상태머신, 실패 재시도, 안분 환불, 추천 리워드까지 결제 도메인 풀스택",
    task: "빌링키 발급·관리 → 정기결제 일배치 → 실패 재시도·연체 전환 → 환불·무료체험 → ERP 동기화 → 추천 그로스 루프 전체.",
    problem: "카드 1회 등록 → 매월 자동결제 + 가입·연체·해지 라이프사이클이 필요. 돈이 걸린 흐름이라 중복 결제·이중 지급 = 즉시 사고.",
    analyze: [
      '카드 정보 — 자체 보관(PCI DSS 스코프 부담) vs 빌링키 위임: <b>빌링키만 보관(vault 위임)</b>으로 카드데이터 스코프 자체를 제거.',
      '중복 방지 — 분산락(인프라·운영 추가) vs DB 멱등성: <b>DB 유니크 제약 + 조건부 UPDATE</b>로 외부 락 없이 정확히 1회.',
    ],
    action: [
      '토스 빌링키 + idempotency 키(memberId+billingDate)로 배치 재실행 시 중복 결제 차단, API/DB 트랜잭션 경계 분리로 외부 지연에도 일관성',
      'exponential backoff 재시도 → N회 실패 시 연체 전환, 추천 리워드 <b>D+8 멱등 지급(PENDING→GRANTED, 정확히 1회)</b> + 환불 시 제외',
      '돈이 걸린 흐름은 <b>blind auto-retry 대신 실패 격리 + Slack 알림 + 수동 멱등 재처리</b>',
    ],
    results: [
      { t: "멤버십 자동결제 <b>BE 단독 출시</b> — 카드 1회 등록으로 매월 자동결제, 운영 개입 없이 안정 운영", ok: true },
      { t: "결제·환불·리워드 회수 흐름 <b>회귀 0건</b> — 결제 도메인 안정성 = 매출 안정성", ok: true },
      { t: "카드 등록 회원 결제 성공률 N%, 추천코드 경유 신규 가입 N%", ok: false },
    ],
    keywords: ["토스페이먼츠 빌링키", "정기결제 일배치", "PCI DSS 인지(vault 위임)", "idempotency 멱등 결제", "안분 환불", "라이프사이클 상태머신", "추천 그로스 루프", "실패 격리 + 수동 재처리"],
  },
  {
    id: "ros",
    title: "본부↔점주 양방향 소통관리 도메인 신규 구축 (외식UP ROS)",
    headline: "ROS 1.0 신규 출시에 맞춰 본부↔점주 소통관리(3종 컨텐츠 + 1:1 문의 + 알림톡) 도메인을 제로에서 BE 단독 풀스택 구축 → 출시 후 성능 튜닝까지 완수",
    task: "본부향 + 점주향 + 관리자 3축, 3종 컨텐츠, 알림톡/1:1 문의/조회현황 전 영역 API 설계·구현 + 운영 성능 책임.",
    problem: "ROS 1.0 출시에 본부-점주 채널이 부재 → 공지 미전달·동의서 누락·공문 확인 불가 리스크. 공지/동의서/공문 3종 + 알림톡 + 1:1 문의가 묶인 도메인 필요.",
    analyze: [
      '모델 — 타입별 테이블 분리 vs 공통 라이프사이클 공유: <b>STI(단일 테이블 상속)</b>로 폴리모픽 목록 조회 최적화 (타입별 nullable 수용).',
      '알림톡 정합성 — 단순 retry(dual-write 유실) vs 트랜잭션 분리: <b>Transactional Outbox</b>로 게시글 커밋과 발송요청을 분리 처리.',
    ],
    action: [
      '본부향 CRUD(임시저장/발행) + 점주향 동의·확인 흐름 + 카카오 알림톡 연동을 BE 단독 구축',
      '출시 후 실행계획 분석 → <b>N+1 제거 + 복합 인덱스 + Fetch Join</b>으로 목록/상세 성능 개선',
    ],
    results: [
      { t: "제로에서 <b>39건 API BE 단독 구축</b> (본부향 26 + 점주향 13, 전건 배포완료)", ok: true },
      { t: "QA 이슈 <b>14건 전건 종결</b> (첨부/업로드·권한·알림톡·연동 안정화)", ok: true },
      { t: "구축 기간 N개월, 목록 P95 N→Mms 개선", ok: false },
    ],
    keywords: ["본부↔점주 양방향 도메인", "3종 컨텐츠 라이프사이클(STI)", "Kakao AlimTalk 연동", "Transactional Outbox", "1:1 문의 thread", "JPA N+1 제거 + 복합 인덱스"],
  },
  {
    id: "observability",
    title: "관측성(Observability) 자발 도입 → 팀 표준 정착",
    headline: "운영 디버깅 병목을 스스로 발견 → OpenTelemetry 기반 self-hosted SigNoz 제안·도입 → 팀/전사 관측성 표준 정착",
    task: "비용 예측가능성·데이터 주권·벤더 이식성을 모두 만족하는 관측성 대안을 직접 선정 → 도입 → 확산까지 책임.",
    problem: "운영 장애를 로그 grep으로만 추적 → 디버깅 병목. 팀 관측성 표준 자체가 부재. 대안인 SaaS(Datadog/New Relic)와 AWS 네이티브(X-Ray + CloudWatch) 모두 트레이스·로그 인제스트가 사용량 비례 변동비라 트래픽 증가 시 비용 예측이 어렵고, SaaS는 사용자/매출 데이터 외부 반출 우려까지 존재.",
    analyze: [
      'SaaS(호스트·볼륨 과금) · AWS 네이티브(X-Ray + CloudWatch Logs 인제스트 GB 과금)가 모두 <b>사용량 비례 변동비</b>임을 확인 → <b>기존 운영 EC2의 유휴 리소스에 얹어 추가 인스턴스 비용 0(증분 = EBS 디스크뿐)</b>으로 도입, 트래픽·로그량이 늘어도 비용이 선형 증가하지 않는 구조라 판단해 SigNoz 채택을 직접 설득.',
      '단일 UI·trace-log 상관은 AWS Application Signals로도 가능하나, <b>OTel-native = 백엔드 이식이 자유로워 X-Ray 종속(벤더락인)을 회피</b>하는 점을 차별점으로 판단.',
      '"관측성 다운 ≠ 서비스 다운"이라 <b>HA는 과투자</b>로 판단 — 단일 인스턴스가 합리적.',
    ],
    action: [
      '<b>기존 운영 EC2에 docker-compose로 추가 배포</b>(신규 인스턴스 0, 단일 노드), EBS 스냅샷 백업 + ClickHouse TTL 보존',
      'OTel Java Agent 자동 계측 + 핵심 비즈니스 흐름만 <b>커스텀 span 선별</b>(폭증 방지)',
      'traceId를 <b>Logback MDC 주입</b>해 로그 ↔ 분산 Trace 연관, API별 에러율·P95 대시보드 + Slack 알림',
    ],
    results: [
      { t: "로그 grep 의존 → <b>분산 트레이스 단일 조회로 근본원인 추적</b>", ok: true },
      { t: "<b>데이터 주권 확보</b> (사용자/매출 trace 사내 인프라 유지), 팀 표준 정착", ok: true },
      { t: "<b>SaaS·AWS 네이티브(사용량 비례 변동비) 대비 추가 인스턴스 0(기존 EC2 재활용)</b>으로 연 N만원 절감, 디버깅 N시간 → M분 단축, 확산 N명/N개 서비스", ok: false },
    ],
    keywords: ["OpenTelemetry", "SigNoz self-hosted", "Distributed Tracing", "벤더락인 회피/데이터 주권", "traceId MDC 연관", "EC2 + docker-compose"],
  },
];

// ── 시간순 이력서(career)용 회사 목록 ────────────────────────────────────────
//   첫 항목은 experiences[]를 프로젝트로 사용(useExperiences:true). 이후는 직접 bullets.
export const career = [
  {
    company: "주식회사 스마트푸드네트웍스",
    logo: "SFN",
    period: "2025.05 - 재직 중",
    periodTodo: "정확 입사 연월",
    role: "백엔드 시니어",
    note: "차별화상회 · 외식UP ROS",
    isCurrent: true,
    useExperiences: true,
  },
  {
    company: "주식회사 머스트잇",
    logo: "MUST",
    period: "2023.10 - 2025.05 (1년 8개월)",
    role: "카탈로그 스쿼드",
    projects: [{
      title: "카탈로그 신규 서비스 개발 · 클러스터링 시스템 개발/고도화",
      bullets: [
        "상품을 품번 기준으로 매칭하는 시스템 개발 — 데이터 정합성·효율성 극대화, 확장성·유지보수성 고려한 아키텍처 설계 주도",
        "다량 처리 제어를 위한 메시지큐 도입, 카탈로그 상품 최저가·알림 API 개발",
        "<b>생성형 AI 자동화</b>: ChatGPT API로 상품명 내 시리얼넘버 자동 추출 → 시리얼 자동매칭으로 <b>클러스터링 비율 40% → 60%</b>",
        "<b>외부 상품 크롤링 성능 개선 8H → 1H</b>: 동기→비동기 전환, Cursor 페이징 + Aggregation, Redis로 Rate Limit 카운팅",
        "상품 등록/수정 실시간 감지: <b>CDC + MSK 커넥터</b> 컨슈머로 데이터 일관성 극대화, 이미지 유사도 솔루션 API 연동",
        "외부 채널 상품연동(EP): MongoDB 기반 상품 데이터 관리, 네이버 쇼핑·구글 피드 전송 지원",
        "<b>PDP 성능 개선</b>: 이미지 로딩 캐싱으로 호출 속도 <b>2초대 → 1초 이하</b> (기존 로직 유지, 최소 공수)",
        "찜하기 저장 구조 개선(RDB → Redis), Spring Batch write-back으로 RDB 백업",
      ],
    }],
  },
  {
    company: "엔에이치엔케이씨피(주)",
    logo: "KCP",
    period: "2021.12 - 2023.04 (1년 5개월)",
    projects: [{
      title: "오피셜 사이트 리뉴얼 · 파트너 페이지 리뉴얼",
      bullets: [
        "홈페이지 아키텍처 분리(모놀리식 → 프론트엔드/백엔드 분할), 공지·게시판 REST API 개발로 확장성·유지보수성 향상",
        "가맹점 관리자 페이지 프레임워크 교체(<b>Webwork → Spring Boot</b>) — 결제(포인트/계좌이체/수기)·정산 내역 전체 리뉴얼, ARS 결제 페이지 리뉴얼",
        "간편결제 수단별 그룹 코드 생성/수정 페이지 개발, 작은 규모 특성 고려해 Spring으로 프레임워크 교체",
      ],
    }],
  },
  {
    company: "주식회사 예써",
    logo: "YES",
    period: "2019.11 - 2021.12 (2년 2개월)",
    projects: [{
      title: "줄서기 서비스 성능 개선 · 푸드투어 쇼핑몰 개발 · 파트너 페이지",
      bullets: [
        "<b>줄서기 트래픽/성능 개선</b>: 넘버링 DB 조회·삽입 비효율 개선, <b>RabbitMQ 도입</b>으로 트래픽 분산, JMeter 부하 테스트로 병목 분석 → 서버 안정성·가용성 확보",
        "<b>밀키트 쇼핑몰 풀스택 개발</b>: 모바일/웹 전체 페이지 + REST API, 배송(팀프레시·굿스플로)·결제(네이버페이·나이스페이) API 연동, 주소 찾기·DB 설계, 네이버/구글 SEO 최적화",
        "정산·세금계산서: Popbill·NICEPAY 지급대행 API 연동, <b>Spring Batch 7일 주기 정산 자동화</b>",
        "가맹점 관리자 페이지: Spring Security + JWT 로그인/메뉴 권한, 네이버 식당 50만 건 웹 크롤링 API(검색·DB 설계 포함)",
      ],
    }],
  },
];

export const education = { school: "단국대학교", period: "2013.03 - 2018.03", major: "녹지조경학과" };
export const certs = [
  { name: "정보처리기사", date: "2019.08", org: "한국산업인력공단" },
  { name: "조경기사", date: "2016.12", org: "한국산업인력공단" },
];
export const careerTotal = "7년 차 · 약 6년 3개월"; // 공백(2023.04~10) 제외 환산. SFN 정확 입사월 확정 시 재계산

export default { profile, skills, skillChips, experiences, career, education, certs, careerTotal };
