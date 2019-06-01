
import { Maths } from '../../../../../utils/lang';
import {GRID, PAN_ZOOM} from "../consts";



export const calcArtboardBaseSize = (artboards, vpSize)=> {
// 		console.log('calcs.calcArtboardBaseSize()', artboards, vpSize);

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
// 	console.log('calcs.calcFitScale()', baseSize, vpSize);
	return (Math.max(Math.min(vpSize.height / baseSize.height, vpSize.width / baseSize.width, 3), 0.001));
};


export const calcIntersectSlices = (slices, frame)=> {
// 	console.log('calcs.calcIntersectSlices()', slices, frame);
	return (slices.filter((slice)=> (Maths.geom.frameContainsFrame(frame, slice.meta.frame))));
};


export const calcScrollPoint = (panPt, vpSize, baseSize, scale, panMultPt)=> {
// 		console.log('calcs.calcScrollPoint()', panPt, vpSize, baseSize, scale, panMultPt);

	const pt = calcTransformPoint({ panMultPt, scale });
	return ({
		x : -Math.round((pt.x * vpSize.width) + ((baseSize.width * scale) * -0.5)),
		y : -Math.round((pt.y * vpSize.height) + ((baseSize.height * scale) * -0.5))
	});
};


export const calcSlicesByArea = (slices)=> {
// 	console.log('slicesByArea()', slices);
	return(slices.sort((s1, s2)=> ((Maths.geom.sizeArea(s1.meta.frame.size) < Maths.geom.sizeArea(s2.meta.frame.size)) ? -1 : (Maths.geom.sizeArea(s1.meta.frame.size) > Maths.geom.sizeArea(s2.meta.frame.size)) ? 1 : 0)));
};


export const calcTransformPoint = (state)=> {
// 		console.log('calcs.calcTransformPoint()', state);

	const { panMultPt, scale } = state;
	return {
		x : 0.5 + scale * (PAN_ZOOM.panMultPt.x - panMultPt.x),
		y : 0.5 + scale * (PAN_ZOOM.panMultPt.y - panMultPt.y)
	};
};

