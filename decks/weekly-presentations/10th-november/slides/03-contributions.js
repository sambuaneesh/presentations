// The contributions as the paper lists them, one per click; 2 and 4 greyed for discussion. The slide is one animated
// scene (ext/contributions.js, scene 'contributions'), placed into this slide's frame after `pres build`.
export default {
	name: 'Contributions',
	notes: `COVER
• What the paper claims as its contributions: 1, 3 and 5 are firm; 2 and 4 (greyed) are open, ask the team whether they hold up as contributions

CLICKS
0 · 1 · The workflow itself: the LLM proposes (evidence, domain knowledge, three candidates), deterministic code decides (repair, validate, select, refine), and no reference data is ever used.
1 · 2 (open) · The evaluation design: seventeen LLMs, eight run five times per system; the same inputs for every approach; the reference only after freezing; tests fixed before looking at results; robustness checks.
  – Case for it: it is the only contribution that carries the comparison results (RQ1–3), and the matched, repeated-run design is what prior work lacks (MicroAgent gives the service count from the reference and reports single runs).
  – Case against: as written it lists methodology, not a finding, and it overlaps with 4 (repeated runs) and 5 (reproducibility). Option: reword it around what the comparison found.
2 · 3 · The design evidence: a documented sequence of design experiments, and a paired ablation on identical LLM outputs showing that a selection criterion taken from the LLM's own output biased selection toward the candidate built from it.
3 · 4 (open) · Lessons: deterministic safeguards, models converging on public benchmarks, and that repeated runs change the conclusions of a comparison. Ask: is this a contribution or the discussion section?
4 · 5 · The open workbench: every prompt, protocol, run artifact and script; every number, table and figure regenerates from it.

REF · TSE draft §I (contributions list)`,
	draw() {},
}
