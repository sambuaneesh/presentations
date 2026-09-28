export default {
	name: 'Result',
	kicker: 'II · what happened',
	title: 'Same business services, both times',
	source: 'results.md',
	notes: 'COVER\n• all four decompositions valid\n• PartsUnlimited: the identical partition with and without the models (Catalog, Dealer, Quote, Order, Shipment, Platform)\n• PetClinic: the same Owner (10), Vet (5) and Shared Kernel (3) services; the only change: the 5 infrastructure classes split into System (3) + Bootstrap (2: PetClinicApplication, PetClinicRuntimeHints)\nCLICKS\n1 · PartsUnlimited · 2 · PetClinic\nREF · results.md',
	draw(k) {
		k.box(160, 330, 700, 460, { text: 'PartsUnlimited\n\nidentical\ndecomposition', beat: 1, anim: 'pop' })
		k.box(1060, 330, 700, 460, { text: 'PetClinic\n\nsame business services\ninfrastructure split in two\n(4 → 5 services)', color: 'red', beat: 2, anim: 'pop' })
	},
}
