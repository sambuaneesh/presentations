// The primary analysis: 8 models x 4 systems, each cell the mean of 5 runs.
export default {
	name: 'Eight models, five runs',
	kicker: 'II · what we did',
	title: '32 cells, five runs each',
	source: '§IV-E · §IV-I · Table VIII',
	draw(k) {
		const M = [['DeepSeek v4.1 Flash', 'first benchmark'], ['GLM-5.2', 'first benchmark'], ['gpt-oss:120b', 'first benchmark'], ['gemma4:31b', 'first benchmark'],
			['DeepSeek v4 Pro', 'new'], ['Mistral Large 4', 'new'], ['Kimi K2.7 Code', 'new'], ['Kimi K3', 'new']]
		const SYS = ['Demo', 'JPetStore', 'PartsUnl.', 'PetClinic']
		const X = 760, Y = 300, P = 78, CW = 170
		SYS.forEach((s, j) => k.text(X + j * CW + 10, Y - 60, s, { size: 's', scale: 1.15, color: 'grey' }))
		M.forEach(([m, tag], r) => {
			const y = Y + r * P
			const nw = tag === 'new'
			k.text(150, y + 2, m, { size: 'm', scale: 1.1, color: nw ? 'red' : 'black' })
			for (let j = 0; j < 4; j++) for (let d = 0; d < 5; d++) k.circle(X + j * CW + 20 + d * 26, y + 22, 9, { size: 's', fill: 'solid', color: nw ? 'red' : 'black'})
		})
		k.text(1480, 300, 'DeepSeek v4.1 Flash: its\nfive runs reused from\nthe first benchmark', { size: 's', scale: 1.15, color: 'grey' })
		k.text(150, 940, 'five runs of a cell are averaged first: the cell, not the run, is what we compare', { size: 'm', scale: 1.05, color: 'red' })
		k.text(1480, 640, 'new: chosen because all 12\nof their sweep runs were\nvalid, before any metric\nwas looked at', { size: 's', scale: 1.15, color: 'grey' })
	},
}
