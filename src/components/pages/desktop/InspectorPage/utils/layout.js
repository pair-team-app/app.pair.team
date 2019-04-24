
import { GRID } from '../consts';


export const calcArtboardBaseSize = (artboards, vpSize)=> {
// 		console.log('InspectorPage.calcArtboardBaseSize()', artboards, vpSize);

	let maxH = 0;
	let offset = {
		x : 0,
		y : 0
	};

	let baseSize = {
		width  : 0,
		height : 0
	};

	artboards.forEach((artboard, i)=> {
		if ((i % GRID.colsMax) << 0 === 0 && i > 0) {
			offset.x = 0;
			offset.y += maxH + GRID.padding.row;
			maxH = 0;
		}

		maxH = Math.round(Math.max(maxH, artboard.meta.frame.size.height));
		baseSize.height = Math.max(baseSize.height, offset.y + maxH);

		offset.x += Math.round(((i % GRID.colsMax < (GRID.colsMax - 1) && i < artboards.length - 1) ? GRID.padding.col : 0) + (artboard.meta.frame.size.width));
		baseSize.width = Math.max(baseSize.width, offset.x);
	});

	return (baseSize);
};


export const calcArtboardScaledCoords = (artboards, scale)=> {
// 		console.log('InspectorPage.calcArtboardScaledCoords()', artboards, scale);

// 		const grid = {
// 			cols : (Math.min(artboards.length, GRID.colsMax) - 1) * 50,
// 			rows : ((artboards.length > 0) ? ((artboards.length / GRID.colsMax) << 0) : 0) * 50
// 		};

	let maxH = 0;
	let offset = {
		x : 0,
		y : 0
	};

	let scaledCoords = [];
	artboards.forEach((artboard, i)=> {
		if (((i % GRID.colsMax) << 0) === 0 && i > 0) {
			offset.x = 0;
			offset.y += maxH + GRID.padding.row;
			maxH = 0;
		}

		scaledCoords.push({ artboard,
			coords : Object.assign({}, offset)
		});

		maxH = Math.round(Math.max(maxH, artboard.meta.frame.size.height * scale));
		offset.x += Math.round(((i % GRID.colsMax < (GRID.colsMax - 1)) ? GRID.padding.col : 0) + (artboard.meta.frame.size.width * scale));
	});

	return (scaledCoords);
};


export const calcFitScale = (baseSize, vpSize)=> {
// 		console.log('InspectorPage.calcFitScale()', baseSize, vpSize);
	//const fitScale = Math.max(Math.min(this.state.viewSize.height / this.contentSize.height, this.state.viewSize.width / this.contentSize.width, PAN_ZOOM.zoomNotches.slice(-1)[0]), PAN_ZOOM.zoomNotches[0]);
	//return (Math.max(Math.min(vpSize.height / baseSize.height, vpSize.width / baseSize.width, Math.max(...PAN_ZOOM.zoomNotches)), Math.min(...PAN_ZOOM.zoomNotches)));
	return (Math.max(Math.min(vpSize.height / baseSize.height, vpSize.width / baseSize.width, 3), 0.001));
};
