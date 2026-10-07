// The 517 SWE-bench M test issues, one circle each; one click fills the 63 SWE-agent resolves.
function pick(n, m, seed) {
	let a = seed >>> 0
	const r = () => {
		a = (a + 0x6d2b79f5) >>> 0
		let t = a
		t = Math.imul(t ^ (t >>> 15), t | 1)
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296
	}
	const idx = Array.from({ length: n }, (_, i) => i)
	for (let i = n - 1; i > 0; i--) {
		const j = Math.floor(r() * (i + 1))
		;[idx[i], idx[j]] = [idx[j], idx[i]]
	}
	return idx.slice(0, m)
}
export default {
	name: '63 of 517',
	kicker: 'I · the problem',
	title: 'Strong on SWE-bench, 12% here',
	source: '§I · Table I · SWE-bench M test (§IV-B) · dot positions illustrative',
	notes: "COVER\n• The SWE-bench M test split: 517 visual issues, one circle each\n• SWE-agent \"performs strongly on SWE-bench\" (§I), the text-only benchmark\n• Here it resolves 63 of 517 = 12.19% (Claude 3.5; 62 with GPT-4o)\n• Which dots are red is illustrative; only the count is data\nCLICKS\n1 · the 63 light up, all at once\nREF · §I · Table I · §IV-B",
	draw(k) {
		const X = 165, Y = 300, P = 34, S = 22, C = 47
		k.grid(X, Y, C, 517, P, S, { color: 'grey', each: () => ({ rot: (k.rand() - 0.5) * 20 }) })
		k.text(170, 690, '517 visual issues · one circle each', { size: 'm', scale: 1.2, color: 'grey' })
		for (const i of pick(517, 63, 1602)) {
			k.box(X + (i % C) * P, Y + Math.floor(i / C) * P, S, S, { geo: 'ellipse', size: 's', color: 'red', fill: 'fill', beat: 1, anim: 'pop' })
		}
		k.text(170, 770, 'SWE-agent: 63 of 517', { size: 'xl', scale: 1.5, color: 'red', beat: 1, anim: 'fade' })
		k.text(172, 900, 'the same agent that does well on SWE-bench (text only)', { size: 'm', scale: 1.2, color: 'grey', beat: 1, anim: 'fade' })
		k.text(1250, 800, '12%', { size: 'xl', scale: 2.4, color: 'red', rot: -3, beat: 1, anim: 'fade' })
	},
}
