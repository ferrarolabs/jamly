# 20 — Design Principles

> These are not aesthetic preferences. Most of them are direct reactions to **how the competition fails** ([02-market](../business/02-market-and-competitors.md)) and to the physical reality of where this app is used: a dark stage, a loud rehearsal room, a venue with no signal.
>
> When a design decision is contested, these principles decide it.

---

## The five rules

### 1. Sara must never have to learn anything

The incumbent's documented failure is that the band leader adopts it and the rest of the band doesn't ([R2](../business/06-risks-and-open-questions.md)). The passive member — the drummer who will never configure a thing — is the **primary** user of every screen.

**In practice:**

- Any member's first screen answers _"what's next and what are we playing"_ with **zero taps**.
- No onboarding tutorial, no feature tour, no tooltips. If a screen needs explaining, redesign the screen.
- No empty states that ask a new member to configure something. When Sara joins, the band's content is already there.
- Settings exist but are never on the path to value.

**The test:** _Would a drummer who was handed this in a car park two minutes before load-in understand it?_

### 2. Value in 30 seconds, or it's a failure

From tapping the invite link to seeing something useful: **under 30 seconds, at most 4 taps** ([story A3](../product/11-mvp-scope.md)). This is a measured acceptance criterion, not an aspiration.

**In practice:**

- Deep link → join → in. Sign-in is folded into joining, never a wall before it.
- Every field that isn't strictly required is optional and skippable without a nag.
- A band needs only a name. A song needs only a title. A gig needs only a date. Everything else can come later or never.
- No "complete your profile" prompts. Ever.

**The test:** _stopwatch, a real person who has never seen Jamly, a real link._

### 3. Readable on a dark stage, at arm's length

The app is used at 1.5 metres, in the dark, by someone holding an instrument, possibly with one glance between phrases.

**In practice:**

- **Dark theme is the default and the designed-for case.** Light theme is the secondary one.
- Performance mode: huge type, maximum contrast, no chrome, no decoration, screen kept awake.
- Touch targets ≥ 48dp — assume the user is wearing in-ears, standing, and not looking carefully.
- **One accent colour, reserved for "now"**: the current song, the next event. Nothing else may use it. If everything is highlighted, nothing is.
- Never rely on colour alone; a stage is full of coloured light.

**The test:** put the phone on a music stand, step back 1.5m, turn the lights off. If you can't read it, it fails. **Test physically. A simulator on a bright monitor lies.**

### 4. It works when there is no signal

Venues have concrete walls. The moment the app matters most is the moment the network is worst.

**In practice:**

- All band data is cached locally and readable offline ([ADR-0003](../tech/adr/0003-offline-first-sync-strategy.md)).
- Charts are **downloaded ahead of time**, never streamed on demand.
- The UI never blocks on the network. Nothing that can be shown from cache waits for a request.
- Connection state is shown honestly and quietly — a small indicator, never a modal, never an error that interrupts a show.
- **Live sync failing must degrade gracefully:** the device keeps working alone and re-attaches when it can. A dropped connection can never leave someone with a blank screen mid-song.

**The test:** airplane mode, then run a whole rehearsal.

### 5. Musicians' words, musicians' mental model

Jamly speaks like a bandmate who happens to be organized, not like software.

**In practice:**

- **Setlist**, **chart**, **repertoire**, **rehearsal**, **gig**, **load-in**, **set**. Never _playlist_, _document_, _booking_, _task_, _item_, _resource_.
- The vocabulary is enforced technically: the [domain model](../product/13-domain-model.md) uses these words as its type names, so code and UI can't drift.
- Structure follows how bands actually think: the band → the songs we play → the dates we're playing → tonight's set.
- Concrete over abstract: _"Saturday, 21:00, Blue Note"_, not _"Upcoming event scheduled"_.

---

## Interaction rules

| Rule                                                | Why                                                                                                                        |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **≤ 3 taps to anything needed live**                | On stage, navigation is a failure                                                                                          |
| **Never trap a user in a synced view**              | Detaching from live sync is one obvious tap ([story E2](../product/11-mvp-scope.md))                                       |
| **Destructive actions are undoable, not confirmed** | Confirmation dialogs are noise; undo is respect. Soft-delete everything ([R9](../business/06-risks-and-open-questions.md)) |
| **Optimistic UI**                                   | The action happens immediately; sync catches up. Never a spinner where a result could be shown                             |
| **One primary action per screen**                   | If everything is important, nothing is                                                                                     |
| **The most frequent action is under the thumb**     | Phones are held one-handed while carrying gear                                                                             |

---

## Anti-patterns — explicitly forbidden

Each of these is a specific competitor failure or a way to break a principle above.

- ❌ **A configuration screen on the path to first value.** This is precisely what makes bands abandon the incumbent.
- ❌ **An onboarding carousel.** If it needs explaining, it needs redesigning.
- ❌ **Empty states that assign homework.** A new member should never see "You have no songs. Add one to get started."
- ❌ **Modal dialogs during performance mode.** Nothing may interrupt a show. Not an update prompt, not a rating request, not a network error.
- ❌ **Hiding the invite link in settings.** It's the most important control in the product ([R2](../business/06-risks-and-open-questions.md)).
- ❌ **Feature discovery badges, red dots, "New!" ribbons.** Noise that trains people to ignore the UI.
- ❌ **Blocking on the network to show data we already have.**
- ❌ **Notifications that aren't about the band's actual plans.** No engagement nags, no streak guilt. The bar: _would a bandmate text you this?_

---

## Visual direction

Early and non-binding, but consistent with the principles.

**Colour**

- Deep neutral dark background; layered surfaces for elevation rather than shadows (shadows are invisible in the dark).
- **One accent, used only for "now".**
- Semantic colours (success/warning/danger) used sparingly and always paired with text or an icon.
- WCAG AA minimum on all text; AAA in performance mode.

**Type**

- One family, few weights, a large scale. Performance mode sits at the top of the scale by a wide margin.
- Numbers (tempo, duration, time) tabular-aligned so lists don't jitter.
- Respects the OS font-scaling setting — a lot of gigging musicians are over 50.

**Layout**

- Generous space. A dense screen is unreadable at 1.5m.
- Lists over grids: musicians think in ordered sequences, and a setlist _is_ a list.
- Tablet is a real target, not a stretched phone ([`F606`](../product/10-feature-inventory.md), v0.2) — the tablet on the music stand is the professional's device.

**Motion**

- Minimal and fast. Motion communicates state change (a song advanced), never decoration.
- Respect reduce-motion.

---

## Accessibility

Not a v1.0 checkbox. Partly a moral position, largely a practical one: this audience is often middle-aged, frequently in bad light, and sometimes wearing hearing protection.

- Screen reader labels on every interactive element
- Dynamic type support throughout
- Never colour alone as a carrier of meaning
- 48dp minimum touch targets
- Contrast checked in the dark theme, which is the harder case

---

## How to use this document

**Before building a screen:** read the five rules and check the anti-patterns.
**When a decision is contested:** the earlier rule wins. Rule 1 beats Rule 5 if they ever conflict.
**When you want to add a feature to a screen:** ask whether it helps Marco but costs Sara. If so, it's a net negative — regardless of how good it is.

---

**Related:** [21 — Information Architecture](21-information-architecture.md) · [03 — Personas](../business/03-personas-and-jtbd.md) · [11 — MVP Scope](../product/11-mvp-scope.md) · [04 — Positioning](../business/04-positioning.md)
