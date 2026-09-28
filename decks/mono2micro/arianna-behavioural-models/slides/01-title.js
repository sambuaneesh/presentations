// Title: the name, hand-lettered, and who is presenting. {{TITLE}} etc. are filled in by `deck new`.
export default {
	name: 'Title',
	notes: 'COVER\n• Arianna generated behavioural models of our benchmark systems automatically, from their test runs\n• question from the group: if the LLM also sees these models, do the ICSA decompositions get better?\n• part 1: what the models are · part 2: a quick side experiment\nCLICKS\n1 · the bulb\nREF · Behavioral Models Generation (write-up + artifacts)',
	draw(k) {
		k.text(160, 300, "Arianna's behavioural models", { size: 'xl', scale: 2.2 })
		k.text(166, 440, 'do they help our LLM decompositions?', { size: 'l', scale: 1.4, color: 'grey' })
		k.underline(170, 560, 900, { color: 'red' })
		k.text(166, 830, 'presented by', { size: 'm', scale: 1.1, color: 'grey' })
		k.text(166, 864, "Aneesh S", { size: 'xl', scale: 1.1 })
		// one small doodle: a light bulb that switches on with the first click
		k.circle(1480, 520, 120, { size: 'm' })
		k.circle(1480, 520, 120, { color: 'yellow', fill: 'solid', size: 's', beat: 1, anim: 'fade' })
		k.box(1446, 640, 68, 60, { color: 'grey', fill: 'pattern', size: 's' })
		k.pen([[1440, 540], [1460, 490], [1480, 530], [1500, 490], [1520, 540]], { wob: 1 })
	},
}
