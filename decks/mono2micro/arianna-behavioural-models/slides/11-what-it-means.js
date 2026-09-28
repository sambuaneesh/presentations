export default {
	name: 'What it means',
	kicker: 'II · the answer, for now',
	title: 'The models did not change the business split',
	source: 'results.md · limits in README.md',
	notes: 'COVER\n• with her four models the LLM kept the same business services on both systems; on PetClinic it only split infrastructure, which lowered CMod and C2C\n• cost: +151% / +245% prompt tokens for no gain\n• limits: one model, one pipeline, one try, two systems, models mined from tests only\n• if we want more certainty: repeat the two calls a few times, or try the state machine alone (the only class-level model)\n• needed from Arianna: scripts and settings, a clean demo export, models for demo and JPetStore\nCLICKS\n1 · the limits · 2 · next steps\nREF · README.md',
	draw(k) {
		k.box(160, 320, 760, 220, { text: 'no gain,\nmore than double the cost' })
		k.note(1080, 320, 'one model · one try\ntwo systems', { color: 'yellow', beat: 1, anim: 'drop' })
		k.box(160, 660, 1500, 200, { text: 'next: repeat a few times · try the state machine alone · ask for scripts + clean demo data', color: 'red', beat: 2, anim: 'pop' })
	},
}
