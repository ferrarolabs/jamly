# 02 — Market & Competitors

> **Status:** Living document · **Last researched:** 2026-09-01 · **Re-research trigger:** before v0.1 launch, then every 6 months

Every factual claim here carries a source. Anything unsourced is tagged `ASSUMPTION:` and is a candidate for the [validation plan](../product/14-validation-plan.md).

---

## 1. Market context

| Fact                                                  | Figure                                                                          | Source                                                                                                                                                                  |
| ----------------------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Online music education market, 2025                   | ~$2.18B – $3.9B (estimates vary widely by methodology; one outlier claims $20B) | [Mordor](https://www.mordorintelligence.com/industry-reports/online-music-education-market), [SkyQuest](https://www.skyquestt.com/report/online-music-education-market) |
| Projected CAGR                                        | ~17.5%, to ~$4.9B by 2030                                                       | [Mordor](https://www.mordorintelligence.com/industry-reports/online-music-education-market)                                                                             |
| Share of spending from self-funded hobbyists/amateurs | ~59.4% of 2025 spend                                                            | [Mordor](https://www.mordorintelligence.com/industry-reports/online-music-education-market)                                                                             |
| Shift toward subscription among hobbyists             | +52% preference increase                                                        | [Mordor](https://www.mordorintelligence.com/industry-reports/online-music-education-market)                                                                             |

**Read:** the buyer is the individual amateur musician spending their own money, not an institution. This directly supports the chosen model — individual Pro subscription ([05](05-business-model.md)) — over B2B or per-band enterprise pricing.

**Caution:** these are _music education_ figures, an adjacent market, not the band-tooling market. No credible sizing exists for "band management software" because the category is too small to be analyzed. `ASSUMPTION:` the band-tooling market is a niche within a niche; this project should not be justified by TAM.

---

## 2. Competitive landscape

The space splits into four categories that **do not talk to each other**. That disconnection is Jamly's opportunity.

```
┌─────────────────────────┐   ┌─────────────────────────┐
│  A. BAND LOGISTICS      │   │  B. CHART / SCORE       │
│  BandHelper, SetBook,   │   │  OnSong, forScore,      │
│  BandMGT, Bandloop,     │   │  MobileSheets, SongBook │
│  BandSlate, Muzodo      │   │                         │
│  crowded, weak, ugly    │   │  mature, entrenched,    │
│                         │   │  single-player          │
└─────────────────────────┘   └─────────────────────────┘
            ╳  no connection between any of these  ╳
┌─────────────────────────┐   ┌─────────────────────────┐
│  C. PRACTICE            │   │  D. GEAR PRESETS        │
│  Modacity, Instrumentive│   │  ToneCloud, CustomTone, │
│                         │   │  ToneNET, Quad Cortex   │
│  solo silo, expensive   │   │  guitar-only, vendor-   │
│                         │   │  locked                 │
└─────────────────────────┘   └─────────────────────────┘

        ╔═══════════════════════════════════════╗
        ║  JAMLY: the connective tissue A↔B↔C↔D ║
        ╚═══════════════════════════════════════╝
```

### Category A — Band logistics (our direct competition)

#### BandHelper — the incumbent

The most complete product in the category. Repertoire, schedule, setlists, live lyric/chord display, contacts, stage plots, finances, multi-device sync. iOS, Android, Mac, web.

- **Pricing:** ~$8/mo or $80/yr for a 2–5 member band on Pro; $3.75/mo solo; $12/mo for 6–20 users. 30-day trial, no card. ([source](https://www.bandhelper.com/main/pricing.html))
- **Strengths:** breadth nobody matches, mature sync, responsive developer, genuinely loved by technical professional bands.
- **Documented weaknesses — this is the important part:**
  - "With the amazing and useful features comes a steep learning curve and complexity." ([App Store reviews](https://apps.apple.com/us/app/bandhelper/id552012927))
  - "The learning curve is a bit steep, so **it isn't always easy to convince every band member to use the app**." ([source](https://bandmgt.com/blog/bandmgt-vs-bandhelper))
  - Characterized as "everything and the kitchen sink" requiring investment in "configuration and training".
  - Sharing a set with the band reported as a **9-step process requiring Dropbox** and technical skill.
- **Verdict:** BandHelper is not beatable on features and should not be attacked there. It is beatable on **adoption** — its own users report that they cannot get their bandmates in. A tool that only the band leader uses has failed at the actual job.

#### The 2025–26 startup wave — SetBook, BandMGT, Bandloop, BandSlate, Muzodo, Gigditty, Back On Stage

A cluster of new entrants all offering close to the same thing: scheduling, drag-and-drop setlists, a chart library, band invites, earnings tracking. Muzodo is free and web-based. ([SetBook](https://www.set-book.com/blog/best-band-management-apps), [BandMGT](https://bandmgt.com/blog/band-mobile-app-guide), [Bandloop](https://www.bandloop.net/vs/bandhelper), [Back On Stage](https://backonstageapp.com/blogs/band-management-blog/essential-band-apps-for-bands-and-musicians))

- **What their existence proves:** demand is real enough that multiple teams are funding attempts at it, in 2026.
- **What their sameness proves:** nobody has won. They are all differentiating on marketing copy rather than on product, and all confined to the same "gigs + setlists + money" box.
- **Threat level:** medium and rising. They are our nearest neighbours. But none of them crosses into the personal layer, and several appear to be web-first with weak offline stories — a fatal flaw at a venue with no signal.

### Category B — Chart & score display

**OnSong** (iOS, text/ChordPro/PDF, the popular iOS choice), **forScore** (the PDF-score standard on iPad), **MobileSheets** (Android/Windows), **SongBook Pro**. ([comparison](https://blackboxprompter.com/best-lyrics-apps-for-musicians-2026/), [TalkBass discussion](https://www.talkbass.com/threads/on-song-and-other-solutions-to-better-organize-and-perform-charts-setlists.1294714/))

- **Strengths:** a decade of refinement in the one thing they do; hardware pedal support, annotation, huge personal libraries; deeply entrenched habits.
- **Weakness:** almost entirely **single-player**. Your library is yours; sharing with the band means exporting files. They are personal document readers, not band tools.
- **Verdict:** do not attack head-on. Jamly must be _good enough_ at displaying a chart on stage, and must never make a user re-import a 500-PDF library. `ASSUMPTION:` interoperability (import PDF/ChordPro, export cleanly) matters more than beating forScore at rendering — to be tested in [validation](../product/14-validation-plan.md).

### Category C — Practice tracking

**Modacity** — practice log with automatic session tracking, streaks, milestones, deliberate-practice mode, metronome, cloud notes and recordings. Used in conservatories.

- **Pricing:** $12.99/mo or $129/yr via App Store. 14-day trial. ([source](https://www.modacity.co/subscriptions))
- **What this tells us:** musicians will pay a _premium_ subscription for a purely personal practice tool. That is a strong price anchor for Jamly's future individual Pro tier.
- **Weakness:** a complete silo. Modacity has no idea what your band is playing on Saturday. Every practice item must be entered by hand.
- **Verdict:** this is the clearest evidence for Jamly's core thesis. The band context that makes practice items obvious is exactly the data Modacity cannot have and Jamly will.

### Category D — Gear & presets

**ToneCloud** (Positive Grid — "the world's first custom amp sharing platform"), **Line 6 CustomTone** (log in to see tones for products you own), **ToneNET** (AmpliTube/TONEX sharing), **Neural DSP Quad Cortex** ecosystem. ([ToneCloud](https://sonicscoop.com/positive-grid-releases-tonecloud-amp-sharing-cloud-platform/), [CustomTone](https://line6.com/customtone/), [ToneNET](https://tone.net/))

- **Pattern:** every one of these is **manufacturer-locked and guitar-centric**. The preset is a binary file for one company's product.
- **The gap:** there is no cross-instrument, vendor-neutral place for the technical setup knowledge that isn't a proprietary preset file. **Drum tuning frequencies, drum head choices, bass rigs, keys patch lists, IEM mixes, stage plots — no incumbent at all.** Searches for a drum-tuning equivalent return nothing comparable.
- **Verdict:** the most genuinely empty niche found in this research. Low competition, high community affinity, and — unlike charts — **legally safe to make public**, because a preset is not a copyrighted musical work.

### Adjacent giants — do not compete

| Product                          | Scale                                                                                                                                                                                                                                                           | Relationship to Jamly                                                                                                                                                                                                                 |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **BandLab**                      | 100M+ registered users; free social DAW + distribution ([MBW](https://www.musicbusinessworldwide.com/music-making-app-bandlab-surpasses-100-million-users/), [Billboard](https://www.billboard.com/business/tech/bandlab-100-million-users-report-1235637853/)) | Different job: creating music. Zero overlap with rehearsal logistics. Ignore.                                                                                                                                                         |
| **Ultimate Guitar** (Muse Group) | 30M MAU, 102M downloads, Pro ~$3–10/mo ([Muse Group](https://www.mu.se/ultimate-guitar))                                                                                                                                                                        | Owns the public chord/tab library — and its licensing burden. Jamly must **not** enter this space ([ADR-0007](../tech/adr/0007-copyright-user-generated-charts-only.md)). Potential long-term integration target, never a competitor. |

---

## 3. Gap analysis — where Jamly wins

### Gap 1 — Adoption friction _(the wedge)_

Every product in Category A has the same fatal flaw, and the incumbent's own users say it out loud: **the band leader adopts it and the rest of the band doesn't.** A tool for a group that only one member uses provides zero value.

**Jamly's answer:** ruthless onboarding. Join a band from a link, no account setup ceremony, no configuration, useful within 30 seconds of install. The passive band member — the drummer who will never configure anything — is treated as the _primary_ user, not an afterthought. This is encoded as a hard rule in [20-design-principles](../design/20-design-principles.md).

**Defensibility:** low technically, high culturally. It requires saying no to features, permanently. Incumbents with a decade of accumulated configuration options cannot retrofit simplicity.

### Gap 2 — The vertical connection: band → personal _(the moat)_

No product connects what the band needs to what the individual practices. Modacity doesn't know your setlist. BandHelper doesn't know whether you've practiced.

**Jamly's answer:** the band's setlist generates your practice list. "Saturday's set has 4 songs you've marked shaky and haven't practiced in 3 weeks."

**Defensibility:** high. It requires owning both the group and the individual data model simultaneously — a single-purpose competitor structurally cannot add it without becoming the other kind of product.

### Gap 3 — Gear knowledge for non-guitarists

Drummers, bassists, and keys players have no preset-sharing home. Guitarists have four, all locked to hardware they must own.

**Jamly's answer:** instrument-agnostic, vendor-neutral setup sharing — starting with the categories nobody serves.

**Defensibility:** medium, via community content. The first credible library of drum tunings becomes the only one.

### Gap 4 — Offline as a first-class citizen

`ASSUMPTION:` several web-first Category A entrants degrade badly with poor connectivity. Venues have concrete walls and no signal, and this is precisely when the app matters most.

**Jamly's answer:** offline-first architecture from v0.1 ([ADR-0003](../tech/adr/0003-offline-first-sync-strategy.md)), not retrofitted. _Needs verification against specific competitors before being used as a marketing claim._

---

## 4. Competitive matrix

|                                      | Band logistics | Live setlist sync | Chart display | Personal practice |  Gear presets   | Offline | Discovery | Price            |
| ------------------------------------ | :------------: | :---------------: | :-----------: | :---------------: | :-------------: | :-----: | :-------: | ---------------- |
| **BandHelper**                       |      ●●●       |        ●●         |      ●●       |         —         |        —        |   ●●    |     —     | $8/mo per band   |
| **SetBook / BandMGT / Bandloop**     |       ●●       |         ●         |       ●       |         —         |        —        |    ?    |     —     | varies           |
| **Muzodo**                           |       ●●       |         —         |       ●       |         —         |        —        |    —    |     —     | free             |
| **OnSong / forScore / MobileSheets** |       —        |         ●         |      ●●●      |         —         |        —        |   ●●●   |     —     | one-time         |
| **Modacity**                         |       —        |         —         |       —       |        ●●●        |        —        |   ●●    |     —     | $12.99/mo        |
| **ToneCloud / CustomTone / ToneNET** |       —        |         —         |       —       |         —         | ●●● guitar only |    —    |     —     | free w/ hardware |
| **BandLab**                          |       —        |         —         |       —       |         —         |        —        |    ●    |    ●●     | free             |
| **Ultimate Guitar**                  |       —        |         —         |      ●●●      |         ●         |        —        |   ●●    |    ●●     | ~$3–10/mo        |
| **Jamly v0.1**                       |       ●●       |        ●●●        |      ●●       |         ●         |        —        |   ●●●   |     —     | free             |
| **Jamly v1.0 (target)**              |      ●●●       |        ●●●        |      ●●●      |        ●●●        |       ●●●       |   ●●●   |    ●●     | free + Pro       |

`●●●` strong · `●●` adequate · `●` minimal · `—` absent · `?` unverified

---

## 5. Strategic conclusions

1. **Do not compete on feature count.** BandHelper wins that fight and it is the wrong fight — its feature count is its documented weakness.
2. **Compete on whether the whole band actually uses it.** Success metric is active _bands_, not users. See [40-ways-of-working](../process/40-ways-of-working.md).
3. **The moat is the seam between band and personal.** Build the connective architecture at v0.1 even though the personal features come later ([13-domain-model](../product/13-domain-model.md)).
4. **Charts are a legal minefield; presets are not.** Private-by-default for copyrighted material, public and social for gear. ([ADR-0007](../tech/adr/0007-copyright-user-generated-charts-only.md))
5. **Interoperate with the giants, never compete.** Import from what musicians already have. Never build a public tab library.

---

**Related:** [01 — Vision](01-vision.md) · [04 — Positioning](04-positioning.md) · [06 — Risks](06-risks-and-open-questions.md) · [14 — Validation Plan](../product/14-validation-plan.md)
