// What a dependency graph is, on a piece of PetClinic: classes as nodes, typed and counted edges. The edges and counts
// are PetClinic's real ones from the ICSA study's class dependency graph (graph-artifacts/spring-petclinic-class-dependency.json).
const N = { Person: [250, 330], Owner: [250, 600], OwnerController: [250, 870], Pet: [980, 600], Visit: [1600, 600], PetController: [980, 870] }
const E = [
	['Owner', 'Person', 'extends'],
	['Owner', 'Pet', 'uses ×12'], ['Owner', 'Visit', 'uses ×5'], ['Pet', 'Visit', 'uses ×4'],
	['OwnerController', 'Owner', 'uses ×13'], ['PetController', 'Pet', 'uses ×17'], ['PetController', 'Owner', 'uses ×14'],
]
export default {
	name: 'What is a dependency graph?',
	kicker: 'III · enter the LLM · phase 2',
	title: 'What is a dependency graph?',
	source: 'ICSA 2026 run files · PetClinic class dependency graph (A6)',
	draw(k) {
		for (const [c, [x, y]] of Object.entries(N)) k.box(x - 150, y - 40, 300, 80, { text: c, font: 'mono', size: 'm', fill: 'solid', color: 'white', labelColor: 'black', id: c })
		// 1: who depends on whom, what kind of dependency, and how often
		E.forEach(([a, b, t], i) => k.arrow(a, b, { ...(a === 'Owner' && b === 'Visit' && { bend: -150 }), text: t, size: 'm', color: t === 'extends' ? 'grey' : 'blue', beat: 1, anim: 'wipe', delay: i * 200 }))
		// 2: the definition
		k.text(1300, 820, 'nodes: the classes', { size: 'l', beat: 2, anim: 'fade' })
		k.text(1300, 880, 'edges: typed and counted', { size: 'l', beat: 2, anim: 'fade', delay: 300 })
		k.text(1300, 940, 'extends · calls · uses · creates…', { size: 'm', color: 'grey', beat: 2, anim: 'fade', delay: 500 })
	},
}
