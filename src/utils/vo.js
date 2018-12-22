
export function artboardFiller(amount) {
	let artboards = [];

	for (let i=0; i<amount; i++) {
		artboards.push({
			id       : 0,
			pageID   : 0,
			uploadID : 0,
			title    : null,
			type     : null,
			filename : null,
			meta     : null,
			added    : null,
			selected : false
		});
	}

	return (artboards);
}