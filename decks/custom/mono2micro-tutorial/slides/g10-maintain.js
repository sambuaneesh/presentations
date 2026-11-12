// Learning 1: you will maintain this. Lehman (a system in use keeps changing and decays unless worked on);
// Cunningham's debt metaphor. Callback: Netflix's seven years were maintenance, not a project.
export default {
	name: 'You will maintain this',
	kicker: 'VI · what to take home · 1',
	title: 'You will maintain this',
	source: 'Lehman, laws of software evolution (1980, 1996) · Cunningham, OOPSLA 1992',
	draw(k) {
		// a life: a short build, a long life
		k.arrow([110, 460], [1810, 460], { size: 'm', color: 'grey' })
		k.box(110, 380, 260, 70, { text: 'build', size: 'm', fill: 'solid', color: 'grey', labelColor: 'black' })
		k.box(380, 380, 1400, 70, { text: 'change, fix, extend, change again…', size: 'm', fill: 'solid', color: 'grey', labelColor: 'black', anim: 'wipe', delay: 300 })
		k.text(1480, 300, 'Netflix: 7 years', { size: 'l', rot: -3, anim: 'fade', delay: 700 })
		k.text(110, 560, 'used software keeps changing,', { size: 'xl', scale: 1.1, beat: 1, anim: 'fade' })
		k.text(110, 650, 'and it decays unless someone pushes back', { size: 'xl', scale: 1.1, color: 'red', beat: 1, anim: 'fade', delay: 400 })
		k.note(1350, 600, 'every shortcut\nis a loan', { color: 'yellow', size: 'l', rot: 3, beat: 2, anim: 'drop' })
		k.text(110, 860, 'a decomposition is a maintenance decision, not a one-off project', { size: 'l', color: 'grey', beat: 2, anim: 'fade', delay: 300 })
	},
}
