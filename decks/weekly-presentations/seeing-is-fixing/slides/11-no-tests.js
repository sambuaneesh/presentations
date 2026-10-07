// SWE-bench M ships no tests (§I); visual fixes differ in tiny pixel details (Chart.js-10157, Fig. 3).

// A picture from the paper, taped onto the slide like a print: a white mat, two strips of tape, a caption.
function taped(k, x, y, w, h, name, o = {}) {
	const { caption, alt, ...on } = o
	k.box(x - 14, y - 14, w + 28, h + 28, { fill: 'solid', color: 'white', size: 's', ...on })
	k.image(x, y, w, h, name, { alt: alt ?? name, ...on })
	k.box(x - 34, y - 28, 110, 34, { fill: 'solid', color: 'yellow', size: 's', dash: 'solid', rot: -10, opacity: 0.65, ...on })
	k.box(x + w - 76, y - 28, 110, 34, { fill: 'solid', color: 'yellow', size: 's', dash: 'solid', rot: 9, opacity: 0.65, ...on })
	const cw = Math.max(w + 80, 460)
	if (caption) k.text(x + w / 2 - cw / 2, y + h + 26, caption, { size: 'm', scale: 1.05, color: 'grey', w: cw, align: 'middle', ...on })
}

export default {
	name: 'No tests',
	kicker: 'I · the problem · patch validation',
	title: 'No tests in the box',
	source: 'Chart.js-10157 · the issue, PR 1 and PR n renders from Fig. 3 · §I · §II-B',
	notes: "COVER\n• SWE-bench M ships no test cases (to prevent data leakage)\n• Chart.js-10157: candidate PRs differ only in subtle pixels (bar corners)\n• A visual test needs the expected picture, pixel-accurate; LLMs can't draw it in advance\nCLICKS\n1 · three PR charts (illustrative redraw of Fig. 3) · 2 · the empty \"expected\" frame\nREF · §I · §II-B · Fig. 3",
	draw(k) {
		// the empty test box, crossed out
		k.box(170, 270, 250, 150, { geo: 'rectangle', text: 'tests/', font: 'mono', size: 'l', id: 'tests' })
		k.cross(200, 280, 190, { id: 'x' })
		k.text(470, 290, 'SWE-bench M ships no tests', { size: 'xl', id: 'say' })
		k.text(470, 370, 'to prevent data leakage', { size: 'l', color: 'grey', id: 'why' })

		// click 1: the real issue, and two of the real candidate fixes, rendered
		const one = { beat: 1, anim: 'fade' }
		taped(k, 200, 545, 450, 325, 'chartjs-issue.webp', { caption: 'the issue, as filed', alt: 'Chart.js issue: expected and current behaviour', ...one })
		taped(k, 770, 545, 320, 195, 'chartjs-pr1.webp', { caption: 'PR 1', alt: 'render of candidate fix PR 1', ...one })
		k.text(1118, 610, '…', { size: 'xl', color: 'grey', ...one })
		taped(k, 1190, 537, 320, 211, 'chartjs-prn.webp', { caption: 'PR n', alt: 'render of candidate fix PR n', ...one })

		// click 2: the expected picture: nobody can draw it
		const two = { beat: 2, anim: 'fade' }
		k.box(1570, 537, 200, 211, { dash: 'dashed', color: 'grey', size: 'm', ...two })
		k.text(1570, 565, '?', { size: 'xl', scale: 3, color: 'red', rot: 6, w: 200, align: 'middle', ...two })
		k.text(1530, 774, 'expected', { size: 'm', scale: 1.05, color: 'grey', w: 280, align: 'middle', ...two })
		k.text(740, 880, 'nobody can draw the expected picture in advance', { size: 'l', scale: 1.0, w: 1060, align: 'middle', ...two })
	},
}
