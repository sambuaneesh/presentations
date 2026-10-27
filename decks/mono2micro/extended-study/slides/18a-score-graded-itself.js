// The ablation, 1: what the self-referential score was.
export default {
	name: 'The score that graded itself',
	kicker: 'V · the ablation',
	title: 'The score that graded itself',
	source: '§III-E (E8, E9) · §V-D · Table V · illustrative run: Spring PetClinic, DeepSeek',
	draw(k) {
		k.box(150, 360, 400, 170, { text: 'domain agent writes\na capability map', size: 'm', id: 'map' })
		k.box(760, 360, 420, 170, { text: 'domain-first candidate\nis built from the map', size: 'm', id: 'cand' })
		k.box(1390, 360, 400, 170, { text: 'old score: how well\na candidate agrees\nwith the map', size: 'm', id: 'score' })
		k.arrow('map', 'cand', {})
		k.arrow('cand', 'score', {})
		k.arrow('score', 'map', { color: 'red', bend: -170, text: 'it grades the map against itself' })
		k.text(150, 760, 'so the map\'s own candidate scored ≈100 and tended to win:', { size: 'm', scale: 1.1 })
		k.text(150, 830, 'PetClinic: 6 small services picked, close match 16.7 instead of 75.0 (same LLM answers)', { size: 'm', scale: 1.1, color: 'red' })
		k.text(150, 920, 'the final workflow drops this term: it scores structure only', { size: 'm', scale: 1.1, color: 'grey' })
	},
}
