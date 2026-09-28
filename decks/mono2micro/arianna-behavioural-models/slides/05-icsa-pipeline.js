export default {
	name: 'Our ICSA pipeline',
	kicker: 'II · the pipeline we tested with',
	title: 'ICSA single-shot: summarise, describe, decide once',
	source: 'ICSA 2026 paper · packages/decomplab-campaign/paper.py',
	notes: 'COVER\n• 80k concat: source packed into ≤80k-token chunks and summarised (1 call on our systems)\n• five architectural views generated from the summary (5 calls): component diagram, component descriptions, API endpoints, technology map, dynamic interactions\n• one final call gets the five views + the static dependency graph + the class inventory and writes the decomposition (7 calls in total)\n• the decomposition is scored by the blinded evaluator\nCLICKS\n1 · the final call · 2 · evaluation\nREF · ICSA 2026 §III · paper.py',
	draw(k) {
		k.box(100, 400, 260, 160, { text: 'source\ncode', id: 's' })
		k.box(460, 400, 280, 160, { text: 'summary\n(1 call)', id: 'sum' })
		k.box(840, 400, 300, 160, { text: '5 views\n(5 calls)', id: 'v' })
		k.box(1240, 400, 320, 160, { text: 'final call\n(1 call)', id: 'f', color: 'red', beat: 1, anim: 'pop' })
		k.arrow('s', 'sum', {})
		k.arrow('sum', 'v', {})
		k.arrow('v', 'f', { beat: 1 })
		k.note(1080, 680, 'dependency\ngraph', { color: 'light-violet', id: 'g', beat: 1, anim: 'drop' })
		k.note(1420, 680, 'class\ninventory', { color: 'light-violet', id: 'i', beat: 1, anim: 'drop' })
		k.arrow('g', 'f', { beat: 1 })
		k.arrow('i', 'f', { beat: 1 })
		k.text(1620, 440, '→ decomposition\n→ blinded\n   evaluation', { size: 'm', beat: 2, anim: 'fade' })
	},
}
