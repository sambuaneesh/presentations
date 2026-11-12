// The whole ICSA 2026 pipeline (the paper's overview figure, img/architects-flow-chart/artifacts-flow-chart-v8.pdf,
// rendered to slides/assets/icsa-pipeline.png, 1931 × 440), toured with camera glides.
// Image at (110, 330), 1700 wide (scale 0.8804). Regions in slide px: Inputs x 129–585, Phase 1 x 658–896,
// Phase 2 x 983–1274, Phase 3 x 1313–1789; all y 346–702. Study size (§IV): 7 strategies × 4 LLMs × 4 systems.
// Clicks 1–3 glide onto Inputs + Phase 1, Phase 2, Phase 3 (a note each); the count sits beside Phase 3.
export default {
	name: 'The pipeline',
	kicker: 'III · enter the LLM · the whole thing',
	title: 'Put together: our ICSA 2026 pipeline',
	source: 'ICSA 2026 · overview figure · §III-B · §IV',
	draw(k) {
		k.image(110, 330, 1700, 387, 'icsa-pipeline.png', { anim: 'fade', alt: 'ICSA 2026 pipeline: inputs, code summarisation, architectural artefact generation, service decomposition and evaluation' })
		const stop = (b, x, w, h, notes) => {
			k.box(x - 30, 315, w + 60, h, { opacity: 0, size: 's', focus: b })
			notes.forEach(([nx, note, color, rot]) => k.note(nx, 725, note, { color, size: 's', scale: 0.72, rot, beat: b, anim: 'drop', delay: 500 }))
		}
		stop(1, 129, 767, 590, [[129, 'the repo at one\npinned commit,\nflattened by gitingest', 'yellow', -2], [658, 'chunks or\nhierarchy:\n7 strategies', 'yellow', 2]])
		stop(2, 983, 291, 590, [[983, 'A1–A5 by the LLM,\nA6 by static\nanalysis', 'yellow', -1]])
		stop(3, 1313, 540, 660, [[1313, 'one shot → JSON,\nthen compared with\nthe reference, tools,\nand the other LLMs', 'yellow', 2]])
		// Isotype: one dot per decomposition, 7 strategies × a 4 × 4 block (4 LLMs × 4 systems) = 112
		k.text(110, 885, '112 decompositions', { size: 'l', color: 'red', beat: 3, anim: 'fade', delay: 600 })
		k.text(110, 945, '7 strategies × 4 LLMs × 4 systems', { size: 'm', color: 'grey', beat: 3, anim: 'fade', delay: 800 })
		for (let g = 0; g < 7; g++) for (let i = 0; i < 16; i++)
			k.circle(1000 + g * 112 + (i % 4) * 19, 890 + Math.floor(i / 4) * 19, 6, { fill: 'fill', color: 'black', size: 's', beat: 3, anim: 'pop', delay: 900 + g * 120 })
		k.text(1000, 975, 'GPT-5 · Gemini 2.5 Pro · GLM-4.6 · DeepSeek-3.2', { size: 'm', color: 'grey', beat: 3, anim: 'fade', delay: 1800 })
	},
}
