// Tools that read the data and the history (Wang, Bornais & Rubin, ASE 2024, §2.2, §4):
// Data-Centric: the database schema (foreign keys, table names) → split the tables, classes follow their tables.
// CARGO: context-sensitive static analysis at method level, label propagation over calls and table accesses; stops at
// the number of services you give it. MEM: git history (files changed in the same commit / by the same contributor).
// MEM in the comparison: configured to consider only 12 files per commit, raised to 30 (the most Guava's powerset
// allows within int range), partition max raised 10 → 25, still indeterministic; "Lacking support from developers,
// we could not reliably repair the tool." Click 1 MEM's story, click 2 the quote.
export default {
	name: 'Tools that read data and history',
	kicker: 'II · it’s just clustering… right?',
	title: 'Some need your database, or your git history',
	source: 'Wang, Bornais & Rubin, ASE 2024 · §2.2, §4',
	draw(k) {
		k.text(110, 250, 'Data-Centric:', { size: 'l' }); k.text(420, 250, 'reads your database schema', { size: 'l', color: 'grey' })
		k.text(110, 320, 'CARGO:', { size: 'l' }); k.text(420, 320, 'reads calls + table accesses, you pick K', { size: 'l', color: 'grey' })
		// MEM, the hero
		k.pen([[110, 395], [1810, 395]], { size: 's', color: 'grey', dash: 'dotted' })
		k.text(140, 425, 'MEM reads your git history', { size: 'xl' })
		const st = ['only 12 files\nper commit', '→ 30, the most\nGuava allows', 'max partition\n10 → 25', 'still a new answer\nevery run']
		st.forEach((t, i) => k.text(150 + i * 420, 540, t, { size: 'l', beat: 1, anim: 'fade', delay: i * 350 }))
		k.text(150, 720, 'the tool comparison’s own authors:', { size: 'l', color: 'grey', beat: 2, anim: 'fade' })
		k.text(150, 790, '“Lacking support from developers, we could not reliably repair the tool.”', { size: 'l', color: 'red', beat: 2, anim: 'wipe', delay: 300 })
	},
}
