// Learning 3: using AI tools responsibly. An LLM's decomposition is a proposal; checks decide (our own
// "LLM proposes, code decides"); no tests, no safe refactoring (Feathers); rules as automated checks (fitness functions).
export default {
	name: 'AI tools, responsibly',
	kicker: 'VI · what to take home · 3',
	title: 'An AI’s cut is a proposal, not a decision',
	source: 'Feathers, Working Effectively with Legacy Code, 2004 · Ford, Parsons & Kua, 2017',
	draw(k) {
		k.box(110, 330, 300, 170, { text: 'LLM / agent', size: 'l', id: 'llm' })
		k.note(560, 300, 'a proposed\ncut', { color: 'yellow', size: 'l', rot: -3, id: 'prop' })
		k.box(1000, 330, 300, 170, { text: 'checks', size: 'l', color: 'green', id: 'chk' })
		k.box(1450, 330, 330, 170, { text: 'you decide', size: 'l', id: 'you' })
		k.arrow('llm', 'prop', { size: 'm' }); k.arrow('prop', 'chk', { size: 'm' }); k.arrow('chk', 'you', { size: 'm' })
		k.text(990, 540, 'valid? tested? every class\naccounted for?', { size: 'm', color: 'green' })
		k.text(110, 680, 'no tests, no safe refactoring:', { size: 'xl', beat: 1, anim: 'fade' })
		k.text(110, 770, 'by a human or by an LLM', { size: 'xl', color: 'red', beat: 1, anim: 'fade', delay: 300 })
		k.text(110, 900, 'turn your architecture rules into checks that run on every commit', { size: 'l', color: 'grey', beat: 2, anim: 'fade' })
	},
}
