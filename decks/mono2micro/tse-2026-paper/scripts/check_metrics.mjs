// Recompute recorded metrics with ext/metrics.js and compare them with the run artifacts.
import { readFileSync } from 'node:fs'
import { cmod, cid, c2c, mf, labelPurity } from '../ext/metrics.js'
import { SYSTEMS, PETCLINIC } from '../ext/data/systems.js'
const R = new URL('../../../studies/final-benchmark-v1/runs/', import.meta.url)
const load = (p) => JSON.parse(readFileSync(new URL(p, R)))
const run = 'final-benchmark-v1-agentic-agentic-final-v1b-spring-petclinic-deepseek-v4-1-flash-s1-r1/'
const dec = (p) => Object.fromEntries(Object.entries(load(run + p).tool.decomposition).map(([k, v]) => [k, v.map((x) => x.id ?? x)]))
const blinded = load(run + 'evaluation/blinded-report.json').metrics
const online = load(run + 'evaluation/online/candidates.json').candidate_results
const G = SYSTEMS['spring-petclinic'].graph.map(([a, b, w]) => [a, b, 'dep', w])
const ref = SYSTEMS['spring-petclinic'].reference
const fin = dec('output/decomposition.json')
const rows = [
	['final CMod', cmod(fin, G).value, blinded.CMod],
	['final CiD', cid(fin, G).value, blinded.CiD],
	['final DTP', labelPurity(fin, SYSTEMS['spring-petclinic'].tables).value, blinded.DTP],
	['final DI', labelPurity(fin, SYSTEMS['spring-petclinic'].usecases).value, blinded.DI],
	['final C2C-10', c2c(fin, ref, 0.10).value, blinded['c2c_cvg 10%']],
	['final C2C-33', c2c(fin, ref, 0.33).value, blinded['c2c_cvg 33%']],
	['final C2C-50', c2c(fin, ref, 0.50).value, blinded['c2c_cvg 50%']],
]
for (const r of online) {
	const d = dec(`evaluation/decomp_${r.candidate_id}/decomposition.json`)
	rows.push([`${r.candidate_id} CMod`, cmod(d, G).value, r.metrics.CMod], [`${r.candidate_id} CiD`, cid(d, G).value, r.metrics.CiD], [`${r.candidate_id} MF`, mf(d).value, r.metrics.migration_feasibility])
}
let bad = 0
for (const [n, got, want] of rows) { const ok = Math.abs(got - want) < 0.01; bad += !ok; console.log(ok ? 'ok ' : 'BAD', n.padEnd(16), got.toFixed(3), want.toFixed(3)) }
process.exit(bad ? 1 : 0)
