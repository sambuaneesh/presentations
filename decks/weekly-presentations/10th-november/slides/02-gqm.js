// How the study is planned: the GQM goal, refined into the four research questions and their measures. The slide is
// one animated scene (ext/gqm.js, scene 'gqm'), placed into this slide's frame after `pres build`.
export default {
	name: 'Goal to research questions',
	notes: `COVER
• How we planned the paper: one goal in GQM form (Basili's Goal Question Metric), refined into four research questions, each answered by specific measures
• Colour follows each question from the phrase of the goal it comes from to the measures that answer it

CLICKS
0 · The goal, read row by row. Object: the agentic workflow. Purpose: is it architecturally sound, valid and affordable, compared with single-shot prompting, an autonomous coding agent (OpenCode) and traditional tools? Quality focus: design quality, reference similarity, validity, stability, token cost. Viewpoint: architects and researchers. Context: four Java monoliths with reference decompositions, 17 LLMs, eight of them run five times per system and approach.
  – Why this goal: decomposition balances structure, business alignment and migration effort, so quality needs several metrics, not one; and our ICSA study found single-shot decompositions promising but without guarantees or alternatives, which an agentic organization promises at unknown cost.

1 · The phrases each question comes from light up and drop out of the goal: sound → design quality and reference similarity; valid → validity and stability; affordable → token cost; and the object itself, the workflow.

2 · RQ1 Quality: from "design quality" and "reference similarity". Compared against all three alternatives.
3 · RQ2 Reliability: from "validity" and "stability". Does each approach produce a valid decomposition, and does it give the same answer across repeated runs?
4 · RQ3 Cost: from "token cost". How many tokens, and where in the workflow they go.
5 · RQ4 Design: from the object of study, the workflow. Which of its design decisions matter, and why?

6 · The measures (M).
  – RQ1: design metrics CMod, CiD, DTP, DI, BCP; reference similarity C2C at three thresholds.
  – RQ2: share of valid decompositions among all attempts; over five runs per system, how many distinct partitions and how far apart they are.
  – RQ3: input and output tokens per system, and their split across the workflow's stages.
  – RQ4: the documented sequence of design experiments, and a paired ablation on identical LLM outputs.
  – Ask the team: are these the right questions for the claim we make, and is any question or measure missing?

REF · TSE draft §IV-A (goal and research questions) · §I (the RQs)`,
	draw() {},
}
