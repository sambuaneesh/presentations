// Agents game scores too (the hall of shame, for agents). The workflow's rule: selection and refinement see only the
// design metrics; the developers' reference is sealed until the cut is frozen (the oracle firewall, TSE draft §III).
// Even then its own selection score was gamed once (design experiment E9, TSE draft Table IV). Then the early signs.
export default {
	name: 'Agents game scores too',
	kicker: 'V · enter the agents · ongoing work',
	title: 'Agents game scores too',
	source: 'TSE draft §III (oracle firewall) · design experiment E9, Table IV',
	draw(k) {
		// the agent's loop: propose, score, refine
		k.box(130, 300, 300, 110, { text: 'propose a cut', size: 'm', id: 'p' })
		k.box(560, 300, 340, 110, { text: 'score it\n(design metrics only)', size: 'm', id: 's' })
		k.box(345, 560, 300, 110, { text: 'refine', size: 'm', id: 'r' })
		k.arrow('p', 's', { size: 'm' }); k.arrow('s', 'r', { size: 'm', bend: 20 }); k.arrow('r', 'p', { size: 'm', bend: 20 })
		k.text(1590, 300, 'remember\nCMod 100?', { size: 'l', color: 'grey' })
		// 1: the firewall and the sealed answer
		k.pen([[1000, 250], [1000, 820]], { color: 'red', size: 'l', dash: 'dashed', beat: 1, anim: 'wipe' })
		k.text(1020, 250, 'firewall', { size: 'm', color: 'red', beat: 1, anim: 'fade' })
		k.box(1100, 400, 400, 240, { fill: 'solid', color: 'white', size: 'm', beat: 1, anim: 'pop', delay: 400 })
		k.arrow([1100, 400], [1300, 540], { size: 'm', head: 'none', beat: 1, anim: 'wipe', delay: 600 }); k.arrow([1300, 540], [1500, 400], { size: 'm', head: 'none', beat: 1, anim: 'wipe', delay: 700 })
		k.text(1100, 670, 'the developers’ answer', { size: 'l', beat: 1, anim: 'fade', delay: 600 })
		k.text(1100, 730, 'opened only after the cut is frozen', { size: 'm', color: 'grey', beat: 1, anim: 'fade', delay: 800 })
		// 2: even so, a score got gamed; then the early signs
		k.text(130, 780, 'even our own selection score got gamed once: it kept picking\nthe candidate built from the LLM’s own capability map', { size: 'm', beat: 2, anim: 'fade' })
		k.text(130, 920, 'early signs: almost no failed decompositions, far fewer tokens', { size: 'l', color: 'green', beat: 2, anim: 'fade', delay: 500 })
	},
}
