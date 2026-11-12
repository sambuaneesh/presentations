// These beasts took years: Netflix, Amazon, Twitter on one canvas; one click slams all three stamps in.
export default {
	name: 'Breaking up took years',
	kicker: '0 · it’s complicated',
	source: 'Netflix Tech Blog, 2016 · ACM Queue 4(4), 2006 · Twitter Eng., 2013',
	draw(k) {
		k.box(110, 222, 940, 84, { fill: 'solid', color: 'yellow', size: 's', dash: 'solid' })
		k.text(130, 230, 'Breaking up took them years', { size: 'xl', scale: 1.1 })
		// the hero: Netflix
		k.image(110, 370, 470, 126, 'logo-netflix-trim.png', { alt: 'Netflix' })
		k.text(110, 500, '7 YEARS', { size: 'xl', scale: 3.4, color: 'red', rot: -5, beat: 1, anim: 'zoom' })
		k.text(120, 800, '2008: a database corruption stops DVD shipping\n2016: the last piece leaves the data centre', { size: 'm', color: 'grey', beat: 1, anim: 'fade', delay: 300 })
		k.pen([[1080, 360], [1080, 960]], { size: 's', color: 'grey', dash: 'dotted' })
		// the others, smaller
		k.image(1140, 370, 300, 101, 'logo-amazon-trim.png', { alt: 'Amazon' })
		k.text(1500, 370, '~5 YEARS', { size: 'xl', scale: 1.1, rot: -4, beat: 1, anim: 'zoom', delay: 700 })
		k.text(1140, 490, '“…from a two-tier monolith to a fully-distributed,\ndecentralized, services platform” (Vogels, 2006)', { size: 'm', color: 'grey', w: 700, beat: 1, anim: 'fade', delay: 900 })
		k.image(1140, 660, 110, 89, 'logo-twitter-trim.png', { alt: 'Twitter' })
		k.image(1145, 660, 98, 90, 'logo-x-trim.png', { beat: 1, anim: 'drop', delay: 1500, alt: 'the X logo' })
		k.text(1270, 690, 'pun intended', { size: 'm', color: 'grey', beat: 1, anim: 'fade', delay: 1700 })
		k.text(1500, 660, '3 YEARS', { size: 'xl', scale: 1.1, rot: -4, beat: 1, anim: 'zoom', delay: 1100 })
		k.text(1140, 790, '2010: World Cup, ~2,000 tweets/s, stability problems\n2013: 143,199 tweets/s, “our users didn’t\nexperience a blip”', { size: 'm', color: 'grey', w: 700, beat: 1, anim: 'fade', delay: 1300 })
	},
}
