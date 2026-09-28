export default {
	name: 'Cost',
	kicker: 'II · what it cost',
	title: 'The models more than double the prompt',
	source: 'observations/*/observation.json',
	notes: 'COVER\n• PetClinic: 18,380 → 46,227 input tokens (+151%)\n• PartsUnlimited: 41,745 → 143,901 input tokens (+245%)\n• new calls for this study: 2 (the baselines were already run): 190,128 input + 577 output = 190,705 tokens\n• output size unchanged (173 and 404 tokens)\nCLICKS\n1 · PetClinic · 2 · PartsUnlimited\nREF · observation.json',
	draw(k) {
		// bars to scale: 4 px per 1k tokens
		k.box(200, 900 - 74, 200, 74, { color: 'grey', fill: 'semi', beat: 1 })
		k.box(440, 900 - 185, 200, 185, { color: 'red', fill: 'semi', beat: 1 })
		k.text(200, 920, 'PetClinic  18.4k → 46.2k', { size: 'm', beat: 1 })
		k.box(900, 900 - 167, 200, 167, { color: 'grey', fill: 'semi', beat: 2 })
		k.box(1140, 900 - 576, 200, 576, { color: 'red', fill: 'semi', beat: 2 })
		k.text(900, 920, 'PartsUnlimited  41.7k → 143.9k', { size: 'm', beat: 2 })
		k.text(1420, 360, 'grey: without\nred: with models', { size: 's', color: 'grey' })
		k.text(1420, 500, '+151 %\n+245 %', { size: 'xl', color: 'red', beat: 2, anim: 'pop' })
	},
}
