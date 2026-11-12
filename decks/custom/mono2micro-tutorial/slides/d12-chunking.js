// The seven summarisation strategies of the ICSA pipeline, as one picture (the presenter explains it).
// Rows: chunk budgets 30k / 50k / 80k tokens; whole files packed into non-overlapping chunks (PetClinic: 3 / 2 / 1 chunks).
// Click 1: each chunk gets its own summary. Click 2: two ways to merge them: concatenation (joined with separators)
// and LLM aggregation (one unified summary): 3 × 2 = 6. Click 3: the 7th, hierarchical summarisation (Dhulshette et al.):
// code units → files → packages → one repository summary, no chunking. Source: ICSA 2026 §III-B, §IV-A.
export default {
	name: 'Seven strategies',
	kicker: 'III · enter the LLM · phase 1',
	title: 'Too big? 7 ways to summarise it',
	source: 'ICSA 2026 §III-B, §IV-A · PetClinic: 3 / 2 / 1 chunks · hierarchical: after Dhulshette et al.',
	draw(k) {
		const head = (x, t, o = {}) => k.text(x, 225, t, { size: 'm', color: 'grey', ...o })
		head(250, 'cut the repo (whole files)')
		head(790, 'summarise each chunk', { beat: 1, anim: 'fade' })
		head(1150, 'concatenate', { beat: 2, anim: 'fade' })
		head(1520, 'or: LLM merges', { beat: 2, anim: 'fade', delay: 700 })
		;[[3, '30k'], [2, '50k'], [1, '80k']].forEach(([n, lbl], r) => {
			const y = 290 + r * 165, cy = y + 50
			k.text(110, y + 15, lbl, { size: 'xl' })
			// the repo strip, cut into n chunks
			const W = 440, gap = 10, cw = (W - gap * (n - 1)) / n
			for (let i = 0; i < n; i++) k.box(250 + i * (cw + gap), y + 10, cw, 80, { fill: 'solid', color: 'light-blue', size: 's', anim: 'pop', delay: r * 200 + i * 80 })
			// 1: one summary per chunk
			k.arrow([705, cy], [775, cy], { size: 'm', beat: 1, delay: r * 200 })
			for (let i = 0; i < n; i++) k.box(790 + i * 85, y + 15, 70, 70, { fill: 'solid', color: 'yellow', size: 's', beat: 1, anim: 'drop', delay: r * 200 + i * 100 })
			// 2a: concatenation: the summaries joined end to end, with separators
			k.arrow([1050, cy], [1130, cy], { size: 'm', beat: 2, delay: r * 150 })
			k.box(1150, y + 25, n * 90, 50, { fill: 'solid', color: 'yellow', size: 's', beat: 2, anim: 'wipe', delay: r * 150 })
			for (let i = 1; i < n; i++) k.pen([[1150 + i * 90, y + 25], [1150 + i * 90, y + 75]], { size: 's', dash: 'dashed', beat: 2, anim: 'wipe', delay: r * 150 + 100 })
			// 2b: LLM aggregation: the summaries funnel into one new summary
			const fx = 1520
			for (let i = 0; i < n; i++) k.box(fx, y + 5 + i * 30, 26, 26, { fill: 'solid', color: 'yellow', size: 's', beat: 2, anim: 'pop', delay: 700 + r * 150 + i * 60 })
			k.arrow([fx + 40, cy], [fx + 130, cy], { size: 'm', color: 'violet', beat: 2, delay: 800 + r * 150 })
			k.box(fx + 145, y + 15, 70, 70, { fill: 'solid', color: 'violet', size: 's', beat: 2, anim: 'zoom', delay: 900 + r * 150 })
		})
		k.text(1150, 790, '3 sizes × 2 merges = 6', { size: 'l', beat: 2, anim: 'fade', delay: 1400 })
		// 3: the 7th: a summary tree, no chunking
		k.pen([[110, 845], [1810, 845]], { size: 's', color: 'grey', dash: 'dotted', beat: 3, anim: 'wipe' })
		k.text(110, 880, 'or: a summary tree', { size: 'l', beat: 3, anim: 'fade' })
		const L = [[560, 12, 'methods'], [880, 6, 'files'], [1150, 3, 'packages'], [1400, 1, 'repo']]
		L.forEach(([x, n, lbl], j) => {
			for (let i = 0; i < n; i++) k.box(x + (i % 6) * 34, 870 + Math.floor(i / 6) * 34, 26, 26, { fill: 'solid', color: j === 3 ? 'violet' : 'light-violet', size: 's', beat: 3, anim: 'pop', delay: 200 + j * 250 })
			k.text(x, 945, lbl, { size: 'm', color: 'grey', beat: 3, anim: 'fade', delay: 200 + j * 250 })
			if (j) k.arrow([L[j - 1][0] + Math.min(L[j - 1][1], 6) * 34 + 5, 885], [x - 15, 885], { size: 'm', beat: 3, delay: 150 + j * 250 })
		})
		k.text(1560, 860, '+ 1 = 7', { size: 'xl', scale: 1.3, color: 'red', beat: 3, anim: 'pop', delay: 1300 })
	},
}
