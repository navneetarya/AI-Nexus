# Pricing data (Phase 4)

```
data/pricing/
  snapshots/<YYYY-MM-DD>.json   one frozen copy of the verified facts per date (immutable)
  history.json                  reader-facing change log (newest first)
```

Created by `node scripts/pricing-snapshot.mjs [--date YYYY-MM-DD]`, from `lib/vendor-facts.data.json`.
Only `status: "verified"` tools are included. `null` = not verified, never "no".

## Snapshot (`schemaVersion` 1)
| Field | Meaning |
|---|---|
| `snapshotISO` | Date the snapshot was frozen. Equals the file name. |
| `toolCount`, `tools[]` | Verified tools, sorted by `slug`. |
| `tools[].slug, name, category, currency` | Same slug as `constants.ts`. Category is the site category. |
| `tools[].pricingPageUrl, verifiedISO` | Vendor's own pricing page and the date it was checked. |
| `tools[].freeAccess, trialDays` | `free-plan` / `trial-only` / `none`; trial length or null. |
| `tools[].startsAtMonthly` | Cheapest published paid price billed monthly, or null. |
| `tools[].startsAtMonthlyBilledAnnually` | Cheapest paid price per month on annual billing, or null. |
| `tools[].plans[]` | `id, name, isFree, priceMonthly, priceMonthlyBilledAnnually, oneTimePrice, customPricing, allowance` (display text), `commercialUse`. Promotions are never stored. |

The diff (4.2) compares tools by `slug` and plans by `id`, so keep plan ids stable.

## History entry (`history.json`)
```json
{
  "id": "2026-11-05-elevenlabs-starter-priceMonthly",
  "dateISO": "2026-11-05",
  "slug": "elevenlabs",
  "tool": "ElevenLabs",
  "kind": "price-change",
  "planId": "starter",
  "field": "priceMonthly",
  "from": 6,
  "to": 7,
  "currency": "USD",
  "sourceUrl": "https://elevenlabs.io/pricing",
  "summary": "Starter went from $6 to $7 per month.",
  "fromSnapshot": "2026-10-22",
  "toSnapshot": "2026-11-05"
}
```
`kind` is one of: `price-change`, `allowance-change`, `commercial-use-change`, `free-access-change`,
`plan-added`, `plan-removed`, `tool-added`, `tool-removed`, and `correction`.

A `correction` fixes a mistake on OUR side (a wrong number we published). It is listed under "Corrections" on the tracker page, not under "What changed", and never sets the "Changed" flag. Use `summary` to say what was wrong and what is right; `from`/`to` hold the wrong and the corrected value.
