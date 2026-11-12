// Real broken answers on PetClinic from the study's runs, then the plain code that catches them.
// Sources: studies/final-benchmark-extension-v1 (…paper-80k-concat-spring-petclinic-glm-5-3-s1-r1 and -glm-5-3-flash-,
// …nemotron-3-nano-30b-s1-r1) and studies/final-benchmark-v1 (…harness-opencode-baseline-3-spring-petclinic-gpt-oss-120b-s1-r1),
// evaluation/validation.json + output/decomposition.json. Repair rules: decomplab_agentic/agents/decomposition_generator.py.
export default {
	name: 'Real failures',
	kicker: 'V · enter the agents · from our runs',
	title: 'Real answers on PetClinic',
	draw(k) {
		const receipt = (x, h, who, why, n) => {
			const d = (n - 1) * 450, r = [-1.5, 1, -0.5][n - 1]
			k.box(x, 250, 540, 400, { size: 's', dash: 'draw', fill: 'solid', color: 'white', beat: 1, anim: 'drop', delay: d, rot: r })
			k.text(x + 30, 280, h, { size: 'xl', color: 'red', w: 480, beat: 1, anim: 'fade', delay: d })
			k.text(x + 30, 430, why, { size: 'l', w: 480, beat: 1, anim: 'fade', delay: d + 200 })
			k.text(x + 30, 580, who, { size: 'm', color: 'grey', beat: 1, anim: 'fade', delay: d + 200 })
		}
		receipt(110, 'it copied the example', 'GLM-5.3 · one prompt', 'answered with the prompt’s placeholder: all 23 classes missing', 1)
		receipt(690, 'one class, one service', 'Nemotron 3 Nano · one prompt', '21 services for 23 classes, two simply gone', 2)
		receipt(1270, 'it dodged the hard part', 'OpenCode agent · gpt-oss-120b', 'left out BaseEntity, NamedEntity and Person', 3)
		k.text(110, 740, 'the LLM proposes, plain code checks and repairs', { size: 'xl', beat: 2, anim: 'wipe' })
	},
}
