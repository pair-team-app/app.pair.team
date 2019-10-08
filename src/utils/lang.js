
export const Arrays = {
// 	containsElement  : (arr, element)=> (arr.indexOf(element) > -1),
	containsElement  : (arr, element)=> (Arrays.containsElements(arr, [element])),
	containsElements : (arr, elements, all=true)=> ((all) ? elements.every((element)=> (arr.indexOf(element) > -1)) : elements.some((element)=> (arr.indexOf(element) > -1))),
	convertToObject  : (arr)=> {
		let obj = {};
		arr.forEach((element)=> {
			if (Objects.hasKey(element, 'key') && Objects.hasKey(element, 'val')) {
				obj[element.key] = element.val;
			}
		});

		return (obj);
	},
// 	dropElement      : (arr, element)=> (arr.filter((item)=> (item !== element))),
	dropElement      : (arr, element)=> (Arrays.dropElements(arr, [element])),
	dropElements     : (arr, elements)=> (arr.filter((element)=> (!Arrays.containsElement(elements, element)))),
	indexFill        : (len, ind)=> (Arrays.indexMap((new Array(len).fill(null))).map((i)=> (i + ind))),
	indexMap         : (arr)=> (arr.map((element, i)=> (i))),
	isEmpty          : (arr)=> (arr.length === 0),
	randomElement    : (arr)=> (arr[arr.randomIndex()]),
	randomIndex      : (arr)=> (Maths.randomInt(0, arr.length - 1)),
	shuffle          : (arr)=> {
		let indexes = Arrays.indexMap(arr);
		indexes.forEach((element, i)=> {
			const ind = (arr.length - 1) - i;
			Arrays.swapAtIndexes(indexes, (ind > 0) ? Maths.randomInt(0, ind - 1) : Arrays.randomIndex(indexes), ind);
		});

		return (indexes.map((ind)=> (arr[ind])));
	},
	swapAtIndexes    : (arr, i, ii)=> {
		const swap = arr[i];
		arr[i] = arr[ii];
		arr[ii] = swap;
	},
	wrapElement      : (arr, ind)=> (arr[Arrays.wrapIndex(arr, ind)]),
	wrapIndex        : (arr, ind)=> (Maths.wrap(ind, arr.length - 1))
};


export const Bits = {
	contains : (val, bit)=> (((val & bit) === bit)),
	random   : ()=> (Bools.random() << 0)
};


export const Bools = {
	plusMinus : (bool=true)=> (((bool << 0) * 2) - 1),
	random    : ()=> (Maths.coinFlip())
};


export const Browsers = {
	clipboardCopy : (str)=> {
// 		navigator.clipboard.writeText(str);
		const txtArea = document.createElement('textarea');
		txtArea.innerText = str;
		document.body.appendChild(txtArea);
		txtArea.select();
		document.execCommand('copy');
		txtArea.remove();
	},
	isMobile     : {
		Android    : ()=> (navigator.userAgent.match(/Android/i)),
		BlackBerry : ()=> (navigator.userAgent.match(/BlackBerry/i)),
		iOS        : ()=> (navigator.userAgent.match(/iPhone|iPad|iPod/i)),
		Opera      : ()=> (navigator.userAgent.match(/Opera Mini/i)),
		Windows    : ()=> (navigator.userAgent.match(/IEMobile|WPDesktop/i)),
		ANY        : ()=> (Browsers.isMobile.Android() || Browsers.isMobile.iOS() || Browsers.isMobile.Windows() || Browsers.isMobile.Opera() || Browsers.isMobile.BlackBerry())
	},
	isSafari     : ()=> (navigator.userAgent.match(/Mac OS X.+Safari/i) && !navigator.userAgent.match(/Mac OS X.+Chrome/i)),
	makeDownload : (url, blank=false)=> {
		let link = document.createElement('a');
		link.target = (blank) ? '_blank' : '_self';
		link.href = url;
		link.download = url.split('/').pop();
		document.body.appendChild(link);
		link.click();
		link.remove();
	},
	scrollElement : (element, coords={ x : 0, y : 0 })=> {
		if (element) {
			element.scrollTo(coords.x, coords.y);
		}
	},
	scrollOrigin : (element)=> (Browsers.scrollElement(element))
};


export const Colors = {
	componentHex : (hex, comp)=> {
		const comps = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(hex);
		return ((comps) ? comps[(comp === 'r') ? 1 : (comp === 'g') ? 2 : (comp === 'b') ? 3 : (comp === 'a' && comps.length === 5) ? 4 : 0] : null);
	},
// 	rgbToHex : (rgb)=> (`#${rgb.r.toString(16)}${rgb.g.toString(16)}${rgb.b.toString(16)}`),
	rgbToHex  : (rgb)=> (`#${((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1)}`),
// 	rgbaToHex : (rgb)=> (`#${rgb.r.toString(16)}${rgb.g.toString(16)}${rgb.b.toString(16)}${((rgb.a * 255) << 0).toString(16)}`),
	rgbaToHex : (rgba)=> {
		const hex = {
			r : rgba.r.toString(16),
			g : rgba.g.toString(16),
			b : rgba.b.toString(16),
			a : ((rgba.a * 255) << 0).toString(16),
		};

		return (`#${(hex.r.length > 1) ? hex.r : `0${hex.r}`}${(hex.g.length > 1) ? hex.g : `0${hex.g}`}${(hex.b.length > 1) ? hex.b : `0${hex.b}`}${(hex.a.length > 1) ? hex.a : `0${hex.a}`}`);
	},
	hexToRGB : (hex)=> {
		const comps = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return ((comps) ? {
			r : parseInt(comps[1], 16),
			g : parseInt(comps[2], 16),
			b : parseInt(comps[3], 16)
		} : null);
	}
};


export const Components = {
	componentName     : (component)=> (component.constructor.name),
	txtFieldClassName : (valid)=> (`input-wrapper${(valid) ? '' : ' input-wrapper-error'}`)
};


export const DateTimes = {
	currYear       : ()=> (new Date().getFullYear()),
	durationFormat : (secs, frmt='mm:ss')=> {
		const hours = '' + ((secs / 3600) << 0);
		const mins = '' + ((secs - ((hours * 3600)) / 60) << 0);
		secs -= '' + (mins * 60);

		return (frmt.split('').map((char, i)=> {
			if (char === 'm') {
				return ((i < mins.length) ? mins.split('').reverse()[i] : '0');

			} else if (char === 's') {
				return ((i < secs.length) ? secs.split('').reverse()[i] : '0');

			} else {
				return (char);
			}
		}).reverse().join(''));
	},
	ellipsis       : ()=> (Array((DateTimes.epoch() % 4) + 1).join('.')),
	epoch          : (millisecs=false)=> ((millisecs) ? (new Date()).getTime() : ((new Date()).getTime() * 0.001) << 0),
	isLeapYear     : (date=new Date())=> ((date.getFullYear() % 4 === 0) && ((date.getFullYear() % 100 !== 0) || (date.getFullYear() % 400 === 0))),
	iso8601        : (date=new Date())=> (`${date.getFullYear()}-${Strings.lPad(date.getMonth(), '0', 2)}-${Strings.lPad(date.getDate(), '0', 2)}T${Strings.lPad(date.getHours(), '0', 2)}:${Strings.lPad(date.getMinutes(), '0', 2)}:${Strings.lPad(date.getSeconds(), '0', 2)}${(date.getTimezoneOffset() === 0) ? 'Z' : date.toTimeString().split(' ')[1].replace(/^.+(.\d{4})/, '$1')}`),
	secsDiff       : (date1, date2=new Date())=> (Math.abs(date1.getTime() - date2.getTime()))
};


export const Files = {
	basename     : (path)=> (path.split('/').pop()),
	dirname      : (path)=> (path.split('/').slice(0, -2).pop()),
	extension    : (path)=> (path.split('.').pop()),
	filename     : (path, sep='.')=> (Files.basename(path).split(sep).slice(0, -1).join(sep)),
	truncateName : (path, len)=> (`${Strings.truncate(Files.filename(path).split('').slice(0, -2).join(''), len - 2)}${Files.filename(path).split('').slice(-2).join('')}.${Files.extension(path)}`)
};


export const Maths = {
	coinFlip    : (range=100)=> (Maths.randomInt(range * -0.5, range * 0.5) >= 0),
	clamp       : (val, lower, upper)=> (Math.min(Math.max(val, lower), upper)),
	cube        : (val)=> (Math.pow(val, 3)),
	diceRoll    : (sides=6)=> (Maths.randomInt(1, sides)),
	geom        : {
		cropFrame            : (srcFrame, cropFrame)=> ({
			origin : {
				x : Math.max(srcFrame.origin.x, cropFrame.origin.x),
				y : Math.max(srcFrame.origin.y, cropFrame.origin.y)
			},
			size   : {
				width  : Math.min(srcFrame.origin.x + srcFrame.size.width, cropFrame.origin.x + cropFrame.size.width) - Math.max(srcFrame.origin.x, cropFrame.origin.x),
				height : Math.min(srcFrame.origin.y + srcFrame.size.height, cropFrame.origin.y + cropFrame.size.height) - Math.max(srcFrame.origin.y, cropFrame.origin.y)
			}
		}),
		frameContainsFrame   : (frame1, frame2)=> (Maths.geom.rectContainsRect(Maths.geom.frameToRect(frame1), Maths.geom.frameToRect(frame2))),
		frameIntersectsFrame : (frame1, frame2)=> (Maths.geom.rectIntersectsRect(Maths.geom.frameToRect(frame1), Maths.geom.frameToRect(frame2))),
		frameToRect          : (frame)=> ({
			top    : frame.origin.y,
			left   : frame.origin.x,
			bottom : frame.origin.y + frame.size.height,
			right  : frame.origin.x + frame.size.width
		}),
		intersectionRect     : (rect1, rect2)=> ({
			top    : Math.max(rect1.top, rect2.top),
			left   : Math.max(rect1.left, rect2.left),
			bottom : Math.min(rect1.bottom, rect2.bottom),
			right  : Math.min(rect1.right, rect2.right)
		}),
		isSizeDimensioned    : (size, flag=0x11)=> (size.width !== 0 && size.height !== 0),
		lineMidpoint         : (pt1, pt2)=> ({ x : pt1.x + ((pt2.x - pt1.x) * 0.5), y : pt1.y + ((pt2.y - pt1.y) * 0.5) }),
		ptAngle              : (pt1, pt2)=> (Math.atan2(pt2.y - pt1.y, pt2.x - pt1.x)),
		ptDistance           : (pt1, pt2)=> (Math.sqrt(Maths.square(Math.abs(pt2.x - pt1.x)) + Maths.square(Math.abs(pt2.y - pt1.y)))),
		rectContainsRect     : (rect1, rect2)=> (rect1.top <= rect2.top && rect1.left <= rect2.left && rect1.right >= rect2.right && rect1.bottom >= rect2.bottom),
		rectIntersectsRect   : (rect1, rect2)=> (Math.max(rect1.left, rect2.left) < Math.min(rect1.right, rect2.right) && Math.max(rect1.top, rect2.top) < Math.min(rect1.bottom, rect2.bottom)),
		rectToFrame          : (rect)=> ({
			origin : {
				x : rect.left,
				y : rect.top
			},
			size   : {
				width  : rect.right - rect.left,
				height : rect.bottom - rect.top
			}
		}),
		sizeArea             : (size)=> (size.width * size.height),
		sizeOutboundsSize    : (size1, size2)=> (size1.width > size2.width || size1.height > size2.height),
		slope                : (pt1, pt2)=> ({ x : pt2.x - pt1.x, y : pt2.y - pt1.y }),
		unionRect            : (rect1, rect2)=> ({
			top    : Math.min(rect1.top, rect2.top),
			left   : Math.min(rect1.left, rect2.left),
			bottom : Math.max(rect1.bottom, rect2.bottom),
			right  : Math.max(rect1.right, rect2.right)
		})
	},
	factorial   : (val)=> (Arrays.indexFill(val, 1).reverse().reduce((acc, val)=> (acc * val))),
	half        : (val)=> (val * 0.5),
	quarter     : (val)=> (val * 0.25),
	randomFloat : (lower, upper, precision=15)=> ((Math.random() * (upper - lower)) + lower).toFixed(precision),
	randomHex   : (lower=0x0, upper=0xf)=> (`0x${Maths.randomInt(lower, upper).toString(16)}`),
	randomInt   : (lower, upper)=> (Math.round(Maths.randomFloat(lower, upper))),
	reciprocal  : (val)=> (1 / val),
	root        : (val, root)=> (Math.pow(val, Maths.reciprocal(root))),
	square      : (val)=> (Math.pow(val, 2)),
	toDegrees   : (val)=> (val * (180 / Math.PI)),
	toRadians   : (val)=> (val * (Math.PI / 180)),
	wrap        : (val, upper=Number.MAX_VALUE - 1, lower=0)=> ((val < lower) ? lower + (((upper + 1) - Math.abs(val)) % (upper + 1)) : lower + (val % (upper + 1)))
};


export const Numbers = {
	commaFormat : (val)=> (val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')),
	isEven      : (val)=> (val % 2 === 0),
	isOdd       : (val)=> (!Numbers.isEven(val)),
	toOrdinal   : (val)=> (`${val}${(val >= 10 && val <= 13) ? 'th' : ['th', 'st', 'nd', 'rd', 'th'][Math.min(4, val % 10)]}`)
};


export const Objects = {
	defineVal  : (obj, key, val)=> (Object.assign({}, obj, { [key] : val })),
	dropKey    : (obj, key)=> (Objects.dropKeys(obj, [key])),
	dropKeys   : (obj, keys)=> ({ ...Object.keys(obj).filter((k)=> (!Arrays.containsElement(keys, k))).reduce((newObj, k)=> ({...newObj, [k]: obj[k]}), {})}),
	dropMatch  : (obj, regex)=> (Objects.dropKeys(obj, Object.keys(obj).filter((key)=> (obj.hasOwnProperty(key) && regex.test(key))))),
	isEmpty    : (obj)=> (Object.keys(obj).length === 0),
	hasKey     : (obj, key)=> ((obj && typeof obj !== 'undefined') ? Object.keys(obj).some((k)=> (k === key)) : false),
	length     : (obj)=> (Object.keys(obj).length),
	reduceVals : (obj, init=0)=> (Object.values(obj).reduce((acc, val)=> ((acc << 0) + (val << 0)), init)),
	renameKey  : (obj, oldKey, newKey, overwrite=false)=> {
		if (obj && (Objects.hasKey(obj, oldKey) || (overwrite && !Objects.hasKey(obj, newKey)))) {
			delete Object.assign(obj, { [newKey] : obj[oldKey] })[oldKey];
		}
	},
	swapAtKeys : (obj, key1, key2)=> {
		const swap = obj[key1];
		obj[key1] = obj[key2];
		obj[key2] = swap;
	}
};


export const RegExps = {
	concat : (needle, prefix='', postfix='', flags='gi')=> (new RegExp(`${prefix}${Strings.quote(needle)}${postfix}`, flags))
};


//const EMAIL_NEEDLE_REGEX = new RegExp('^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$', 'i');
const URI_SANITIZED_REGEX = new RegExp('[\u2000-\u206F\u2E00-\u2E7F\'!"#$%&()*+,./:;<=>?@[]^`{|}~]', 'g');
export const Strings = {
	asciiEncode  : (str, enc='utf8')=> ((new Buffer(str, enc)).toString('ascii')),
	base64Decode : (str, enc='utf8')=> ((new Buffer(str, 'base64')).toString(enc)),
	base64Encode : (str, enc='ascii')=> ((new Buffer(str, enc)).toString('base64')),
	camelize     : (str, separator=' ', propName=false)=> (str.split((separator || ' ')).map((word, i)=> (word.replace(/^./, (c)=> ((!propName && i === 0) ? c.toLowerCase() : c.toUpperCase())))).join('')),
	capitalize   : (str, lower=false)=> (str.replace(/^(\w+)$/gi, (c)=> ((lower) ? c.toLowerCase() : c)).replace(/(\b\w)/gi, (c)=> (c.toUpperCase()))),
	countOf      : (str, substr)=> ((str.match(new RegExp(substr.toString(), 'g')) || []).length),
	dropChar     : (str, char)=> (Strings.replAll(str, char)),
	firstChar    : (str)=> (str.charAt(0)),
// 	isEmail      : (str)=> (EMAIL_NEEDLE_REGEX.test(String(str))),
	isEmail      : (str)=> (/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i.test(String(str))),
	lastChar     : (str)=> (str.slice(-1)),
	lPad         : (str, char, amt)=> ((amt < 0 || String(str).length < amt) ? `${(new Array((amt > 0) ? amt - String(str).length + 1 : -amt + 1)).join(char)}${str}` : str),
	indexedVal   : (val, arr, divider='_')=> {
		if (arr[val].length === 0) {
			arr[val] = 0;
		}

		return ({
			name : `${val}${divider}${++arr[val]}`,
			arr : [...arr]
		});
	},
	pluralize   : (str, val)=> (((val << 0) === 1) ? str : (Strings.lastChar(str) === 'y') ? `${str.slice(0, -1)}ies` : (Strings.lastChar(str) === 's') ? 'es' : `${str}s`),
	quoted      : (str)=> (str.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1')),
	remove      : (str, needle)=> (Strings.replAll(str, needle)),
	repeat      : (str='', amt=1)=> ((new Array(amt)).fill(str).join('')),
	replAll     : (str, needle, replacement='')=> (str.split(needle).join(replacement)),
	reverse     : (str)=> ([...str].reverse().join('')),
	randAlpha   : (len=1, cases=true)=> (Arrays.indexFill(len).map((i)=> ((cases && Maths.coinFlip()) ? String.fromCharCode(Maths.randomInt(65, 91)).toLowerCase() : String.fromCharCode(Maths.randomInt(65, 91)))).join('')),
	randHex     : (len=1, upperCase=true)=> (Arrays.indexFill(len).map((i)=> ((upperCase) ? Strings.lastChar(Maths.randomHex()).toUpperCase() : Strings.lastChar(Maths.randomHex()))).join('')),
	rPad        : (str, amt, char)=> ((str.length < amt) ? `${str}${(new Array(amt - String(str).length + 1)).join(char)}` : str),
	shuffle     : (str)=> (Arrays.shuffle([...str.split('')]).join('')),
	slugifyURI  : (str)=> (str.trim().replace(URI_SANITIZED_REGEX, '').replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-').replace(/^-+/, '').replace(/-+$/, '').toLowerCase()),
// 	trimBounds  : (str, char)=> (str.replace(new RegExp(RegExps.quote(char), 'g')), ''),
// 	trimBounds  : (str, char)=> (str.match(RegExps.concat(char, '^', '$'), '')),
	trimBounds  : (str, char)=> (str.split(char).filter((segment, i)=> (segment.length > 0)).join(char)),
	trimSlashes : (str, leading=true, trailing=true)=> (str.replace(((leading && trailing) ? /^\/?(.+)\// : (leading && !trailing) ? /^\/(.+)$/ : (!leading && trailing) ? /^(.+)\/$/ : /^(.+)$/), '$1')),
	truncate    : (str, len, ellipsis='…')=> ((str.trimEnd().length > len) ? `${str.trimEnd().slice(0, len)}${ellipsis}` : str),
	utf8Encode  : (str, enc='ascii')=> ((new Buffer(str, enc)).toString('utf8'))
};

export const URIs = {
	firstComponent : (url=window.location.pathname, trim=true)=> ((trim) ? Strings.trimBounds(url, '/').split('/').shift() : url.substr(1).split('/').shift()),
	hostname       : (url=window.location.hostname)=> (url.replace(/^https?:\/\//g, '').split('/').shift()),
	lastComponent  : (url=window.location.pathname)=> (Files.basename(url)),
	protocol       : (url=window.location.protocol)=> ((/^https?/.test(url.toLowerCase())) ? url.split(':').shift() : null),
	queryString    : (url=window.location.search)=> (Arrays.convertToObject((url.includes('?')) ? url.split('?').pop().split('&').map((qs)=> ({ key : qs.split('=').shift(), val : qs.split('=').pop() })) : [])),
	subdomain      : (url=window.location.hostname)=> ((URIs.hostname(url).split('.').length >= 3) ? URIs.hostname(url).split('.').shift() : null),
	tdl            : (url=window.location.hostname)=> (URIs.hostname(url).split('.').pop())
};



/* …\(^_^)/… */


/*
const removeItem = (object, key, value)=> {
  if (value == undefined)
    return;

  for (var i in object) {
    if (object[i][key] == value) {
        object.splice(i, 1);
    }
  }
};

let collection = [{
 id : '5f299a5d-7793-47be-a827-bca227dbef95',
 title : 'one'
 }, {
 id : '87353080-8f49-46b9-9281-162a41ddb8df',
 title : 'two'
 }, {
 id : 'a1af832c-9028-4690-9793-d623ecc75a95',
 title : 'three'
}];

removeItem(collection, 'id', '87353080-8f49-46b9-9281-162a41ddb8df');
*/