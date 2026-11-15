# Namatiev AI Orchestrator — מדריך הפעלה

האורקסטרטור רץ בתוך Claude Code על המחשב שלך, על מנוי Claude Pro. אין שרת ואין עלות API.

## התקנה במחשב חדש (פעם אחת, כ־10 דקות)

1. התקן: [Git](https://git-scm.com/download/win), [Node.js 20 ומעלה](https://nodejs.org), ו־Claude Code (`npm install -g @anthropic-ai/claude-code`).
2. שכפל את הפרויקט:
   ```
   cd ~
   git clone https://github.com/shlomonamati/nametayev-jewelry.git my-project
   cd my-project
   ```
3. צור קובץ סודות מקומי (לא עולה ל־GitHub):
   ```
   copy .env.example .env
   ```
   פתח את `.env` והדבק את ה־**service_role key** מ־Supabase ← Project Settings ← API.
4. התקן את כלי הבדיקות:
   ```
   cd qa && npm install && npx playwright install chromium && cd ..
   ```
5. בדוק שהכל עובד:
   ```
   cd orchestrator && npm test && cd ..
   node orchestrator/db.mjs leads:new
   ```
6. הפעל את Claude Code בתיקייה: `claude`. בפעם הראשונה התחבר עם חשבון ה־Pro, **ולא** עם מפתח API.

## שימוש יומיומי

| מה | פקודה ב־Claude Code |
| --- | --- |
| לעבד פניות חדשות מהאתר | `/process-leads` |
| לראות פניות שמחכות למחיר | `/set-price` |
| לתמחר פנייה ולקבל קישור ווטסאפ | `/set-price <מזהה פנייה> <מחיר>` |
| שינוי באתר מקצה לקצה | `/change-request להוסיף ...` |

שלושה דברים נשארים תמיד אצלך: **המחיר**, **השליחה ללקוח** ו**המיזוג ל־main** (העלייה לאתר החי).

## מחשב שני — להישאר מסונכרן

לפני שמתחילים לעבוד: `git switch main && git pull`.
בסוף עבודה: לוודא שכל שינוי נמצא ב־Pull Request או ב־main (`git status` נקי). קובץ `.env` צריך להעתיק ידנית לכל מחשב פעם אחת.

## מבנה

- `.claude/agents/` — הסוכנים: intake, design, pricing-prep, qa (הזמנות); product, dev (פיתוח האתר)
- `.claude/commands/` — הפקודות
- `orchestrator/` — `db.mjs` (קריאה וכתיבה ל־Supabase), `lib.mjs` (לוגיקה ובדיקת פלט הסוכנים), `portfolio.json`, בדיקות
- `supabase/migrations/` — כל שינויי מסד הנתונים
- `qa/` — בדיקות Playwright לאתר
