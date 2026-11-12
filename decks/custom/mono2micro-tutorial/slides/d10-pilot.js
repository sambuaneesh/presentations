// The pilot that put A5 in the pipeline (ICSA 2026 §IV-B): on a food-delivery system with monolith and microservice
// versions, decompositions from the static views A1–A4 alone "frequently produced anti-patterns (shared databases,
// CRUD-centric services)"; adding the dynamic interaction sequences (A5) "enabled identification of advanced
// patterns (CQRS, event sourcing)". The two drawings are schematic.
// Click 1 the static-only result, 2 with A5, 3 the lesson.
export default {
	name: 'Why A5',
	kicker: 'III · enter the LLM',
	title: 'We tried without the dynamic view first',
	source: 'ICSA 2026 · §IV-B (pilot on a food-delivery system)',
	draw(k) {
		k.text(110, 250, 'A1–A4 only (static)', { size: 'l' })
		k.text(1010, 250, '+ A5 (dynamic)', { size: 'l', color: 'violet', beat: 2, anim: 'fade' })
		k.pen([[960, 250], [960, 820]], { size: 's', color: 'grey' })
		// static only: CRUD services on one shared database
		;['OrderCRUD', 'MenuCRUD', 'UserCRUD'].forEach((s, i) => k.box(130 + i * 260, 360, 220, 90, { text: s, font: 'mono', size: 'm', id: `c${i}`, beat: 1, anim: 'drop', delay: i * 120 }))
		k.box(330, 600, 260, 110, { geo: 'ellipse', text: 'one shared DB', size: 'm', color: 'red', id: 'db', beat: 1, anim: 'pop', delay: 400 })
		;[0, 1, 2].forEach((i) => k.arrow(`c${i}`, 'db', { size: 's', color: 'red', beat: 1, delay: 500 + i * 100 }))
		k.text(130, 740, 'anti-patterns: shared database,\nCRUD-centric services', { size: 'l', color: 'red', beat: 1, anim: 'fade', delay: 800 })
		// with A5: commands, queries, events
		k.box(1010, 360, 280, 90, { text: 'place order\n(commands)', size: 'm', id: 'cmd', beat: 2, anim: 'drop' })
		k.box(1500, 360, 280, 90, { text: 'track order\n(queries)', size: 'm', id: 'qry', beat: 2, anim: 'drop', delay: 120 })
		k.box(1180, 590, 420, 90, { text: 'event: OrderPlaced', font: 'mono', size: 'm', color: 'green', id: 'ev', beat: 2, anim: 'pop', delay: 300 })
		k.arrow('cmd', 'ev', { size: 's', color: 'green', beat: 2, delay: 450 }); k.arrow('ev', 'qry', { size: 's', color: 'green', beat: 2, delay: 600 })
		k.text(1010, 740, 'patterns: CQRS,\nevent sourcing', { size: 'l', color: 'green', beat: 2, anim: 'fade', delay: 800 })
		k.text(110, 890, 'how the system behaves over time changes where you cut it', { size: 'xl', beat: 2, anim: 'wipe', delay: 1200 })
	},
}
