// What SWE-bench and SWE-bench M are: the same exam drawn twice. Left: a GitHub issue in words plus
// the repository gives a patch. Right (one click): the issue now carries a screenshot, the repository is a
// front-end JavaScript library, and no tests come with it.

// One side of the comparison, at horizontal offset `x`.
function exam(k, x, o) {
	const on = o.on ?? {}
	k.text(x, 250, o.name, { size: 'xl', scale: 1.05, ...on })
	k.text(x + 4, 330, o.cite, { size: 's', scale: 1.1, color: 'grey', ...on })

	// the issue card: a few lines of text, and (on the M side) a screenshot
	k.box(x, 400, 330, 230, { fill: 'solid', color: 'white', size: 's', rot: -1.5, id: o.id + '-issue', ...on })
	k.text(x + 22, 412, 'GitHub issue', { size: 's', color: 'grey', ...on })
	const lines = o.screenshot ? [250, 180] : [270, 230, 260, 150]
	lines.forEach((w, i) => k.pen([[x + 24, 470 + i * 38], [x + 24 + w * 0.5, 468 + i * 38], [x + 24 + w, 471 + i * 38]], { size: 's', wob: 1.2, ...on }))
	if (o.screenshot) {
		const sx = x + 26, sy = 555
		k.box(sx, sy, 150, 58, { fill: 'solid', color: 'grey', size: 's', ...on })
		k.pen([[sx + 10, sy + 50], [sx + 50, sy + 18], [sx + 80, sy + 38], [sx + 105, sy + 22], [sx + 140, sy + 50]], { size: 's', ...on })
		k.loop(sx + 75, sy + 29, 120, 52, on)
		k.text(x - 10, 650, 'with screenshots', { size: 'm', color: 'red', rot: -2, ...on })
	}

	k.text(x + 360, 470, '+', { size: 'xl', scale: 1.3, ...on })

	// the repository, as a folder
	k.box(x + 430, 405, 110, 36, { fill: 'semi', color: 'grey', size: 's', ...on })
	k.box(x + 430, 435, 280, 170, { fill: 'semi', color: 'grey', size: 's', ...on })
	k.text(x + 430, 625, o.repo, { size: 'm', scale: 1.1, w: 300, ...on })
	if (o.libs) k.text(x + 452, 450, o.libs, { size: 's', color: 'grey', w: 250, ...on })

	// → one patch
	k.arrow([x + 260, 650], [x + 260, 755], { size: 'm', ...on })
	k.box(x + 120, 765, 300, 120, { fill: 'solid', color: 'white', size: 's', rot: 1, ...on })
	k.text(x + 140, 775, 'patch', { size: 's', color: 'grey', ...on })
	k.text(x + 145, 810, '- old line', { font: 'mono', size: 's', color: 'red', ...on })
	k.text(x + 145, 842, '+ new line', { font: 'mono', size: 's', color: 'green', ...on })
	if (o.noTests) k.text(x + 450, 800, 'no tests given', { size: 'm', scale: 1.1, ...on })
}

export default {
	name: 'SWE-bench',
	kicker: 'I · the problem',
	title: 'The exam, and its visual version',
	source: 'SWE-bench [15] · SWE-bench M [22] · §I, §II-B, §IV-B',
	notes: "COVER\n• SWE-bench (Jimenez et al., ICLR 2024): real GitHub issues; a system gets the issue and the repository and has to write the patch\n• Its issues are told in text: natural language and code, few contain an image\n• SWE-bench M (Yang et al., ICLR 2025): bugs in visual, user-facing JavaScript software\n• 619 tasks from 17 popular JavaScript libraries: web interface design, diagramming, data visualization, syntax highlighting, interactive mapping; each with images crucial to solving it\n• No test cases come with the tasks (to prevent data leakage)\n• Both: only the top-ranked patch counts (Pass@1)\n• Doing well on the first doesn't carry over: SWE-agent gets about 12% on SWE-bench M (coming up)\nCLICKS\n1 · the SWE-bench M side, all at once\nREF · §I · §II-B · §IV-B · [15] · [22]",
	draw(k) {
		exam(k, 150, { id: 'sb', name: 'SWE-bench', cite: 'Jimenez et al. · ICLR 2024', repo: 'its repository' })
		k.pen([[960, 250], [962, 600], [958, 940]], { size: 's', color: 'grey', wob: 1.5 })
		exam(k, 1030, {
			id: 'sbm', name: 'SWE-bench M', cite: 'Yang et al. · ICLR 2025', screenshot: true, noTests: true,
			repo: 'a front-end library', libs: 'bpmn-js\nopenlayers\nhighlight.js\nChart.js\nnext, …',
			on: { beat: 1, anim: 'fade' },
		})
	},
}
