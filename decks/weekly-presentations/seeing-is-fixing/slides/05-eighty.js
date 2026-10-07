// One number: 80% of visual symptoms can't be fully put into words. The number first; one click
// brings the sentence, its underline and the study it comes from.
export default {
	name: '80%',
	kicker: 'I · the problem',
	notes: "COVER\n• Show the number alone first, let it sit\n• 80% of visual symptoms can't be fully described in text\n• That's the OpenLayers report we just saw, in general\n• Not our number, not the paper's own: it comes from the SWE-bench Multimodal study (Yang et al., ICLR 2025), the benchmark's authors, cited by the paper\nCLICKS\n1 · the sentence, the underline and the reference card, all at once\nREF · [22] (Yang et al., ICLR 2025), cited in §II-A",
	draw(k) {
		const on = { beat: 1, anim: 'fade' }
		k.text(240, 250, '80%', { size: 'xl', scale: 7.5, rot: -2 })
		k.text(260, 700, 'of visual symptoms can\'t be fully described', { size: 'xl', scale: 1.25, ...on })
		k.text(260, 800, 'in text', { size: 'xl', scale: 1.25, color: 'red', ...on })
		k.underline(262, 890, 200, { beat: 1, anim: 'wipe' })
		citation(k, on)
	},
}

// The study both numbers come from: reference [22] of Seeing is Fixing, as a small reference card.
function citation(k, o = {}) {
	const x = 1130, y = 800, w = 690
	k.box(x, y, w, 175, { fill: 'solid', color: 'white', size: 's', rot: -1, ...o })
	k.text(x + 30, y + 18, 'SWE-bench Multimodal: Do AI Systems Generalize to Visual Software Domains?', { size: 's', scale: 1.15, w: w - 60, rot: -1, ...o })
	k.text(x + 30, y + 98, 'Yang, Jimenez, … Narasimhan et al. · ICLR 2025', { size: 's', scale: 1.05, color: 'grey', rot: -1, ...o })
	k.text(x + 30, y + 132, 'ref. [22] in Seeing is Fixing, §II-A', { size: 's', scale: 1.05, color: 'grey', rot: -1, ...o })
}
