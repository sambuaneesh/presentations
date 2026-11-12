// Why the LLM needs the dependency graph next to its views: views are words (names drift, classes get invented);
// the graph gives exact names and the real structure. Answer on the left is the kind views alone produce (ICSA §IV-B:
// A6 grounds the LLM's reasoning, prevents non-existent entities, honours the actual dependency structure).
export default {
	name: 'Why a dependency graph?',
	kicker: 'III · enter the LLM · phase 2',
	title: 'Views are words. Words are slippery.',
	source: 'ICSA 2026 §IV-B (A6)',
	draw(k) {
		k.box(110, 260, 820, 300, { size: 's', fill: 'solid', color: 'white' })
		k.text(135, 272, 'an answer built from views only', { size: 'm', color: 'grey' })
		k.text(140, 330, '"Owner Service": [\n   "the owner controllers",\n   "OwnerService",\n   "PetManager" ]', { font: 'mono', size: 'l' })
		k.text(1000, 290, 'which classes, exactly?', { size: 'l', color: 'red' })
		k.text(1000, 370, '“OwnerService”, “PetManager”:\nno such classes in PetClinic', { size: 'l' })
		// 1: what the graph gives us
		k.text(110, 640, 'a dependency graph gives the LLM', { size: 'l', color: 'grey', beat: 1, anim: 'fade' })
		const G = [['exact names', 'all 23 classes, spelled right:\nanswers can be checked and scored'], ['the inside view', 'who uses whom, and how much:\nOwner uses Visit 5 times'], ['ground truth from the code', 'not the LLM’s guess\nabout the code']]
		G.forEach(([h, t], i) => {
			k.text(110 + i * 590, 720, '✓ ' + h, { size: 'l', color: 'green', beat: 1, anim: 'fade', delay: 300 + i * 300 })
			k.text(150 + i * 590, 790, t, { size: 'm', beat: 1, anim: 'fade', delay: 400 + i * 300 })
		})
	},
}
