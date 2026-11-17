// The deck's own scenes. Each slide (slides/*.js) carries one `scene` shape, placed after `pres build`.
import { WorkflowScene, WORKFLOW_BEATS } from './workflow.js'
import { GqmRevisionScene, GQM_REVISION_BEATS } from './gqm.js'
import { ResultsScene, RESULTS_BEATS } from './results.js'
import { TokensScene, PerModelScene } from './plotsnew.js'

export default {
	scenes: {
		workflow: { name: 'The workflow diagram, then and now', beats: WORKFLOW_BEATS, render: WorkflowScene },
		gqm: { name: 'The GQM goal, revised', beats: GQM_REVISION_BEATS, render: GqmRevisionScene },
		results: { name: 'The results at a glance, revised', beats: RESULTS_BEATS, render: ResultsScene },
		tokens: { name: 'Token cost, revised', beats: 1, render: TokensScene },
		permodel: { name: 'Per model, revised', beats: 1, render: PerModelScene },
	},
}
