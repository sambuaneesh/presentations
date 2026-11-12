// One plain LLM call: how would you feed it the monolith? Option 1, paste the whole repo: gitingest text sizes of the
// four ICSA systems (studies/icsa-2026/systems/*/generation/gitingest.txt, characters; ICSA §IV-A: full source +
// metadata can reach several hundred thousand tokens; these systems have only 24–53 classes). Option 2, just the
// names: PetClinic's 23 classes (benchmark inventory) with the ambiguous ones marked. Click 1 option 1, click 2 option 2.
const SYS = [['PetClinic', 259284], ['JPetStore', 438774], ['7ep-demo', 626631], ['PartsUnlimited', 835587]]
const NAMES = ['Owner', 'OwnerController', 'OwnerRepository', 'Person', 'Pet', 'PetController', 'PetType', 'PetTypeFormatter', 'PetValidator', 'Visit', 'VisitController', 'Vet', 'Vets', 'VetController', 'VetRepository', 'Specialty', 'BaseEntity', 'NamedEntity', 'PetClinicApplication', 'PetClinicRuntimeHints', 'CacheConfiguration', 'WelcomeController', 'CrashController']
const ODD = ['Vet', 'Vets', 'BaseEntity', 'NamedEntity', 'PetTypeFormatter', 'PetClinicRuntimeHints', 'CrashController']
export default {
	name: 'How would you feed it?',
	kicker: 'III · enter the LLM',
	title: 'One call. How would YOU feed it the code?',
	source: 'ICSA 2026 study files (gitingest.txt) · §IV-A · PetClinic’s 23 classes',
	draw(k) {
		k.text(110, 250, 'option 1: paste the whole repo', { size: 'l', beat: 1, anim: 'fade' })
		k.text(112, 310, 'characters, as one text file', { size: 'm', color: 'grey', beat: 1, anim: 'fade' })
		SYS.forEach(([n, chars], i) => {
			const y = 380 + i * 105, w = (chars / 835587) * 420
			k.text(110, y + 12, n, { size: 'm', beat: 1, anim: 'fade', delay: i * 150 })
			k.box(380, y, w, 64, { fill: 'semi', color: i === 0 ? 'blue' : 'grey', size: 's', beat: 1, anim: 'wipe', delay: i * 150 })
			k.text(390 + w, y + 12, (chars / 1000).toFixed(0) + 'k', { size: 'm', font: 'mono', beat: 1, anim: 'fade', delay: i * 150 + 200 })
		})
		k.text(110, 830, 'too big', { size: 'xl', scale: 1.3, rot: -3, beat: 1, anim: 'zoom', delay: 800 })
		k.text(1000, 250, 'option 2: just the class names', { size: 'l', beat: 2, anim: 'fade' })
		let x = 1000, y = 330
		NAMES.forEach((c, i) => {
			const w = c.length * 12.6 + 30
			if (x + w > 1830) { x = 1000; y += 78 }
			k.box(x, y, w, 50, { text: c, font: 'mono', size: 's', fill: 'solid', color: 'white', labelColor: 'black', rot: (i % 3) - 1, beat: 2, anim: 'drop', delay: i * 30 })
			if (ODD.includes(c)) k.text(x + w - 18, y - 34, '?', { size: 'l', color: 'red', beat: 2, anim: 'pop', delay: 900 + i * 40 })
			x += w + 18
		})
		k.text(1000, 830, 'too vague', { size: 'xl', scale: 1.3, rot: 3, beat: 2, anim: 'zoom', delay: 1300 })
	},
}
