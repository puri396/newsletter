# WhatsApp Integration – Schema & Phone (Day 1)

## 1. Subscriber schema changes

### Fields added

| Field           | Type    | Constraints              | Purpose |
|----------------|---------|--------------------------|---------|
| `phone`        | String? | Optional, unique         | E.164 number for WhatsApp; one number per subscriber. |
| `whatsappOptIn`| Boolean | Default: false           | When true and `phone` is set, subscriber receives WhatsApp notifications. |

### Why phone is optional

- Existing subscribers and email-only signups do not require a phone; migration adds columns with safe defaults.
- WhatsApp is an optional channel; primary identity remains email.

### Why phone is unique

- One phone number must not be associated with multiple accounts (compliance and delivery).
- Uniqueness is enforced at the DB layer and checked before create in the subscribe API.

### WhatsApp opt-in logic

- Only subscribers with `whatsappOptIn === true` and non-null `phone` are eligible for WhatsApp sends.
- Default `false` ensures no messages are sent without explicit opt-in (migration-safe and compliant).

### Migration safety

- New columns are nullable / have defaults; existing rows are valid without backfill.
- No destructive changes to existing columns or indexes.
- Migration name: `add_subscriber_phone_whatsapp_optin`.

**Applying the change:**

- **Clean migration history:** Run `npx prisma migrate dev --name add_subscriber_phone_whatsapp_optin` to create and apply the migration.
- **Drift (DB already ahead of migrations):** To add only the new columns without resetting the DB, run `npx prisma db push`. Then optionally baseline with `prisma migrate resolve` if you use migrations in production.
- **Conflict resolution:** Do not run `prisma migrate reset` in production (it drops data). Use `db push` for additive schema changes when migrations are out of sync.

---

## 2. Phone validation (E.164)

- **Location:** `lib/phone.ts`
- **Format:** E.164 (`+` followed by 10–15 digits, country code included).
- **Exports:**
  - `isValidE164(phone: string): boolean`
  - `normalizeToE164(input: string): NormalizePhoneResult` (returns `{ ok, e164 }` or `{ ok, error }`)
  - `normalizePhoneOrNull(input): string | null` for optional fields
- **Behaviour:** Strips non-digits, validates length and leading digit; does not infer country code. Use before persisting to DB.

---

## 3. Example usage (subscriber creation)

In `POST /api/subscribe`:

1. If `whatsappOptIn` is true, require `phone` and run `normalizeToE164(rawPhone)`; reject on `!result.ok`.
2. If optional phone is provided without opt-in, optionally normalize and store (or ignore invalid).
3. Before create, check `phone` uniqueness (e.g. `findUnique({ where: { phone } })`) to return a clear 400 if the number is already used.
4. Persist `phone` (E.164) and `whatsappOptIn` (true only when phone is set and user opted in).

---

## 4. Future extensibility: WhatsAppLog (optional)

For delivery tracking, status, and retries, a separate table is recommended:

| Concept        | Purpose |
|----------------|---------|
| **WhatsAppLog**| Store per-message: subscriberId, newsletterId, providerMessageId, status, createdAt; optional timestamps for delivered/read. |
| **Retries**    | Use status + lastAttemptAt (or similar) to drive retry logic. |
| **Errors**     | Store last error message or code for debugging. |

Not required for Day 1; add when implementing delivery status or webhooks.

---

## 5. File reference

- Schema: `prisma/schema.prisma` (Subscriber model)
- Phone util: `src/lib/phone.ts`
- Subscriber create (example): `src/app/api/subscribe/route.ts`
