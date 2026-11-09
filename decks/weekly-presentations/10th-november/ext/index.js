// The deck's own scenes. Each slide (slides/*.js) carries one `scene` shape, placed after `pres build`.
import { MorphScene, MORPH_BEATS } from './morph.js'
import { GqmScene, GQM_BEATS } from './gqm.js'
import { ContributionsScene, CONTRIB_BEATS } from './contributions.js'
import { DesignScene } from './design.js'
import { PlotsScene } from './plots.js'

export default {
	scenes: {
		'pipeline-morph': { name: 'Old diagram to new', beats: MORPH_BEATS, render: MorphScene },
		gqm: { name: 'Goal to research questions', beats: GQM_BEATS, render: GqmScene },
		contributions: { name: 'Contributions', beats: CONTRIB_BEATS, render: ContributionsScene },
		design: { name: 'Design decisions', beats: 0, render: DesignScene },
		plots: { name: 'The plots', beats: 0, render: PlotsScene },
	},
}
