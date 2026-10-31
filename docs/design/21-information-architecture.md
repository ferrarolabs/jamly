# 21 — Information Architecture

> Navigation map and screen inventory for v0.1. Structure follows how bands think ([Rule 5](20-design-principles.md)): _the band → what we play → when we're playing → tonight's set → and me_.

---

## Top-level navigation

Five tabs. Not four, not seven — these are the five nouns a band actually has.

```
┌──────────┬────────────┬───────────┬──────────┬──────────┐
│   Band   │ Repertoire │   Dates   │ Setlists │    Me    │
│  (home)  │            │           │          │          │
└──────────┴────────────┴───────────┴──────────┴──────────┘
     ▲
  default tab — answers "what's next" with zero taps
```

| Tab            | Answers                                | Primary persona |
| -------------- | -------------------------------------- | --------------- |
| **Band**       | _What's happening and who's in?_       | P2 Sara         |
| **Repertoire** | _What do we play?_                     | P1 Marco        |
| **Dates**      | _When are we playing?_                 | P1 + P2         |
| **Setlists**   | _What are we playing on Saturday?_     | P1 Marco        |
| **Me**         | _My stuff_ — notes now, practice later | P3 Luca         |

**Performance mode is not a tab.** It's a full-screen takeover launched from a setlist — because on stage, tab bars are wasted pixels and accidental taps.

**Why "Me" exists in v0.1** even though it holds almost nothing: it reserves the place where the personal layer lives, so v0.2's practice features have a home rather than being wedged in later ([13-domain-model](../product/13-domain-model.md)).

---

## Screen inventory (v0.1)

### Entry & onboarding

| Screen          | Purpose                        | Notes                                                                                                                                      |
| --------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `Welcome`       | First open, unauthenticated    | One line of what Jamly is, one button                                                                                                      |
| `SignIn`        | Email + password               | Two fields, one button, no sign-up link — accounts are created by hand ([ADR-0008](../tech/adr/0008-email-password-auth-now-otp-later.md)) |
| `CheckEmail`    | Waiting for the code           | Arrives with email OTP, not before                                                                                                         |
| `JoinBand`      | Landing from an invite link ⭐ | The most important screen in the product. Band name + who invited you + one button                                                         |
| `CreateBand`    | Start a band                   | **Name only.** Ends by presenting the invite link immediately                                                                              |
| `InviteMembers` | Share the link                 | Reachable from Band tab at all times, never buried                                                                                         |

> The join path must survive the worst case: a link tapped by someone with no account, no app installed, on Android, in a car park. Store → install → deep link → joined.

### Band tab

| Screen          | Purpose                             | Key content                                                                                                                                                                     |
| --------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BandHome` ⭐   | **The default screen.** What's next | Next event (large), one-tap availability, its setlist, member list. Zero taps to value. **My own row on the member list has "Edit" for my instruments in this band** (story A4) |
| `BandSettings`  | Name, invite link, leave band       | Sparse on purpose                                                                                                                                                               |
| `MemberProfile` | A member's instruments and role     | My own instruments are edited on `BandHome`, not here                                                                                                                           |

### Repertoire tab

| Screen           | Purpose              | Key content                                                                          |
| ---------------- | -------------------- | ------------------------------------------------------------------------------------ |
| `RepertoireList` | All the band's songs | Search, filter by status, sort. Must stay fast at 200+ songs                         |
| `SongDetail`     | One song             | Band info (key, tempo, duration, status, shared notes), charts, **my private notes** |
| `SongEdit`       | Add/edit             | Title + artist are enough to save                                                    |
| `ChartViewer`    | A PDF or image chart | Zoom, page. Opens from `SongDetail` **and** from performance mode                    |

### Dates tab

| Screen        | Purpose              | Key content                                                             |
| ------------- | -------------------- | ----------------------------------------------------------------------- |
| `EventList`   | Upcoming and past    | Grouped by upcoming/past, rehearsals and gigs distinguished at a glance |
| `EventDetail` | One rehearsal or gig | When, where, load-in, notes, who's coming, its setlist                  |
| `EventEdit`   | Add/edit             | Type + date + time is enough to save                                    |

### Setlists tab

| Screen               | Purpose                   | Key content                                                                                        |
| -------------------- | ------------------------- | -------------------------------------------------------------------------------------------------- |
| `SetlistList`        | The band's setlists       | Linked to their events                                                                             |
| `SetlistDetail`      | View a set                | Numbered, per-song key and duration, per-set and total running time. **Read-only for non-leaders** |
| `SetlistEdit`        | Build a set               | Pick from repertoire, drag to reorder, add breaks and set markers                                  |
| `PerformanceMode` ⭐ | **Full-screen, on stage** | Huge current song, next song secondary, sync indicator, detach/attach, one tap to the chart        |

### Me tab

| Screen      | Purpose                                                |
| ----------- | ------------------------------------------------------ |
| `MyProfile` | Display name, avatar                                   |
| `MyNotes`   | All my personal song notes in one place                |
| `Settings`  | Theme, notifications, sign out, **data export**, about |

Instruments are not in `MyProfile`: they belong to a membership, not to the person, so the same drummer can play keys in a second band. They are edited on each band's roster ([decision log D51](../process/41-decision-log.md)).

---

## Key flows

### Flow 1 — Join a band ⭐ _the flow that decides everything_

```
 tap link → [store → install] → JoinBand → SignIn → BandHome
                                              ↑        ↑
                                 folded in, not a wall │
                                                       │
                        real content, never an empty state
```

**Budget: < 30 seconds, ≤ 4 taps.** Measured, not estimated ([N5](../product/11-mvp-scope.md)).

### Flow 2 — Book a gig and build its set

```
 Dates → + → EventEdit (type, date, venue) → EventDetail
   → "Build setlist" → SetlistEdit (pick, drag, breaks) → done
```

The setlist is created **from the event**, not separately. Bands think "the set for Saturday", never "a setlist that I'll later assign".

### Flow 3 — Play a show

```
 BandHome → next event → "Start performance" → PerformanceMode
   → leader advances → every device follows
   → any member: chart (1 tap) · detach (1 tap) · re-attach (1 tap)
```

Nothing in this flow may require typing, precision, or more than 3 taps.

### Flow 4 — Prepare at home

```
 Repertoire → SongDetail → chart + my private notes
```

Small in v0.1 — and it's the seed of v0.2, where the same screen gains practice logging and confidence.

---

## Navigation rules

1. **The Band tab is home.** Launching the app always lands there.
2. **Performance mode is a takeover**, entered deliberately and exited deliberately. No tab bar, no accidental navigation, screen stays awake.
3. **Deep links are first-class**: invite links, event links, setlist links. The link _is_ the sharing mechanism, because the band lives in a group chat and always will.
4. **Back always works**, on both platforms, including Android's system back.
5. **No nested tabs**, no drawer plus tabs. One navigation model.
6. **Charts open modally** over whatever launched them, and return there — so a chart opened during a show returns to the show.

---

## Screen count

**~25 screens in v0.1.** Small enough to build alone, large enough to be a real product. If this number grows before v0.1 ships, scope has crept ([R1](../business/06-risks-and-open-questions.md)).

## Growth plan

| Release | IA change                                                                     |
| ------- | ----------------------------------------------------------------------------- |
| v0.2    | **Me** tab gains practice and stats — the reason it was reserved              |
| v0.2    | Band switcher in the header for multi-band                                    |
| v0.3    | Money lives inside `EventDetail` and a band summary — not a new tab           |
| v0.4    | Gear lives under **Me**, with a public browse surface — still not a sixth tab |

**The five tabs should survive to v1.0.** If a release needs a new tab, that's a signal the product is sprawling rather than deepening.

---

**Related:** [20 — Design Principles](20-design-principles.md) · [11 — MVP Scope](../product/11-mvp-scope.md) · [13 — Domain Model](../product/13-domain-model.md)
