// The paper's data plots (Figs. 5–10), for a discussion of what to keep and what to change. The slide is one animated
// scene (ext/plots.js, scene 'plots'), placed into this slide's frame after `pres build`.
export default {
	name: 'The plots',
	notes: `COVER
• All six data plots of the paper. Goal: decide with the team which to keep, which to change, which to drop
• Click a plot to zoom it; click again (or beside it), or press Space or Esc, to put it back. The slide has no clicks of its own

PLOTS
• Fig. 5 · Primary analysis (forest plot): mean difference, workflow minus each baseline, over the 32 model–system cells (eight models, five seeds), with bootstrap 95% intervals; right of zero favours the workflow.
• Fig. 6 · Size control: each point one model–system cell; difference in number of services (x) against difference in the metric (y), workflow minus single-shot (top) and for the ablation (bottom); lines are least-squares fits, "adj." is the fitted difference at equal service counts.
• Fig. 7 · Per model: the same differences as Fig. 5, one row per model (five-run means over four systems), one panel per metric, each with its own scale.
• Fig. 8 · Validity of every attempt: one square per run, primary models (four systems × five seeds) and breadth models (four systems).
• Fig. 9 · Cost: (a) total tokens per system and model; (b) per run, input/output/cache-read composition and median time.
• Fig. 10 · The ablation per model: final workflow minus the version that also scored agreement with the capability map, on identical LLM outputs.
• For each, ask: does it carry a claim we make? Is it readable at column width? Could it merge with another or move to the appendix?

REF · TSE draft Figs. 5–10 (§V)`,
	draw() {},
}
