
export const Arrays = {
	randomElement : (arr)=> (arr[arr.randomIndex()]),
	randomIndex   : (arr)=> (Maths.randomInt(0, arr.length - 1))
};

export const Maths = {
	clamp       : (val, lower, upper)=> (Math.min(Math.max(val, lower), upper)),
	randomFloat : (lower, upper)=> ((Math.random() * (upper - lower)) + lower),
	randomInt   : (lower, upper)=> (Maths.randomFloat(lower, upper) << 0),
	geom        : {
		sizeArea : (size)=> (size.width * size.height)
	}
};

export const Numbers = {
	commaFormat : (val)=> (val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','))
};

export const Objects = {
	isEmpty : (obj)=> (Object.keys(obj).length === 0)
};

export const Strings = {
	capitalize : (str, lower=false)=> (str.replace(/^(\w+)$/gi, (c)=> ((lower) ? c.toLowerCase() : c)).replace(/(\b\w)/gi, (c)=> (c.toUpperCase()))),
	countOf  : (str, substr)=> ((str.match(new RegExp(substr.toString(), 'g')) || []).length),
// 	lPad     : (str, amt, char)=> ((new Array(amt - String(str).length + 1)).join(str || char) + str),
	lPad     : (str, amt, char)=> ((str.length < amt) ? `${(new Array(amt - String(str).length + 1)).join(char)}${str}` : str),
	replAll  : (str, needle, replacement)=> (str.split(needle).join(replacement)),
// 	rPad     : (str, amt, char)=> ((new Array(amt - String(str).length + 1)).join(str || char) + str),
	rPad     : (str, amt, char)=> ((str.length < amt) ? `${str}${(new Array(amt - String(str).length + 1)).join(char)}` : str),
	reverse  : (str)=> ([...str].reverse().join('')),
	truncate : (str, len, ellipsis='…')=> ((str.length > len) ? str.substring(0, len - 1) + ellipsis : str)
};
