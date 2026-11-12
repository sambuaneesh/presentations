// Place your bets, then the ICSA results row by row (means over 4 systems; LLMs: 4 models × 7 strategies = 28 per system).
// CiD, CMod, BCP, DI, TC: ICSA §V (Mann–Whitney U). C2C-50: re-analysis of the same stored decompositions (MS thesis ch. 4, descriptive).
const ROWS = [
	['CiD', 'no cycles between services', '87.8', '65.1', 'llm'],
	['CMod', 'cohesion & coupling', '61.2', '62.9', 'tie'],
	['BCP', 'one use case per service', '44.2', '39.6', 'tie'],
	['DI', 'a use case stays in one service', '24.1', '34.8', 'tools'],
	['TC', 'teams can work alone', '20.2', '31.2', 'tools'],
	['C2C-50', 'close to the developers’ services', '50.2', '29.7', 'llm'],
]
export default {
	name: 'Place your bets',
	kicker: 'IV · the ICSA results · bet first',
	title: 'LLMs or the traditional tools?',
	source: 'ICSA §V (≈ no significant difference) · C2C-50: re-analysis of the runs',
	draw(k) {
		k.text(870, 260, 'LLMs', { size: 'l', color: 'blue' }); k.text(1190, 260, 'tools', { size: 'l', color: 'violet' })
		ROWS.forEach(([m, what, l, t, win], i) => {
			const y = 330 + i * 100, b = 1, d = i * 450
			k.text(120, y, m, { size: 'l' }); k.text(360, y + 8, what, { size: 'm', color: 'grey' })
			k.text(880, y, l, { size: 'l', color: win === 'llm' ? 'green' : 'black', beat: b, anim: 'pop', delay: d })
			k.text(1200, y, t, { size: 'l', color: win === 'tools' ? 'green' : 'black', beat: b, anim: 'pop', delay: d + 150 })
			k.box(1500, y + 4, 3 * Number(l), 20, { fill: 'fill', color: 'blue', size: 's', beat: b, anim: 'wipe', delay: d + 100 })
			k.box(1500, y + 30, 3 * Number(t), 20, { fill: 'fill', color: 'violet', size: 's', beat: b, anim: 'wipe', delay: d + 250 })
			if (win === 'tie') k.text(1380, y, '≈', { size: 'xl', color: 'grey', beat: b, anim: 'fade', delay: d + 300 })
			else k.tick(win === 'llm' ? 1010 : 1330, y + 30, 34, { color: 'green', beat: b, anim: 'wipe', delay: d + 300 })
		})
		k.note(1480, 250, 'your bet:\nwho wins\neach row?', { color: 'yellow', size: 'm', rot: 3, anim: 'drop', until: 1 })
		k.text(120, 950, 'LLMs: clean cuts with few cycles. tools: closer to the business and the teams.', { size: 'l', beat: 2, anim: 'wipe' })
	},
}
