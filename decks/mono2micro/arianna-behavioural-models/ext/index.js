// Arianna's behavioural models: one animated scene showing where her diagrams enter the ICSA pipeline.
import { IcsaBehavioural, BEATS } from './icsa.js'

export default {
	scenes: {
		'icsa-behavioural': { name: 'Where her diagrams go', beats: BEATS, render: IcsaBehavioural, safelight: false },
	},
}
