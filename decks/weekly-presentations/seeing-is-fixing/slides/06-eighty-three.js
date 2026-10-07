// One number: in 83.5% of cases the image is essential to solving the issue. The number first; one
// click brings the sentence, the circled picture and the study it comes from.
export default {
	name: '83.5%',
	kicker: 'I · the problem',
	notes: "COVER\n• Show the number alone first\n• In 83.5% of cases the image is essential to solving the issue\n• The picture carries information the fix depends on; it isn't decoration\n• Same study as the 80%: SWE-bench Multimodal (Yang et al., ICLR 2025), cited by the paper\nCLICKS\n1 · the sentence, the circled picture and the reference card, all at once\nREF · [22] (Yang et al., ICLR 2025), cited in §II-A",
	draw(k) {
		const on = { beat: 1, anim: 'fade' }
		k.text(240, 250, '83.5%', { size: 'xl', scale: 7.5, rot: -2 })
		k.text(260, 700, 'of cases: the image is essential to solving it', { size: 'xl', scale: 1.25, ...on })
		// a little print, doodled: mountains and a sun
		const x = 1440, y = 330
		k.box(x, y, 300, 220, { fill: 'solid', color: 'grey', size: 's', rot: 5, id: 'print', ...on })
		k.pen([[x + 20, y + 190], [x + 100, y + 90], [x + 150, y + 150], [x + 200, y + 100], [x + 270, y + 200]], { wob: 1.5, size: 's', ...on })
		k.circle(x + 220, y + 60, 22, { size: 's', ...on })
		k.loop(x + 150, y + 125, 210, 160, { beat: 1, anim: 'wipe' })
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
