// The study's metrics, re-implemented line by line from the code that produced the paper's numbers,
// so interactive slides can recompute them live. Checked against recorded run values by
// scripts/check_metrics.mjs.
//   CMod   vendor/legacy-metrics-engine/calculator/evaluate.py  calculate_normalized_turbomq
//   CiD    vendor/legacy-metrics-engine/calculator/evaluate.py  calculate_cycles (CiD = 100 − CDP)
//   C2C    vendor/legacy-metrics-engine/calculator/c2c.py        (strict "greater than" threshold)
//   MF     packages/decomplab-agentic/.../agents/decomposition_evaluator.py  _migration_feasibility
//   entropy purity (DTP, DI, BCP)  vendor/legacy-metrics-engine/calculator/entropy.py
// A decomposition is { serviceName: [className, …] }; edges are [source, target, type, weight].

export function ownerOf(dec) {
	const own = {}
	for (const [s, cs] of Object.entries(dec)) for (const c of cs) own[c] = s
	return own
}

// Mean cluster factor CF_i = 2·int_i / (2·int_i + ext_i) over services, × 100.
export function cmod(dec, edges) {
	const own = ownerOf(dec)
	const names = Object.keys(dec)
	if (!names.length) return 0
	let cf = 0
	const parts = {}
	for (const n of names) {
		let internal = 0, external = 0
		const set = new Set(dec[n])
		for (const [s, t, , w = 1] of edges) {
			if (!(s in own) || !(t in own)) continue
			if (set.has(s) && set.has(t)) internal += w
			else if (set.has(s) || set.has(t)) external += w
		}
		const f = internal > 0 ? (2 * internal) / (2 * internal + external) : 0
		parts[n] = { internal, external, cf: f }
		cf += f
	}
	return { value: (cf / names.length) * 100, parts }
}

// Share of ordered service pairs that do NOT depend on each other in both directions.
export function cid(dec, edges) {
	const own = ownerOf(dec)
	const names = Object.keys(dec)
	const dep = new Set()
	for (const [s, t] of edges) if (s in own && t in own && own[s] !== own[t]) dep.add(own[s] + '→' + own[t])
	let total = 0, cyclic = 0
	const pairs = []
	for (const a of names) for (const b of names) {
		if (a === b) continue
		total++
		const both = dep.has(a + '→' + b) && dep.has(b + '→' + a)
		if (both) cyclic++
		if (a < b) pairs.push({ a, b, ab: dep.has(a + '→' + b), ba: dep.has(b + '→' + a) })
	}
	return { value: total ? 100 - (cyclic / total) * 100 : 100, pairs }
}

// Overlap of two class sets, |A ∩ B| / max(|A|, |B|).
export function overlap(a, b) {
	const B = new Set(b)
	return a.filter((x) => B.has(x)).length / Math.max(a.length, b.length)
}

// Share of produced services with some reference service overlapping by MORE than `threshold` (0–1).
// Every reference group counts, including an "uncounted" (unassigned) one, as in the code.
export function c2c(dec, ref, threshold) {
	const produced = Object.entries(dec)
	const rows = produced.map(([name, cs]) => {
		let best = null
		for (const [rn, rcs] of Object.entries(ref)) {
			const o = overlap(cs, rcs)
			if (!best || o > best.o) best = { ref: rn, o }
		}
		return { name, best: best.ref, o: best.o, hit: Object.values(ref).some((rcs) => overlap(cs, rcs) > threshold) }
	})
	return { value: (rows.filter((r) => r.hit).length / produced.length) * 100, rows }
}

// Migration feasibility: 100·(1 − 0.6·s_max − 0.4·s_1), clipped at 0.
export function mf(dec) {
	const sizes = Object.values(dec).map((cs) => cs.length)
	const total = sizes.reduce((a, b) => a + b, 0)
	if (!sizes.length || !total) return null
	const sMax = Math.max(...sizes) / total
	const s1 = sizes.filter((s) => s === 1).length / sizes.length
	return { value: Math.max(0, 100 * (1 - 0.6 * sMax - 0.4 * s1)), sMax, s1 }
}

// Natural-log entropy of a list of counts, clipped at 1 (scipy.stats.entropy on raw counts).
export function clippedEntropy(counts) {
	const n = counts.reduce((a, b) => a + b, 0)
	if (!n) return 0
	const h = -counts.filter((c) => c > 0).reduce((s, c) => s + (c / n) * Math.log(c / n), 0)
	return Math.min(1, h)
}

// DTP / DI: for each label (a table, or a use case), how spread its classes are across services.
// labels = { label: [className, …] }. 100·(1 − mean clipped entropy).
export function labelPurity(dec, labels) {
	const own = ownerOf(dec)
	const rows = Object.entries(labels).map(([label, cs]) => {
		const per = {}
		for (const c of new Set(cs)) if (c in own) per[own[c]] = (per[own[c]] ?? 0) + 1
		return { label, per, h: clippedEntropy(Object.values(per)) }
	})
	return { value: (1 - rows.reduce((s, r) => s + r.h, 0) / rows.length) * 100, rows }
}

// BCP: for each service, how many distinct use cases its classes take part in (counted per class).
export function bcp(dec, labels) {
	const byClass = {}
	for (const [label, cs] of Object.entries(labels)) for (const c of new Set(cs)) (byClass[c] ??= []).push(label)
	const rows = []
	for (const [s, cs] of Object.entries(dec)) {
		const uses = cs.flatMap((c) => byClass[c] ?? [])
		if (!uses.length) continue
		const counts = {}
		for (const u of uses) counts[u] = (counts[u] ?? 0) + 1
		rows.push({ service: s, counts, h: clippedEntropy(Object.values(counts)) })
	}
	return { value: rows.length ? (1 - rows.reduce((a, r) => a + r.h, 0) / rows.length) * 100 : null, rows }
}
