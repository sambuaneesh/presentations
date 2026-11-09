// The workflow, old to new. The slide is one animated scene (ext/morph.js, scene 'pipeline-morph'): it opens on the
// TSE deck's live-trace diagram, each click applies one design principle behind the new Fig. 1, and the last click
// shows the paper's figure itself. The scene shape is placed into this slide's frame after `pres build` (code slides
// draw native shapes only). The slide has no headings: the notes carry what to say at each click.
export default {
	name: 'Old diagram to new',
	notes: `COVER
• The same workflow, drawn twice: the figure from our earlier deck, and Fig. 1 of the TSE draft
• The agents and the flow did not change; only how we draw them did. Each click is one design principle, applied to every box it touches
• Ask at the end: does the new figure read at a glance, and does anything look wrong or missing?

CLICKS
0 · The old figure. Inputs on the left; the five agents inside the dashed Process Controller frame; the Quality Agent on the right; a horizontal oracle firewall; the blinded evaluation below it.
  – Colour alone gives the kind of agent: pink = deterministic tool, green = LLM, blue = hybrid (both).
  – The black pills are numbers from one live run (Spring PetClinic, DeepSeek v4.1 Flash).

1 · Draw only what exists.
  – The Quality Agent was marked future work and was never built, so it leaves.
  – The canonical class inventory no longer gets its own box and long wire: it travels inside the evidence pack.
  – The Process Controller orders the stages, validates every artifact, freezes the result and records the run. It runs the agents; it does not contain them. A frame round them suggested a container, so it becomes a band.

2 · Short labels: a box holds a name and one line (Rougier et al., "Ten Simple Rules for Better Figures", 2014).
  – The token and score pills leave: numbers belong in the text and the tables, not in the method figure.
  – "Agent" is dropped from every name; the strategy list becomes "3 strategies, then repair".
  – "Design + similarity metrics" becomes the six names: CMod, CiD, DTP, DI, BCP, C2C.

3 · One symbol, one meaning (Moody, "The Physics of Notations", IEEE TSE 2009).
  – The result charts already use colour for the three approaches, so colour cannot also mean "kind of agent".
  – Colour-only coding also fails in greyscale print and for colour-blind readers.
  – Now: a robot is an LLM call (the number is calls per run), a gear is deterministic code. A hybrid agent shows both icons, so there is no third colour.
  – Point at the Generator: 3 LLM calls, then deterministic repair. The legend shrinks to a two-entry key.

4 · Artifacts as small pictures (the Agentless, MapCoder and MetaGPT figures draw their artifacts like this).
  – A decomposition is drawn as a partition: dots are classes, tinted columns are services.
  – The locked one is the frozen result; the grey one is the reference; three stacked ones are the 3 candidates the Generator hands to the Evaluator.

5 · One reading direction, one firewall line.
  – Top row left to right (1 → 2 → 3); one vertical connector carries the candidates down; bottom row right to left (4 → 5 → frozen → evaluation). The Agentless overview uses the same snake.
  – Straight arrows and no crossings: the old inventory wire and the bent "evidence" arrow are gone. The caption says agents 3–5 also read the evidence pack and the capability map.
  – The oracle firewall becomes one vertical red line between the deterministic part and the blinded evaluation. Red means nothing else in the figure.
  – A shorter figure also places better on a two-column journal page.

6 · Group by regions (Gestalt "common region": things inside one shaded area read as one group).
  – Three regions: LLM interprets and proposes; deterministic code decides; blinded evaluation. They replace most arrows and most of the legend.
  – Together they spell out the one message: the LLM only proposes, code decides, and the reference is used only after the result is frozen. DTP, DI, BCP and C2C are never computed during a run.

7 · The paper's Fig. 1 as it stands (TikZ, full page width).
  – Ask the team: what would you change, add or drop?

REF · TSE draft Fig. 1 (papers/tse-2026/manuscript/imgs/agenticFramework.tex) and its caption · old figure: tse-2026-paper deck, live-trace slide`,
	draw() {},
}
