---
description: Shlomi sets the final price for a lead; builds the WhatsApp message and a ready wa.me link
argument-hint: <lead id> <price in ILS>
---
Arguments: $ARGUMENTS (lead id, then the final price in ₪).

1. If no arguments: run `node orchestrator/db.mjs briefs:list awaiting_price`, show the waiting leads in Hebrew (name, item, pricing card) and stop.
2. Otherwise run `node orchestrator/db.mjs price:set <lead id> <price>`.
3. Show Shlomi, in Hebrew: the full WhatsApp message and the wa.me link to click. Remind him that clicking opens WhatsApp with the message ready and he presses send.
4. Ask him to confirm when he has sent it, then run `node orchestrator/db.mjs brief:sent <lead id>`.

Never change the price he gave and never send the message yourself.
