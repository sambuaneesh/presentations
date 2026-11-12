// The bill: what the eight tools need before they run, as a case-study funnel (Wang et al. §2.3):
// 62 apps used by at least one of the 24 tools → 22 with public Java source and English docs → 8 that also have a
// developer-made microservice version → 3 that meet every tool's needs (tests with ≥ 60 % statement coverage,
// ≥ 3 functional tests as use cases, ≥ 3 database tables, ≥ 100 commits and ≥ 3 contributors):
// JPetStore, Spring-PetClinic, PartsUnlimitedMRP. Shown as isotype dot rows (one dot per app); click 1 narrows the funnel, click 2 names the survivors.
export default {
	name: 'The bill',
	kicker: 'II · it’s just clustering… right?',
	title: 'So which apps can they even run on?',
	source: 'Wang, Bornais & Rubin, ASE 2024 · §2.3 · Table 1',
	draw(k) {
		// isotype: one dot per app, the same size in every row; the survivors in red
		const rows = [
			[62, 'apps used to evaluate those 24 tools', 0],
			[22, 'public Java code, English docs', 1],
			[8, 'a microservice version made by developers', 1],
			[3, 'tests ≥ 60 % coverage, ≥ 3 use cases,\n≥ 3 DB tables, ≥ 100 commits, ≥ 3 people', 1],
		]
		const P = 38, cols = 16, Y = [250, 450, 590, 710]
		rows.forEach(([n, why, b], i) => {
			const y = Y[i], d = Math.max(0, i - 1) * 500
			k.text(110, y - 8, String(n), { size: 'xl', color: i === 3 ? 'red' : 'black', beat: b, anim: 'pop', delay: d })
			k.grid(250, y, cols, n, P, 26, { color: i === 3 ? 'red' : 'black', fill: 'fill', beat: b, anim: 'pop', each: (j) => ({ fill: 'fill', delay: d + (j % cols) * 20 }) })
			k.text(960, y, why, { size: 'm', scale: 1.15, beat: b, anim: 'fade', delay: d + 200 })
		})
		k.text(960, 900, 'JPetStore · Spring PetClinic · PartsUnlimitedMRP', { size: 'm', font: 'mono', beat: 2, anim: 'fade' })
		k.text(110, 900, 'and some want the number\nof services up front', { size: 'm', color: 'grey', beat: 2, anim: 'fade', delay: 300 })
	},
}
