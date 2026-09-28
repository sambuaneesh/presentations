export default {
	name: 'The catches',
	kicker: 'I · what to know before using them',
	title: 'Useful, but with catches',
	source: 'folder inspection · file sizes and contents',
	notes: 'COVER\n• models exist only for PetClinic and PartsUnlimited; the demo and JPetStore model folders are empty\n• the demo export is corrupted: ~40% of demo/traces.json (and much of its logs and metrics) is null bytes, so it cannot be rebuilt either\n• built from the projects\' TEST suites, not real usage (PetClinic traces contain Mockito mocks)\n• large: PartsUnlimited Petri net ≈ 1,090 edges, BPMN ≈ 1,050; the four files add ≈ 28k (PetClinic) and ≈ 102k (PartsUnlimited) prompt tokens\n• EFSM guards are Java object hashes (…@652b1eea), not meaningful values\n• her scripts and settings are not included, so the models cannot be regenerated yet\nCLICKS\n1 · 2 · 3 · 4 · 5 · 6 · one note each\nREF · folder inspection · observations/*/observation.json (tokens)',
	draw(k) {
		k.note(120, 290, 'models for\n2 of 4 systems', { color: 'light-red', beat: 1, anim: 'drop' })
		k.note(470, 290, 'demo files\n~40% corrupted', { color: 'light-red', beat: 2, anim: 'drop' })
		k.note(820, 290, 'from tests,\nnot users', { color: 'yellow', beat: 3, anim: 'drop' })
		k.note(1170, 290, 'big: up to\n~1,000 edges', { color: 'yellow', beat: 4, anim: 'drop' })
		k.note(290, 620, 'EFSM rules =\nobject hashes', { color: 'yellow', beat: 5, anim: 'drop' })
		k.note(640, 620, 'no scripts yet:\ncan\'t regenerate', { color: 'yellow', beat: 6, anim: 'drop' })
		k.text(1100, 700, 'so: experiment on\nPetClinic + PartsUnlimited', { size: 'l', color: 'red', beat: 6, anim: 'wipe' })
	},
}
