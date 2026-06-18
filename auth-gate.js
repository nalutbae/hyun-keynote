/**
 * auth-gate.js — 카테고리 페이지 비밀번호 인증 게이트
 *
 * 사용법: 각 카테고리 index.html에서 GATE_KEY를 정의하고 이 스크립트를 로드합니다.
 *   <script>const GATE_KEY = 'agentic-coding';</script>
 *   <script src="../auth-gate.js"></script>
 *
 * 동작:
 *   1. 페이지 로드 시 sessionStorage에서 인증 여부 확인
 *   2. 이미 인증됨 → 모달 없이 바로 콘텐츠 표시
 *   3. 미인증 → 콘텐츠 숨김, 비밀번호 입력 모달 표시
 *   4. 비밀번호 입력 → POST /api/ext/check API 호출
 *   5. 응답 true → 모달 제거, 콘텐츠 표시, sessionStorage 저장
 *   6. 응답 false → 에러 메시지 표시, 입력창 초기화
 *   7. 네트워크 오류 → 서버 연결 실패 메시지 표시
 */
(function () {
  'use strict';

  // ── 설정 ──
  var API_URL = 'https://hyun-portfolio.vercel.app/api/ext/check';

  // ── sessionStorage 키 ──
  var STORAGE_KEY = 'hyun-keynote-auth-' + (typeof GATE_KEY !== 'undefined' ? GATE_KEY : 'default');

  // ── 이미 인증된 경우 바로 통과 ──
  if (sessionStorage.getItem(STORAGE_KEY) === 'true') {
    return;
  }

  // ── 콘텐츠 숨기기 ──
  // visibility: hidden은 CSS 상속으로 인해 이후 추가되는 모달까지 숨겨버리는 버그가 있으므로,
  // main 요소만 display: none으로 숨김
  var mainEl = document.querySelector('main.page') || document.querySelector('main.deck') || document.querySelector('main');
  if (mainEl) mainEl.style.display = 'none';

  // ── DOM 준비 후 모달 삽입 ──
  function init() {
    var body = document.body;

    // ── 스타일 주입 ──
    var style = document.createElement('style');
    style.textContent = [
      '/* auth-gate overlay */',
      '.auth-overlay{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;font-family:var(--sans,-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Malgun Gothic","Segoe UI",sans-serif);visibility:visible}',
      '.auth-card{background:var(--bg,#FFFFFF);padding:48px 40px 40px;max-width:400px;width:calc(100% - 48px);text-align:center;position:relative}',
      '.auth-mark{width:18px;height:18px;border:1.5px solid var(--ink,#0A0A0A);border-radius:50%;position:relative;margin:0 auto 24px}',
      '.auth-mark::after{content:"";position:absolute;top:50%;left:50%;width:7px;height:7px;background:var(--accent,#C15F3C);border-radius:50%;transform:translate(-50%,-50%)}',
      '.auth-card h2{font-family:var(--mono,"JetBrains Mono",ui-monospace,Menlo,monospace);font-size:13px;letter-spacing:.2em;text-transform:uppercase;color:var(--ink,#0A0A0A);margin:0 0 6px}',
      '.auth-card .auth-subtitle{font-size:14px;color:var(--ink-3,#78746E);line-height:1.5;margin:0 0 28px}',
      '.auth-input-wrap{position:relative;margin-bottom:20px}',
      '.auth-input{width:100%;padding:12px 16px;font-family:var(--mono,"JetBrains Mono",monospace);font-size:14px;border:1.5px solid var(--rule,#0A0A0A);background:#fff;color:var(--ink,#0A0A0A);outline:none;letter-spacing:.08em;transition:border-color .14s}',
      '.auth-input:focus{border-color:var(--accent,#C15F3C)}',
      '.auth-input::placeholder{color:var(--ink-3,#78746E);letter-spacing:.04em}',
      '.auth-btn{width:100%;padding:12px 20px;font-family:var(--mono,"JetBrains Mono",monospace);font-size:12px;letter-spacing:.14em;text-transform:uppercase;border:1.5px solid var(--rule,#0A0A0A);background:var(--rule,#0A0A0A);color:#fff;cursor:pointer;transition:background .14s,color .14s,border-color .14s}',
      '.auth-btn:hover,.auth-btn:focus-visible{background:var(--accent,#C15F3C);border-color:var(--accent,#C15F3C);outline:none}',
      '.auth-btn:disabled{opacity:.6;cursor:not-allowed}',
      '.auth-error{font-size:13px;color:#C73E1D;margin-top:14px;min-height:18px;line-height:1.4}',
      '@media(max-width:480px){.auth-card{padding:36px 24px 32px}}'
    ].join('\n');
    document.head.appendChild(style);

    // ── 오버레이 생성 ──
    var overlay = document.createElement('div');
    overlay.className = 'auth-overlay';

    var card = document.createElement('div');
    card.className = 'auth-card';

    // 브랜드 마크
    var mark = document.createElement('div');
    mark.className = 'auth-mark';
    card.appendChild(mark);

    // 제목
    var heading = document.createElement('h2');
    heading.textContent = 'HYUN KEYNOTE';
    card.appendChild(heading);

    // 부제
    var subtitle = document.createElement('p');
    subtitle.className = 'auth-subtitle';
    subtitle.textContent = '카테고리에 접근하려면 비밀번호를 입력하세요';
    card.appendChild(subtitle);

    // 입력창 래퍼
    var inputWrap = document.createElement('div');
    inputWrap.className = 'auth-input-wrap';

    var input = document.createElement('input');
    input.type = 'password';
    input.className = 'auth-input';
    input.placeholder = '비밀번호 입력';
    input.autocomplete = 'off';
    input.setAttribute('aria-label', '비밀번호');
    inputWrap.appendChild(input);
    card.appendChild(inputWrap);

    // 확인 버튼
    var btn = document.createElement('button');
    btn.className = 'auth-btn';
    btn.textContent = '확인';
    card.appendChild(btn);

    // 에러 메시지
    var errorEl = document.createElement('div');
    errorEl.className = 'auth-error';
    card.appendChild(errorEl);

    overlay.appendChild(card);
    body.appendChild(overlay);

    // ── 포커스 ──
    input.focus();

    // ── 인증 함수 ──
    function authenticate() {
      var password = input.value.trim();
      if (!password) {
        input.focus();
        return;
      }

      btn.disabled = true;
      btn.textContent = '확인 중…';
      errorEl.textContent = '';

      var key = typeof GATE_KEY !== 'undefined' ? GATE_KEY : 'default';
      var url = API_URL + '?key=' + encodeURIComponent(key) + '&password=' + encodeURIComponent(password);

      fetch(url, { method: 'POST' })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.json();
        })
        .then(function (data) {
          if (data && data.valid === true) {
            // 인증 성공
            sessionStorage.setItem(STORAGE_KEY, 'true');
            if (mainEl) mainEl.style.display = '';
            overlay.remove();
            style.remove();
          } else {
            // 인증 실패
            errorEl.textContent = '비밀번호가 올바르지 않습니다';
            input.value = '';
            input.focus();
            btn.disabled = false;
            btn.textContent = '확인';
          }
        })
        .catch(function () {
          errorEl.textContent = '서버 연결에 실패했습니다';
          btn.disabled = false;
          btn.textContent = '확인';
          input.focus();
        });
    }

    // ── 이벤트 ──
    btn.addEventListener('click', authenticate);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        authenticate();
      }
    });
  }

  // ── DOMContentLoaded 보장 ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();