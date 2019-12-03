

let rootNode = null;



export default function packComponents(components) {
// 	console.log('packComponents()', { components });

	let node = null;
	const rects = genRects(components);
	rootNode = { ...[...rects].shift(),
		x     : 0,
		y     : 0,
		used  : false,
		down  : null,
		right : null
	};

	rects.forEach((rect, i)=> {
		let fit = null;

		if (node === findNode(rootNode, rect.width, rect.height)) {
			fit = splitNode(node, rect.width, rect.height);

		} else {
			fit = growNode(rect.width, rect.height);
		}

		rect.x = fit.x;
		rect.y = fit.y;
	});

	return (rects);
}


export function calcSize(rects) {
// 	console.log('calcSize()', { rects });

	return ({
		width  : rects.reduce((acc, val)=> (Math.max(acc, val.x + val.width)), 0),
		height : rects.reduce((acc, val)=> (Math.max(acc, val.y + val.height)), 0)
	});
}


const genRects = (components, sort=true)=> {
	const rects = components.map(({ id, meta })=> ({ id,
		x      : 0,
		y      : 0,
		width  : meta.bounds.width + 20,
		height : meta.bounds.height + 20
	}));

	// https://github.com/jakesgordon/bin-packing/blob/master/js/demo.js
	const sorting = {
		area   : (j, jj)=> ((jj.width * jj.height) - (j.width * j.height)), // [h,w]
		len    : (j, jj)=> ((jj.width * jj.height) - (j.width * j.height)), // [h,w]
		height : (j, jj)=> ((jj.width * jj.height) - (j.width * j.height)), // [h,w]
		width  : (j, jj)=> ((jj.width * jj.height) - (j.width * j.height)), // [h,w]
	};


	return ((sort) ? rects.sort(sorting.area) : rects);
};

const findNode = (node, width, height)=> {
// 	console.log('findNode()', { node, width, height });
	return ((node.used) ? (findNode(node.right, width, height) || findNode(node.down, width, height)) : (width <= node.width && height <= node.height) ? node : null);
};

const growNode = (width, height)=> {
// 	console.log('growNode()', { width, height });

	const down = (width <= rootNode.width);
	const right = (height <= rootNode.height);

	if (right && (rootNode.height >= rootNode.width + width)) {
		return (growRight(width, height));

	} else if (down && (rootNode.width >= rootNode.height + height)) {
		return (growDown(width, height));

	} else if (right) {
		return (growRight(width, height));

	} else if (down) {
		return (growDown(width, height));

	} else { // null
		return (null);
	}
};

const growDown = (width, height)=> {
// 	console.log('grownDown()', { width, height });

	rootNode = {
		used   : true,
		x      : 0,
		y      : 0,
		width  : rootNode.width,
		height : rootNode.height + height,
		down   : {
			x      : 0,
			y      : rootNode.height + 0, //
			width  : rootNode.width,
			height : height
		},
		right  : rootNode
	};

	const node = findNode(rootNode, width, height);
	if (node) {
		return (splitNode(node, width, height));

	} else {
		return (null);
	}
};

const growRight = (width, height)=> {
// 	console.log('growRight()', { width, height });

	rootNode = {
		used   : true,
		x      : 0,
		y      : 0,
		width  : rootNode.width + width,
		height : rootNode.height,
		down   : rootNode,
		right  : {
			x      : rootNode.width + 0,
			y      : 0,
			width  : width,
			height : rootNode.height
		}
	};

	const node = findNode(rootNode, width, height);
	if (node) {
		return (splitNode(node, width, height));

	} else {
		return (null);
	}
};

const splitNode = (node, width, height)=> {
// 	console.log('splitNode()', {  node, width, height });

	node.used = true;
	node.down = {
		x      : node.x + 0,
		y      : node.y + height + 0,
		width  : node.width,
		height : node.height - height
	};
	node.right = {
		x      : node.x + width + 0, //
		y      : node.y + 0,
		width  : node.width - width,
		height : height
	};

// 	console.log('splitNode()', {  node, width, height });

	return ({ ...node});
};