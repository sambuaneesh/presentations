// The ablation, 2: how it was run on eight models without a single model call.
export default {
	name: 'Re-scored for free',
	kicker: 'V · the ablation',
	title: 'Re-scored without any model call',
	source: '§IV-J ablation by replay · SS-04 · 139 replays, 0 tokens',
	draw(k) {
		k.text(150, 270, 'why: the first test covered only 2 models, both used in development', { size: 'm', scale: 1.05, color: 'grey' })
		k.box(150, 380, 440, 260, { text: 'a stored run:\nevidence, map,\n3 candidates', size: 'm', id: 'run' })
		k.box(860, 330, 460, 150, { text: 'old selection\n(with the map score)', size: 'm', id: 'old' })
		k.box(860, 560, 460, 150, { text: 'final selection\n(structure only)', size: 'm', id: 'new' })
		k.arrow('run', 'old', {})
		k.arrow('run', 'new', {})
		k.box(1500, 440, 300, 160, { text: 'difference =\nselection only', size: 'm', color: 'red', id: 'diff' })
		k.arrow('old', 'diff', { color: 'red' })
		k.arrow('new', 'diff', { color: 'red' })
		k.text(150, 820, 'same LLM outputs, two selection rules: 159 run pairs over 8 models', { size: 'l', scale: 0.95 })
		k.text(150, 900, 'replayed from stored outputs: 139 runs, zero tokens', { size: 'm', scale: 1.1, color: 'grey' })
	},
}
