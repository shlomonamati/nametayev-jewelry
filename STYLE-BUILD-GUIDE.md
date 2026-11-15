# מדריך בנייה — אתר תדמית בסגנון "נמטייב תכשיטים"

מדריך מדויק לשחזור סגנון האתר: עיצוב, מבנה, רכיבים, נגישות, ביצועים, SEO/GEO ופריסה.
אפשר לקרוא אותו כבן-אדם, או להדביק אותו כהנחיות ל-Claude Code / עוזר קוד כדי לבנות אתר חדש.
כל ערכי העיצוב והקוד למטה הם המקור הרשמי — העתק אותם כמו שהם.

> **פילוסופיה בקצרה:** יוקרה שקטה. רקע כהה + זהב, טיפוגרפיה נקייה, המון "אוויר" (whitespace),
> אנימציות עדינות בלבד, RTL עברית, **ביצועים לפני הכל**, ונגישות מלאה כברירת מחדל.

---

## 1. Stack טכני

- **HTML/CSS/JS טהור** (vanilla) — בלי framework. הכל בקובץ `index.html` אחד עם `<style>` ו-`<script>` מוטמעים.
- **פריסה:** Vercel (סטטי), דומיין מותאם, git → deploy אוטומטי מ-`main`.
- **בלי build step** — קובץ שנפתח בדפדפן. זה מה שמשאיר אותו מהיר וקל לתחזוקה.
- **אופציונלי (טפסים/לידים):** Supabase (טבלה + Edge Function להתראות). ראה §11.
- **שפה:** `<html lang="he" dir="rtl">`.

---

## 2. Design Tokens (העתק ל-`:root`)

```css
:root {
  /* מותג — זהב */
  --gold:        #C9A84C;
  --gold-light:  #E8C96A;
  --gold-dark:   #9A7A30;
  --gold-glow:   rgba(201,168,76,0.35);

  /* רקעים כהים */
  --black: #080808;
  --dark:  #0F0F0F;
  --dark2: #161616;
  --dark3: #1E1E1E;

  /* טקסט על כהה */
  --text-light: #EDE5D5;
  --text-muted: #8A7A60;

  /* מערכת */
  --focus-ring: 3px solid #E8C96A;
  --radius: 10px;
}
```

**עקרון צבע:** הרקע כמעט-שחור (`#080808`/`#0F0F0F`), הזהב הוא ההדגשה היחידה. לבן טהור נדיר —
משתמשים ב-`--text-light` (`#EDE5D5`, לבן חמים) לטקסט ראשי ו-`--text-muted` לטקסט משני.
כותרות זהב תמיד בגרדיאנט: `linear-gradient(135deg, var(--gold-light), var(--gold), var(--gold-dark))` עם `-webkit-background-clip:text`.

### פלטת "נייר" לעמודי תוכן/מאמרים (רקע בהיר לקריאה ארוכה)
```css
--ink:       #1C2734;   /* טקסט כותרות */
--ink-soft:  #43505e;   /* גוף טקסט */
--paper:     #FBF9F4;   /* רקע קרם */
--paper-card:#ffffff;
--line:      #ece6d8;   /* קווי הפרדה */
--link:      #8a6a1f;   /* קישורים — זהב כהה, עובר ניגודיות AA על לבן */
```

---

## 3. טיפוגרפיה

```html
<link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;900&family=Frank+Ruhl+Libre:wght@500;700;900&display=swap" rel="stylesheet" />
```

- **גוף + ממשק:** `Heebo` (sans-serif עברי). משקלים: 300 (עדין), 400, 500, 600, 700, 900 (כותרות).
- **כותרות מאמרים/עריכה:** `Frank Ruhl Libre` (serif עברי אלגנטי) — נותן תחושת מגזין יוקרה.
- **סקאלה גמישה:** כותרות ב-`clamp()` כדי לזרום בין מובייל לדסקטופ:
  - H1 hero: `clamp(3rem, 8vw, 6rem)`, `font-weight:900`, `line-height:1.05`
  - H2 section: `clamp(2rem, 4vw, 3.2rem)`, `font-weight:900`
  - H1 מאמר: `clamp(1.9rem, 5vw, 3.2rem)` בפונט Frank Ruhl Libre
- **גוף:** `16px` בסיס, `line-height:1.85` (טקסט נושם). שורת קריאה מקסימלית `~760px`.
- **תגיות סקשן (kicker):** `letter-spacing:4px; text-transform:uppercase; font-size:~0.75rem; color:var(--gold)` — עם `✦` משני הצדדים.

---

## 4. מבנה העמוד (סדר הסקשנים)

1. **Nav** — sticky, שקוף עם `backdrop-filter: blur`, לוגו טקסט (`שם <span>מותג</span>`), תפריט + המבורגר במובייל.
2. **Hero** — מסך מלא, כותרת ענקית עם מילה אחת בגרדיאנט זהב, תת-כותרת, 2 כפתורי CTA, שורת סטטיסטיקות. אפשר אלמנט 3D/וידאו עדין ברקע.
3. **סרט מותג** (אופציונלי) — וידאו לופ קצר, מושתק, autoplay.
4. **About** — טקסט + תמונת דיוקן/סטודיו בפריים.
5. **Portfolio/Gallery** — גריד תמונות עם overlay בהובר (רקע בהיר).
6. **Services** — גריד כרטיסים על רקע כהה.
7. **Process** — צעדים ממוספרים (רקע בהיר).
8. **Testimonials** — סליידר ביקורות + כוכבים.
9. **Articles/Blog** — גריד כרטיסי מאמרים (ראה §10).
10. **Contact** — טופס על רקע כהה + פרטי קשר.
11. **Footer** — לוגו, קישורי ניווט, קרדיט, הצהרת נגישות.
12. **צף:** כפתור נגישות (שמאל-תחתון) + כפתור וואטסאפ (שמאל-תחתון). ראה §8.

**ריתמוס סקשנים:** `section { padding: 7rem 5%; }`. סקשנים כהים ובהירים מתחלפים ליצירת קצב.
כותרת סקשן תמיד: `.section-header` ממורכז עם `.section-tag` (kicker), `<h2>`, פסקת תיאור, ו-`.divider` (קו זהב קצר).

```css
section { padding: 7rem 5%; }
.section-header { text-align: center; margin-bottom: 4.5rem; }
.divider { width:60px; height:1.5px; margin:1.8rem auto 0;
  background: linear-gradient(90deg, transparent, var(--gold), transparent); }
```

---

## 5. רכיבים מרכזיים

### כפתורים
```css
.btn-primary {
  background: linear-gradient(135deg, #E8C96A 0%, #C9A84C 50%, #A8873A 100%);
  color: #0D0B07; font-weight: 800; padding: 1.05rem 2.6rem;
  border: none; border-radius: 50px; letter-spacing: 1px; text-transform: uppercase;
  box-shadow: 0 6px 35px rgba(201,168,76,0.45), inset 0 1px 0 rgba(255,255,255,0.25);
  transition: transform .25s cubic-bezier(.34,1.56,.64,1), box-shadow .3s;
}
.btn-primary:hover { transform: translateY(-4px) scale(1.02); }

.btn-outline {
  background: transparent; color: var(--text-light);
  border: 1px solid rgba(201,168,76,0.4); border-radius: 50px;
  padding: 1.05rem 2.6rem; backdrop-filter: blur(8px);
  transition: all .3s cubic-bezier(.34,1.56,.64,1);
}
.btn-outline:hover { background: rgba(201,168,76,0.1); border-color: var(--gold); transform: translateY(-4px); }
```
כלל: **CTA ראשי אחד בולט לכל מסך**; משני ב-outline.

### כרטיסים (גנרי — services / articles)
```css
.card {
  background: linear-gradient(145deg, #1A1710 0%, #141210 100%);
  border: 1px solid rgba(201,168,76,0.14);
  border-radius: 20px; overflow: hidden;
  transition: transform .35s cubic-bezier(.25,.46,.45,.94), box-shadow .35s, border-color .35s;
}
.card:hover { transform: translateY(-6px); border-color: rgba(201,168,76,0.4);
  box-shadow: 0 22px 60px rgba(0,0,0,.5); }
```
גריד רספונסיבי: `grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.8rem; max-width: 1200px;`.

### Nav
- `position: sticky; top:0; background: rgba(8,8,8,0.92); backdrop-filter: blur(10px);` + גבול תחתון זהב עדין.
- לוגו: `נמטייב <span style="color:var(--gold)">תכשיטים</span>`.
- מובייל: המבורגר עם `aria-expanded` שמחליף מצב תפריט.

### Footer
רקע `#060606`, לוגו, קישורי ניווט חוזרים, קרדיט זכויות, כפתור "הצהרת נגישות".

---

## 6. אנימציות (עדין בלבד)

- **Reveal on scroll:** אלמנטים עם class `.reveal` מקבלים `opacity:0; transform: translateY(30px)` והופכים ל-visible דרך `IntersectionObserver` (עם `.reveal-delay-1/2` ל-stagger).
- **משכים:** מיקרו-אינטראקציות 150–300ms. הובר של כרטיס `.35s`.
- **Easing:** כניסה `cubic-bezier(.34,1.56,.64,1)` (spring קליל) לכפתורים; `cubic-bezier(.25,.46,.45,.94)` לכרטיסים.
- **הובר = הרמה:** `translateY(-4px..-6px)` + הגברת צל/זוהר זהב. אף פעם לא לשנות `width/height` (רק `transform`/`opacity`).
- **חובה:** לכבד `@media (prefers-reduced-motion: reduce)` — לבטל אנימציות ו-`scroll-behavior`.

---

## 7. נגישות (רמת AA — לא אופציונלי)

- `lang="he" dir="rtl"`, מבנה כותרות היררכי (h1→h2→h3 בלי דילוגים).
- **Skip link** לתוכן ראשי, `<main id="main-content" tabindex="-1">`.
- **Focus rings** גלויים תמיד: `:focus-visible { outline: var(--focus-ring); outline-offset: ...; }`.
- כל תמונה עם `alt` תיאורי; כפתורי אייקון עם `aria-label`.
- **Live region** להודעות: `<div aria-live="polite" class="sr-only" id="live-region"></div>`.
- ניגודיות: טקסט על כהה ≥ 4.5:1 (לכן `--text-light` ולא אפור). קישורים על בהיר עם קו תחתון (`--link`).
### וידג'ט נגישות + כפתור וואטסאפ (רכיב משותף — חובה בכל עמוד)

רכיב אחד, `assets/a11y-wa.js`, מזריק לבד את **שני הכפתורים הצפים** ואת פאנל הנגישות המלא — בלי לשכפל קוד בין עמודים.

- **מיקום:** שני הכפתורים **בפינה שמאל-תחתונה** — כפתור הנגישות (עיגול כחול) מעל, כפתור הוואטסאפ (ירוק) מתחת.
- **פאנל הנגישות כולל:** הגדלה/הקטנת טקסט, ניגודיות גבוהה, היפוך צבעים, הדגשת קישורים, סמן גדול, פונט דיסלקציה, ריווח/גובה שורה, ביטול אנימציות, הסתרת תמונות, מדריך פוקוס, יישור טקסט — **עם שמירה ב-`localStorage`** (ההעדפה נשמרת בין עמודים וביקורים), הכרזות ARIA, וניווט מקלדת מלא.

**איך מטמיעים בעמוד חדש (שלב אחד):**
```html
<script src="/assets/a11y-wa.js" defer></script>   <!-- ממש לפני </body> -->
```

**איך מעבירים לאתר חדש:**
1. העתק את הקובץ `assets/a11y-wa.js` מהאתר הזה **כמו שהוא** לתיקיית `assets/` של האתר החדש.
2. בתוך הקובץ שנה 2 דברים בלבד: **מספר הוואטסאפ** (`waHref` — הפורמט `9725XXXXXXXX`) ואת **טקסט ההודעה** המקדימה.
3. הוסף את שורת ה-`<script>` בכל עמוד ומאמר. זהו.

> **חובה בכל עמוד ובכל מאמר** — זו מדיניות קבועה של האתר.

---

## 8. ביצועים (העדיפות העליונה)

- **תמונות:** WebP/JPG אופטימלי, **self-hosted** (בלי hotlink לצד ג'). לכל `<img>` לשים `width`+`height` (מניעת CLS), `loading="lazy"` לכל מה שמתחת לקיפול, `decoding="async"`. תמונת hero בלבד `loading="eager"`.
- **וידאו:** לדחוס אגרסיבית (ffmpeg → H.264 720p, ללא אודיו, `+faststart`), `<video autoplay muted loop playsinline preload="metadata" poster="...">` עם תמונת poster קלה. יעד: וידאו hero < ~1.5MB.
- **גופנים:** `&display=swap`, ורצוי `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`.
- **סקריptים חיצוניים:** `defer`, וכשמ-CDN — עם **SRI** (`integrity` + `crossorigin`). ראה §12.
- **Cache:** נכסים סטטיים (תמונות/וידאו) עם `Cache-Control: public, max-age=31536000, immutable`; HTML עם `must-revalidate`. ראה §12.
- כלל אצבע: כל החלטה — לבחור באופציה המהירה יותר.

---

## 9. SEO — בלוק ה-`<head>` (תבנית)

```html
<title>שם העסק | תיאור קצר – עיר</title>
<meta name="description" content="תיאור 150-160 תווים עם מילות מפתח + טלפון." />
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
<link rel="canonical" href="https://DOMAIN/" />

<!-- Geo (SEO מקומי) -->
<meta name="geo.region" content="IL-M" />
<meta name="geo.placename" content="עיר" />
<meta name="geo.position" content="LAT;LNG" />
<meta name="ICBM" content="LAT, LNG" />

<!-- Open Graph -->
<meta property="og:type" content="business.business" />
<meta property="og:title" content="..." />
<meta property="og:description" content="..." />
<meta property="og:image" content="https://DOMAIN/images/og.jpg" />
<meta property="og:url" content="https://DOMAIN/" />
<meta property="og:locale" content="he_IL" />

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />
```

### JSON-LD (Structured Data) — הכרחי
מטמיעים `<script type="application/ld+json">` לכל אחד:
1. **LocalBusiness** (או תת-סוג מתאים: `Store`, `ProfessionalService` וכו') — שם, טלפון, כתובת, `geo`, `openingHoursSpecification`, `aggregateRating`, `review[]`.
2. **FAQPage** — 4-6 שאלות ותשובות (מצוין ל-GEO, ראה §10).
3. **BreadcrumbList** — פירורי לחם.
4. **Blog** + `blogPost[]` אם יש מאמרים.

`sitemap.xml` + `robots.txt` בשורש:
```
# robots.txt
User-agent: *
Allow: /
Sitemap: https://DOMAIN/sitemap.xml
```

---

## 10. GEO — אופטימיזציה למנועי AI (ChatGPT/Perplexity/Gemini)

GEO = לגרום למנועי תשובות מבוססי-AI לצטט את האתר. עקרונות שיישמנו:
- **תשובות ישירות וקצרות** לשאלות אמיתיות — בלוקי FAQ עם `<details>` + סכמת `FAQPage` תואמת.
- **מבנה סמנטי ברור:** H2/H3 כשאלות, פסקאות עצמאיות שניתן לצטט, רשימות וטבלאות.
- **ישויות (entities):** שם העסק, מיקום, תחום — חוזרים באופן עקבי בטקסט ובסכמה, עם `inLanguage: "he-IL"`.
- **מקורות סמכות:** קישור לגופים מוכרים בתחום (למשל בתכשיטים — GIA).
- כל מאמר עם `BlogPosting` + `FAQPage` + `BreadcrumbList`.

---

## 11. מערכת מאמרים (Blog)

**מבנה:** תיקיית `articles/` עם עמוד HTML לכל מאמר + כרטיסים בדף הבית שמקשרים אליהם.

**תבנית עמוד מאמר** (שונה מדף הבית — פלטת "נייר" בהירה לקריאה נוחה):
- Nav + Footer כהים (זהים לאתר) — עקביות מותג.
- **Hero כהה** עם breadcrumbs, kicker, H1 (Frank Ruhl Libre), meta (מחבר/תאריך/זמן קריאה).
- **גוף בהיר** (`--paper`), רוחב קריאה `max-width:760px`, `line-height:1.85`, כותרות עם קו תחתון זהב.
- רשימות עם תבליטי `✦` זהב; רשימות ממוספרות עם עיגולי גרדיאנט זהב; callout עם גבול-ימין זהב; טבלאות עם `thead` בגרדיאנט זהב.
- FAQ עם `<details>` (סימן `+` שמסתובב).
- CTA כהה בסוף + כפתור זהב.
- שלוש סכמות JSON-LD: `BlogPosting` + `FAQPage` + `BreadcrumbList`.
- `<script src="/assets/a11y-wa.js" defer></script>`.

**כרטיס מאמר בדף הבית:** תמונה (16:9, `height:220px; object-fit:cover`) + badge זהב + meta + כותרת + תקציר + "קראו עוד ←". גריד `auto-fit, minmax(260px,1fr)`.

**לאחר הוספת מאמר:** לעדכן את `sitemap.xml`, את סכמת ה-`Blog.blogPost[]`, ולהוסיף כרטיס.

---

## 12. טפסים ולידים (אופציונלי — Supabase)

- טופס עם ולידציה בצד לקוח (`required`, שגיאות ליד השדה, `aria-invalid`, focus לשדה הראשון שנכשל, הודעת הצלחה ב-live region).
- שמירה ל-Supabase דרך REST עם **anon key** (מותר לחשוף — מוגן ב-RLS).
- **RLS חובה:** אנונימי מורשה רק `INSERT`, לא `SELECT` (שלא יחשפו הלידים). מדיניות INSERT עם תקרות אורך לשדות (אנטי-ספאם).
- **התראות:** Edge Function שמופעלת ע"י טריגר `AFTER INSERT` (pg_net) → שולחת מייל (Resend) ו/או וואטסאפ (CallMeBot). המפתחות נשמרים בצד-שרת בלבד, וגישת RPC לפונקציה נחסמת (`revoke execute`). קלט משתמש עובר escaping לפני הכנסה למייל.

---

## 13. אבטחה + פריסה (`vercel.json`)

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Content-Security-Policy", "value": "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; frame-src 'none'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; connect-src 'self' https://*.supabase.co; media-src 'self'; form-action 'self'; upgrade-insecure-requests" },
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=(), browsing-topics=()" }
      ]
    },
    {
      "source": "/images/(.*)",
      "headers": [ { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" } ]
    },
    {
      "source": "/(.*)\\.(html)?$",
      "headers": [ { "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" } ]
    }
  ]
}
```
> התאם את ה-CSP למקורות שאתה באמת טוען (CDN של סקריptים, דומיין ה-Supabase שלך). אם אין Supabase — הסר את `https://*.supabase.co` מ-`connect-src`.

- **SRI** לכל סקריפט CDN: `integrity="sha384-..." crossorigin="anonymous"` (מחשבים עם `curl URL | openssl dgst -sha384 -binary | openssl base64 -A`).
- **Git flow:** commit + push ל-`main` → Vercel פורס אוטומטית.

### חיבור ל-GitHub → Vercel → דומיין (כך זה מחובר באתר הזה)

**א. GitHub (מקור האמת):**
1. `git init` בתיקיית הפרויקט, commit ראשוני.
2. צור repo ב-GitHub ו-`git push -u origin main`. **כל push ל-`main` = deploy חדש.**

**ב. חיבור ל-Vercel (deploy אוטומטי):**
1. [vercel.com](https://vercel.com) → **Add New → Project → Import Git Repository** → בחר את ה-repo.
2. Framework Preset: **Other** (אתר סטטי — אין build). Root Directory: `/`. Build Command: ריק. Output: ריק.
3. **Deploy**. מעכשיו Vercel בונה ופורס אוטומטית בכל commit ל-`main` (ו-Preview URL לכל ענף/PR).
4. `vercel.json` (מ-§13) נקרא אוטומטית ומחיל את ה-headers והקאשינג.
5. HTTPS נוצר אוטומטית (Let's Encrypt) — אין מה להגדיר.

> באתר הזה קיימת תיקיית `.vercel` (מקשרת מקומית ל-Vercel CLI) — לא חובה; אפשר גם רק דרך ה-Git integration.

**ג. חיבור דומיין מותאם (custom domain):**
1. ב-Vercel: **Project → Settings → Domains → Add** → הקלד את הדומיין (למשל `example.com` וגם `www.example.com`).
2. Vercel יראה לך אילו רשומות DNS להגדיר אצל רשם הדומיין (GoDaddy/Namecheap/וכו'):
   - **דומיין שורש** (`example.com`): רשומת **A** ל-`76.76.21.21`.
   - **תת-דומיין** (`www`): רשומת **CNAME** ל-`cname.vercel-dns.com`.
   - (או להעביר את ה-Nameservers ל-Vercel, אם רוצים שהוא ינהל הכל.)
3. אחרי שה-DNS מתעדכן (דקות עד כמה שעות), Vercel מנפיק תעודת SSL אוטומטית והאתר עולה על הדומיין.
4. הגדר את הגרסה המועדפת (redirect מ-`www` לשורש או להפך) ב-Domains.

**ד. אחרי חיבור הדומיין — עדכן בקוד:**
- `<link rel="canonical">`, `og:url`, וכל ה-URLs המוחלטים ב-JSON-LD ל-`https://DOMAIN/`.
- `sitemap.xml` ו-`robots.txt` עם הדומיין הסופי.

---

## 14. Checklist לפני העלאה

- [ ] Mobile-first: נבדק ב-375px, 768px, 1280px + landscape. אין גלילה אופקית.
- [ ] כל התמונות: `width`/`height` + `loading="lazy"` (חוץ מ-hero) + `alt`.
- [ ] `prefers-reduced-motion` מכובד.
- [ ] Focus rings גלויים; ניווט מקלדת מלא; ניגודיות AA.
- [ ] כפתורי נגישות + וואטסאפ (שמאל) בכל עמוד.
- [ ] `<head>`: title, description, canonical, OG, geo, JSON-LD (LocalBusiness + FAQPage + BreadcrumbList).
- [ ] `sitemap.xml` + `robots.txt`.
- [ ] `vercel.json`: security headers + caching.
- [ ] SRI על סקריptים חיצוניים.
- [ ] אם יש טופס: RLS מוגדר (INSERT בלבד לאנונימי) + התראות עובדות.
- [ ] GitHub→Vercel מחובר (deploy אוטומטי מ-`main`); דומיין מותאם מקושר עם SSL.
- [ ] canonical / og:url / JSON-LD / sitemap עודכנו לדומיין הסופי.

---

## 15. פרומפט מוכן ל-Claude Code (העתק-הדבק לפרויקט חדש)

> בנה לי אתר תדמית **סטטי** (index.html יחיד, HTML/CSS/JS טהור, בלי framework) עבור **[סוג העסק]** בשם **[שם]** ב**[עיר]**.
> סגנון: יוקרה שקטה — רקע כמעט-שחור (`#080808`) עם הדגשת **זהב** (`#C9A84C`, כותרות בגרדיאנט `#E8C96A→#9A7A30`), עברית RTL, פונטים `Heebo` (גוף) ו-`Frank Ruhl Libre` (כותרות מאמרים). אימוץ ה-Design Tokens, הרכיבים והמבנה מהמדריך המצורף (`STYLE-BUILD-GUIDE.md`).
> סקשנים: Nav sticky, Hero מסך-מלא עם CTA, About, Portfolio/Gallery, Services, Process, Testimonials, Articles, Contact, Footer. כפתור נגישות + וואטסאפ בשמאל-תחתון בכל עמוד (הזרקה דרך `/assets/a11y-wa.js`).
> חובה: ביצועים (webp self-hosted, lazy, dimensions), נגישות AA (focus rings, aria, reduced-motion), SEO מלא (meta+OG+JSON-LD: LocalBusiness+FAQPage+BreadcrumbList), `sitemap.xml`, `robots.txt`, ו-`vercel.json` עם security headers + caching. אנימציות עדינות בלבד (reveal on scroll, hover-lift, 150–300ms).
> אל תשתמש בתמונות stock זולות — השאר placeholders עם `alt` נכון עד שאספק תמונות אמיתיות.

---

*נבנה על בסיס אתר נמטייב תכשיטים. כל ערכי העיצוב לעיל הם המקור המדויק — העתק כמו שהם ושנה רק תוכן, צבע-מותג (אם תרצה גוון אחר) ומדיה.*
