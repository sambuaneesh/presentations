// A real A5 view, redrawn: "Workflow 1: Find Owners", written by GPT-5 in the ICSA study (80k chunks, concatenated
// summary) for Spring PetClinic: studies/icsa-2026/systems/spring-petclinic/generation/summaries/gpt-5/80k/
// artifacts_concat/05_dynamic_interactions.md. Calls copied from its mermaid sequence diagram, reduced to the
// four main participants (the DispatcherServlet hop and the replies are left out). Click 1: the calls; 2: the point.
const P = [['Browser', 250], ['OwnerController', 720], ['OwnerRepository', 1190], ['DB', 1640]]
export default {
	name: 'A5, for real',
	kicker: 'III · enter the LLM',
	title: 'A5, for real: “find owners”',
	source: 'ICSA 2026 run files · GPT-5 · 80k-concat · 05_dynamic_interactions.md',
	draw(k) {
		P.forEach(([n, x]) => {
			const w = n.length * 17 + 50
			k.box(x - w / 2, 250, w, 76, { text: n, font: 'mono', size: 'm', fill: 'solid', color: 'white', labelColor: 'black' })
			k.pen([[x, 326], [x, 800]], { size: 's', color: 'grey', dash: 'dashed' })
		})
		const X = Object.fromEntries(P)
		const msg = (a, b, y, t, d) => {
			k.arrow([X[a] + 8, y], [X[b] - 8, y], { size: 'l', beat: 1, delay: d })
			k.text(X[a] + 30, y - 58, t, { font: 'mono', size: 'm', beat: 1, anim: 'fade', delay: d })
		}
		msg('Browser', 'OwnerController', 440, 'GET /owners?lastName=Sm', 0)
		msg('OwnerController', 'OwnerRepository', 580, 'findByLastName…("Sm")', 350)
		msg('OwnerRepository', 'DB', 720, "SELECT … LIKE 'Sm%'", 700)
		k.text(110, 880, 'written by the LLM: nobody ran the app', { size: 'xl', color: 'red', beat: 2, anim: 'wipe' })
	},
}
