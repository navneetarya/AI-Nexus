# Phase 8 Measurement Runbook

This runbook records the measurements needed after the calculator, matcher, and verdict-token infrastructure are deployed. It does not contain fabricated traffic or conversion numbers.

## Event taxonomy

Register these event-scoped custom dimensions in GA4 before reading reports:

- `calculator`: `voice_cost`
- `matcher`: `verified_tool_matcher`
- `vendor`: vendor slug on calculator and matcher CTA events
- `cta_position`: existing affiliate CTA position values
- `link_url`: outbound destination captured by the existing affiliate tracking
- `page_path`: page where the event occurred
- `post_slug`: blog post slug for blog engagement events

C2 audit (Nov 2026): `lib/subid-tracking.ts`'s `applyTracking` (the `affiliate_click` event fired by
every React CTA and by `BlogPostPage.tsx`'s delegated blog-body handler) sends several params that
were missing from the list above. Any param without a matching GA4 custom dimension stays empty in
reports. Register these too, and re-check this list whenever a new param is added to
`applyTracking` or `trackOutboundClickOnElement`:

- `tool_name`: resolved tool/brand slug (from `utm_source`, or the matched domain as a fallback)
- `network`: `impact` | `partnerstack` | `direct` — which affiliate network the link belongs to
- `link_domain`: hostname of the final (Sub-ID-appended) outbound URL
- `link_type`: `affiliate` | `plain` — distinguishes real affiliate links from plain `rel="sponsored"` links
- `content_position`: `0_15` | `15_50` | `50_85` | `85_100` | `unknown` — where in the article body the link sits
- `sid`: the GA4 Client ID appended to the link as a PartnerStack/Impact Sub ID (`unavailable` if the `_ga` cookie wasn't readable)
- `sid_param`: which query param carried the Sub ID (`sid` for PartnerStack, `subId1` for Impact)

`outbound_click` (both the React `trackOutboundClickOnElement` path for blog-body plain links and
the `public/js/ga-init.js` document-level fallback for every other page) also use `tool_name`,
`link_domain`, `link_url`, `cta_position`, `content_position` and `post_slug` from the same
definitions above, plus `is_affiliate` (boolean) and `destination_domain`/`destination_url` on the
ga-init.js fallback path specifically.

Calculator events:

- `calc_start`
- `calc_change`
- `calc_cta_click`

Matcher events:

- `matcher_start`
- `matcher_complete`
- `matcher_result_click`

## Baseline report

Create an Explore report for the period before each feature launch. Use the same date range, filters, and attribution settings for every later comparison.

Dimensions:

- Landing page + query string
- Page path
- Event name
- CTA position

Metrics:

- Views
- Active users
- Event count
- Key events, if `affiliate_click` is marked as a key event

Filters:

- Include page paths beginning with `/tools/`, `/compare/`, `/calculators/`, `/find-ai-tool`, or `/blog/` as appropriate.
- Exclude internal traffic using the existing GA4 internal-traffic definition.
- Do not filter by country unless the comparison uses the same country filter before and after launch.

Record the export date and the exact date range beside every saved result. Do not compare a partial current day with a complete historical day.

## Calculator funnel

Export event counts grouped by `event_name` and `calculator`:

1. `calc_start`
2. `calc_change`
3. `calc_cta_click`

For CTA analysis, group by `vendor` and `page_path`. Calculate:

- CTA rate = `calc_cta_click` users / `calc_start` users
- Vendor share = vendor CTA users / all calculator CTA users

Do not interpret a rate until there are enough users for a stable comparison. Report raw users and events alongside every percentage.

## Matcher funnel

Export event counts grouped by `event_name` and `matcher`:

1. `matcher_start`
2. `matcher_complete`
3. `matcher_result_click`

Group result clicks by `tool` and `page_path`. Report zero-result completions separately from result clicks; a zero-result state is a product signal, not a conversion failure.

## Blog verdict-card check

For each blog post that receives a verified token, compare:

- Page views
- Engaged sessions
- `affiliate_click` users with `cta_position=verdict_card`
- Total affiliate-click users

Use the same post list before and after the change. Do not call the result an A/B test: this is a before/after observational comparison without random assignment.

## Evidence log

For each measurement run, save:

- Run date
- GA4 date range
- Property and data stream name
- Filters and exclusions
- Export filenames
- Raw user and event counts
- Notes about deployments, outages, or tracking changes
- Interpretation and confidence limits

The first run should remain marked `pending` until the GA4 export is supplied. A missing export is not evidence of zero traffic or zero conversions.
