# Build prompt: Self-serve automation SaaS platform

Use this as a direct prompt to a coding agent (Claude Code, etc.) or as a dev spec. It is written to be handed over as-is.

---

## 1. What we're building

A multi-tenant SaaS platform where any business can self-onboard, get AI-suggested automations (WhatsApp bots, voice AI agents, booking funnels, CRM), pay via a credit-wallet system, and run everything from one dashboard — with our agency (super-admin) managing all clients, billing, and the underlying n8n automation engine behind the scenes.

**Two sides of the same app:**
- **Client side**: business owner self-onboards, gets recommended automations, pays, manages leads, views funnels, requests a website if they don't have one.
- **Agency side (us)**: super-admin panel to see all clients, revenue, credit sales, automation health, and support.

---

## 2. Core user roles (RBAC)

| Role | Access |
|---|---|
| Super Admin (agency owner) | Full access — all clients, billing, automation templates, theming defaults, platform settings |
| Agency Staff | Manage assigned clients, view leads, cannot touch billing/global settings |
| Client Owner | Full access to their own org — billing, team, automations, leads, funnel |
| Client Team Member | View/manage leads and funnels only, no billing or automation config access |
| Automation Viewer (read-only) | View dashboards/leads only — for a client's staff who just needs visibility |

RBAC must be enforced at the API layer, not just hidden in the UI — every request checks role + organization ownership before returning data. Use a permissions table (role → allowed actions) rather than hardcoded role checks scattered through the code.

---

## 3. Onboarding flow (this is the product's make-or-break moment)

Step-by-step wizard, one screen at a time, progress bar visible:

1. **Business basics** — name, industry (dropdown: real estate, clinic/salon, home services, coach/consultant, e-commerce, restaurant, other), city, team size.
2. **Requirement discovery quiz** (5-7 short questions, not a form dump):
   - "What's costing you the most leads right now?" (missed calls / slow follow-up / no-shows / cold traffic that doesn't convert / other)
   - "Do you currently have a website?" (Yes / No / Not sure)
   - "How do most customers currently reach you?" (phone / WhatsApp / walk-in / social DMs)
   - "Do you want AI to just alert you, or also talk to leads directly?" (alert only / talk to leads)
   - "What's your monthly lead volume roughly?" (rough bucket, not exact number)
3. **AI recommendation screen** — based on quiz answers, show 2-3 recommended automations from the catalog (not the full catalog) with a one-line "why this fits you" explanation each. This is a rules engine first (industry + pain point → mapped bundle), with an LLM call layered on top only to write the "why this fits you" copy — don't make the whole recommendation logic an LLM call, keep it deterministic and cheap.
4. **No-website branch**: if they said "No" to having a website, insert an extra screen offering the "1-week starter website" service — a short form (business description, 3 things they want visitors to know, any existing content) that ends in "we'll build this and a human will call you within 24h to confirm details" rather than trying to fully automate a custom site build.
5. **Package selection + payment** — show selected automations, itemized price, wallet/credit top-up amount required, pay via Razorpay (UPI/cards native to India). On success, auto-provision: create their org, assign automation templates, generate their n8n workspace credentials, activate their dashboard.
6. **Post-payment welcome** — a short checklist (not a wall of text): "connect your WhatsApp number," "add your first 10 leads or connect a source," "review your funnel," each with a single clear CTA button. This is the moment users churn if it's confusing — keep it to 3 checklist items max, everything else can wait.

---

## 4. Core modules

### 4.1 Automation marketplace/catalog
- Each automation is a template card: name, description, category tag, setup price, monthly retainer, estimated setup time, "recommended for" tags (used by the AI recommendation engine to match).
- Client can browse full catalog anytime beyond onboarding, add more automations later (upsell surface).

### 4.2 Credits & billing
- Wallet-based: client adds credits (INR), credits get consumed by usage-metered items (WhatsApp conversations, voice-agent minutes) and by monthly retainers (auto-deducted).
- Razorpay integration for top-ups and subscription billing.
- Auto low-balance alerts (in-app + WhatsApp) before an automation gets paused for insufficient credit.
- Agency-side revenue dashboard: total credits sold, active subscriptions, churn, per-client lifetime value.

### 4.3 CRM (leads module)
- Central leads table per client org: name, phone, source (which automation generated it), status (new/contacted/qualified/booked/won/lost), tags, notes, last activity timestamp.
- Filter/search/segment leads, bulk actions (tag, assign, export CSV).
- Every automation writes leads here via a standard internal API — this is the single source of truth the n8n workflows push into (replaces the per-automation Google Sheet once a client is on the platform; keep the Sheet as a v1 fallback for clients not yet migrated).
- Lead detail view shows full conversation history if it came through WhatsApp/voice.

### 4.4 Funnel builder
- Template-based (not fully drag-drop for v1 — pick a template, fill fields, publish). Drag-drop can be a v2 addition once template usage proves demand.
- Branch at setup: "Do you have a website?"
  - **Yes** → connect existing domain, embed a lead-capture widget/WhatsApp chat button via a snippet.
  - **No** → offer the 1-week starter website package (see onboarding step 4), and in the meantime give them a hosted single landing page on a subdomain (e.g. `clientname.ourplatform.com`) so they aren't blocked while waiting.
- Every funnel submission flows straight into the CRM leads table, tagged by funnel source.

### 4.5 Automations dashboard (per client)
- List of active automations with on/off toggle, last-run status, execution count this month, credits consumed this month.
- Each automation's leads/results link back to the CRM module filtered by that automation.
- Behind the scenes this calls the n8n instance's API to activate/deactivate/trigger the corresponding workflow — the platform is a control layer over n8n, not a rebuild of it.

### 4.6 Voice AI agent (cold-calling / relationship-building agent)
- Config panel: script/prompt template, calling hours, lead list to call (pulled from CRM by status/tag), call goal (book appointment / re-engage cold lead / follow-up after quote).
- Voice provider choice — compare and pick per client based on budget:

| Provider | Notes | Rough cost |
|---|---|---|
| **Sarvam AI** | Strong Indian-language support (Hindi + regional), competitive INR pricing, good for local business calls in non-English-first markets | Check current per-minute rate at sarvam.ai — generally positioned as the budget-friendly India-first option |
| **ElevenLabs (+ a call orchestration layer like Twilio/Vapi)** | Best voice quality/naturalness, primarily English-strong, pricier per minute | Usage-based, typically higher than Sarvam for INR-denominated clients |
| **Vapi / Retell / Bland** | Full-stack voice agent orchestration (STT+LLM+TTS+calling) if you don't want to wire providers together yourself | Per-minute, easiest to integrate but adds a platform markup on top of the underlying voice cost |

Recommendation: default new clients to **Sarvam** for cost and regional-language reach, offer ElevenLabs-based agents as a premium tier for clients who want the most natural-sounding English voice (e.g. higher-ticket B2B or English-first urban audiences).

- Call outcomes must write back to the CRM automatically: call connected/no-answer, outcome tag, next-action, and — if relationship-building is the goal — a running "relationship stage" per lead (first contact → warmed → interested → booked) so the AI agent's follow-up calls are aware of prior context, not cold every time.

### 4.7 Notifications
- In-app + WhatsApp alerts for: new qualified lead, low credit balance, automation paused/failed, new booking.

### 4.8 Analytics/reporting
- Per client: leads generated, conversion rate by automation, cost per lead, ROI estimate (revenue attributed vs credits spent).
- Agency-side: aggregate across all clients for internal reporting.

---

## 5. UI/design system requirements

- **Component library: shadcn/ui only.** No mixing in other component kits.
- **Theming must be fully configurable, not hardcoded**: border radius, spacing scale, padding scale, and the full color palette (primary/secondary/accent/background/foreground/destructive/etc.) must be stored as design tokens (CSS variables) in a settings table, editable from a theming panel — both by us (platform defaults / per-client white-label) and optionally by the client themselves if we want to offer white-labeling as a premium feature.
- Tokens should map directly to shadcn's `tailwind.config` CSS variable convention (`--radius`, `--primary`, `--background`, etc.) so changing a value in the theming panel live-updates the whole UI without a rebuild.
- Support light/dark mode out of the box.
- Keep the component tree modular: a `ThemeProvider` wrapping the app, reading tokens from the org's settings row, with sane platform-wide defaults if a client hasn't customized anything.

---

## 6. Suggested tech stack

- **Frontend**: Next.js (App Router) + shadcn/ui + Tailwind CSS
- **Auth/RBAC**: Auth.js (NextAuth) or Clerk, with a custom permissions table for role → action mapping
- **Database**: Postgres (via Supabase for speed, or self-hosted Postgres on the same VPS as n8n to save cost)
- **Automation engine**: existing self-hosted n8n instance, controlled via its REST API (create/activate/deactivate workflows per client, trigger via webhook)
- **Payments**: Razorpay (native UPI/India support, subscriptions + one-time top-ups)
- **Voice**: Sarvam AI (default) / ElevenLabs (premium tier), orchestrated via Twilio or Vapi for the actual calling infrastructure
- **WhatsApp**: direct Meta Cloud API (cheapest, no BSP markup), same pattern as the n8n workflows already built
- **Hosting**: same or a sibling VPS to keep infra cost minimal (Hetzner/DigitalOcean)

---

## 7. Data model sketch

- `organizations` (client businesses) — id, name, industry, theme_tokens (jsonb), credit_balance
- `users` — id, org_id, role, email, phone
- `automations_catalog` — id, name, category, setup_price_inr, monthly_price_inr, description, recommended_tags
- `org_automations` — org_id, automation_id, status (active/paused), n8n_workflow_id, activated_at
- `leads` — id, org_id, automation_id (source), name, phone, status, tags, notes, created_at
- `lead_activities` — lead_id, type (message/call/booking), payload, timestamp
- `transactions` — org_id, amount_inr, type (topup/deduction), reference, timestamp
- `funnels` — org_id, template_id, published_url, has_own_website (bool), status
- `call_logs` — lead_id, org_id, provider, duration_sec, outcome, relationship_stage, transcript_url

---

## 8. Non-functional requirements

- True multi-tenancy — every query scoped by `org_id`, enforced server-side.
- Must handle many concurrent client orgs without cross-contamination of leads/automations/billing.
- Audit log on billing and automation activation/deactivation events.
- Rate-limit and queue webhook-triggered automation runs so a burst of leads from one client doesn't starve others.

---

## 9. Suggestions to make this the best version of itself

1. **Don't build the funnel drag-and-drop builder first.** Template-based funnels get you to market in weeks, not months. Add true drag-drop only once you have real client demand data on which templates get customized the most.
2. **Keep the AI recommendation engine rules-based + LLM-polished, not LLM-decided.** A deterministic mapping (industry + pain point → automation bundle) is cheaper, faster, and more predictable than asking an LLM to pick from your whole catalog every time. Use the LLM only to phrase the "why this fits you" explanation.
3. **Ship the "no website" 1-week service as a hybrid, not pure automation.** Let the platform capture the brief automatically, but always route to a human call within 24h — fully automated website generation from a form is a worse product than a fast human-assisted turnaround at this stage.
4. **Default every new client to Sarvam for voice, not ElevenLabs.** It keeps their per-minute cost predictable in INR and matches multi-language Indian markets better; upsell ElevenLabs only when a client explicitly wants premium English voice quality.
5. **White-label theming is your best upsell, not a free feature.** Offer full color/logo/radius customization as a paid tier — most clients won't care, but agencies/franchises reselling under their own brand will pay well for it.
6. **Build the credit-wallet auto-alert before anything else in billing.** The single fastest way to lose trust is an automation silently pausing because credits ran out with no warning — this should be the first billing feature built, not the last.
7. **Instrument cost-per-lead from day one.** Every automation should be able to show "this automation cost you ₹X in credits and generated Y leads" — this number is what turns a one-time client into a retainer client, so make sure it's visible on the main dashboard, not buried in analytics.
8. **Use one n8n instance with per-client workflow duplication (like the JSON templates already built), not one shared workflow with client branching inside it.** Isolation per client makes debugging, scaling, and pausing individual clients trivial, and matches the modular pattern already established in the automation templates.
