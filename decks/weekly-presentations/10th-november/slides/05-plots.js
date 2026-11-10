// The paper's result plots and tables, for a discussion of what to keep and what to change. The slide is one
// animated scene (ext/plots.js, scene 'plots'), placed into this slide's frame after `pres build`.
export default {
	name: 'The plots',
	notes: `COVER
• The results as the paper shows them: four plots and one table, ordered by research question. Goal: decide with the team which to keep, which to change, which to drop
• Click one to zoom it; click again (or beside it), or press Space or Esc, to put it back. The slide has no clicks of its own

CARDS
• Workflow vs. baselines (Fig. 5) · mean difference, workflow minus each baseline, over the 32 model–system cells (eight models, five seeds), with bootstrap 95% intervals; right of zero favours the workflow.
• Per model (Fig. 7) · the same differences, one row per model, one panel per metric, each with its own scale.
• Tools vs. LLM approaches (Table XIV) · traditional tools next to the three LLM approaches; means over the four systems (LLM approaches: the eight primary models, five seeds each). The tools row averages the tools the benchmark measured (DataCentric, HyDec, Mono2Micro in two configurations, Log2MS on two systems), so it is not the best single tool; bold marks the best per metric.
• Validity of every run (Fig. 8) · one square per run: valid, invalid decomposition, unreadable output; primary models (five seeds) and breadth models (one seed).
• Token cost and time (Fig. 9) · (a) total tokens per system and model; (b) per run: input, output and cache reads, and median time.
• For each, ask: does it carry a claim we make? Is it readable at column width? Could it merge with another, or move to the appendix?

REF · TSE draft §V: Figs. 5, 7–9, Table XIV`,
	draw() {},
}
