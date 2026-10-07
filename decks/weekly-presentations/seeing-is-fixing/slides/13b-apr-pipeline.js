// The classic automated-program-repair pipeline GUIRepair follows (§III): four boxes. Click 1: the
// MAPE-K reading (Monitor, Analyze, Plan, Execute over shared Knowledge), and a cheeky aside.
// Click 2: the aside gets struck through.
export default {
	name: 'APR pipeline',
	kicker: 'II · the method',
	title: 'The classic repair pipeline',
	source: '§I · §III (APR pipeline [3]) · MAPE-K: Kephart & Chess, 2003 (our analogy)',
	draw(k) {
		k.text(150, 245, 'automated program repair (APR): fixing bugs without a human, in four steps', { size: 'm', scale: 1.2, color: 'grey' })

		const steps = [['understand\nthe bug', 'fault comprehension', 'M'], ['find where', 'fault localization', 'A'], ['write the fix', 'patch generation', 'P'], ['check it', 'patch validation', 'E']]
		const w = 300, h = 150, y = 420, x0 = 150, gap = 110
		const X = (i) => x0 + i * (w + gap)
		const on = { beat: 1, anim: 'fade' }
		steps.forEach(([s, paper, letter], i) => {
			k.box(X(i), y, w, h, { text: s, size: 'l', rot: (i % 2 ? 1 : -1) * 0.8, id: 'st' + i })
			k.text(X(i), y + h + 18, paper, { size: 's', scale: 1.15, color: 'grey', w, align: 'middle' })
			if (i > 0) k.arrow('st' + (i - 1), 'st' + i, { size: 'm' })
			k.text(X(i), y - 125, letter, { size: 'xl', scale: 1.5, color: 'red', w, align: 'middle', ...on })
		})
		// the K: one shared bar of knowledge under all four
		k.box(X(0), y + h + 75, X(3) + w - X(0), 62, { fill: 'semi', color: 'red', size: 's', ...on })
		k.text(X(0), y + h + 85, 'K · knowledge (GUIRepair adds this: the project\'s docs)', { size: 'm', scale: 1.1, color: 'red', w: X(3) + w - X(0), align: 'middle', ...on })

		k.text(150, 790, 'basically MAPE-K, for bugs', { size: 'l', scale: 1.15, ...on })
		k.text(150, 862, 'this analogy\'s sole purpose is to impress the self-adaptation folks in the room. lol', { size: 'l', scale: 0.95, color: 'grey', ...on })
		k.pen([[140, 890], [700, 887], [1300, 885], [1690, 882]], { color: 'red', size: 'm', wob: 1.5, beat: 2, anim: 'wipe' })
	},
}
