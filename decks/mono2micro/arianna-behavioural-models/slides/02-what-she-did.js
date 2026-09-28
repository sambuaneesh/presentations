export default {
	name: 'What she did',
	kicker: 'I · what we were given',
	title: 'Run the tests, record everything, mine models',
	source: 'Behavioral Models Generation, §1–3',
	notes: 'COVER\n• same four systems as our benchmark: 7ep Demo, JPetStore, PartsUnlimited, PetClinic\n• each project\'s own test suite (mvn test) ran under the OpenTelemetry Java agent (v2.29) + her custom extension that records method calls and parameter values\n• output: traces.json, logs.json, metrics.json per system\n• then four model types mined from the traces: EFSM (GK-Tail+), DFG, Petri net (Inductive Miner), BPMN (Split Miner) via PM4Py\nCLICKS\n1 · recordings · 2 · the four models\nREF · write-up §1–3 · files in each system folder',
	draw(k) {
		k.box(120, 380, 360, 200, { text: 'project\'s own\ntest suite', id: 'tests' })
		k.box(640, 380, 420, 200, { text: 'OpenTelemetry\nagent + her extension', id: 'otel', color: 'red' })
		k.arrow('tests', 'otel', { text: 'runs under' })
		k.note(1220, 330, 'traces.json\nlogs.json\nmetrics.json', { color: 'yellow', id: 'rec', beat: 1, anim: 'drop' })
		k.arrow('otel', 'rec', { beat: 1 })
		k.box(1220, 700, 560, 220, { text: 'EFSM · DFG\nPetri net · BPMN', id: 'models', dash: 'dashed', beat: 2, anim: 'pop' })
		k.arrow('rec', 'models', { text: 'mined', beat: 2 })
		k.text(120, 700, 'same 4 systems\nas our benchmark\n(models for 2 of them)', { size: 'l', color: 'grey' })
	},
}
