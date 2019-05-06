
import { CANVAS, GRID, PAN_ZOOM, SECTIONS } from '../consts';
import { flattenUploadArtboards } from './model';
import { Maths } from '../../../../../utils/lang';


export const calcCanvasSliceFrame = (state, slice, artboard, offset, scrollPt)=> {
// 	console.log('InspectorPage.calcCanvasSliceFrame()', state, slice, artboard, offset, scrollPt);

	const { section, upload, scale, urlBanner } = state;
	const artboards = flattenUploadArtboards(upload, 'page_child');

// 	console.log(':::::::::', artboards.length, { offset, scrollPt });

	const baseOffset = {
		x : (artboards.length < GRID.colsMax && section !== SECTIONS.EDIT) ? GRID.padding.col * 0.5 : 0,
// 		x : 0,
		y : 24 + (38 * (urlBanner << 0)) + PAN_ZOOM.insetSize.height
	};

	const srcFrame = Maths.geom.cropFrame(slice.meta.frame, artboard.meta.frame);
	const srcOffset = {
		x : baseOffset.x + ((offset.x - scrollPt.x) << 0),
		y : baseOffset.y + ((offset.y - scrollPt.y) << 0)
	};

	const scaledFrame = {
		origin : {
			x : (srcOffset.x + (srcFrame.origin.x * scale)) << 0,
			y : (srcOffset.y + (srcFrame.origin.y * scale)) << 0

		},
		size   : {
			width  : (srcFrame.size.width * scale) << 0,
			height : (srcFrame.size.height * scale) << 0
		}
	};

// 		console.log('-- InspectorPage.calcCanvasSliceFrame()', baseOffset, srcFrame, srcOffset, scaledFrame);
	return (scaledFrame);
};

export function drawCanvasSliceBorder(context, frame) {
	context.strokeStyle = CANVAS.slices.borderColor;
	context.lineWidth = CANVAS.slices.lineWidth;
	context.setLineDash([]);
	context.lineDashOffset = 0;
	context.beginPath();
	context.strokeRect(frame.origin.x + 1, frame.origin.y + 1, frame.size.width - 2, frame.size.height - 2);
	context.stroke();
}

export function drawCanvasSliceFill(context, frame, color) {
	context.fillStyle = color;
	context.fillRect(frame.origin.x, frame.origin.y, frame.size.width, frame.size.height);
}

export function drawCanvasSliceGuides(context, frame, size, color) {
	context.strokeStyle = color;
	context.lineWidth = CANVAS.guides.lineWidth;
	context.setLineDash(CANVAS.guides.lineDash);
	context.lineDashOffset = 0;
	context.beginPath();
	context.moveTo(0, frame.origin.y); // h-top
	context.lineTo(size.width, frame.origin.y);
	context.moveTo(0, frame.origin.y + frame.size.height); // h-bottom
	context.lineTo(size.width, frame.origin.y + frame.size.height);
	context.moveTo(frame.origin.x, 0); // v-left
	context.lineTo(frame.origin.x, size.height);
	context.moveTo(frame.origin.x + frame.size.width, 0); // v-right
	context.lineTo(frame.origin.x + frame.size.width, size.height);
	context.stroke();
}

export function drawCanvasSliceMarchingAnts(context, frame, offset) {
	context.strokeStyle = CANVAS.marchingAnts.stroke;
	context.lineWidth = CANVAS.marchingAnts.lineWidth;
	context.setLineDash(CANVAS.marchingAnts.lineDash);
	context.lineDashOffset = offset;
	context.beginPath();
	context.strokeRect(frame.origin.x, frame.origin.y, frame.size.width, frame.size.height);
	context.stroke();
}

export function drawCanvasSliceTooltip(context, text, origin, maxWidth=-1) {
	maxWidth = (maxWidth === -1) ? 250 : maxWidth;

	let caption = text;
	let txtWidth = context.measureText(caption.toUpperCase()).width << 0;
	while ((txtWidth + CANVAS.caption.padding) > maxWidth) {
		caption = `${caption.substring(0, -3)}…`;
		txtWidth = context.measureText(caption.toUpperCase()).width << 0;
		if (caption.length === 1) {
			break;
		}
	}

	const txtMetrics = {
		width   : txtWidth,
		height  : CANVAS.caption.height,
		padding : CANVAS.caption.padding
	};

	context.fillStyle = CANVAS.caption.bgColor;
	context.fillRect(origin.x + 1, (origin.y - txtMetrics.height), (txtMetrics.width + (txtMetrics.padding * 2)) - 2, txtMetrics.height);

	context.strokeStyle = CANVAS.caption.lineColor;
	context.lineWidth = 1;
	context.setLineDash([]);
	context.lineDashOffset = 0;
	context.beginPath();
	context.strokeRect(origin.x + 1, (origin.y - txtMetrics.height), (txtMetrics.width + (txtMetrics.padding * 2)) - 2, txtMetrics.height);
	context.stroke();

	context.fillStyle = CANVAS.caption.textColor;
	context.fillText(caption.toUpperCase(), txtMetrics.padding + origin.x, txtMetrics.padding + (origin.y - txtMetrics.height));
}
