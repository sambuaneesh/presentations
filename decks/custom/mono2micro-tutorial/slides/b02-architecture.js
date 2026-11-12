// What "architecture" means (Bass, Clements & Kazman), and the four steps of a migration: this talk is step 1.
export default {
	name: 'Architecture',
	kicker: 'I · what are we migrating?',
	source: 'Bass, Clements & Kazman, Software Architecture in Practice, 3rd ed. · ICSA 2026 §I',
	draw(k) {
		k.text(120, 230, '“The software architecture of a system is the set of structures needed\nto reason about the system, which comprise software elements,\nrelations among them, and properties of both.”', { size: 'l', scale: 1.05, color: 'grey' })
		k.text(120, 420, 'elements  +  relations', { size: 'xl', scale: 1.15 })
		const STEPS = ['find the\nservice\nboundaries', 'split\nthe data', 'turn calls\ninto network\ncalls', 'deploy,\nmonitor,\noperate']
		STEPS.forEach((t, i) => {
			k.note(150 + i * 430, 560, (i + 1) + ' · ' + t, { color: 'yellow', size: 'm', rot: [-3, 2, -2, 3][i], beat: 1, anim: 'drop', delay: i * 200 })
			if (i) k.arrow([150 + i * 430 - 160, 660], [150 + i * 430 - 20, 660], { size: 'm', beat: 1, anim: 'wipe', delay: i * 200 + 100 })
		})
		k.loop(260, 660, 210, 190, { color: 'red', size: 'l', beat: 2, anim: 'wipe' })
		k.text(160, 900, 'today: only step 1. every other step depends on it.', { size: 'xl', beat: 2, anim: 'fade', delay: 300 })
	},
}
