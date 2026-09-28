export default {
	name: 'The experiment',
	kicker: 'II · the setup',
	title: 'One model, two systems, one try each',
	source: 'studies/behavioural-models-side-v1/README.md',
	notes: 'COVER\n• model: DeepSeek v4.1 Flash, temperature 0.2, seed 1 (same settings as the benchmark)\n• systems: PetClinic and PartsUnlimited (the only two with models)\n• without: the unchanged ICSA final prompt · with: the same prompt + her four models unchanged\n• one call per condition and system (4 calls); if the answer is unclear we can repeat\n• scored on everything: CMod, CiD, DTP, DI, BCP, C2C\nCLICKS\n1 · the two conditions · 2 · the metrics\nREF · run_side_study.py · analyze.py',
	draw(k) {
		k.box(160, 330, 520, 170, { text: 'DeepSeek v4.1 Flash\nseed 1 · temp 0.2' })
		k.box(160, 580, 520, 170, { text: 'PetClinic\nPartsUnlimited' })
		k.box(900, 330, 380, 170, { text: 'without\n(ICSA prompt)', beat: 1, anim: 'pop' })
		k.box(1380, 330, 380, 170, { text: 'with her\n4 models', color: 'red', beat: 1, anim: 'pop' })
		k.text(900, 620, '2 systems × 2 = 4 calls', { size: 'l', beat: 1, anim: 'fade' })
		k.text(900, 760, 'CMod · CiD · DTP · DI · BCP · C2C', { size: 'l', color: 'grey', beat: 2, anim: 'wipe' })
	},
}
