// Opening question: ask the room how they know a UI fix worked. One click: "You look at it.", and the
// classic "CSS" clip (Peter Griffin fighting the blinds) for what looking at it really feels like.
export default {
	name: 'How do you know?',
	draw(k) {
		k.text(200, 270, 'You fixed a UI bug.', { size: 'xl', scale: 1.3 })
		k.text(200, 390, 'How do you know it\'s fixed?', { size: 'xl', scale: 1.3 })

		const on = { beat: 1, anim: 'fade' }
		k.text(200, 640, 'You look at it.', { size: 'xl', scale: 1.5, ...on })
		k.underline(206, 760, 470, { beat: 1, anim: 'wipe' })

		k.image(1190, 330, 600, 450, 'css-blinds.webp', { alt: 'Peter Griffin fighting window blinds, captioned CSS', rot: 1.5, beat: 1, anim: 'pop' })
		k.text(1190, 810, '(and then you look again)', { size: 'm', scale: 1.2, color: 'grey', w: 600, align: 'middle', ...on })
	},
}
