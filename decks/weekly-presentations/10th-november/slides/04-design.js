// Contribution 3 opened up: the heading morphs out of slide 3 and Table IV of the paper fills the slide. The slide is
// one animated scene (ext/design.js, scene 'design'), placed into this slide's frame after `pres build`.
export default {
	name: 'Design decisions',
	notes: `COVER
• Contribution 3, opened up: Table IV of the paper, the design experiments that shaped the workflow (DeepSeek v4.1 Flash, blinded evaluation after freezing)
• Each row changed one mechanism: the question, what we observed, what we decided.

WALK THROUGH
• E1 · Do three strategy prompts give three alternatives? Not really: often one or two distinct partitions; domain-first and balanced were identical on all four systems. We keep diversity diagnostics and report the collapse.
• E2 · Algorithmic (Louvain) seeds gave three distinct candidates but not better ones. Not adopted: the LLM keeps membership.
• E3 · The first domain score saturated at 100. Replaced by V-measure, which E9 later removed from selection.
• E4 · Is the selector the bottleneck? All candidates were Pareto non-dominated, so we keep the weighted composite.
• E5 · LLM self-refinement: one accepted edit across four systems. Replaced with deterministic Pareto local search.
• E6 · LLM-inferred ownership links displaced structural moves. Not adopted.
• E7 · Replicating shared classes cut cross-service dependency weight by 3–33% on three systems, but the metrics cannot score replicated classes fairly. Future work.
• E8 · The interim design was cheaper than single-shot but worse on C2C-50 and all five design metrics; on PetClinic, selection favoured the fragmented domain-first candidate. So we analysed the selection score.
• E9 · The key one: V-measure rewarded agreement with the capability map that the domain-first candidate was generated from, so selection was self-referential. Without it: four of five design metrics above single-shot on DeepSeek, two of five on the GLM-5.2 hold-out. Adopted: the final workflow.
• E10 · Consensus (medoid) selection: one of five metrics above single-shot. Rejected.
• E11 · A data-ownership objective: three of five, but by less than E9. Not adopted.
• Ask the team: which of these decisions would you question, and is anything missing?

REF · TSE draft Table IV (§III-E)`,
	draw() {},
}
