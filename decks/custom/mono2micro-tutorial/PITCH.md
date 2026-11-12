# Terms of Separation: what to say, slide by slide

For the AutoSE class, about 60 minutes, 53 slides. This file is generated against the slides as they are now:
every "Click n" below is a real click on that slide, in order, with exactly what appears.

**How to read it**
- **Goal**: the one thing the room should get from the slide.
- **On screen**: what is visible before the first click.
- **Click n → (what appears)**: what to say when that appears.
- **Ask**: an interaction. **(pause)** means wait 5–7 seconds: silence is what makes people think.
- **Bridge**: the line that hands over to the next slide.
- Lines in quotes are suggestions to say your own way, not a script. Every number here is on the slide or in its
  source line; don't add others.

**Clock**: 0 → 5 min · I → 10 · II → 15 · III → 30 · IV with the game → 45 · V → 50 · VI → 55 · questions.

---

## 0 · it's complicated (slides 1–5, ~5 min)

### 1 · Terms of Separation
**Goal**: set the tone (light, a bit cheeky) and the theme: a breakup.
**On screen**: the title, and the breakup meme ("It's not you, it's me." / "We can still be friends, right?").

- "Good morning. Today's talk is about a separation. A painful one: there are lawyers, there's a fight over who keeps
  the database, the works."
- *(point at the meme)* "It's not you, it's me. We can still be friends… right?" *(let it land)*

**Click 1 → the Distracted Boyfriend ("our dev team" eyeing "microservices", "the monolith that pays the bills" glaring) and "not that separation. this one."**
- "No, not *that* separation. **This** one."
- "Our dev team, eyes on the shiny new thing: microservices. And the monolith, the thing that actually pays the
  bills, watching."
- "For the next hour: when should a codebase break up, who decides where to cut, and can an AI be the marriage
  counsellor? I'll tell you my research on that, and you'll do some of it yourselves."

**Bridge**: "Every breakup starts the same way."

### 2 · It's complicated
**Goal**: systems start simple and get tangled; plant the tangle (it comes back at the end).
**On screen**: "how it started": three tidy blue classes, "one small app, one team. simple."

- "Every system starts like this. One small app. One team. Three classes. Everyone knows where everything is. Life is
  good."

**Click 1 → "how it's going": a grey tangle grows, with "+ one more feature, + a new team, + 10× the users, + deadline: Friday".**
- "Then life happens. One more feature. A new team joins. Ten times the users. And a deadline: Friday."
- "And the code becomes… this." *(point at the tangle)* "Remember this tangle. I'm not going to explain it now. It
  comes back."

**Click 2 → the "Relationship status: It's complicated" card, with a broken heart.**
- "Relationship status: it's complicated. That's every codebase older than two years."

**Bridge**: "So teams decide to break up. How long does that take?"

### 3 · Breaking up took them years
**Goal**: migration is huge, long work, even for the best engineers.
**On screen**: "Breaking up took them years", the Netflix, Amazon and Twitter logos.

- **Ask**: "Guess: how long does it take a company like Netflix to split its monolith into services? A sprint? A
  quarter?" *(take one or two guesses)*

**Click 1 → "7 YEARS" for Netflix (big), "~5 YEARS" for Amazon, "3 YEARS" for Twitter, with the facts; the X logo lands on Twitter's bird ("pun intended").**
- "Netflix: **seven years.** In 2008 a database corruption stopped their DVD shipping. That was the trigger.
  The last piece left their data centre in early 2016."
- "Amazon: about five. Werner Vogels, their CTO, in 2006: they moved 'from a two-tier monolith to a
  fully-distributed, decentralized, services platform'."
- "Twitter: three. The 2010 World Cup, around 2,000 tweets a second, and the site kept falling over. By 2013 they
  handled 143,199 tweets in one second, and 'our users didn't experience a blip'." *(X logo)* "Pun intended."
- "These are some of the best engineering teams on the planet. And it took them years."

**Bridge**: "And yet, everybody wants in."

### 4 · The hype, and the twist
**Goal**: microservices became fashion; even the big players walked some of it back. Splitting isn't automatically good.
**On screen**: "2,200", "microservices at Uber, 2020… then they grouped them back into domains", a field of dots (one dot = ten services).

- "Uber, 2020: around 2,200 microservices. Each of these dots is ten of them."
- "And then they had to group them back into bigger domains. Because no human can reason about 2,200 boxes."

**Click 1 → the Drake meme (no to "one app that works", yes to "200 services, 3 users") and a "microservices" dictionary card.**
- "And yet this is the mood in the industry." *(Drake)* "One app that works? No. Two hundred services and three
  users? Yes!"
- "The joke: small teams copying the giants, splitting a tiny app into hundreds of services because Netflix did it."
- *(read the dictionary card, deadpan)* "Microservices: when one app that works becomes 200 services, 3 users and a
  pager that never sleeps."

**Click 2 → "plot twist:", "140+ → 1" (Segment, 2018) and "−90%" (Prime Video, 2023).**
- "Plot twist. Segment, 2018: they had 140-plus services, and went back to **one**. The operational overhead had
  stopped their feature work."
- "Amazon Prime Video, 2023: they moved a monitoring service back into one process, and the cost dropped by
  **ninety percent**."
- **Ask**: "So: is splitting good or bad?" *(pause, let someone answer)* "It depends. The classic engineer answer.
  Let's make 'it depends' precise."

**Bridge**: "What exactly do you buy, and what do you pay?"

### 5 · Why split (and the promise)
**Goal**: the trade-off, the question of the talk, and the promise of what they'll learn.
**On screen**: "What you buy, and what you pay": an empty balance.

**Click 1 → notes drop on the pans. Buy: "ship one part alone", "one team, one service", "scale one part". Pay: "every call can fail", "no shared transactions", "more to deploy and watch".**
- "What you buy: you can ship one part alone. One team owns one service. You can scale just the part that's busy."
- "What you pay: every call between services goes over the network and can fail. No more one transaction across
  everything. And many more things to deploy and watch."

**Click 2 → "worth it only when the monolith hurts", and a dictionary card: "resume-driven development".**
- "So it's worth it only when the monolith actually hurts."
- *(read the card)* "Otherwise you're doing resume-driven development: splitting a perfectly fine monolith because
  it looks great on your CV."

**Click 3 → Fowler's quote, then "So where do you cut?" and "And who decides?"**
- "Martin Fowler, 2015: almost all the successful microservice stories started with a monolith that got too big
  and was broken up."
- "So the interesting question is not *whether*. It's: **where do you cut? And who decides?**" *(pause)*

**Click 4 → the promise: three notes ("judge a cut", "catch a gamed metric", "know where tools stop") and the main idea.**
- "That's this hour. By the end you'll be able to judge a cut, catch a gamed metric, and know where tools stop."
- "And one sentence to remember: *tools and LLMs propose cuts; judging and owning them is engineering.* I'll say
  it again later. That's on purpose."

**Bridge**: "But first: when we say 'migrate', what exactly are we migrating?"

---

## I · what are we migrating? (slides 6–10, ~5 min)

### 6 · Wait. What are we actually migrating?
**Goal**: we work on the architecture (structure), not the code; and it's a refactoring you maintain afterwards.
**On screen**: real PetClinic code on the left ("the code"); OwnerController → OwnerRepository → Owner boxes on the right ("the architecture").

- "When people hear 'migration' they picture code: controllers, annotations, Spring magic. That's the left side."
- "On the right is the same thing as boxes and arrows: the controller saves through the repository, which stores
  the owner."

**Click 1 → a red loop round the boxes, "this talk lives here", and "a refactoring: same behaviour, new structure, and someone maintains it for years".**
- "This talk lives here: the structure, not the code."
- "And notice what that is: a **refactoring**. Same behaviour, new structure. And someone maintains the result for
  years. Keep that in mind; it's the last lesson of the talk."

### 7 · Architecture
**Goal**: architecture = elements and relations; migration has four steps and we focus on the first.
**On screen**: the Bass, Clements & Kazman definition, and "elements + relations".

- "The textbook definition: the set of structures you need to reason about a system: software elements, the
  relations among them, and their properties. Two words matter today: **elements** and **relations**."

**Click 1 → four yellow notes: 1 find the service boundaries · 2 split the data · 3 turn calls into network calls · 4 deploy, monitor, operate.**
- "A migration, roughly, in four steps. Find where the service boundaries go. Split the data. Turn in-process calls
  into network calls. Then deploy and run it."

**Click 2 → step 1 circled, "today: only step 1. every other step depends on it."**
- "Today: only step one. And everything else depends on it. Get the boundaries wrong and steps two to four become
  very expensive."

**Bridge**: "So, what does the system look like as elements and relations?"

### 8 · That tangle? It's a graph
**Goal**: introduce the PetClinic graph, the picture the whole talk uses.
**On screen**: the grey tangle from slide 2, full size, its edges drawing in.

- "Remember the tangle from the beginning? Here it is, full size."

**Click 1 → class names appear on every dot; "nodes: the classes", "edges: one uses the other", "23 classes · 24 dependencies".**
- "It's Spring PetClinic, a classic Spring demo app for a vet clinic: owners, pets, visits, vets."
- "Every node is a class. Every edge means one class uses another. 23 classes, 24 dependencies."

**Click 2 → the classes take colours: customers blue, vets violet, visits amber, shared base classes grey; "the developers' own split".**
- "And this is how the developers themselves split it when they built a microservice version: customers, vets,
  visits. The grey ones are base classes like `BaseEntity` and `Person`: everyone needs them."
- "This graph is the main character of the talk. Every idea today will happen on it."

### 9 · A migration plan = cutting this graph
**Goal**: decomposition = partitioning the graph; set up "it's just clustering?" as a naive belief.
**On screen**: the same coloured map (it doesn't redraw).

- "So a migration plan is just this: cut the graph into groups."

**Click 1 → two red dashed cut lines, a smug stick figure with sunglasses: "it's just clustering!"**
- "Red lines are cuts. And this guy has a take." *(smug)* "It's just clustering! First-year algorithms. Run
  k-means, go home."

**Click 2 → the map and its edges disappear; the classes regroup into four columns: customers, vets, visits, shared + infrastructure; "after the cut: services, each a list of classes".**
- "And here's what you actually get after the cut. Not a graph any more: services, each one just a list of
  classes. The edges that crossed the cut become network calls; the rest disappear inside a service."
- "That's what every tool and every LLM will hand back today: lists of classes."

**Click 3 → "…right?"**
- "…right?" *(pause; don't answer; let the doubt sit)*

**Bridge**: "To cluster a graph you need its edges. Where do they come from?"

### 10 · Where do the edges come from?
**Goal**: static vs dynamic analysis give different edges.
**On screen**: "static: read the code", the map with all its edges, "✓ every path written down", "✗ misses wiring made at runtime".

- "Two ways to get edges. Static analysis reads the code without running it. You see every path that's written
  down. But some wiring only exists at runtime: Spring, for example, creates the class behind `OwnerRepository`
  when the app starts."

**Click 1 → "dynamic: run it, record the calls": the same map with only the edges of one recorded use case, "book a visit".**
- "Dynamic analysis runs the app and records who calls whom. Here, one use case: booking a visit. You see the calls
  that really happen, but only for what you ran."

**Click 2 → "both give you edges. not the same edges."**
- "Both give you edges. Not the same edges. Keep both in mind: they're about to show up as the tools' shopping list."

---

## II · it's just clustering… right? (slides 11–16, ~5 min)

### 11 · 24 tools, each reads something different
**Goal**: people built many tools; they differ in what they read.
**On screen**: a big "24", "tools in the literature".

- "Researchers took 'just clustering' seriously. One independent comparison counted 24 tools in the literature."

**Click 1 → four groups: "it runs the app" (Mono2Micro, Log2MS), "it reads the code" (Data-Centric, CARGO, MOSAIC), "both" (HyDec, toMicroservices), "it reads git history" (MEM); "8 of them compared on the same apps".**
- "Some run the app, some read the code, some do both, one reads your git history. That study managed to run 8 of
  them on the same apps. Let's look at a few."

### 12 · Some tools need the app running
**Goal**: tools need inputs and human choices; they can be far from the developers' answer.
**On screen**: Mono2Micro (IBM): a cluster tree cut at K; "runs every use case, clusters the traces", "you pick the number of services".

- "Mono2Micro, from IBM. It runs every business use case, records which classes work together, builds a cluster
  tree… and then asks *you* how many services you want. The default is five. Why five?" *(pause)* "Vibes."

**Click 1 → HyDec: "+ names", "JPetStore: 8 services", "the developers' answer: 3".**
- "HyDec reads the code, the traces, and even every name in the code. On JPetStore it proposed eight services.
  The developers' own answer: three."
- "So: one tool needs you to already know the answer; another over-answers."

### 13 · Some need your database, or your git history
**Goal**: more inputs, and some tools aren't even stable.
**On screen**: "Data-Centric: reads your database schema", "CARGO: reads calls + table accesses, you pick K", "MEM reads your git history".

- "Data-Centric needs your database schema. CARGO needs calls plus table accesses, and also wants you to pick the
  number of services. MEM reads who changed which files together in git."

**Click 1 → MEM's steps: "only 12 files per commit" → "30, the most Guava allows" · "max partition 10 → 25" · "still a new answer every run".**
- "The people comparing these tools tried to run MEM properly. It only looked at 12 files per commit: they raised
  it to 30, the most the library allows. Partitions capped at 10: raised to 25. And it still gave a new answer
  every run."

**Click 2 → the quote: "Lacking support from developers, we could not reliably repair the tool."**
- *(read slowly)* "'Lacking support from developers, we could not reliably repair the tool.' That's the
  researchers *evaluating* the tools."

### 14 · What "just clustering" actually needs
**Goal**: overwhelm them with everything the tools need before they can "just cluster".
**On screen**: one small box, "cluster the graph", labelled "easy".

- "So, the tools. Each one promises: give me your system, I'll cluster the graph. Easy." *(point at "easy")*
- "Here's what they actually ask for first."

**Click 1 → twelve sticky notes drop one by one around the box, and "easy" gets crossed out.** *(let them keep dropping; read a few as they land, faster and faster)*
- "A running build of the app. Business use cases, written down. Execution traces of every use case. Functional
  tests with at least 60 percent coverage. At least three use-case tests…"
- "The database schema. At least three tables. Which method touches which table. Git history: a hundred-plus
  commits, three-plus contributors…"
- "The number of services, from *you*. And config knobs nobody explains: 12 becomes 30, 10 becomes 25."
- *(as the cross lands)* "Easy." *(pause)* "Does your project have all of that? Mine doesn't."

**Bridge**: "So how many real apps can actually feed these tools?"

### 15 · So which apps can they even run on?
**Goal**: the requirements are so heavy that almost no real app qualifies.
**On screen**: "62" with 62 dots: "apps used to evaluate those 24 tools".

- "Here's the bill. Across those 24 tools' papers, 62 different apps were used for evaluation. Each dot is one."

**Click 1 → 22 dots (public Java code, English docs), 8 dots (a microservice version made by developers), 3 red dots (tests ≥ 60% coverage, ≥ 3 use cases, ≥ 3 DB tables, ≥ 100 commits, ≥ 3 people).**
- "22 have public Java code and English docs. 8 have a microservice version the developers made, so you can compare.
  And to run all the tools you need tests above 60% coverage, real use cases, database tables, a hundred-plus
  commits by three-plus people…"
- *(point at the red dots)* "**Three.** Out of sixty-two."

**Click 2 → "JPetStore · Spring PetClinic · PartsUnlimitedMRP", "and some want the number of services up front".**
- "JPetStore, Spring PetClinic, PartsUnlimited. Our PetClinic is one of the three. And some tools still want you
  to tell them the number of services."

### 16 · You, a couple of minutes ago
**Goal**: punchline of section II.
**On screen**: Gru's plan: "the monolith is a graph", "just cluster it", "but first: traces, tests, schema, git log, K".

- *(read the four panels)* "The monolith is a graph. Just cluster it. But first: traces, tests, schema, git log,
  K. But first: traces, tests…" *(Gru's face)*

**Click 1 → "it was never just clustering", "and every one of them needed a human".**
- "It was never just clustering. And every one of these tools needed a human: to run the use cases, feed the inputs,
  pick K."

**Bridge**: "So, the obvious 2025 idea…"

---

## III · enter the LLM (slides 17–31, ~15 min)

### 17 · What if we just… ask an LLM?
**Goal**: the naive idea, with a wink.
**On screen**: the "is this a pigeon?" meme (us, 2025, pointing at an LLM: "is this an architect?"); "no traces, no tests, no schema, no K…"; "hey LLM, here's my code. split it into microservices."

- "No traces, no tests, no schema, no K. Just: 'hey LLM, here's my code. Split it into microservices.'"
- *(meme)* "Us, in 2025, looking at an LLM: is this an architect?"

**Click 1 → "…could it really be that simple?"**
- "Could it really be that simple?" *(pause)*

### 18 · Get in. We're going back in time.
**Goal**: set the constraints of our ICSA study (pre-agent).
**On screen**: a clock labelled "BEFORE AGENTS".

- "Let's go back in time. Before agents. These were the rules of our ICSA 2026 study."

**Click 1 → four notes: "one plain LLM call", "no agents", "no tools, no file browsing", "a window of ~128k tokens", and the This Is Fine meme ("the whole repo" burning around "my 128k window").**
- "One plain LLM call. No agents. No tools, no browsing files. A context window of about 128 thousand tokens."
- *(meme)* "The whole repo, on fire, around my 128k window. This is fine."

**Click 2 → "so… are LLMs even good at this?"**
- "So: are LLMs even good at this? That's the question we asked."

### 19 · One call. How would YOU feed it the code?
**Goal**: make them think about the input problem before we show our answer.
**On screen**: the title only.

- **Ask**: "You get exactly one call. How do you give it the code? Think for ten seconds." *(pause)*

**Click 1 → option 1, "paste the whole repo": bars of characters (PetClinic 259k, JPetStore 439k, 7ep-demo 627k, PartsUnlimited 836k), "too big".**
- "Option one: paste everything. PetClinic is the smallest: 259 thousand characters as one text file. The others
  are much bigger. Too big."

**Click 2 → option 2, "just the class names", with red question marks, "too vague".**
- "Option two: just the class names. But is `Vets` the same thing as `Vet`? What does `PetTypeFormatter` belong to?
  Too vague."
- "We need something in between."

### 20 · What would an architect look at?
**Goal**: the architectural views A1–A5 as the in-between representation.
**On screen**: the title.

- **Ask**: "If you joined a new team, what would you want to look at before splitting their system?" *(take one answer)*

**Click 1 → five notes: A1 component diagram, A2 component overview table, A3 API endpoints, A4 technology map, A5 dynamic interactions.**
- "An architect looks at views. A component diagram. A table of components and what they do. The API endpoints.
  The technology map: Spring, JPA, Thymeleaf. And how things interact at runtime."

**Click 2 → "static: what the system IS" under A1–A4, "dynamic: what it DOES" under A5.**
- "The first four describe what the system *is*. The fifth describes what it *does*. Remember static versus dynamic
  from earlier? Same split."

### 21 · A5, for real: "find owners"
**Goal**: show a real artefact; the LLM inferred behaviour without running anything.
**On screen**: four lifelines: Browser, OwnerController, OwnerRepository, DB.

**Click 1 → the calls: "GET /owners?lastName=Sm" → "findByLastName…("Sm")" → "SELECT … LIKE 'Sm%'".**
- "A real A5 from one of our runs, the 'find owners' use case: the browser asks for owners named 'Sm…', the
  controller asks the repository, the repository queries the database."

**Click 2 → "written by the LLM: nobody ran the app".**
- "And the twist: an LLM wrote this. Nobody ran the app. It inferred the behaviour from the code summary."

### 22 · We tried without the dynamic view first
**Goal**: evidence that the dynamic view matters.
**On screen**: "A1–A4 only (static)".

- "We first tried without A5, in a pilot on a food-delivery system."

**Click 1 → OrderCRUD, MenuCRUD, UserCRUD all pointing at "one shared DB"; "anti-patterns: shared database, CRUD-centric services".**
- "With only the static views, the LLM produced create-read-update-delete services, all sharing one database. Two
  textbook anti-patterns."

**Click 2 → "+ A5 (dynamic)": "place order (commands)", "track order (queries)", "event: OrderPlaced"; "patterns: CQRS, event sourcing"; "how the system behaves over time changes where you cut it".**
- "Add the dynamic view, and it started separating commands from queries, connected by events: CQRS and event
  sourcing. How a system behaves over time changes where you cut it."

### 23 · So… who gives us these views?
**Goal**: in reality only code exists, so the LLM must write the views.
**On screen**: the "always has been" meme ("Wait, the architecture docs are just the code?").

- "Great, we want views. Who gives them to us? The developers? The documentation?" *(meme)* "Wait, the architecture
  docs are just the code? …Always has been."

**Click 1 → "what we really have: the source repository. that's it." and "so the LLM has to write the views itself, from the code".**
- "All we really have is the source repository. That's it. So the LLM has to write the views itself, from the code.
  But the code doesn't fit in the window…"

### 24 · Too big? 7 ways to summarise it
**Goal**: the six chunked summarisation strategies.
**On screen**: three rows, 30k, 50k, 80k: the repo cut into 3, 2 and 1 chunks (whole files only).

- "So we summarise first. Cut the repository, whole files only, into chunks of at most 30, 50 or 80 thousand
  tokens. For PetClinic that's three chunks, two, or one."

**Click 1 → each chunk gets its own summary (yellow).**
- "The LLM summarises each chunk separately."

**Click 2 → two merge columns: "concatenate" (summaries glued end to end) and "or: LLM merges" (into one new summary); "3 sizes × 2 merges = 6".**
- "Then two ways to combine them. Just glue the summaries together. Or ask the LLM to merge them into one new
  summary. Three sizes times two merges: six strategies."

**Click 3 → "or: a summary tree": methods → files → packages → repo; "+ 1 = 7".**
- "And a seventh that doesn't cut the repo at all: a summary tree, from an earlier paper by Dhulshette et al. Let's
  zoom in on that one."

### 25 · The 7th way: a summary tree
**Goal**: show how hierarchical summarisation works, and its cost.
**On screen**: real (shortened) `Owner.java`.

**Click 1 → (camera) the file is split into code units: fields, accessors, getPets(), addPet(), getPet(), addVisit().**
- "Take one real file, `Owner.java`. A parser splits it into units: the fields, the getters and setters, each method."

**Click 2 → (camera) one yellow summary per unit: "contact data + pets", "adds a pet", "finds a pet by name"…**
- "One LLM call per unit: 'adds a pet', 'finds a pet by name', 'records a pet's visit'."

**Click 3 → "summarise the summaries": the file summary "Owner.java: an owner and their pets".**
- "Then another call summarises those into one summary of the file."

**Click 4 → (camera pulls back) Pet.java, Visit.java, OwnerController.java and 6 more files feed the "owner package" summary.**
- "Do that for every file in the package, and summarise those into a package summary."

**Click 5 → (whole slide) model, vet and system packages roll into "one repo summary"; "every coloured box is an LLM call", "~736k tokens per run: 3–4× the chunked ways", "and the cuts were no better".**
- "Then every package into one summary of the whole repository. Every coloured box was an LLM call. About 736
  thousand tokens per run: three to four times the chunked strategies."
- "And the decompositions? No better." *(pause)* "Remember that. There's a bet on it later."

### 26 · What is a dependency graph?
**Goal**: explain the artefact before we use it.
**On screen**: six PetClinic classes as boxes: Person, Owner, OwnerController, Pet, PetController, Visit.

- "Before we feed the LLM anything else, one more artefact. Here are six classes from PetClinic, no lines yet."

**Click 1 → the edges draw in, each typed and counted: Owner extends Person; Owner uses Pet ×12, uses Visit ×5; Pet uses Visit ×4; OwnerController uses Owner ×13; PetController uses Pet ×17 and Owner ×14.**
- "A dependency graph records who depends on whom. Not just 'connected': the *kind* of dependency, and *how
  often*. `Owner` extends `Person`. `PetController` uses `Pet` seventeen times."
- "These are PetClinic's real numbers, extracted by static analysis: reading the code, not running it."

**Click 2 → "nodes: the classes", "edges: typed and counted", "extends · calls · uses · creates…".**
- "So: nodes are classes, edges are typed and counted. It's the map from slide 8, with the details filled in."

### 27 · Views are words. Words are slippery.
**Goal**: why the LLM needs the graph next to its views.
**On screen**: "an answer built from views only": a service listing "the owner controllers", "OwnerService", "PetManager"; "which classes, exactly?", "no such classes in PetClinic".

- "Why do we need it? Here's the kind of answer you get from the views alone. 'The owner controllers'.
  'OwnerService'. 'PetManager'."
- **Ask**: "Which classes are those, exactly?" *(pause)* "Trick question: `OwnerService` and `PetManager` don't exist
  in PetClinic. The LLM read a summary and invented plausible names."
- "And to score a decomposition, the metrics need every real class, spelled exactly."

**Click 1 → "a dependency graph gives the LLM": ✓ exact names (all 23 classes, spelled right: answers can be checked and scored) · ✓ the inside view (who uses whom, and how much: Owner uses Visit 5 times) · ✓ ground truth from the code (not the LLM's guess about the code).**
- "The graph fixes three things. Exact names, so every answer can be checked and scored. The inside view: who uses
  whom and how much, which a summary blurs. And it comes from the code itself, not from the LLM's guess about the code."

**Bridge**: "Easy then: just give it the full dependency graph. Right?"

### 28 · The full dependency graph is… a lot
**Goal**: the raw graph is far too big; overwhelm on purpose.
**On screen**: a wall of tiny XML: real lines from PetClinic's full dependency file, around the `Owner` class.

- "This is what a full static-analysis dependency graph looks like. Real lines, from the benchmark's file for PetClinic."
- *(let them squint at it for a second)*

**Click 1 → over the wall: "587 MB", "4.65 million lines, for a 23-class app".**
- "That file is **587 megabytes**. 4.65 million lines. For an app with 23 classes."
- "Our context window, remember, is about 128 thousand tokens. This isn't 'a bit too big'. It's absurd."

**Click 2 → "it follows every call into every library: Spring, Jackson, ASM…", "PetClinic's own Owner class first shows up at line 4,341,957".**
- "Why so huge? It follows every call into every library the app touches: Spring, Jackson, bytecode libraries,
  everything."
- "PetClinic's own `Owner` class first shows up at line 4,341,957." *(pause)* "Everything before that is somebody else's code."

### 29 · Our miniature: A6
**Goal**: what we actually pass to the LLM, and its syntax.
**On screen**: "587 MB → 29 KB", "about 20,000× smaller", and three notes: "only PetClinic's own classes: no libraries", "one node per class, not per method", "edges typed and counted".

- "So we build a miniature. 587 megabytes down to 29 kilobytes: about twenty thousand times smaller."
- "Three decisions: keep only PetClinic's own classes, no libraries. One node per class, not one per method. And keep
  the edges typed and counted, because that's the information that matters for cutting."

**Click 1 → "the shape of every entry": the syntax ("<class name>": annotations, methods (signatures), fields (declarations), relationships: "<TYPE>": { "<other class>": <count> }); and "a real one: Visit".**
- "Every class gets one entry with the same shape: its annotations, its method signatures, its fields, and its
  relationships: for each type of dependency, which other class and how many times."
- "Here's a real one, `Visit`. It's a database entity, `@Entity`, table 'visits'. It extends `BaseEntity`. And
  `Pet`, `VisitController` and `Owner` use it."

**Click 2 → the map with Visit and its edges in amber, "Visit and its edges, on our map", "Owner uses Visit 5 times: a summary loses that", "25 classes · 100 dependencies", "exact names, real edges".**
- "Those are exactly `Visit`'s edges on our map."
- "`Owner` uses `Visit` five times: a summary would never keep that. The whole thing: 25 classes, 100 dependencies.
  Exact names, real edges. That's A6, the sixth artefact, and it goes into the prompt next to the five views."

### 30 · One prompt in, one decomposition out
**Goal**: show the prompt rules and a real answer.
**On screen**: the rules: "every class exactly once · exact names · 3–6 services · high cohesion, low coupling · JSON only".

- "All the views plus the graph go into one final prompt with these rules: every class exactly once, exact names,
  three to six services, high cohesion, low coupling, answer in JSON."

**Click 1 → GPT-5's real answer painted on the map: Owner-Pet-Visit Management (10), Veterinarian Catalog (6), Shared Domain Kernel (3), Web Portal (2), Platform & I18n Infrastructure (2).**
- "Here's what GPT-5 answered, painted on our map: five services."

**Click 2 → the map and edges disappear; the answer regroups into five columns, one per service, each listing its classes; "what the LLM hands back: services, each a list of classes".**
- "Drop the picture: this is literally what came back. Five services, each a list of class names. No edges, no
  arrows. That's a decomposition."

**Click 3 → a red frame round "Shared Domain Kernel", "the base classes everyone inherits got a service of their own", "is it good? how would we even know?"**
- "Notice: it gave `BaseEntity`, `NamedEntity` and `Person`, the classes everyone inherits from, a service of their
  own. Is that good?" *(pause)* "How would we even know?"

### 31 · Put together: our ICSA 2026 pipeline
**Goal**: one overview of the whole study.
**On screen**: the pipeline figure from the paper.

**Click 1 → (camera) Inputs and phase 1: "the repo at one pinned commit, flattened by gitingest", "chunks or hierarchy: 7 strategies".**
- "Put together: we take the repo at a fixed commit, flatten it into one text file, and summarise it with one of the
  seven strategies."

**Click 2 → (camera) phase 2: "A1–A5 by the LLM, A6 by static analysis".**
- "Then the LLM writes the five views, and static analysis builds the dependency graph."

**Click 3 → (camera) phase 3: "one shot → JSON, then compared with the reference, tools, and the other LLMs"; a grid of 112 dots: "112 decompositions", "7 strategies × 4 LLMs × 4 systems" (GPT-5, Gemini 2.5 Pro, GLM-4.6, DeepSeek-3.2).**
- "One final call gives the decomposition. Seven strategies, four LLMs, four systems: 112 decompositions. Each
  dot is one."
- "So now we have 112 answers. Which brings us to the hard part."

---

## IV · is it any good? (slides 32–45, ~17 min with the game)

### 32 · Same input, two answers. Which is better?
**Goal**: judging is the hard problem; second statement of the main idea.
**On screen**: GLM-4.6's answer on the map: 7 services.

- "Same input, same prompt. GLM-4.6 cut PetClinic into seven services."

**Click 1 → DeepSeek-3.2's answer on the map: 3 services.**
- "DeepSeek cut the exact same input into three."
- **Ask**: "Which one is better?" *(take one or two answers; ask "why?")*

**Click 2 → both maps dissolve into their service lists: GLM's 7 rows, DeepSeek's 3 rows, each row a service and its classes.**
- "Without the pictures, here's what each one really is. GLM: seven small services; owners, pets and visits all
  separate. DeepSeek: three big ones; owners, pets and visits all in one."

**Click 3 → "proposing a cut is easy. judging it is the job."**
- "Proposing a cut is easy. Judging it is the job." *(this is the main idea, said a second time)*

### 33 · The honest answer: build it and run it
**Goal**: why we need static metrics.
**On screen**: notes "the cut → rewrite into services → deploy → load-test, watch it" (latency, failures, cost).

- "The honest way to judge a cut: actually build it. Rewrite into services, deploy, load-test, watch latency,
  failures, cost."

**Click 1 → the notes are crossed out; 112 dots: "112 decompositions", "a rewrite for every model, every strategy, every system", "and you'd measure how you coded it (network, caching, database), not the cut".**
- "Now do that 112 times. And even then, you'd be measuring how well you wrote the network code and the caching,
  not the cut itself."

**Click 2 → "so: judge the blueprint, not the building".**
- "So we judge the blueprint, not the building: metrics on the decomposition itself."

### 34 · Ask any software engineer
**Goal**: cohesion and coupling, on the map, as the intuition before the game.
**On screen**: the map with the developers' cut lines, and a cloud: "high cohesion, low coupling!"

- "What makes a good cut? Ask any engineer and you'll hear: high cohesion, low coupling."

**Click 1 → edges inside each group turn green: "inside a group: cohesion".**
- "Cohesion: lots of edges *inside* a group. Things that change together live together."

**Click 2 → edges crossing the cut turn red: "across the cut: coupling", "so: you be the architect."**
- "Coupling: edges *across* the cut. Every red edge here would become a network call."
- "So: you be the architect."

### 35 · You are the architect (the game)
**Goal**: students cut the system themselves, blind to the score.
**On screen**: only the QR code, filling the slide, with the URL under it; your control panel small in the bottom-right
corner (state, how many joined, ▶ start 5:00 · ↺ reset).

- "Phones out. Scan this. You get PetClinic's 23 classes. Split them into services you'd defend in a design review.
  What changes together stays together; few wires between services."
- "Each colour is one service. Tap a class to put it in. Press plus for a new service. Type your name and send it.
  One cut per phone, so choose well."

- "First your name. Then you wait: nobody starts until I press start, so everyone gets the same five minutes."
- **Before the class**: press ↺ reset (twice: it asks "tap again") to clear the room.
- **While they join**: phones ask for a name, then show "Wait until the presenter starts the game". The panel counts
  "N joined"; wait until it stops climbing.
- **When everyone has joined**: press ▶ start 5:00. Every phone shows the countdown, and the talk moves on
  to the board slide by itself (the QR code is on it too, for latecomers). A reset lets every phone, even ones that
  already sent, play again.

- "The score is a mystery. No, I won't tell you what it measures. Yet."

### 36 · The live class board
**Goal**: show results live; plant the hall of shame.
**On screen**: the live board: "Class board", every player ranked by a score (no metric named), and, only if someone
broke the rules, a red "Thought you could get away with this??" box with their names and why. On the right: the
countdown, the player count, ■ stop (while the timer runs) and the QR code with the URL.

- **Controls**: the sidebar shows "M of N sent". ■ stop closes the game early; at 0:00 it closes by itself and the timer turns red.
- **Secret extend** (nothing on screen gives it away): tap the *minutes* of the countdown for +1:00, the *seconds*
  for +0:10. Tapping "time's up" after the timer ran out reopens the game for 1:00 (not after ■ stop). Phones pick
  up the new time within a few seconds.
- *(about 5 minutes; walk around; tease: "someone here is having a very deep relationship with
  PetClinicRuntimeHints")*

- "Here's the class, live. Ranked by the mystery score."
- *(if the red box is there)* "And a second list: 'Thought you could get away with this??' We'll come back to who's
  in there." *(if it isn't)* "Nobody tried to cheat. Suspiciously honest room."

### 37 · Everyone who played
**Goal**: nobody is left out: every name on screen, with position and score.
**On screen**: "Everyone": a tile per player, filling the slide. Ranked players with medal or position and score; rule-breakers
with a red ✗ and the reason; players who joined but never sent, dashed, "ran out of time".

- "Not just the top seven: here's everyone. Find yourself."
- *(if there are ⏱ tiles)* "And the ones with the stopwatch: you ran out of time. That's not cheating, that's
  just… a migration project."

### 38 · The mystery score was… CMod
**Goal**: explain the metric they just optimised.
**On screen**: two services, A and B, with dots.

- "The mystery score was CMod: modularity, the classic cohesion-and-coupling number."

**Click 1 → edges inside each service ("inside: 3", "inside: 2") and one crossing ("crossing: a network call", "crossing: 1").**
- "Count the edges inside each service, and the ones crossing between them. Each crossing would become a network call."

**Click 2 → the formula "2·in / (2·in + out)", "A: 6/7 = 0.86, B: 4/5 = 0.80", "CMod = 83".**
- "Per service: twice the inside edges over twice the inside plus the outside. 6/7 and 4/5. Average them: CMod 83."

**Click 3 → "zero crossings scores 100. so… what if everything sits in ONE service?"**
- "Zero crossings scores 100. So… what if everything sits in ONE service?" *(look at the room; someone did it)*

### 39 · Thought you could get away with this??
**Goal**: Goodhart's law, learned by doing.
**On screen**: the whole map in one colour, one loop round everything: one service called "PetClinic".

- "One service. Called 'PetClinic'."

**Click 1 → the scores: CMod 100, CiD 100, DTP 100, DI 100, BCP 0, C2C-50 0.**
- "CMod 100. Cycles 100. Tables 100. Domain 100. Perfect. And two zeros, which we'll understand in a minute."

**Click 2 → the Trade Offer meme ("I receive: CMod 100", "you receive: your monolith back"), "perfect scores, zero cuts: the monolith we started with", Goodhart's law.**
- *(meme)* "I receive: CMod 100. You receive: your monolith back."
- "Perfect scores, zero cuts: the monolith we started with. Goodhart's law: when a measure becomes a target, it
  ceases to be a good measure. You just proved it, live."
- "So one ruler is never enough. Here are the others, each catching a different cheat."

### 40 · Cycles: the distributed monolith
**Goal**: CiD (cyclic independence).
**On screen**: the map with two groups circled, "model" and "owner" (the Java packages as services); "CiD 100".

- "Take the Java packages as services. No two services depend on each other in both directions: CiD 100."

**Click 1 → "move Owner" into "model", red arrows both ways: "CiD 90", "controllers use Owner, Owner uses Pet: neither can change or deploy alone".**
- "Now move `Owner` into 'model'. Controllers use `Owner`, and `Owner` uses `Pet`: a two-way link. CiD drops to 90.
  Neither service can change or deploy alone."

**Click 2 → "CiD = share of service pairs with no two-way link", and a dictionary card: "distributed monolith".**
- "CiD is the share of service pairs with no two-way link. And the thing it catches has a name: the distributed
  monolith. All the network calls of microservices, all the coupling of a monolith."

### 41 · Does the cut follow the business?
**Goal**: DI, BCP, DTP: business and data metrics.
**On screen**: the map with the model and owner packages circled.

**Click 1 → the "book a visit" use case lights up amber, hopping across both packages: "one use case, 'book a visit', hops across two services".**
- "Follow one use case: booking a visit. It touches classes in both packages, so with this cut every booking
  crosses a service boundary."

**Click 2 → DI 32.0 ("is each use case kept in one service?"), BCP 33.3 ("does each service serve one use case?"), DTP 100 ("is each database table kept in one service?"), "from recorded runs of the app, not from the code".**
- "Three metrics ask business questions. DI: is each use case kept in one service? BCP: does each service serve one
  use case? DTP: is each table kept in one service?"
- "These come from recorded runs of the app, not the code. And BCP is the one that gave the one-service cut a zero."

### 42 · Even the developers' split is one answer
**Goal**: C2C, and why there's no single right answer.
**On screen**: "your service".

**Click 1 → "their service" overlapping it, "overlap > half?", "C2C-50: the share of your services with a close twin in the developers' split".**
- "C2C compares you to the developers' split: how many of your services have a close twin there, overlapping by more
  than half?"

**Click 2 → "but their split copies BaseEntity, NamedEntity, Person and the app class into every service", "one good answer, not the answer", and a TC line.**
- "But careful: their own split copies the base classes into every service. So it's one good answer, not *the*
  answer."
- "And TC is the same idea over git history: does each team's code sit in its own service?"

### 43 · LLMs or the traditional tools? (bet)
**Goal**: the ICSA results, after the room commits to a guess.
**On screen**: the metric rows (CiD, CMod, BCP, DI, TC, C2C-50) with empty LLM and tool columns; a note: "your bet: who wins each row?"

- **Ask**: "Your bet: for each row, who wins: LLMs or the traditional tools?" *(10 seconds; take a few calls)*

**Click 1 → the values cascade row by row, with bars: CiD 87.8 vs 65.1, CMod 61.2 vs 62.9 (≈), BCP 44.2 vs 39.6 (≈), DI 24.1 vs 34.8, TC 20.2 vs 31.2, C2C-50 50.2 vs 29.7.**
- "Cycles: LLMs, clearly. Modularity and business purity: a tie. Domain fit and team fit: the tools. Closeness to
  the developers' split: LLMs."

**Click 2 → "LLMs: clean cuts with few cycles. tools: closer to the business and the teams."**
- "LLMs make clean cuts with few cycles; tools stay closer to the business and the teams. Neither wins outright."

### 44 · Bigger window, better cut? (bet)
**Goal**: the counter-intuitive results on context size and cost.
**On screen**: four notes (30k, 50k, 80k, hierarchical) and "which gave the best decompositions?"

- **Ask**: "Remember the seven strategies? Which gave the best decompositions?" *(take bets)*

**Click 1 → "none of them.", "no measurable difference on any metric, for any context size", "and the four LLMs? remarkably similar, too".**
- "None of them. No measurable difference, on any metric. And the four LLMs? Remarkably similar too."

**Click 2 → "ok then: which one cost the most tokens?"**
- **Ask**: "OK then: which one cost the most tokens?" *(take bets)*

**Click 3 → the token bars: 30k concat 226k, 30k LLM merge 192k, 80k concat 188k, 80k LLM merge 184k, hierarchical 736k; "small chunks repeat the instructions in every call"; "hierarchical: 3–4× the tokens, and no better".**
- "The summary tree: 736 thousand tokens. Three to four times the rest, and no better."
- "And notice: 30k costs *more* than 80k, because small chunks repeat the instructions in every call."

### 45 · Every decomposition, every score: explore it
**Goal**: hand over to the live web visualiser.
**On screen**: "live demo", the QR code for sambuaneesh.github.io/llms4arch.

- "Every one of the 112 decompositions, every score, every class: it's all public. Let me show you."
- *(open the visualiser; keep it to 3–5 minutes: one system, compare one LLM answer with a tool and the reference)*

---

## V · enter the agents: ongoing work (slides 46–49, ~5 min)

### 46 · Back to today: LLMs got hands
**Goal**: what changes with agents.
**On screen**: buff doge vs. cheems ("agents, 2026: read files, run tools, check their work" vs "one plain prompt, 2025: 128k and a prayer"); "an agent can: read files · run tools · check its work".

- "That was 2025: one plain prompt, 128k and a prayer." *(cheems)*
- "2026: agents. They read the files they need, run tools, and check their own work." *(buff doge)*

**Click 1 → "does that make the cut better? that is what we are working on now".**
- "Does that make the cut better? That's what we're working on now. It's ongoing work, so I'll show ideas, not
  final numbers."

### 47 · Real answers on PetClinic
**Goal**: why plain LLM answers need checking.
**On screen**: the title.

**Click 1 → three receipts: "it copied the example" (GLM-5.3, one prompt: answered with the prompt's placeholder, all 23 classes missing), "one class, one service" (Nemotron 3 Nano: 21 services for 23 classes, two gone), "it dodged the hard part" (OpenCode agent, gpt-oss-120b: left out BaseEntity, NamedEntity and Person).**
- "Real answers from our runs. One model copied the example from the prompt: 'Service Name: SimpleClassName'. All 23
  classes missing."
- "One gave 21 services for 23 classes, and two classes simply vanished."
- "And a coding agent left out exactly the base classes every service needs: the hard part."

**Click 2 → "the LLM proposes, plain code checks and repairs".**
- "So the design rule: the LLM proposes; plain code checks and repairs."

### 48 · Sneak peek: what we're working on
**Goal**: the agentic workflow at the level of ideas. Twelve clicks; one sentence each.
**On screen**: the whole workflow diagram.

- "This is the workflow we're building. Pink boxes are plain code, green are LLM calls, blue are both."
- **Click 1 (inputs)**: "It starts from the code, its dependency graph, and the list of classes."
- **Click 2 (1 · Evidence Constructor)**: "First, one evidence pack: facts from the code plus the LLM's views of the
  architecture."
- **Click 3 (2 · Domain Extractor)**: "Then the LLM guesses the business capabilities: owners, pets, visits, vets."
- **Click 4 (3 · Generator)**: "Three candidate cuts from three perspectives: dependency-first, domain-first,
  balanced."
- **Click 5 (4 · Evaluator)**: "Plain code checks every candidate is valid, scores it without the reference, and
  picks one."
- **Clicks 6–9 (5 · Refiner, rounds 1–4)**: "Then a small search moves one class at a time, keeping a move only if
  nothing gets worse. Round four: nothing improves, it stops."
- **Click 10 (Freeze)**: "The answer is frozen before anyone looks at the reference."
- **Click 11 (blinded evaluation)**: "Only now do we compare with the developers' split."
- **Click 12 (whole workflow)**: "LLMs where judgement helps, plain code everywhere else."

### 49 · Agents game scores too
**Goal**: connect the hall of shame to agents (the AutoSE point).
**On screen**: the agent's loop: "propose a cut" → "score it (design metrics only)" → "refine"; "remember CMod 100?"

- "Remember CMod 100? You optimised a score and broke the point of it. Agents optimise scores too, and they're far
  more patient than you."

**Click 1 → a red "firewall" line, and a sealed envelope: "the developers' answer", "opened only after the cut is frozen".**
- "So our rule: the agent's loop only ever sees design metrics. The developers' answer stays sealed behind a
  firewall until the cut is frozen."

**Click 2 → "even our own selection score got gamed once: it kept picking the candidate built from the LLM's own capability map"; "early signs: almost no failed decompositions, far fewer tokens".**
- "And even then, our own selection score got gamed once: it kept choosing the candidate that copied the LLM's own
  capability map, because the score rewarded agreement with it. Goodhart doesn't care how clever you are."
- "Early signs so far: almost no failed decompositions, far fewer tokens. Better cuts? Still being measured."

---

## VI · what to take home (slides 50–54, ~5 min)

### 50 · Spot the smell
**Goal**: students apply what they learned (retrieval before the summary).
**On screen**: a deliberately bad cut on the map: one huge blue service, two smaller ones, a "vets table"; "what's wrong with this cut?"

- **Ask**: "Last exercise. What's wrong with this cut? Shout it out." *(wait for three answers)*

**Click 1 → "god service: one team owns it all", "cycle: can't deploy alone", "shared table: can't change alone".**
- "A god service: one team owns almost everything. A cycle: these two can't deploy alone. A shared table: these two
  can't change alone."
- "If you spotted those, you can judge a cut. That was promise number one."

### 51 · You will maintain this
**Goal**: the maintenance perspective (pays off slide 6).
**On screen**: a timeline: a short "build", then a long "change, fix, extend, change again…"; "Netflix: 7 years".

- "Remember slide 6: a refactoring. This is the real life of software: a short build, then years of change, fix,
  extend, change again. Netflix's migration alone was seven years of that."

**Click 1 → "used software keeps changing, and it decays unless someone pushes back".**
- "Software that's used keeps changing, and its structure decays unless someone actively pushes back. That's an old
  law of software evolution."

**Click 2 → a note "every shortcut is a loan", "a decomposition is a maintenance decision, not a one-off project".**
- "Every shortcut is a loan you'll repay with interest. A decomposition is a maintenance decision, not a one-off
  project."

### 52 · Where tools stop, engineering starts
**Goal**: the three things tools can't do for you (promise three).
**On screen**: a small map with the cut: "cut where change is independent", "tools see calls; only you see what will change".

- "One: cut where change is independent. That's Parnas, 1972: hide each decision that's likely to change inside one
  module. Tools see calls; only you can see what will change."

**Click 1 → the map coloured, with a database per group: "boundaries follow teams and data", "then: split the data, migrate piece by piece, or stay a modular monolith".**
- "Two: boundaries follow teams and data, not just classes. Conway: systems mirror the teams that build them. And
  after the cut: split the data, migrate piece by piece, or stay a modular monolith."

**Click 2 → a smoke detector with "CMod 100": "a metric is a smoke detector, not a target", "remember the hall of shame?", "and sometimes the right cut is: don't split."**
- "Three: a metric is a smoke detector, not a target. Remember the hall of shame?"
- "And sometimes the right cut is: don't split. Segment and Prime Video would agree."

### 53 · An AI's cut is a proposal, not a decision
**Goal**: how to use AI tools for refactoring responsibly.
**On screen**: "LLM / agent" → "a proposed cut" → "checks" → "you decide"; "valid? tested? every class accounted for?"

- "So how should you use these tools? The agent proposes. Checks verify: is it valid, is every class accounted for,
  do the tests pass? And then you decide."

**Click 1 → "no tests, no safe refactoring: by a human or by an LLM".**
- "No tests, no safe refactoring. That's true for a human, and it's true for an LLM."

**Click 2 → "turn your architecture rules into checks that run on every commit".**
- "And turn your architecture rules into checks that run on every commit. Then an agent can't quietly break them."

### 54 · The whole map
**Goal**: close the loop, and leave the AutoSE question open.
**On screen**: the small grey tangle, "remember 'it's complicated'?"

- "Remember 'it's complicated'? The tangle from the start?"

**Click 1 → it grows into the full map: names, domain colours, red cuts; "an agent can propose this cut in minutes".**
- "You can read it now: classes, dependencies, domains, and where the cuts go. And an agent can propose a cut like
  this in minutes."

**Click 2 → "what it still can't do:" and three notes: "judge a cut with no answer key", "not game the score", "know what will change".**
- "What it still can't do: judge a cut when there's no answer key. Avoid gaming the score. Know what will change in
  your business next year."
- "Those are open problems for autonomous software engineering. That's where you come in."

**Click 3 → one big QR code, "all the results" (sambuaneesh.github.io/llms4arch), and "thank you!"**
- "Every decomposition and every score from the study is online here. Thank you!" *(leave this slide up for questions)*

---

## If things go wrong

- **The Wi-Fi dies during the game (35–36):** do it by voice. "Shout a class, I'll tell you where it goes", then
  reveal CMod on slide 38 as usual.
- **Nobody games the score:** "A suspiciously honest room." Then slide 39 anyway: "here's what you could have done."
- **"So are LLMs better than the tools?":** "Different, not better: cleaner cuts with fewer cycles; the tools stay
  closer to the business and the teams. Slide 42."
- **A MoJoFM question:** we report similarity as C2C because the developers' split puts some classes in several
  services, and C2C compares services as sets.
- **Running late:** say one line each for slides 21, 22, 42 and 44, and keep the demo to 3 minutes.
