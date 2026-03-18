# MVP Readiness (Day 6)

**Purpose:** Full workflow analysis and gap check. Run the reader and admin journeys below, then update the must-fix and nice-to-have lists.

**How to use:** Walk through Journey A and B (optionally in the browser), answer the three questions per step, and add any new items to the lists. When all must-fix items are done, set the summary to "MVP ready: yes".

---

## Reader journey (A1–A3)

| Step | Action | Is it clear? | Does it work? | Missing for MVP? |
|------|--------|--------------|---------------|------------------|
| A1 | Land on site | (To be filled by manual test) | (To be filled by manual test) | (To be filled by manual test) |
| A2 | Subscribe | (To be filled by manual test) | (To be filled by manual test) | (To be filled by manual test) |
| A3 | Post-subscribe | (To be filled by manual test) | (To be filled by manual test) | (To be filled by manual test) |

---

## Admin journey (B1–B6)

| Step | Action | Is it clear? | Does it work? | Missing for MVP? |
|------|--------|--------------|---------------|------------------|
| B1 | Reach dashboard | (To be filled by manual test). Access is via `x-admin-secret` header when `ADMIN_SECRET` is set; no login page. | (To be filled by manual test) | No "login" UX or doc hint. |
| B2 | Create EPIC content | (To be filled by manual test) | (To be filled by manual test) | (To be filled by manual test) |
| B3 | Generate newsletter | (To be filled by manual test) | (To be filled by manual test) | (To be filled by manual test) |
| B4 | Schedule or publish | (To be filled by manual test) | (To be filled by manual test) | (To be filled by manual test) |
| B5 | Check analytics | (To be filled by manual test) | (To be filled by manual test) | (To be filled by manual test) |
| B6 | Settings | (To be filled by manual test) | (To be filled by manual test) | (To be filled by manual test) |

---

## Must-fix before launch

- [x] **Protect /epic and /api/epic with admin middleware** when `ADMIN_SECRET` is set. (Done: middleware updated.)
- [ ] *(Add any other blockers from the walk-through or Day 5.)*

---

## Nice-to-have (later)

- **Login UX or documentation:** Document how to send `x-admin-secret` (e.g. in README or Settings), or add a simple login form.
- **Landing → subscribe:** Confirm `/` has a clear CTA to `/subscribe`; improve if needed.
- **Better error/confirmation UX:** e.g. post-subscribe confirmation message, clearer API error messages.
- *(Add other improvements as you find them.)*

---

## Summary

- **MVP ready:** no (until must-fix list is complete and verified).
- **Remaining must-fix count:** 0 (EPIC protection done; add more here if found during walk-through).
