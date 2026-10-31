# 03 — Personas & Jobs-To-Be-Done

> **Status:** Draft — **built from reasoning and market research, not yet from interviews.** Validating these is the first task in [14-validation-plan](../product/14-validation-plan.md). Treat every persona as a hypothesis.

Personas here are defined by **the job they are trying to get done**, not by demographics. Age and income don't change what someone needs from a setlist; the role they play in their band does.

Each persona lists the tool they use _today_, because the real competitor for most of these jobs is not another app — it is WhatsApp, a spreadsheet, and memory.

---

## P1 — Marco, the band leader _(primary persona for v0.1)_

**Role:** the one who organizes. Books the gigs, builds the setlists, chases people for answers, usually holds the band's money.
**Context:** 28–45, plays in a semi-pro cover or original band, 1–4 gigs a month, weekly rehearsal, has a day job.

**Today he uses:** WhatsApp group + Google Sheets + a Drive folder of PDFs + his own memory.

### Jobs

| #    | Job                                                                                      | Today's friction                                                   | Jamly's answer                                         |
| ---- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------ |
| J1.1 | _When we book a gig, I want the whole band to know the date, place and time — once_      | Posted in chat, scrolls away, asked again three times              | Event created once; it's on everyone's calendar screen |
| J1.2 | _When I plan a show, I want to build a setlist and know it's the version everyone plays_ | Photo of a notepad in the group; someone plays from an old version | One setlist object; every device shows the same one    |
| J1.3 | _When we change the set on stage, I want everyone to know without shouting_              | Shouting, hand signals, confusion                                  | Live sync: leader advances, everyone's screen follows  |
| J1.4 | _I want to know who's coming to Thursday's rehearsal without asking five people_         | Five individual chat replies, or silence                           | Per-event availability, visible at a glance            |
| J1.5 | _After a gig I want to know what we earned and who still needs paying_                   | A number in his head and an awkward conversation                   | Gig fee recorded, payouts tracked, no one has to ask   |

**What makes him adopt:** it visibly saves _him_ time in week one.
**What makes him abandon:** having to configure it. He is willing to invest 20 minutes, not an evening.
**Why he matters:** he is the buyer, the champion, and the one who invites everyone else.

---

## P2 — Sara, the passive member _(the persona that decides whether Jamly succeeds)_

**Role:** the drummer, the bassist, the second guitarist. Shows up, plays well, organizes nothing. Not lazy — busy, and correctly assumes someone else is handling it.
**Context:** any age, in one or two bands, treats music as a serious hobby.

**Today she uses:** WhatsApp. That's it. She reads what Marco posts and shows up.

### Jobs

| #    | Job                                                                 | Today's friction                              | Jamly's answer                                     |
| ---- | ------------------------------------------------------------------- | --------------------------------------------- | -------------------------------------------------- |
| J2.1 | _Just tell me when and where the next thing is_                     | Scroll back through 200 chat messages         | The next event, on the first screen, no navigation |
| J2.2 | _Tell me what we're playing so I can look at it before I get there_ | Asks Marco the night before, or doesn't       | Setlist visible the moment it exists               |
| J2.3 | _Show me my chart on stage without me touching anything_            | Paper, or a PDF she has to find and scroll    | Follows the live setlist automatically             |
| J2.4 | _Don't make me learn software_                                      | Every band app she's been invited to, ignored | Link → in. No account ceremony, no setup           |

**What makes her adopt:** Marco sends a link and it takes 30 seconds, and the first screen already tells her something useful.
**What makes her abandon:** any registration wall, any empty state that asks her to configure something, any moment where the app is harder than asking Marco.

> **This persona is the whole thesis.** The documented failure of the incumbent is that Sara never logs in ([02-market](02-market-and-competitors.md)). Every design decision must be checked against her. If a feature makes Marco happier and Sara less likely to open the app, it is a bad feature.

---

## P3 — Luca, the improver _(primary persona for v0.2+)_

**Role:** plays alone as much as with others. Deliberately working on getting better.
**Context:** 16–35, may be in a band or between bands, might be studying music, watches lessons online.

**Today he uses:** Ultimate Guitar for chords, YouTube for lessons, a notes app or nothing for practice, a metronome app.

### Jobs

| #    | Job                                                  | Today's friction                                   | Jamly's answer                                                              |
| ---- | ---------------------------------------------------- | -------------------------------------------------- | --------------------------------------------------------------------------- |
| J3.1 | _I want to know what I should practice today_        | Guesses; defaults to playing what he already knows | Practice list derived from the band's upcoming setlist + his own weak spots |
| J3.2 | _I want proof I'm improving, not a feeling_          | No record exists                                   | Practice log, per song and per skill, over time                             |
| J3.3 | _I want my personal notes on a song the band plays_  | Scribbles on paper that get lost                   | Personal layer attached to the shared song                                  |
| J3.4 | _I want to be ready for the gig, and know that I am_ | Anxiety, no data                                   | Confidence rating per song vs. what's in Saturday's set                     |

**What makes him adopt:** J3.1 — nobody else can generate a meaningful practice list, because nobody else knows what his band is playing.
**Why he matters:** he is the persona most likely to pay for Pro, and the one who keeps Jamly when he leaves a band.

---

## P4 — Andrea, the gear nerd _(persona for v0.4+)_

**Role:** the one who spent four hours dialing in a tone, or two hours tuning the kit for the room.
**Context:** any instrument — and crucially, **often not a guitarist**, which is why he has nowhere to go today.

**Today he uses:** ToneCloud/CustomTone if he's a guitarist with the right hardware; **nothing at all** if he's a drummer, bassist or keys player. Photos of his pedalboard. A note with tuning frequencies. Memory.

### Jobs

| #    | Job                                                               | Today's friction                                         | Jamly's answer                                             |
| ---- | ----------------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------- |
| J4.1 | _I want to recall the setup that worked, months later_            | A photo he can't find                                    | Saved setup profiles per instrument                        |
| J4.2 | _I want a different setup per venue/song and to switch reliably_  | Rebuilds it from scratch each time                       | Multiple named setups, attachable to songs or events       |
| J4.3 | _I want to share what I found, and see what others use_           | Forum posts, no structure — and nothing at all for drums | Public, vendor-neutral, instrument-agnostic preset library |
| J4.4 | _I want the band's stage setup documented so load-in isn't chaos_ | The one person who knows explains it every time          | Stage plot + input list attached to the band               |

**Why he matters:** the least contested opportunity found in research, and the most likely source of organic public content and inbound traffic.

---

## Anti-persona — who we are NOT building for

Naming these prevents accidental scope drift toward them.

- **The touring professional with management.** Has a tour manager, a production rider and Excel. Our simplicity is a liability to them. Serving them is how you become BandHelper.
- **The bedroom producer.** Making beats in a DAW. That is BandLab's 100M users, and a different product entirely.
- **The absolute beginner learning their first chord.** Belongs to Yousician/Simply Guitar/Ultimate Guitar. Jamly assumes you already play.
- **The music school administrator.** A real market, a real business — and a different product. Explicitly deferred ([Decision Log](../process/41-decision-log.md)).

---

## Persona → release mapping

| Release  | Primary persona    | Why                                                                    |
| -------- | ------------------ | ---------------------------------------------------------------------- |
| **v0.1** | P1 Marco + P2 Sara | The band loop only works if both are in. Marco creates, Sara consumes. |
| **v0.2** | P3 Luca            | The personal layer, once the shared data exists to feed it             |
| **v0.3** | P1 Marco           | Money and earnings — his job, his pain                                 |
| **v0.4** | P4 Andrea          | Gear, once there is a community to share into                          |

---

## Open questions for validation

These are the assumptions that would most damage the plan if wrong. Each becomes an interview question in [14-validation-plan](../product/14-validation-plan.md).

1. Does Sara really exist as described, or do passive members simply not want _any_ app? **If the answer is "no app, ever", the entire wedge is wrong.**
2. Is live setlist sync a genuine need or a demo trick? Do bands actually change the set mid-show often enough to care?
3. Do musicians want their charts _inside_ the band app, or will they keep using forScore/OnSong forever and only want logistics from us?
4. Does the band→practice connection (J3.1) excite people, or is it a solution looking for a problem?
5. Who would actually pay, and for which half — band features or personal features?

---

**Related:** [02 — Market & Competitors](02-market-and-competitors.md) · [11 — MVP Scope](../product/11-mvp-scope.md) · [20 — Design Principles](../design/20-design-principles.md) · [14 — Validation Plan](../product/14-validation-plan.md)
