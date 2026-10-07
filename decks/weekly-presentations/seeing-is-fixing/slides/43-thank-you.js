// Thank you: just the words. One click: a scuba cat, as a reward.
export default {
	name: 'Thank you',
	draw(k) {
		k.text(160, 400, 'Thank you', { size: 'xl', scale: 3 })

		const on = { beat: 1, anim: 'pop' }
		k.image(1190, 230, 528, 447, 'scuba_cat.webp', { alt: 'scuba cat', rot: 2, ...on })
		k.text(1030, 735, 'here\'s your reward for your attention so far', { size: 'l', scale: 0.95, color: 'red', rot: -2, w: 840, align: 'middle', beat: 1, anim: 'fade' })
	},
}
