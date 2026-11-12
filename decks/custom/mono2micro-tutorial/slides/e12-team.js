// C2C: closeness to the developers' split, and why even that split is one good answer, not the answer.
// TC (the same modularity score over who edits what in git) gets one line.
export default {
	name: 'The reference',
	kicker: 'IV · is it any good? · C2C',
	title: 'Even the developers’ split is one answer',
	source: 'C2C coverage: Wang, Bornais & Rubin, ASE 2024 · TC: ICSA Table I',
	draw(k) {
		k.box(130, 280, 560, 420, { size: 'l', color: 'blue' }); k.text(160, 295, 'your service', { size: 'l', color: 'blue' })
		k.box(420, 400, 560, 420, { size: 'l', color: 'green', beat: 1, anim: 'pop' }); k.text(700, 760, 'their service', { size: 'l', color: 'green', beat: 1, anim: 'fade' })
		k.text(450, 480, 'overlap\n> half?', { size: 'xl', beat: 1, anim: 'fade', delay: 400 })
		k.text(1080, 300, 'C2C-50: the share of your\nservices with a close twin\nin the developers’ split', { size: 'l', beat: 1, anim: 'fade', delay: 200 })
		k.text(1080, 540, 'but their split copies BaseEntity,\nNamedEntity, Person and the app\nclass into every service', { size: 'm', color: 'grey', beat: 2, anim: 'fade' })
		k.text(1080, 730, 'one good answer,\nnot the answer', { size: 'xl', color: 'red', beat: 2, anim: 'wipe', delay: 400 })
		k.text(130, 920, 'TC is the same score over who edits what in git: does each team’s code sit in its own service?', { size: 'm', color: 'grey', w: 1700, beat: 2, anim: 'fade', delay: 800 })
	},
}
