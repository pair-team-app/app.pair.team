
import { Maths } from 'lang-js-utils';


let rootNode = null;
const PADDING = 0;


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

	if (rects.length > 1) {
		rects.forEach((rect, i) => {
			let fit = null;

// 			if (node === findNode(rootNode, rect.width, rect.height)) {
      node = findNode(rootNode, rect.width, rect.height);
			if (node) {
				fit = splitNode(node, rect.width, rect.height);

			} else {
				fit = growNode(rect.width, rect.height);
			}

// 			console.log('fit', i, { fit });

			if (fit) {
				rect.x = fit.x;
				rect.y = fit.y;
			}
		});
	}

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
	const rects = components.map(({ id, title, meta })=> {
// 		console.log(':::::::', 'genRects', { id, title, area : Maths.geom.sizeArea(meta.bounds) });

		return ({ id,
      x      : 0,
      y      : 0,
      width  : meta.bounds.width + PADDING,
      height : meta.bounds.height + PADDING,
			area   : Maths.geom.sizeArea({
				width  : meta.bounds.width + PADDING,
				height : meta.bounds.height + PADDING
			})
    });
  });

	// https://github.com/jakesgordon/bin-packing/blob/master/js/demo.js
	const sorting = {
		base     : {
			width  : (i, ii)=> (ii.width - i.width),
			height : (i, ii)=> (ii.height - i.height),
			area   : (i, ii)=> (ii.area - i.area),
			max    : (i, ii)=> (Math.max(ii.width, ii.height) - Math.max(i.width, i.height)),
			min    : (i, ii)=> (Math.min(ii.width, ii.height) - Math.min(i.width, i.height))
		},

		orthodox : (i, ii)=> ((ii.width * ii.height) - (i.width * i.height)),
    area     : (i, ii)=> (msort(i, ii, ['area', 'height', 'width'])),
    len      : (i, ii)=> (msort(i, ii, ['width', 'height'])),
    height   : (i, ii)=> (msort(i, ii, ['height', 'width'])),
    width    : (i, ii)=> (msort(i, ii, ['max', 'min', 'height', 'width']))
	};


	const msort = (i, ii, types)=> {
		for (const type of types) {
    //   console.log(':::msort:::', { type, diff : sorting.base[type](i, ii), i, ii });

      const diff = sorting.base[type](i, ii);
      if (diff !== 0) {
        return (diff);
      }
		}

		return (0);
	};

	return ((sort) ? rects.sort(sorting.base.width).reverse() : rects);
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
// 		console.log('::grownRight::', { width, height, rootNode : { width : rootNode.width, height : rootNode.height }});
		return (growRight(width, height));

	} else if (down && (rootNode.width >= rootNode.height + height)) {
//     console.log('::grownDown::', { width, height, rootNode : { width : rootNode.width, height : rootNode.height } });
		return (growDown(width, height));

	} else if (right) {
//     console.log('::grownRight::', { width, height, rootNode : { width : rootNode.width, height : rootNode.height } });
		return (growRight(width, height));

	} else if (down) {
//     console.log('::grownDown::', { width, height, rootNode : { width : rootNode.width, height : rootNode.height } });
		return (growDown(width, height));

	} else { // null
//     console.log('::null::', { width, height, rootNode : { width : rootNode.width, height : rootNode.height } });
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
			y      : rootNode.height, //
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
			x      : rootNode.width,
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

	if (!node) {
		return (null);
	}

	node.used = true;
	node.down = {
		x      : node.x,
		y      : node.y + height,
		width  : node.width,
		height : node.height - height
	};
	node.right = {
		x      : node.x + width, //
		y      : node.y,
		width  : node.width - width,
		height : height
	};

// 	console.log('splitNode()', {  node, width, height });

	return ({ ...node});
};
