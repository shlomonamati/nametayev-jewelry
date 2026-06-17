/*!
 * נמטייב תכשיטים — רכיב משותף: כפתור נגישות (שמאל למטה) + כפתור WhatsApp (שמאל למטה)
 * זהה לדף הראשי. כדי להוסיף לכל דף/מאמר חדש:  <script src="/assets/a11y-wa.js" defer></script>
 */
(function () {
  if (window.__nmtA11yWaLoaded) return;
  window.__nmtA11yWaLoaded = true;

  /* ── CSS (זהה לדף הראשי, צבעים מוטמעים כדי שיהיה עצמאי בכל דף) ── */
  var css = `
    .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;}
    /* WhatsApp כפתור צף */
    .whatsapp-btn{position:fixed;bottom:24px;left:24px;z-index:9999;background:#25D366;color:#fff;border-radius:50px;padding:14px 22px;display:flex;align-items:center;gap:10px;font-size:0.95rem;font-weight:700;font-family:'Heebo',sans-serif;text-decoration:none;box-shadow:0 4px 20px rgba(37,211,102,0.5);transition:transform 0.2s,box-shadow 0.2s;animation:waPulse 2s infinite;}
    .whatsapp-btn:hover{transform:scale(1.06);box-shadow:0 6px 28px rgba(37,211,102,0.7);}
    @keyframes waPulse{0%,100%{box-shadow:0 4px 20px rgba(37,211,102,0.5);}50%{box-shadow:0 4px 32px rgba(37,211,102,0.85);}}
    @media (max-width:600px){.whatsapp-btn span.wa-text{display:none;}.whatsapp-btn{padding:14px;border-radius:50%;bottom:16px;left:16px;}}
    /* Accessibility widget */
    .aw-trigger{position:fixed;bottom:5.5rem;left:1.5rem;z-index:400;width:54px;height:54px;border-radius:50%;background:linear-gradient(135deg,#4A90E2,#1E5FD0);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(37,99,235,0.45);transition:transform 0.25s,box-shadow 0.25s;font-size:1.5rem;}
    .aw-trigger:hover{transform:scale(1.1);box-shadow:0 6px 30px rgba(37,99,235,0.6);}
    .aw-trigger:focus-visible{outline:3px solid #E8C96A;outline-offset:4px;}
    .aw-panel{position:fixed;bottom:5rem;left:1.5rem;z-index:401;width:min(300px,calc(100vw - 2rem));max-height:calc(100vh - 7rem);background:#1a1a1a;border:1px solid rgba(201,168,76,0.25);border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,0.7);overflow:hidden;display:flex;flex-direction:column;transform:translateY(20px) scale(0.95);opacity:0;pointer-events:none;transition:transform 0.3s cubic-bezier(0.4,0,0.2,1),opacity 0.3s;}
    .aw-panel.open{transform:translateY(0) scale(1);opacity:1;pointer-events:all;}
    .aw-header{background:linear-gradient(135deg,#9A7A30,#C9A84C);padding:1rem 1.2rem;display:flex;align-items:center;justify-content:space-between;}
    .aw-header-title{color:#080808;font-weight:800;font-size:1rem;display:flex;align-items:center;gap:0.5rem;}
    .aw-header-sub{color:rgba(0,0,0,0.6);font-size:0.72rem;font-weight:500;}
    .aw-close{width:28px;height:28px;border-radius:50%;background:rgba(0,0,0,0.15);border:none;color:#080808;font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background 0.2s;}
    .aw-close:hover{background:rgba(0,0,0,0.3);}
    .aw-close:focus-visible{outline:2px solid #000;outline-offset:2px;}
    .aw-body{overflow-y:auto;flex:1;padding:0.8rem;}
    .aw-grid{display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;margin-bottom:0.8rem;}
    .aw-item{background:#242424;border-radius:10px;padding:0.85rem 0.6rem 0.7rem;display:flex;flex-direction:column;align-items:center;gap:0.4rem;cursor:pointer;transition:all 0.2s;font-family:'Heebo',sans-serif;color:#EDE5D5;font-size:0.75rem;font-weight:500;text-align:center;border:1px solid transparent;}
    .aw-item:hover{background:#2e2e2e;border-color:rgba(201,168,76,0.2);}
    .aw-item.active{background:rgba(201,168,76,0.12);border-color:#C9A84C;color:#C9A84C;}
    .aw-item:focus-visible{outline:3px solid #E8C96A;outline-offset:2px;}
    .aw-item-icon{font-size:1.6rem;line-height:1;}
    .aw-item-label{line-height:1.3;}
    .aw-font-row{display:flex;align-items:center;justify-content:space-between;background:#242424;border-radius:10px;padding:0.6rem 0.8rem;margin-bottom:0.5rem;border:1px solid transparent;}
    .aw-font-row.active{border-color:#C9A84C;background:rgba(201,168,76,0.08);}
    .aw-font-label{color:#EDE5D5;font-size:0.8rem;font-weight:500;}
    .aw-font-controls{display:flex;gap:0.4rem;}
    .aw-font-btn{width:30px;height:30px;border-radius:6px;border:1px solid rgba(201,168,76,0.3);background:#1a1a1a;color:#C9A84C;font-size:1rem;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;font-family:'Heebo',sans-serif;}
    .aw-font-btn:hover{background:rgba(201,168,76,0.15);}
    .aw-font-btn:focus-visible{outline:3px solid #E8C96A;}
    .aw-font-size{color:#C9A84C;font-weight:700;font-size:0.85rem;min-width:28px;text-align:center;}
    .aw-reset{width:100%;background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.2);border-radius:8px;color:#C9A84C;font-family:'Heebo',sans-serif;font-size:0.8rem;font-weight:600;padding:0.6rem;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:0.4rem;}
    .aw-reset:hover{background:rgba(201,168,76,0.18);}
    .aw-reset:focus-visible{outline:3px solid #E8C96A;}
    .aw-footer{background:#141414;padding:0.7rem 1rem;text-align:center;color:#8A7A60;font-size:0.7rem;border-top:1px solid rgba(255,255,255,0.05);}
    .aw-footer button{color:#C9A84C;}
    /* Body states */
    body.aw-big-cursor *{cursor:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cpath d='M8 4 L8 28 L14 22 L18 30 L21 28 L17 20 L25 20 Z' fill='%23C9A84C' stroke='%23000' stroke-width='1.5'/%3E%3C/svg%3E"),auto !important;}
    body.aw-links a{text-decoration:underline !important;text-decoration-color:#C9A84C !important;text-underline-offset:3px;}
    body.aw-dyslexia *{font-family:'Arial',sans-serif !important;letter-spacing:0.05em;}
    body.aw-hide-images img{opacity:0 !important;}
    body.aw-hide-images svg:not([aria-hidden]){opacity:0 !important;}
    body.aw-spacing *{letter-spacing:0.12em !important;word-spacing:0.16em !important;}
    body.aw-line-height *{line-height:2.2 !important;}
    body.aw-invert{filter:invert(1) hue-rotate(180deg);}
    body.aw-invert img,body.aw-invert video,body.aw-invert canvas{filter:invert(1) hue-rotate(180deg);}
    body.aw-contrast{filter:contrast(1.5) saturate(0.5);}
    body.aw-text-left *{text-align:left !important;direction:ltr !important;}
    body.aw-no-anim *,body.aw-no-anim *::before,body.aw-no-anim *::after{animation:none !important;transition:none !important;}
    body.aw-focus-guide *:focus{outline:3px solid #ff0 !important;outline-offset:4px !important;box-shadow:0 0 0 6px rgba(255,255,0,0.2) !important;}
    body.aw-text-align-center *{text-align:center !important;}
    @media (max-width:480px){.aw-panel{left:0.5rem;width:calc(100vw - 1rem);bottom:9rem;}.aw-trigger{left:0.8rem;bottom:5rem;}}
  `;
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  /* ── HTML (live-region + WhatsApp + trigger + panel) ── */
  var waHref = "https://wa.me/972542985027?text=%D7%94%D7%99%D7%99%20%D7%94%D7%92%D7%A2%D7%AA%D7%99%20%D7%90%D7%9C%D7%99%D7%9A%20%D7%9E%D7%94%D7%90%D7%AA%D7%A8%20%F0%9F%92%8D%20%D7%9E%D7%A2%D7%95%D7%A0%D7%99%D7%99%D7%9F%20%D7%9C%D7%A2%D7%A9%D7%95%D7%AA%20%D7%AA%D7%9B%D7%A9%D7%99%D7%98";
  var items = [
    ['aw-contrast','aw-contrast','◑','ניגודיות גבוהה','הפעל ניגודיות גבוהה'],
    ['aw-invert','aw-invert','🔲','היפוך צבעים','היפוך צבעים'],
    ['aw-links','aw-links','🔗','הדגשת קישורים','הדגשת קישורים'],
    ['aw-big-cursor','aw-big-cursor','🖱️','סמן גדול','סמן גדול'],
    ['aw-dyslexia','aw-dyslexia','Df','תמיכה בדיסלקציה','פונט לדיסלקציה'],
    ['aw-spacing','aw-spacing','↔','ריווח טקסט','ריווח טקסט מוגבר'],
    ['aw-line-height','aw-line-height','↕','גובה שורה','גובה שורה מוגבר'],
    ['aw-no-anim','aw-no-anim','⏸','ביטול הנפשות','ביטול הנפשות'],
    ['aw-hide-images','aw-hide-images','🖼','הסתרת תמונות','הסתרת תמונות'],
    ['aw-focus-guide','aw-focus-guide','🎯','מדריך פוקוס','מדריך פוקוס'],
    ['aw-contrast2','aw-contrast','🌑','כהה מוגבר','מצב כהה מוגבר'],
    ['aw-text-align-center','aw-text-align-center','≡','יישור טקסט','יישור טקסט למרכז']
  ];
  var gridHtml = items.map(function (it) {
    return '<button class="aw-item" id="' + it[0] + '" onclick="awToggle(\'' + it[0] + '\',\'' + it[1] + '\')" aria-pressed="false" aria-label="' + it[4] + '">' +
      '<span class="aw-item-icon" aria-hidden="true">' + it[2] + '</span>' +
      '<span class="aw-item-label">' + it[3] + '</span></button>';
  }).join('');

  var html =
    '<div aria-live="polite" aria-atomic="true" class="sr-only" id="live-region"></div>' +
    '<button class="aw-trigger" id="aw-trigger" aria-haspopup="dialog" aria-expanded="false" aria-controls="aw-panel" aria-label="פתח תפריט נגישות">' +
      '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><circle cx="12" cy="4.5" r="2" fill="#FFFFFF"/><path d="M5 9h14M12 9v11M8 20l4-6 4 6" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
    '</button>' +
    '<div class="aw-panel" id="aw-panel" role="dialog" aria-modal="false" aria-label="תפריט נגישות" tabindex="-1">' +
      '<div class="aw-header"><div>' +
        '<div class="aw-header-title"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="4.5" r="2" fill="#0A0A0A"/><path d="M5 9h14M12 9v11M8 20l4-6 4 6" stroke="#0A0A0A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> תפריט נגישות</div>' +
        '<div class="aw-header-sub">WCAG 2.2 AA | תקן SI 5568</div>' +
      '</div><button class="aw-close" id="aw-close" aria-label="סגור תפריט נגישות">✕</button></div>' +
      '<div class="aw-body">' +
        '<div class="aw-font-row" id="aw-fontrow" aria-label="גודל טקסט"><span class="aw-font-label">📝 גודל טקסט</span>' +
          '<div class="aw-font-controls" role="group" aria-label="שליטה בגודל גופן">' +
            '<button class="aw-font-btn" onclick="awFontSize(-1)" aria-label="הקטן טקסט">−</button>' +
            '<span class="aw-font-size" id="aw-font-val" aria-live="polite" aria-label="גודל טקסט נוכחי">100%</span>' +
            '<button class="aw-font-btn" onclick="awFontSize(1)" aria-label="הגדל טקסט">+</button>' +
          '</div></div>' +
        '<div class="aw-grid" role="group" aria-label="אפשרויות נגישות">' + gridHtml + '</div>' +
        '<button class="aw-reset" onclick="awReset()" aria-label="אפס את כל הגדרות הנגישות">↺ &nbsp; איפוס כל הגדרות הנגישות</button>' +
      '</div>' +
      '<div class="aw-footer">אנו מחויבים לנגישות מלאה · <button onclick="showA11yStatement()" style="background:none;border:none;color:#C9A84C;cursor:pointer;font-family:inherit;font-size:inherit;padding:0;" aria-label="הצהרת נגישות">הצהרת נגישות</button></div>' +
    '</div>' +
    '<a class="whatsapp-btn" href="' + waHref + '" target="_blank" rel="noopener noreferrer" aria-label="שלח הודעת WhatsApp לנמטייב תכשיטים">' +
      '<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>' +
      '<span class="wa-text">שלחו לנו WhatsApp</span>' +
    '</a>';

  var wrap = document.createElement('div');
  wrap.innerHTML = html;
  while (wrap.firstChild) document.body.appendChild(wrap.firstChild);

  /* ── Logic (זהה לדף הראשי) ── */
  var AW_ITEMS = ['aw-contrast','aw-invert','aw-links','aw-big-cursor','aw-dyslexia','aw-spacing','aw-line-height','aw-no-anim','aw-hide-images','aw-focus-guide','aw-contrast2','aw-text-align-center'];
  var AW_LABELS = {
    'aw-contrast':['ניגודיות גבוהה הופעלה','ניגודיות גבוהה כובתה'],
    'aw-invert':['היפוך צבעים הופעל','היפוך צבעים כובה'],
    'aw-links':['הדגשת קישורים הופעלה','הדגשת קישורים כובתה'],
    'aw-big-cursor':['סמן גדול הופעל','סמן גדול כובה'],
    'aw-dyslexia':['פונט דיסלקציה הופעל','פונט דיסלקציה כובה'],
    'aw-spacing':['ריווח טקסט הוגדל','ריווח טקסט אופס'],
    'aw-line-height':['גובה שורה הוגדל','גובה שורה אופס'],
    'aw-no-anim':['הנפשות בוטלו','הנפשות הופעלו'],
    'aw-hide-images':['תמונות הוסתרו','תמונות מוצגות'],
    'aw-focus-guide':['מדריך פוקוס הופעל','מדריך פוקוס כובה'],
    'aw-contrast2':['כהה מוגבר הופעל','כהה מוגבר כובה'],
    'aw-text-align-center':['יישור מרכז הופעל','יישור מרכז כובה']
  };
  var awFontLevel = 3;
  var SIZES = [70,80,90,100,110,120,135,150,170];

  function announce(msg) {
    var el = document.getElementById('live-region');
    if (el) { el.textContent = ''; setTimeout(function () { el.textContent = msg; }, 50); }
  }
  window.announce = announce;

  window.awToggle = function (btnId, bodyClass) {
    var btn = document.getElementById(btnId);
    var isOn = document.body.classList.toggle(bodyClass);
    btn.setAttribute('aria-pressed', isOn);
    btn.classList.toggle('active', isOn);
    var labels = AW_LABELS[btnId];
    if (labels) announce(isOn ? labels[0] : labels[1]);
    localStorage.setItem('aw-' + btnId, isOn);
  };

  window.awFontSize = function (dir) {
    awFontLevel = Math.max(0, Math.min(8, awFontLevel + dir));
    var pct = SIZES[awFontLevel];
    document.documentElement.style.fontSize = pct + '%';
    document.getElementById('aw-font-val').textContent = pct + '%';
    var row = document.getElementById('aw-fontrow');
    if (row) row.classList.toggle('active', pct !== 100);
    localStorage.setItem('aw-font', awFontLevel);
    announce('גודל טקסט: ' + pct + ' אחוז');
  };

  window.awReset = function () {
    AW_ITEMS.forEach(function (id) {
      var cls = (id === 'aw-contrast2') ? 'aw-contrast' : id;
      document.body.classList.remove(cls);
      var btn = document.getElementById(id);
      if (btn) { btn.setAttribute('aria-pressed', 'false'); btn.classList.remove('active'); }
      localStorage.removeItem('aw-' + id);
    });
    awFontLevel = 3;
    document.documentElement.style.fontSize = '100%';
    document.getElementById('aw-font-val').textContent = '100%';
    var row = document.getElementById('aw-fontrow');
    if (row) row.classList.remove('active');
    localStorage.removeItem('aw-font');
    announce('כל הגדרות הנגישות אופסו');
  };

  window.showA11yStatement = function () {
    alert(
      'הצהרת נגישות — נמטייב תכשיטים\n\n' +
      'אתר זה עומד בדרישות תקן WCAG 2.2 רמה AA ותקן ישראלי SI 5568.\n\n' +
      'רכיבי נגישות:\n' +
      '• ניווט מקלדת מלא\n• תמיכה בקוראי מסך\n• ניגודיות גבוהה\n' +
      '• טקסט ניתן להגדלה\n• תפריט נגישות מלא\n• הצהרת נגישות\n\n' +
      'תאריך עדכון: יוני 2026\n\n' +
      'לדיווח על בעיות נגישות:\n' +
      'shlomonamati@gmail.com | 054-2985027\n\n' +
      'נטפל בפנייה תוך 5 ימי עסקים.'
    );
  };

  /* Widget open/close */
  (function () {
    var trigger = document.getElementById('aw-trigger');
    var panel = document.getElementById('aw-panel');
    var closeBtn = document.getElementById('aw-close');
    if (!trigger || !panel) return;
    function openWidget() { panel.classList.add('open'); trigger.setAttribute('aria-expanded', 'true'); setTimeout(function () { panel.focus(); }, 80); announce('תפריט נגישות נפתח'); }
    function closeWidget() { panel.classList.remove('open'); trigger.setAttribute('aria-expanded', 'false'); trigger.focus(); announce('תפריט נגישות נסגר'); }
    trigger.addEventListener('click', function (e) { e.stopPropagation(); panel.classList.contains('open') ? closeWidget() : openWidget(); });
    if (closeBtn) closeBtn.addEventListener('click', function (e) { e.stopPropagation(); closeWidget(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && panel.classList.contains('open')) closeWidget(); });
    document.addEventListener('click', function (e) {
      if (!panel.classList.contains('open')) return;
      var path = e.composedPath ? e.composedPath() : [];
      var insidePanel = panel.contains(e.target) || path.includes(panel);
      var insideTrigger = trigger.contains(e.target) || path.includes(trigger);
      if (!insidePanel && !insideTrigger) closeWidget();
    });
  })();

  /* Restore preferences */
  (function () {
    AW_ITEMS.forEach(function (id) {
      if (localStorage.getItem('aw-' + id) === 'true') {
        var cls = (id === 'aw-contrast2') ? 'aw-contrast' : id;
        document.body.classList.add(cls);
        var btn = document.getElementById(id);
        if (btn) { btn.setAttribute('aria-pressed', 'true'); btn.classList.add('active'); }
      }
    });
    var savedFont = localStorage.getItem('aw-font');
    if (savedFont !== null) {
      awFontLevel = Math.max(0, Math.min(8, parseInt(savedFont, 10)));
      var pct = SIZES[awFontLevel];
      document.documentElement.style.fontSize = pct + '%';
      var el = document.getElementById('aw-font-val');
      if (el) el.textContent = pct + '%';
      if (pct !== 100) { var row = document.getElementById('aw-fontrow'); if (row) row.classList.add('active'); }
    }
  })();
})();
