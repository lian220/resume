// ============================================================================
//  이력서 빌드 — base/resume-data.mjs → 4개 포맷(career/star/paar/summary) 생성
//  실행: npm run build  (또는 node scripts/build.mjs)
// ============================================================================
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import data from "../base/resume-data.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const { profile: P, skills, skillChips, experiences, career, education, certs, careerTotal } = data;

// ── helpers ─────────────────────────────────────────────────────────────────
const mdB = (s) => s.replace(/<\/?b>/g, "**").replace(/<sub>.*?<\/sub>/g, "");
const jn = (a) => a.map((x) => x.replace(/\.\s*$/, "")).join(" · "); // PAAR 셀 인라인 합치기(구분자)
const resHtml = (r) => (r.ok ? r.t : `<span class="todo">[확인 필요: ${r.t}]</span>`);
const resMd = (r) => (r.ok ? mdB(r.t) : `*[확인 필요: ${mdB(r.t)}]*`);
const out = (name, body) => { writeFileSync(join(ROOT, name), body); console.log("✓", name); };
const AUTOGEN = "<!-- 자동 생성 파일 — 직접 수정 금지. base/resume-data.mjs 수정 후 `npm run build`. -->\n";
const contactMd = `📧 ${P.email} ｜ 💻 ${P.github} ｜ 📦 ${P.portfolio}`;
const contactHtml = `📧 <a href="mailto:${P.email}">${P.email}</a> ｜ 💻 <a href="https://${P.github}">${P.github}</a> ｜ 📦 <a href="https://${P.portfolio}">Alpha Foundry 포트폴리오</a>`;

// ── ① PAAR ──────────────────────────────────────────────────────────────────
function paarMd() {
  let s = `${AUTOGEN}# ${P.name} (${P.en}) — ${P.title} (PAAR 포맷)\n\n${contactMd}\n\n> **자기소개** — ${mdB(P.introHook)}\n`;
  experiences.forEach((e, i) => {
    s += `\n---\n\n## ${i + 1}. ${e.title}\n\n| | |\n|---|---|\n`;
    s += `| 🟥 **P** | ${e.problem} |\n`;
    s += `| 🟨 **A**(분석) | ${mdB(jn(e.analyze))} |\n`;
    s += `| 🟦 **A**(실행) | ${mdB(jn(e.action))} |\n`;
    s += `| 🟩 **R** | ${e.results.map(resMd).join(" / ")} |\n`;
  });
  s += `\n---\n\n<sub>※ 이전 경력은 resume-career.html, 상세·면접 답변은 resume-star.md 참조. (base/resume-data.mjs 에서 생성)</sub>\n`;
  return s;
}
function paarHtml() {
  const rows = (e) => `
      <div class="row"><div class="chip c-p"><span class="lt">P</span><span class="cap">문제</span></div><div class="txt">${e.problem}</div></div>
      <div class="row"><div class="chip c-a1"><span class="lt">A</span><span class="cap">분석</span></div><div class="txt">${jn(e.analyze)}</div></div>
      <div class="row"><div class="chip c-a2"><span class="lt">A</span><span class="cap">실행</span></div><div class="txt">${jn(e.action)}</div></div>
      <div class="row res"><div class="chip c-r"><span class="lt">R</span><span class="cap">결과</span></div><div class="txt">${e.results.map(resHtml).join(", ")}</div></div>`;
  const exps = experiences.map((e, i) => `
  <div class="exp">
    <div class="exp-h"><span class="num">${i + 1}</span><h2>${e.title}</h2></div>
    <div class="paar">${rows(e)}
    </div>
  </div>`).join("\n");
  return `${docHead("PAAR 구조", PAAR_CSS)}
<div class="wrap">
  <div class="wordmark"><span class="l wm-p">P</span><span class="l wm-a1">A</span><span class="l wm-a2">A</span><span class="l wm-r">R</span> PROBLEM · ANALYZE · ACTION · RESULT</div>
  <h1>${P.name} <span class="en">${P.en}</span></h1>
  <p class="contact">${contactHtml}</p>
  <div class="intro">${P.introHook}</div>
  <div class="legend">
    <span><i style="background:var(--p)"></i> P — 문제(왜)</span><span><i style="background:var(--a1)"></i> A — 분석·결정</span>
    <span><i style="background:var(--a2)"></i> A — 도입·구현</span><span><i style="background:var(--r)"></i> R — 결과(수치)</span>
  </div>
${exps}
  <div class="foot">PAAR = Problem(왜) → Analyze(분석·결정) → Action(도입·구현) → Result(수치) · 같은 경험도 의사결정을 드러내면 설득력이 달라집니다.<br>이전 경력은 <a href="resume-career.html">resume-career.html</a>, 상세는 <a href="resume-star.md">resume-star.md</a> 참조.</div>
</div>
</body></html>`;
}

// ── ② STAR ──────────────────────────────────────────────────────────────────
function starMd() {
  let s = `${AUTOGEN}# ${P.name} (${P.en}) — ${P.title} (STAR 포맷)\n\n${contactMd}\n\n> ${mdB(P.introHook)}\n`;
  experiences.forEach((e, i) => {
    s += `\n---\n\n## STAR ${i + 1}. ${e.title}\n\n> **헤드라인** — ${e.headline}\n\n`;
    s += `**Situation**\n- ${e.problem}\n\n`;
    s += `**Task**\n- ${e.task}\n\n`;
    s += `**Action**\n${e.analyze.map((a) => `- 〔분석〕 ${mdB(a)}`).join("\n")}\n${e.action.map((a) => `- 〔실행〕 ${mdB(a)}`).join("\n")}\n\n`;
    s += `**Result**\n${e.results.map((r) => `- ${resMd(r)}`).join("\n")}\n\n`;
    s += `**키워드**: ${e.keywords.map((k) => `\`${k}\``).join(" · ")}\n`;
  });
  return s;
}
function starHtml() {
  const exps = experiences.map((e, i) => `
  <section class="star">
    <h2><span class="tag">STAR ${i + 1}</span> ${e.title}</h2>
    <p class="hl">${e.headline}</p>
    <div class="block"><span class="lab s">Situation</span><p>${e.problem}</p></div>
    <div class="block"><span class="lab t">Task</span><p>${e.task}</p></div>
    <div class="block"><span class="lab a">Action</span><ul>${[...e.analyze.map((a) => `<li><em>분석</em> ${a}</li>`), ...e.action.map((a) => `<li><em>실행</em> ${a}</li>`)].join("")}</ul></div>
    <div class="block"><span class="lab r">Result</span><ul>${e.results.map((r) => `<li>${resHtml(r)}</li>`).join("")}</ul></div>
    <p class="kw">${e.keywords.map((k) => `<span>${k}</span>`).join("")}</p>
  </section>`).join("\n");
  return `${docHead("STAR 포맷", STAR_CSS)}
<div class="wrap">
  <h1>${P.name} <span class="en">${P.en}</span> — ${P.title}</h1>
  <p class="contact">${contactHtml}</p>
  <div class="intro">${P.introHook}</div>
${exps}
</div></body></html>`;
}

// ── ③ 제출용 요약본 (summary) ────────────────────────────────────────────────
function summaryMd() {
  let s = `${AUTOGEN}# ${P.name} (${P.en}) — ${P.title}\n\n**${P.positioning}**\n\n> ${mdB(P.introHook)}\n\n${contactMd}\n\n## Core Skills\n\n| 영역 | 핵심 기술 |\n|---|---|\n`;
  skills.forEach((k) => (s += `| **${k.cat}** | ${k.items} |\n`));
  s += `\n## 주요 경험\n`;
  experiences.forEach((e, i) => {
    s += `\n### ${i + 1}. ${e.title}\n> ${e.headline}\n\n`;
    s += `**임팩트**\n${e.results.map((r) => `- ${resMd(r)}`).join("\n")}\n\n`;
    s += `**핵심 의사결정**\n${[e.analyze[0], ...e.action.slice(0, 2)].map((a) => `- ${mdB(a)}`).join("\n")}\n`;
  });
  return s;
}
function summaryHtml() {
  const exps = experiences.map((e, i) => `
  <div class="exp">
    <h3>${i + 1}. ${e.title}</h3>
    <p class="head">${e.headline}</p>
    <div class="label">임팩트</div><ul>${e.results.map((r) => `<li>${resHtml(r)}</li>`).join("")}</ul>
    <div class="label">핵심 의사결정</div><ul>${[e.analyze[0], ...e.action.slice(0, 2)].map((a) => `<li>${a}</li>`).join("")}</ul>
  </div>`).join("\n");
  const sk = skills.map((k) => `<tr><td class="cat">${k.cat}</td><td>${k.items}</td></tr>`).join("");
  return `${docHead("제출용 요약본", SUMMARY_CSS)}
<div class="page">
  <header>
    <h1>${P.name} <span style="font-weight:400;color:var(--sub);font-size:18px;">(${P.en})</span> — ${P.title}</h1>
    <p class="tagline">${P.positioning}</p>
    <p class="summary">${P.introHook}</p>
    <p class="contact">${contactHtml}</p>
  </header>
  <h2>Core Skills</h2>
  <table class="skills">${sk}</table>
  <h2>주요 경험</h2>
${exps}
  <div class="foot">※ 상세 설계·면접 답변은 STAR 이력서/포트폴리오로 제공 가능합니다.</div>
</div></body></html>`;
}

// ── ④ 시간순 커리어 (career) ─────────────────────────────────────────────────
function careerHtml() {
  const projFromExp = (e) => `
    <div class="proj">
      <div class="pt">${e.title}</div>
      <div class="desc">${e.headline}</div>
      <ul>
        ${e.action.map((a) => `<li>${a}</li>`).join("\n        ")}
        <li class="impact-li">📈 ${e.results.map(resHtml).join(" · ")}</li>
      </ul>
    </div>`;
  const companyBlock = (c) => {
    const projects = c.useExperiences ? experiences.map(projFromExp).join("\n")
      : c.projects.map((pr) => `
    <div class="proj"><div class="pt">${pr.title}</div><ul>${pr.bullets.map((b) => `<li>${b}</li>`).join("")}</ul></div>`).join("\n");
    const todo = c.periodTodo ? ` <span class="todo">[확인: ${c.periodTodo}]</span>` : "";
    const tag = c.isCurrent ? `<span class="newtag">현재</span>` : "";
    return `
  <div class="co ${c.isCurrent ? "newco" : ""}">
    <div class="logo">${c.logo}</div>
    <div><span class="nm">${c.company}</span>${tag}<br><span class="pd">${c.period}${todo}${c.role ? " ｜ " + c.role : ""}${c.note ? " ｜ " + c.note : ""}</span></div>
  </div>
  <hr class="co">
${projects}`;
  };
  const projOverview = [
    ...experiences.map((e) => `<li><b>[스마트푸드네트웍스]</b> ${e.title}</li>`),
    `<li>카탈로그 서비스 신규구축·고도화 (클러스터링, 생성형 AI 자동화)</li>`,
    `<li>결제대행사 파트너 페이지 리뉴얼 / 밀키트 쇼핑몰 개발 / 줄서기 서비스 성능 개선</li>`,
  ].join("\n    ");
  return `${docHead("이력서 (시간순)", CAREER_CSS)}
<div class="page">
  <h1>${P.name} <span style="font-weight:400;color:var(--sub);font-size:20px;">${P.en}</span></h1>
  <p class="contact">📞 ${P.phone} ｜ 📧 ${P.email} ｜ 💻 ${P.github}</p>
  <div class="intro">${P.introLong.map((p) => `<p>${p}</p>`).join("\n    ")}</div>
  <h2 class="sec">주요 기술</h2>
  <p class="tech">${skillChips.join(", ")}</p>
  <h2 class="sec">진행 프로젝트</h2>
  <ul class="flat">
    ${projOverview}
  </ul>
  <h2 class="sec">경력 <span class="yr">${careerTotal}</span></h2>
${career.map(companyBlock).join("\n")}
  <h2 class="sec">학력</h2>
  <p class="edu"><b>${education.school}</b> <span class="pd">${education.period} ｜ ${education.major}</span></p>
  <h2 class="sec">스킬</h2>
  <div class="chips">${skillChips.map((c) => `<span class="chip">${c}</span>`).join("")}</div>
  <h2 class="sec">수상/자격증</h2>
  <p class="edu">${certs.map((c) => `<b>${c.name}</b> <span class="pd">${c.date} · ${c.org}</span>`).join(" &nbsp;·&nbsp; ")}</p>
  <h2 class="sec">링크</h2>
  <div class="links">
    <div>🔗 Portfolio: <a href="https://${P.portfolio}">${P.portfolio}</a></div>
    <div>🔗 Blog: <a href="https://${P.blog}">${P.blog}</a> ｜ GitHub: <a href="https://${P.github}">${P.github}</a></div>
  </div>
</div></body></html>`;
}

// ── shared head + styles ─────────────────────────────────────────────────────
function docHead(sub, css) {
  return `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${P.name} (${P.en}) — ${sub}</title><style>${css}</style></head><body>`;
}
const PAAR_CSS = `:root{--p:#ef4444;--a1:#f59e0b;--a2:#3b82f6;--r:#22c55e;--bg:#0d1117;--card:#161b22;--card2:#1b222b;--ink:#e6edf3;--sub:#8b949e;--line:#2a313a;--rtint:rgba(34,197,94,.08);--todo:#fff4cc;--todoink:#7a5d00}*{box-sizing:border-box}body{margin:0;background:radial-gradient(1200px 600px at 50% -10%,#131a23,var(--bg) 60%);color:var(--ink);line-height:1.55;font-family:-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Pretendard","Segoe UI",Roboto,sans-serif}.wrap{max-width:860px;margin:0 auto;padding:48px 26px 64px}.wordmark{font-size:11px;font-weight:800;letter-spacing:2px;margin-bottom:14px}.wordmark .l{padding:3px 8px;border-radius:7px;color:#0d1117;margin-right:4px}.wm-p{background:var(--p);color:#fff}.wm-a1{background:var(--a1)}.wm-a2{background:var(--a2);color:#fff}.wm-r{background:var(--r);color:#06210f}h1{font-size:30px;margin:0 0 5px;letter-spacing:-.4px}h1 .en{color:var(--sub);font-weight:400;font-size:19px;margin-left:6px}.contact{color:var(--sub);font-size:13px;margin:0 0 18px}.contact a{color:#58a6ff;text-decoration:none}.intro{background:linear-gradient(180deg,var(--card2),var(--card));border:1px solid var(--line);border-radius:12px;padding:16px 20px;font-size:13.6px;color:#cdd6e0;position:relative;overflow:hidden}.intro::before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:linear-gradient(180deg,var(--p),var(--a1),var(--a2),var(--r))}.intro b{color:#fff}.legend{display:flex;gap:14px;flex-wrap:wrap;margin:16px 2px 4px;font-size:11.5px;color:var(--sub)}.legend span{display:inline-flex;align-items:center;gap:6px}.legend i{width:11px;height:11px;border-radius:3px;display:inline-block}.exp{margin-top:30px}.exp-h{display:flex;align-items:center;gap:11px;margin:0 0 13px}.exp-h .num{flex:0 0 30px;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;color:#0d1117;background:linear-gradient(135deg,#cdd6e0,#9aa6b2)}.exp-h h2{font-size:17.5px;margin:0;letter-spacing:-.2px;line-height:1.3}.paar{border:1px solid var(--line);border-radius:13px;overflow:hidden;background:var(--card);box-shadow:0 8px 24px rgba(0,0,0,.25)}.row{display:flex;align-items:stretch;border-top:1px solid var(--line);transition:background .15s}.row:first-child{border-top:0}.row:hover{background:var(--card2)}.row.res{background:var(--rtint)}.chip{flex:0 0 70px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:14px 0;position:relative}.chip .lt{font-weight:900;font-size:23px;line-height:1;color:#fff;width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;box-shadow:inset 0 1px 0 rgba(255,255,255,.25),0 2px 6px rgba(0,0,0,.3)}.chip .cap{font-size:9.5px;font-weight:800;letter-spacing:.4px;color:var(--sub)}.c-p .lt{background:linear-gradient(160deg,#f87171,var(--p))}.c-a1 .lt{background:linear-gradient(160deg,#fbbf24,var(--a1));color:#3a2a00}.c-a2 .lt{background:linear-gradient(160deg,#60a5fa,var(--a2))}.c-r .lt{background:linear-gradient(160deg,#4ade80,var(--r));color:#06210f}.chip::before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px}.c-p::before{background:var(--p)}.c-a1::before{background:var(--a1)}.c-a2::before{background:var(--a2)}.c-r::before{background:var(--r)}.txt{flex:1;padding:13px 18px 13px 14px;font-size:13.4px;color:#d7dee6;display:flex;align-items:center}.txt b{color:#fff;font-weight:700}.row.res .txt b{color:#b9f6ca}.todo{background:var(--todo);color:var(--todoink);padding:1px 6px;border-radius:4px;font-size:11.5px;font-weight:700}.foot{margin-top:34px;padding-top:16px;border-top:1px solid var(--line);color:var(--sub);font-size:12px;text-align:center;line-height:1.7}.foot a{color:#58a6ff;text-decoration:none}@media print{body{background:#fff;color:#16191d}.wrap{padding:14px 16px;max-width:none}.intro{background:#f7f8fa;color:#33373d;border-color:#e2e5e9}.intro b{color:#000}.paar{box-shadow:none;border-color:#dfe3e8}.row{border-color:#eef0f3}.row.res{background:#f3fbf5}.txt{color:#22272e}.txt b{color:#000}.row.res .txt b{color:#0a7a37}.exp,.row{break-inside:avoid}.foot a{color:#16191d}}`;
const STAR_CSS = `:root{--ink:#1a2233;--sub:#5b6677;--line:#e2e6ec;--accent:#2563eb}*{box-sizing:border-box}body{margin:0;background:#f4f5f7;color:var(--ink);font-family:-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Pretendard","Segoe UI",Roboto,sans-serif;line-height:1.6}.wrap{max-width:840px;margin:24px auto;background:#fff;padding:48px 56px;box-shadow:0 2px 18px rgba(20,30,50,.1);border-radius:6px}h1{font-size:25px;margin:0 0 5px}h1 .en{color:var(--sub);font-weight:400;font-size:17px}.contact{color:var(--sub);font-size:13px;margin:0 0 16px}.contact a{color:var(--accent);text-decoration:none}.intro{font-size:13.5px;color:#33404f;padding:12px 16px;border-left:3px solid #eef2ff;background:#fafbff;border-radius:6px;margin-bottom:8px}.intro b{color:#0f1726}.star{margin-top:30px;border-top:1px solid var(--line);padding-top:18px}.star h2{font-size:18px;margin:0 0 6px}.star .tag{background:var(--accent);color:#fff;font-size:11px;font-weight:800;padding:2px 8px;border-radius:6px;margin-right:6px;vertical-align:2px}.hl{font-style:italic;color:#3a4654;font-size:13px;border-left:3px solid var(--accent);padding-left:11px;margin:0 0 12px}.block{margin:9px 0;display:flex;gap:12px}.lab{flex:0 0 80px;font-size:11px;font-weight:800;letter-spacing:.5px;text-transform:uppercase;padding-top:2px}.lab.s{color:#6366f1}.lab.t{color:#0891b2}.lab.a{color:#d97706}.lab.r{color:#16a34a}.block p{margin:0;font-size:13.5px}.block ul{margin:0;padding-left:17px}.block li{font-size:13.3px;margin:3px 0}.block li em{font-style:normal;font-size:10px;font-weight:800;color:#9aa3ad;margin-right:3px}b{color:#0f1726}.kw{margin-top:10px}.kw span{display:inline-block;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:5px;padding:2px 8px;font-size:11.5px;color:#475569;margin:0 5px 6px 0}.todo{background:#fff4cc;color:#7a5d00;padding:1px 6px;border-radius:4px;font-size:11.5px;font-weight:600}@media print{body{background:#fff}.wrap{box-shadow:none;margin:0;max-width:none;padding:20px}.star{break-inside:avoid}}`;
const SUMMARY_CSS = `:root{--ink:#1a2233;--sub:#5b6677;--line:#e2e6ec;--accent:#2563eb;--chip:#eef2ff;--todo:#fff4cc;--todoink:#8a6d00}*{box-sizing:border-box}body{margin:0;background:#f4f5f7;color:var(--ink);font-family:-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Pretendard","Segoe UI",Roboto,sans-serif;line-height:1.55}.page{max-width:820px;margin:24px auto;background:#fff;padding:48px 56px;box-shadow:0 2px 18px rgba(20,30,50,.1);border-radius:6px}header{border-bottom:2px solid var(--ink);padding-bottom:16px;margin-bottom:20px}h1{font-size:27px;margin:0 0 6px}.tagline{font-size:15px;font-weight:700;color:var(--accent);margin:0 0 10px}.summary{font-size:13.5px;color:#33404f;margin:0 0 12px;padding-left:12px;border-left:3px solid var(--chip)}.summary b{color:#0f1726}.contact{font-size:12.5px;color:var(--sub)}.contact a{color:var(--accent);text-decoration:none}h2{font-size:15px;text-transform:uppercase;letter-spacing:.6px;color:var(--accent);border-bottom:1px solid var(--line);padding-bottom:6px;margin:24px 0 13px}table.skills{width:100%;border-collapse:collapse;font-size:12.5px}table.skills td{padding:7px 10px;border-bottom:1px solid var(--line);vertical-align:top}table.skills td.cat{white-space:nowrap;font-weight:700;width:128px;background:#fafbfc}.exp{margin-bottom:18px}.exp h3{font-size:14.5px;margin:0 0 4px}.exp .head{font-size:12.8px;color:#3a4654;font-style:italic;margin:0 0 9px;padding-left:11px;border-left:3px solid var(--accent)}.label{font-size:11px;font-weight:800;letter-spacing:.5px;color:var(--accent);text-transform:uppercase;margin:9px 0 3px}ul{margin:3px 0 6px;padding-left:18px}li{font-size:12.8px;margin:3px 0}b{color:#0f1726}.todo{background:var(--todo);color:var(--todoink);padding:1px 6px;border-radius:4px;font-size:11.5px;font-weight:600}.foot{margin-top:22px;padding-top:12px;border-top:1px solid var(--line);font-size:11.5px;color:var(--sub)}@media print{body{background:#fff}.page{box-shadow:none;margin:0;max-width:none;padding:24px 28px}.exp{break-inside:avoid}}`;
const CAREER_CSS = `:root{--ink:#222;--sub:#888;--line:#e5e7eb;--new:#1d72d2;--newbg:#eef5fd;--todo-bg:#fff4cc;--todo-ink:#8a6d00;--chip:#f3f4f6}*{box-sizing:border-box}body{margin:0;background:#f4f5f7;color:var(--ink);font-family:-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Pretendard","Segoe UI",Roboto,sans-serif;line-height:1.6;font-size:14px}.page{max-width:840px;margin:24px auto;background:#fff;padding:54px 60px;box-shadow:0 2px 18px rgba(20,30,50,.1);border-radius:4px}h1{font-size:30px;margin:0 0 4px;font-weight:800}.contact{font-size:13px;color:var(--sub);margin:0 0 22px}.intro p{margin:0 0 12px;font-size:13.5px;color:#33373d}h2.sec{font-size:17px;font-weight:800;margin:30px 0 6px;padding-bottom:7px;border-bottom:1px solid #d7dade}h2.sec .yr{font-size:13px;font-weight:600;color:var(--sub);margin-left:8px}.tech{font-size:13.5px;margin:6px 0 0}ul.flat{margin:6px 0 0;padding-left:18px}ul.flat li{font-size:13.5px;margin:2px 0}.co{margin:22px 0 6px;display:flex;align-items:center;gap:10px}.co .logo{width:34px;height:34px;border-radius:7px;background:#e9edf2;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:#7a8494;flex:0 0 34px}.co .nm{font-size:16px;font-weight:800}.co .pd{font-size:12.5px;color:var(--sub)}.co.newco .logo{background:var(--new);color:#fff}.newtag{font-size:10.5px;font-weight:800;color:#fff;background:var(--new);padding:1px 7px;border-radius:10px;margin-left:6px;vertical-align:2px}hr.co{border:0;border-top:1px solid var(--line);margin:8px 0 14px}.proj{margin:0 0 16px}.proj .pt{font-size:14px;font-weight:800;margin:12px 0 2px}.proj .desc{font-size:13px;margin:0 0 3px;color:#3a3f46}.proj ul{margin:2px 0 6px;padding-left:18px}.proj li{font-size:13px;margin:2.5px 0}.impact-li{background:#f6faf6;border-left:3px solid #43a047;padding:2px 8px;border-radius:3px;list-style:none;margin-left:-14px}.todo{background:var(--todo-bg);color:var(--todo-ink);padding:0 5px;border-radius:3px;font-size:12px;font-weight:600}.chips{margin-top:8px}.chip{display:inline-block;background:var(--chip);border:1px solid #e1e4e8;border-radius:14px;padding:3px 11px;font-size:12.5px;margin:0 5px 7px 0;color:#374151}.links a{color:var(--new);text-decoration:none}.links div{margin:4px 0;font-size:13px}.edu{font-size:13.5px}.edu .pd{color:var(--sub);font-size:12.5px}@media print{body{background:#fff}.page{box-shadow:none;margin:0;max-width:none;padding:22px 26px}.proj,.co{break-inside:avoid}}`;

// ── 실행 ─────────────────────────────────────────────────────────────────────
out("resume-paar.md", paarMd());
out("resume-paar.html", paarHtml());
out("resume-star.md", starMd());
out("resume-star.html", starHtml());
out("resume-summary.md", summaryMd());
out("resume-summary.html", summaryHtml());
out("resume-career.html", careerHtml());
console.log("\n✅ 7개 파일 생성 완료 (base/resume-data.mjs → 4개 포맷)");
