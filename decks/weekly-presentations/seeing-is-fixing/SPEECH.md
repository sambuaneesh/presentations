# Seeing is Fixing: what to say, slide by slide

The full talk from slide 2 to slide 43, written to be said out loud. **[click]** marks where to
click. Each slide has a target time and the paper section its facts come from, so you can check any
number before you say it.

## How this talk is meant to feel

These are the decisions we made while building the deck. They're why the speech sounds the way it does.

- **Joyous, and it keeps moving.** Every slide has one idea and gets about 15–50 seconds. Leave each
  slide just before it stops being interesting. The story drives the talk, not the slides.
- **One click per reveal.** The visuals carry the slide. The speech adds what the visuals can't
  show: the why, the paper's own examples, and the numbers behind the drawings.
- **Say more than the screen shows.** Many facts here, such as Top-6 documents, 39 samples at
  temperature 1, Playwright, and the 500-line window, aren't on the slides. Saying them shows you
  know the paper. Each slide's *Off screen* line lists them.
- **Facts only from the paper.** Wherever we interpret, we say so ("our reading"). Background that
  isn't in the paper (what SWE-bench is, Agentless, MAPE-K) was checked online; see *Background*
  at the end.
- **Cover nearly everything, but say we've trimmed.** A few times, and plainly at the end, tell
  them what we skipped and to read the paper for more.
- **Three acts:** I · the problem (2–11) → II · the method (13b–29) → III · results by RQ1/2/3
  (33–39) → the recap of the three questions (42) → the scuba cat (43).
- Slide changes are instant cuts. The only camera movement is the dive on slide 14, which carries
  on into slide 15 by itself.

## Timing plan (about 21½ minutes of speech, 25 minutes with laughs and a question or two)

| Part | Slides | Target |
|---|---|---|
| I · the problem | 2 – 11 | 5½ min |
| II · the idea | 13b, 12, 13, 14 | 2½ min |
| II · the seven steps | 15 – 29 | 7 min |
| III · results | 33 – 39 | 6 min |
| Close | 42, 43 | ¾ min |

If you're running late, these slides can lose half their time without losing the story: 16, 21, 22,
27 and 36. Keep slides 13 (the hinge), 26 (try it) and 32 (the switches) at full length. They're the
moments people remember.

---

# I · The problem

## 2 · How do you know? · ~30 s · 1 click

Before the paper, a quick question. Hands up if you've ever fixed a UI bug.
…Keep it up if you were *sure* it was fixed. How did you know?

**[click]** You looked at it. And then you looked again. And then CSS fought back, like Peter here
with his blinds.

That's how we all do it: we fix pixels by looking at pixels. Today's paper asks what happens when
the one fixing the bug is an AI, and it can't really look.

## 3 · Here is a bug report… · ~25 s · 1 click

Here's a real bug report from OpenLayers, a web-mapping library. It's straight from the paper's
Figure 1.

*"There is a bug with the anchor point for some symbols."*

Okay. Which symbols? Off by how much? Too big, too small, shifted? From this alone, nobody can tell.

**[click]** And look at the last line. Even the reporter gave up on words and attached a picture.

> Source: Fig. 1 (openlayers).

## 4 · …and here are the two pictures · ~25 s · 1 click

And here are those two pictures. On the left is what OpenLayers drew. On the right is a clipping from
Google Earth, showing how it's supposed to look.

**[click]** Same symbols, wrong size and wrong place. You get it in one glance. Now try writing that
as a sentence a program could fix from. That's the whole problem, on one slide.

## 5 · 80% · ~15 s · 1 click

And this isn't a one-off. **[click]** The study behind the visual benchmark we'll meet in a second
found that 80% of visual symptoms can't be fully described in text.

> Source: §II-A, citing [22] (SWE-bench Multimodal, ICLR 2025).

## 6 · 83.5% · ~15 s · 1 click

**[click]** And in 83.5% of cases, the image is essential to solving the issue. The picture isn't
decoration. The picture *is* the bug report.

## 6b · The exam, and its visual version · ~45 s · 1 click

A quick detour, because these two names come back all through the talk.

SWE-bench is the standard exam for coding AIs: real GitHub issues from popular Python projects, about
2,300 of them. The AI gets the issue and the whole repository, and has to write a patch. The grader
then runs the tests that came with the real fix and checks they now pass. Those issues are almost
all text.

**[click]** SWE-bench M, M for *multimodal*, is the visual version, from the same group. Every issue
comes with screenshots. The code is front-end JavaScript from 17 popular libraries: diagrams
(bpmn-js), maps (OpenLayers), charts (Chart.js), syntax highlighting (highlight.js, Prism) and UI
kits (next). That's 619 tasks: 517 for testing and 102 for development.

And look at the bottom right: *no tests given.* To prevent data leakage, the system gets no test
cases. Remember that; it'll hurt in a minute.

> Off screen: SWE-bench (Jimenez et al., ICLR 2024) has 2,294 tasks from 12 Python repos. It's graded
> by running the real PR's tests. Domains of SWE-bench M are as listed in §IV-B. 619 = 517 test +
> 102 dev (§IV-B).

## 8 · Strong on SWE-bench, 12% here · ~25 s · 1 click

So how do the champions of SWE-bench do on this one? Each circle is one of the 517 test issues.

SWE-agent comes from the SWE-bench group itself and does well on the text-only exam. **[click]** It
solves 63. That's 12%. Almost every circle stays empty.

> Source: §I ("only 12%"), Table I (63 / 517 = 12.19%). Dot positions are illustrative.

## 8b · Handing it the pictures didn't help · ~30 s · 1 click

The natural reaction is: just give it the screenshots! The leaderboard has that experiment already.
It's the same agent with the same model, run with and without the images.

With GPT-4o: 62 without images, 63 with. With Claude 3.5: 63 without, and 59 *with*. It actually
got worse.

**[click]** Seeing the pixels isn't the same as understanding them. Putting the two side by side is
our reading; the numbers are straight from the paper's Table I.

## 9 · Two blindnesses · ~30 s · 2 clicks

The paper pins down why, and it comes down to two blind spots.

**[click]** One: it can't read the picture. It doesn't know *which code* is behind what it sees.
The paper calls this fault understanding.

**[click]** Two: it can't check its own fix. With no tests, it has no way to know whether a patch
worked. That's patch validation. One slide on each.

> Source: §I (two key limitations), §II-A, §II-B.

## 10 · The missing third layer · ~25 s · 1 click

A visual bug report really has three layers. The paper shows this with an Alibaba Fusion issue in
Figure 2: the words, the screenshot, and **repro code**, a little program that makes the bug happen.

That third layer is the bridge: it tells you which components produce what you see.
**[click]** But only 17% of SWE-bench M reports include it.

> Source: §II-A, Fig. 2 (next-895), 17% from [22].

## 11 · No tests in the box · ~45 s · 2 clicks

Blindness two. Normally a repair tool runs tests to choose its patch. Here, the test box is empty.

**[click]** Take this real Chart.js issue from Figure 3: the bottom corners of zero-value bars ignore
`borderRadius`. Different candidate fixes, PR 1 through PR n, each draw something *slightly*
different. Libraries like Chart.js and OpenLayers really do test this way: they compare against
reference images pixel by pixel.

**[click]** So could an AI just write that test itself? It would need the *expected* picture, drawn
pixel-perfect, in advance. Nobody can do that. So there are no tests, and no way to write one.

> Off screen: §II-B says pixel-level visual tests are typical of Chart.js and OpenLayers (refs
> [31] pixelmatch, [32] Puppeteer), and that generating such image tests is "infeasible for LLMs".

---

# II · The method

## 13b · The classic repair pipeline · ~35 s · 2 clicks

So how does anything fix bugs automatically? Automated program repair, or APR, has a classic
four-step pipeline: understand the bug, find where it is, write the fix, check it. GUIRepair follows
it exactly. The paper cites the pipeline from an APR survey (ref. [3]), whose first author is also
a Kai Huang.

**[click]** And if you squint: Monitor, Analyze, Plan, Execute, all over shared Knowledge. It's
basically MAPE-K for bugs. GUIRepair's knowledge is the project's own documentation. The sole purpose
of this analogy is to impress the self-adaptation folks in the room.

**[click]** …which, it turns out, didn't work. Moving on.

> MAPE-K is our analogy, not the paper's (Kephart & Chess, 2003).

## 12 · Read it both ways · ~30 s · 2 clicks

Meet GUIRepair. The husky is the paper's own mascot, straight from Figure 4. The whole idea fits on
one slide: read it both ways.

**[click]** **Image2Code**: read the picture as code. Turn the screenshot into code that reproduces
it. That fixes blindness one.

**[click]** **Code2Image**: read the code as a picture. Run the code and take a screenshot, so you
can judge a patch by what it draws. That fixes blindness two.

> Source: §I, §III. The paper calls it a "bidirectional cross-modal transformation".

## 13 · The hinge · ~45 s · 3 clicks

This is where I first got confused, so let's play a little. The part everything turns on, the
hinge, is the repro code.

**[click]** Here's the clean story: Image2Code writes the repro code, Code2Image replays it, out
comes the fixed picture, tick!

**[click]** …Except, wait. The same code, on the same library, gives the *same bug*. Nothing
changed. Did I just lie to you? A little.

**[click]** Here's the truth. Each candidate patch goes into the *library*, the library is rebuilt,
and the same repro code runs again. You get one render per patched build. The code never changes;
only the library under it does. That's why the repro is the hinge: it's a fixed experiment you
rerun after every fix.

> Source: §III-D1 (apply each patch, rebuild, rerun the repro).

## 14 · Seven steps · ~40 s · 3 clicks, then it moves on by itself

Here's the whole machine, Figure 4 as printed. Please don't try to read it.

**[click]** Here it is, simplified: seven steps.

**[click]** They sit on the four APR stages. Steps 1 and 2 are Image2Code, and steps 6 and 7 are
Code2Image. Steps 3 to 5 in the middle are a classic *agentless* core: a fixed sequence of steps,
with no agent deciding what to do next. That design comes from a system called Agentless.

**[click]** Let's dive in, starting with step one. *(The camera zooms in and slides on to step 1 by
itself. Keep talking.)*

> Source: §III, Fig. 4. Agentless is ref. [18]; GUIRepair "builds on simple agentless workflows" (§VII).

## 15 · Step 1 · first, only the names · ~25 s · 2 clicks

Step one, knowledge mining. Before touching any code, read the manual, like a person new to a
project would. But docs are big and context windows aren't. So first, the chat model (GPT-4o)
sees only the *file names*, like a flashlight over the spines on a bookshelf.

**[click]** It picks the docs that sound relevant, six of them. **[click]** It also names the key
directories. The tree is Chart.js's docs from Figure 4; which files it picks here is illustrative.

> Off screen: Top-6 from the chat model at temperature 0 (§IV-D).

## 16 · Step 1 · …then read the pages · ~30 s · 2 clicks

But a name can lie. So there's a second pass: an embedding model, OpenAI's text-embedding-3-small,
reads the actual pages. It splits them into 512-token chunks, but only inside those key directories,
which keeps it cheap.

**[click]** The six chunks closest to the issue win. **[click]** Merge both lists, by name and by
similarity, and that's the *related docs*. If this sounds like RAG, it is. The paper says it was
inspired by retrieval-augmented generation.

> Source: §III-A1, §IV-D (chunk 512, overlap 0, Top-6).

## 17 · Step 2 · next-1509, as the reporter saw it · ~20 s · 1 click

Step two, repro generation, with the paper's own example: next-1509, from Alibaba's *Fusion Next*
UI library. There's a date picker inside a dialog.

**[click]** The calendar opens *beneath* the dialog, so you can't pick a date.

## 18 · Step 2 · the picture, written as code · ~35 s · 4 clicks

And here's the code GUIRepair writes for it, the real lines from Figure 6b. Line 2 names the parts:
**[click]** a Button, **[click]** a Dialog, **[click]** a DatePicker. Each maps to a piece of the
picture.

**[click]** Lines 4 to 47 arrange them so the bug happens: a ConfigProvider with a popup container,
inside a scrolling box. That's the picture, written as code. The model writes only the JavaScript;
the HTML and CSS are fixed scaffolding.

> Source: §III-A2, Fig. 6. One-shot prompting (§IV-D). Inspired by website generation and bug
> reproduction work.

## 19 · Step 2 · the report, plus · ~25 s · 3 clicks

So the report grows. Description, plus screenshot, **[click]** plus repro code,
**[click]** equals the *Issue Report+*. Every later step reads this, not the original.

**[click]** And it doesn't have to be pixel-perfect. A button the wrong size or a different
highlight colour is fine. What matters is the code behaviour behind the bug, say, an API being
misused. And since it all gets re-rendered in a clean local setup later, the noise disappears anyway.

## 20 · Step 3 · Which files? · ~25 s · 2 clicks

Now the agentless core. Step three: which files? The whole repo can't fit in a prompt. So the chat
model reads only the folder structure, a trick borrowed from Agentless, while the embedding model
fetches the four closest files from the key directories.

**[click]** Out come the suspicious paths. **[click]** More than four? Keep the Top-4.

> Off screen: the chat model samples twice at temperature 1 for variety (§IV-D).

## 21 · Step 3 · Read it as a skeleton · ~20 s · 2 clicks

To choose those four, each suspect file is read as a *skeleton*. **[click]** The bodies are
scribbled out. **[click]** It keeps imports, headers and comments, and drops variable declarations.
Agentless's skeleton keeps the declarations; GUIRepair swaps them for imports, so it can see how
files depend on each other.

> Source: §III-B1.

## 22 · Step 4 · Which functions? · ~25 s · 2 clicks

Step four: which functions? Now the model reads the four files *in full* and names the guilty classes
or functions. **[click]** Here they are, Figure 4's Chart.js example.

**[click]** And if the bug lives outside any function, in a config block or in global code, it
takes a 500-line window around it instead.

> Source: §III-B2, §IV-D (window 500; temperature 1, 2 samples).

## 23 · Step 5 · Write the edit · ~30 s · 3 clicks

Step five: write the fix, as a search-and-replace edit, another idea from Agentless. Here's the real
Prism fix from Figure 7: a YAML string loses its colour when a comment follows it on the same line.

Search for this regular expression… **[click]** and replace it with this one.
**[click]** The key difference: a `#` joins the list of things allowed after a string, so a comment
can end it. **[click]** Then `git diff` turns the edit into an ordinary patch.

> Source: §III-C, Fig. 7a (prism-1602).

## 24 · Step 5 · Not one patch: a handful · ~30 s · 2 clicks

And it doesn't write one patch. First comes the model's best guess, at temperature zero: always its
most likely answer.

**[click]** Then 39 more at temperature one, each a bit different: up to 40 candidate fixes.

**[click]** But the benchmark counts only one: Pass@1, you submit a single patch. Which one? With no
tests, that's blindness two again, and that's Code2Image's job.

> Source: §III-C, §IV-D (1 greedy + 39 sampled), Pass@1 §II-B, §III-D.

## 25 · Step 6 · Now look at every one · ~25 s · 3 clicks

Step six, GUI rendering. Take one patch. **[click]** Apply it, rebuild the library, and run the
repro code in a real browser, driven by Playwright. **[click]** Take a screenshot. Every candidate
becomes a print.

**[click]** And remember that little grey line: *the environments were set up by hand.* We'll come
back to it.

> Off screen: `fnm` to switch Node.js versions, npm/pnpm/yarn, Playwright (§IV-D).

## 26 · Step 6 · try it: prism-1602 · ~40 s · interactive

Let's try it ourselves. This is prism-1602 again. The browser shows the bug: on the second line,
"world" has lost its colour because of the comment after it.

*(Drag patch 1 into the browser.)* The picture changed, but now *all* the highlighting is gone!
*(Put back.)* *(Drag patch 2 in.)* Both "world"s are green, and the comment is grey. Fixed. This
is exactly what the model gets to see.

> Source: §III-D2, Fig. 7b. Our render is reconstructed, not the paper's screenshot.

## 27 · Step 7 · Same pixels? Out. · ~25 s · 2 clicks

Step seven, patch selection, in two parts. The first part is a cheap sieve. Every print is compared
pixel by pixel with the bug image.

**[click]** The candidates land on the sieve. **[click]** Any print with *no* pixel change falls
through: that patch did nothing visible, so it's out. No AI needed for this part.

## 28 · Step 7 · Stops at the first yes · ~25 s · 4 clicks

Part two is the judge. The survivors go to the model one at a time, with the issue in mind: "does
this look fixed?"

**[click]** No. **[click]** No, no. **[click]** No. **[click]** Yes. Stop. Only that one is
submitted.

Notice that it doesn't rank all forty. It takes the *first* one that looks right, and the rest are
never looked at.

> Source: §III-D2 ("Once the model identifies a patch as effective, the validation process
> terminates"). Frame numbers are illustrative.

## 29 · Step 7 · Three prints of one line · ~25 s · 2 clicks

Here's the paper's own example of the judge at work: the bug, patch 1 and patch 2.

**[click]** Patch 1 changed the pixels, so it got through the sieve, but it killed all the
highlighting. No. **[click]** Patch 2 brings it back, and the model keeps patch 2.

And that's the entire method: read the picture as code, and judge the code by its picture.

---

# III · Results

## 33 · RQ1 · Against the leaderboard · ~35 s · 2 clicks

So, does it work? The paper asks three research questions. RQ1: how does it compare to the state of
the art? Here's the SWE-bench M leaderboard as of May 2025. A commercial system, Globant's Code
Fixer Agent, leads with 153 of 517. Zencoder has 140, and Agentless Lite has 131.

**[click]** GUIRepair, with plain GPT-4o, gets 157.

**[click]** That's four more than the best commercial system. The fairest comparison is against
Agentless Lite running the *same* model, GPT-4o: plus 30. A simple fixed pipeline beat complex agents.

> Off screen: +17 over Zencoder, +26 over the best open-source system (§V-A). The commercial systems
> don't say which model they use, so the same-model comparison is the fair one (the paper says this).

## 34 · RQ1 · What a fix costs · ~30 s · 2 clicks

And the bill: 29 cents per issue.

**[click]** SWE-agent Multimodal, on the same GPT-4o, costs $2.94, ten times as much, for 63 fixes
instead of 157.

**[click]** To be fair, it's not the cheapest. Its own agentless core costs 8 cents, and Agentless
Lite costs 18. The expensive part is sampling 40 patches and reading all their pictures.

> Source: Table I, Table III, §V-B3.

## 37 · RQ1 · Different eyes see different bugs · ~30 s · 2 clicks

Do they all fix the same bugs? Here's Figure 8, the paper's Venn diagram of the top five systems.
A five-way Venn is hard to read, so **[click]** here's ours, with just the unique fixes and the
middle. 92 bugs are fixed by all five.

**[click]** But GUIRepair solves 12 that nobody else does, and Globant solves 12 of its own. Their
totals are close, 157 against 153, but they win on different bugs. These systems complement each
other.

## 38 · RQ1 · Where it works, where it doesn't · ~30 s · 2 clicks

Where does it work? Each outline is one repository, filled green as far as GUIRepair got.

**[click]** OpenLayers: 76 of 79, that's 96%. To be fair, every top system does well there.

**[click]** Carbon, IBM's design system and the biggest repository with 134 tasks: only 9%. And
scratch-gui: zero. Nobody in the table solves a single one.

Repository by repository, GUIRepair is best in 7, Globant in 5 and Zencoder in 6. There's plenty
of room left.

> Source: Table II, §V-A.

## 32 · RQ2 · Two switches · ~50 s · interactive

RQ2: do the two new parts actually help? Two switches.

Both off is just the agentless core: 136 solved, 8 cents an issue.
*(Flip Image2Code.)* 146: plus 10, for 10 cents.
*(Flip it off, flip Code2Image.)* 148: plus 12. But it costs 27 cents, about three times as much,
because of the 40 samples and all the pictures it reads.
*(Both on.)* 157: plus 21, a 15% improvement.

The interesting part is that Code2Image alone only works when the report already has repro code,
and that's just the 17%. Image2Code writes the repro that Code2Image needs. They're designed as a
pair.

> Source: Table III, §V-B (+7.35%, +8.82%, +15.44%; "only around 17% of instances contain
> reproduced link").

## 31 · RQ2 · eslint-15243 · Why the docs matter · ~40 s · 3 clicks

Why do the docs matter so much? Here's a case from the paper: eslint-15243, a request to support
*async formatters*.

**[click]** Without Image2Code, the model guesses from file names: the CLI engine, the formatters
folder. It never looks at `lib/cli.js`.

**[click]** With Image2Code, it first reads ESLint's own architecture doc, which says `lib/cli.js`
is "the heart of the ESLint CLI".

**[click]** So it looks there, and adds an `await` in front of `formatter.format(results)`, which
matches what the real developer did. The maintainers' own map led it to the bug.

> Source: §V-B2, Fig. 9.

## 30 · RQ2 · next-4182 · Only the full pipeline solved it · ~40 s · 4 clicks

And here's one that *only* the full pipeline solves: next-4182. Turning on "popup v2" in a
CascaderSelect throws an error. The report has a snippet and a screenshot, but no complete repro
code. So Code2Image alone has nothing to run, and Image2Code alone can't check its patches.

**[click]** Step 1: it reads the CascaderSelect docs and the popup theme, and names the bug:
"cannot read getInstance of null".
**[click]** Step 2: it writes the repro, with `popupProps: { v2: true }`.
**[click]** Step 3: it finds `cascader-select.jsx`.
**[click]** Step 7: it replays the repro on each patch, in order, and at patch 8 it says: *"This patch
has solved the bug scenario."*

> Source: §V-B4, Fig. 10.

## 35 · RQ3 · Better eyes, same pipeline · ~30 s · 3 clicks

RQ3: does it carry over to other models and projects? Same pipeline, better eyes. With GPT-4o, the
base gets 136 and the full pipeline 157.

**[click]** With GPT-4.1: 148, then 161. **[click]** With o4-mini, a reasoning model: 160, then 175.

**[click]** 175: that's 22 more than the best commercial system. And the two components add 21,
13 and 15 on each model, so the gain isn't just a better model.

> Off screen: o4-mini full costs $0.36 per issue (Table V). A side note of our own: o4-mini's *base*
> alone (160) already beats Globant's 153.

## 36 · RQ3 · Five new repos, 102 tasks · ~25 s · 1 click

And on new projects: the development split, 102 tasks from five other repositories: Chart.js,
p5.js, marked, react-pdf and WordPress.com's Calypso. One pencil stroke per task solved.

RAG gets 11, GUIRepair's base 10, SWE-agent Multimodal 10. **[click]** The full GUIRepair gets 14.
The numbers are small, because these repos are hard, but it's still the best of all.

> Source: Table IV, §V-C.

## 39 · The catch · Still done by hand · ~30 s · 3 clicks

Now, the catch. Remember that little grey line?

**[click]** Step six is done by hand. **[click]** For every repository, the authors installed its
dependencies by following its contributor guide, built it, imported the package into the repro's
HTML, and fixed paths when it wouldn't run.

**[click]** In their own words, it's "a practical compromise", following the SWE-bench M study. They
list it as a threat to validity, mention that SWE-bench M has since released Docker images, and plan
to automate it.

> Off screen, if asked about data leakage: they use the same base model as the baselines, and the
> gains show up in the ablation and on other models too (§VI).

---

# Close

## 42 · What we've answered · ~30 s · 1 click (the notes pop in one by one)

It may not feel like it, but we've now answered all three of the paper's questions.

**[click]**
**RQ1**, how good is it? 157 of 517 with GPT-4o, more than anyone on the leaderboard, at 29 cents an
issue.
**RQ2**, do the two parts help? Yes: plus 10 and plus 12 on their own, plus 21 together.
**RQ3**, does it carry over? Yes: best on the new repositories, and 175 with o4-mini.

We skipped a lot for time: the implementation settings, the related work, the full per-repository
table, the threats section. If any of this caught your interest, the paper is very readable, and
the code and data are public.

## 43 · Thank you · ~15 s · 1 click

Thank you!

**[click]** And here's your reward for your attention so far. Happy to take questions.

---

## Ready for questions (all from the paper)

- **Why not just use a vision model?** That's what SWE-agent Multimodal does, and it got 63 (Table I).
  The gain comes from turning pictures into code and code into pictures, not from having eyes.
- **Is it an agent?** No. It's agentless: a fixed sequence of steps with no tool-use loop (§VII).
  That's why it's cheap.
- **What's "first work"?** The paper calls itself the first to explicitly target issues with visual
  cues in front-end libraries (§I contributions). Earlier visual repair work was narrow:
  DesignRepair handles UI design quality, Iris handles colour accessibility on Android (§VII).
- **What exactly does Code2Image compare?** First pixels (no change means out), then the model
  judges each remaining screenshot against the issue, in order, and stops at the first yes (§III-D2).
- **Is the repro code always right?** No, and it doesn't have to be. Small mismatches are tolerated;
  it only has to capture the behaviour, for example an API misuse (§III-A2).
- **Where's the code?** Released with the data; the paper links sites.google.com/view/guirepair ([27]).

## Background (checked online, not from the paper)

- **SWE-bench:** 2,294 tasks from real GitHub issues and pull requests in 12 Python repositories.
  A patch is graded by running the tests from the real fix.
  [arXiv 2310.06770](https://arxiv.org/abs/2310.06770)
- **SWE-bench Multimodal:** JavaScript, 17 libraries, visual domains as listed. Its abstract also
  reports SWE-agent at about 12%. The abstract says 617 tasks; the paper we present says 619
  (517 + 102). Use the paper's numbers.
  [arXiv 2410.03859](https://arxiv.org/abs/2410.03859)
- **Agentless:** localize → repair → validate, with no autonomous agent loop; simple, cheap and
  interpretable. [arXiv 2407.01489](https://arxiv.org/abs/2407.01489)
- **MAPE-K:** Monitor, Analyze, Plan, Execute over shared Knowledge. It's the reference loop for
  self-adaptive systems, from IBM's autonomic computing vision (Kephart & Chess, 2003).
  [The Vision of Autonomic Computing](https://www.researchgate.net/publication/2955831_The_Vision_Of_Autonomic_Computing)
