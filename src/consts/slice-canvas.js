
export const CANVAS_COLORS = {
	border : '#005cc5',
	types  : {
		slice      : {
			fill   : 'rgba(255, 148, 0, 0.6)',
			guides : '#ff9400'
		},
		textfield  : {
			fill   : 'rgba(9, 248, 16, 0.6)',
			guides : '#00ff0f'
		},
		background : {
			fill   : 'rgba(255, 127, 240, 0.6)',
			guides : '#ff7ff0'
		},
		group      : {
			fill   : 'rgba(0, 120, 255, 0.6)',
			guides : '#93c6ff'
		},
		symbol     : {
			fill   : 'rgba(255, 236, 0, 0.6)',
			guides : '#ffec00'
		}
	}
};

const CAPTION_FONT_SIZE = 10;
const CAPTION_PADDING = 10;
export const CANVAS_CAPTION = {
	padding   : CAPTION_PADDING,
	height    : (CAPTION_PADDING * 2) + CAPTION_FONT_SIZE,
	lineColor : '#005cc5',
	fontFace  : `normal 600 ${CAPTION_FONT_SIZE}px "San Francisco Text SemiBold"`,
	fontSize  : CAPTION_FONT_SIZE,
	textColor : '#005cc5',
	baseline  : 'top',
	align     : 'left'
};

const LINE_DASH = [8, 4];
export const MARCHING_ANTS = {
	STROKE     : 'rgba(0, 92, 197, 0.5)',
	LINE_WIDTH : 2,
	LINE_DASH  : LINE_DASH,
	INTERVAL   : 50,
	INCREMENT  : 0.5,
	OFFSET_MOD : 12//(LINE_DASH.reduce((acc, val)=> (acc * val)) * 0.5) << 0
};
