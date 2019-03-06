
export const Arrays = {
	randomElement : (arr)=> (arr[arr.randomIndex()]),
	randomIndex   : (arr)=> (Maths.randomInt(0, arr.length - 1))
};

export const Maths = {
	clamp       : (val, lower, upper)=> (Math.min(Math.max(val, lower), upper)),
	randomFloat : (lower, upper, precision=15)=> ((Math.random() * (upper - lower)) + lower).toFixed(precision),
	randomInt   : (lower, upper)=> Math.round(Maths.randomFloat(lower, upper)),
	geom        : {
		cropFrame          : (srcFrame, cropFrame)=> ({
				origin : {
					x : Math.max(srcFrame.origin.x, cropFrame.origin.x),
					y : Math.max(srcFrame.origin.y, cropFrame.origin.y)
				},
				size   : {
					width  : Math.min(srcFrame.origin.x + srcFrame.size.width, cropFrame.origin.x + cropFrame.size.width) - Math.max(srcFrame.origin.x, cropFrame.origin.x),
					height : Math.min(srcFrame.origin.y + srcFrame.size.height, cropFrame.origin.y + cropFrame.size.height) - Math.max(srcFrame.origin.y, cropFrame.origin.y)
				}
			}),
		frameToRect        : (frame)=> ({
				top    : frame.origin.y,
				left   : frame.origin.x,
				bottom : frame.origin.y + frame.size.height,
				right  : frame.origin.x + frame.size.width
			}),
		rectContainsRect   : (baseRect, testRect)=> (baseRect.top <= testRect.top && baseRect.left <= testRect.left && baseRect.right >= testRect.right && baseRect.bottom >= testRect.bottom),
		rectIntersectsRect : (baseRect, testRect)=> (Math.max(baseRect.left, testRect.left) < Math.min(baseRect.right, testRect.right) && Math.max(baseRect.top, testRect.top) < Math.min(baseRect.bottom, testRect.bottom)),
		rectToFrame        : (rect)=> ({
				origin : {
					x : rect.left,
					y : rect.top
				},
				size   : {
					width  : rect.right - rect.left,
					height : rect.bottom - rect.top
				}
			}),
		sizeArea           : (size)=> (size.width * size.height)
	}
};

export const Numbers = {
	clamp       : (val, lower, upper)=> (Math.min(Math.max(lower, val), upper)),
	commaFormat : (val)=> (val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','))
};

export const Objects = {
	isEmpty : (obj)=> (Object.keys(obj).length === 0)
};

export const Strings = {
	camilze    : (text, separator=' ', first=false)=> {
		const camilized = text.split((separator || ' ')).map((word)=> (word.replace(/^./, (c)=> (c.toUpperCase())))).join('');
		return ((first) ? camilized : camilized.replace(/^./, (c)=> (c.toLowerCase())));
	},
	capitalize : (str, lower=false)=> (str.replace(/^(\w+)$/gi, (c)=> ((lower) ? c.toLowerCase() : c)).replace(/(\b\w)/gi, (c)=> (c.toUpperCase()))),
	countOf  : (str, substr)=> ((str.match(new RegExp(substr.toString(), 'g')) || []).length),
// 	lPad     : (str, amt, char)=> ((new Array(amt - String(str).length + 1)).join(str || char) + str),
	lPad     : (str, amt, char)=> ((str.length < amt) ? `${(new Array(amt - String(str).length + 1)).join(char)}${str}` : str),
	repeat   : (str, amt)=> ((new Array(amt)).fill(str).join('')),
	replAll  : (str, needle, replacement)=> (str.split(needle).join(replacement)),
	reverse  : (str)=> ([...str].reverse().join('')),
// 	rPad     : (str, amt, char)=> ((new Array(amt - String(str).length + 1)).join(str || char) + str),
	rPad     : (str, amt, char)=> ((str.length < amt) ? `${str}${(new Array(amt - String(str).length + 1)).join(char)}` : str),
	truncate : (str, len, ellipsis='…')=> ((str.length > len) ? `${str.substring(0, len - 1).trim()}${ellipsis}` : str)
};
