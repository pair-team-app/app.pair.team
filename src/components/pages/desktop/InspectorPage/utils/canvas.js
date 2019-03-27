
import { CANVAS } from '../consts';


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
