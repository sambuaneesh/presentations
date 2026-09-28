function card(k, x, y, name, what, eg, beat) {
	k.box(x, y, 800, 300, { id: 'm' + x + y, beat, anim: 'pop' })
	k.text(x + 30, y + 24, name, { size: 'l', color: 'red', beat, anim: 'pop' })
	k.text(x + 30, y + 90, what, { size: 'm', w: 740, beat, anim: 'fade' })
	k.text(x + 30, y + 220, eg, { size: 's', font: 'mono', color: 'grey', w: 740, beat, anim: 'fade' })
}
export default {
	name: 'The four models',
	kicker: 'I · what she gave us',
	title: 'Four behavioural models per system',
	source: 'pet clinic/*/*.mmd · write-up §3',
	notes: 'COVER\n• all four are summaries of the same test recordings, in different notations\n• EFSM (GK-Tail+): states + method calls with parameter guards; the only one about classes\n• DFG: activity B happened right after A; here activities are SQL statements, HTTP routes, repository calls\n• Petri net (Inductive Miner): the same activities as a formal control-flow model (sequence, choice, parallel)\n• BPMN (Split Miner): the same as a business-process diagram with gateways\n• .dot and .mmd are the same diagram in two text formats; we passed the Mermaid text\nCLICKS\n1 · EFSM · 2 · DFG · 3 · Petri net · 4 · BPMN\nREF · write-up §3.1–3.2 · PetClinic .mmd files',
	draw(k) {
		card(k, 120, 250, 'State machine (EFSM)', 'states + method calls, with conditions on parameters', 'q0 → q1 : OwnerController.setAllowedFields [dataBinder == …@652b1eea]', 1)
		card(k, 1000, 250, 'Directly-follows graph', '"B happened right after A": SQL, HTTP routes, repositories', 'nodes: ALTER TABLE …pets (2) · CREATE INDEX … (6)', 2)
		card(k, 120, 600, 'Petri net', 'the same events as a formal model of sequence, choice, parallel', 'n_2234188864816 → n_2234188865488 → …', 3)
		card(k, 1000, 600, 'BPMN', 'a business-process diagram with decision gateways', 'tasks: POST /owners/new · OwnerRepository.save · INSERT …vets', 4)
	},
}
