
import moment from 'moment-timezone';


export const Arrays = {
// 	containsElement  : (arr, element)=> (arr.indexOf(element) > -1),
	containsElement  : (arr, element)=> (Arrays.containsElements(arr, [element])),
	containsElements : (arr, elements, all=true)=> ((all) ? elements.every((element)=> (arr.indexOf(element) > -1)) : elements.some((element)=> (arr.indexOf(element) > -1))),
	isEmpty          : (arr)=> (arr.length === 0),
	randomElement    : (arr)=> (arr[arr.randomIndex()]),
	randomIndex      : (arr)=> (Maths.randomInt(0, arr.length - 1))
};


export const Bits = {
	contains : (val, bit)=> (((val & bit) === bit))
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
		Android    : ()=> { return (navigator.userAgent.match(/Android/i)); },
		BlackBerry : ()=> { return (navigator.userAgent.match(/BlackBerry/i)); },
		iOS        : ()=> { return (navigator.userAgent.match(/iPhone|iPad|iPod/i)); },
		Opera      : ()=> { return (navigator.userAgent.match(/Opera Mini/i)); },
		Windows    : ()=> { return (navigator.userAgent.match(/IEMobile|WPDesktop/i)); },
		ANY        : ()=> { return (Browsers.isMobile.Android() || Browsers.isMobile.iOS() || Browsers.isMobile.Windows() || Browsers.isMobile.Opera() || Browsers.isMobile.BlackBerry()); }
	},
	makeDownload : (url, blank=false)=> {
		let link = document.createElement('a');
		link.target = (blank) ? '_blank' : '_self';
		link.href = url;
		link.download = url.split('/').pop();
		document.body.appendChild(link);
		link.click();
		link.remove();
	},
	scrollElement : (element, coords={x:0, y:0})=> {
		if (element) {
			element.scrollTo(coords.x, coords.y);
		}
	},
	scrollOrigin : (element)=> { Browsers.scrollElement(element)}
};


export const Components = {
	className : (component)=> (component.constructor.name)
};


export const DateTimes = {
	currYear       : ()=> (new Date().getFullYear()),
	diffSecs       : (startDate, endDate)=> (moment.duration(moment(`${endDate.replace(' ', 'T')}Z`).diff(`${startDate.replace(' ', 'T')}Z`)).asSeconds()),
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
	secsDiff       : (date1, date2)=> (Math.abs(date1.getTime() - date2.getTime()))
};


export const Files = {
	basename     : (path)=> (path.split('/').pop()),
	dirname      : (path)=> (path.split('/').slice(0, -2).pop()),
	extension    : (path)=> (path.split('.').pop()),
	filename     : (path, sep='.')=> (Files.basename(path).split(sep).slice(0, -1).join(sep)),
	truncateName : (path, len)=> (`${Strings.truncate(Files.filename(path).split('').slice(0, -2).join(''), len - 2)}${Files.filename(path).split('').slice(-2).join('')}.${Files.extension(path)}`)
};


export const Maths = {
	clamp       : (val, lower, upper)=> (Math.min(Math.max(val, lower), upper)),
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
		sizeOutboundsSize    : (size1, size2)=> (size1.width > size2.width || size1.height > size2.height)
	},
	randomFloat : (lower, upper, precision=15)=> ((Math.random() * (upper - lower)) + lower).toFixed(precision),
	randomInt   : (lower, upper)=> (Math.round(Maths.randomFloat(lower, upper)))
};


export const Numbers = {
	commaFormat : (val)=> (val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')),
	isEven      : (val)=> (val % 2 === 0),
	isOdd       : (val)=> (!Numbers.isEven(val))
};


export const Objects = {
	defineVal  : (obj, key, val)=> (Object.assign({}, obj, { [key] : val })),
	dropKey    : (obj, key)=> (Objects.dropKeys(obj, [key])),
	dropKeys   : (obj, keys)=> ({...Object.keys(obj).filter((k)=> (!Arrays.containsElement(keys, k))).reduce((newObj, k)=> ({...newObj, [k]: obj[k]}), {})}),
	isEmpty    : (obj)=> (Object.keys(obj).length === 0),
	hasKey     : (obj, key)=> (Object.keys(obj).some((k)=> (k === key))),
	length     : (obj)=> (Object.keys(obj).length),
	reduceVals : (obj, init=0)=> (Object.values(obj).reduce((acc, val)=> ((acc << 0) + (val << 0)), init))
};


export const Strings = {
	camelize   : (str, separator=' ', propName=false)=> {
// 		const camilized = str.split((separator || ' ')).map((word, i)=> (word.replace(/^./, (c)=> ((!propName && i === 0) ? c.toLowerCase() : c.toUpperCase())))).join('');
// 		return ((propName) ? camilized : camilized.replace(/^./, (c)=> (c.toLowerCase())));
		return (str.split((separator || ' ')).map((word, i)=> (word.replace(/^./, (c)=> ((!propName && i === 0) ? c.toLowerCase() : c.toUpperCase())))).join(''));
	},
	capitalize : (str, lower=false)=> (str.replace(/^(\w+)$/gi, (c)=> ((lower) ? c.toLowerCase() : c)).replace(/(\b\w)/gi, (c)=> (c.toUpperCase()))),
	countOf    : (str, substr)=> ((str.match(new RegExp(substr.toString(), 'g')) || []).length),
	dropChar   : (str, char)=> (Strings.replAll(str, char)),
	firstChar  : (str)=> (str.charAt(0)),
	isEmail    : (str)=> (/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(String(str).toLowerCase())),
// 	lPad       : (str, amt, char)=> ((new Array(amt - String(str).length + 1)).join(str || char) + str),
	lastChar   : (str)=> (str.slice(-1)),
	lPad       : (str, amt, char)=> ((str.length < amt) ? `${(new Array(amt - String(str).length + 1)).join(char)}${str}` : str),
	indexedVal : (val, arr, divider='_')=> {
		if (arr[val].length === 0) {
			arr[val] = 0;
		}

		return ({
			name : `${val}${divider}${++arr[val]}`,
			arr : [...arr]
		});
	},
	pluralize  : (str, val)=> ((val === 1) ? str : (Strings.lastChar(str) === 'y') ? `${str.slice(0, -1)}ies` : (Strings.lastChar(str) === 's') ? 'es' : `${str}s`),
	repeat     : (str, amt)=> ((new Array(amt)).fill(str).join('')),
	replAll    : (str, needle, replacement='')=> (str.split(needle).join(replacement)),
	reverse    : (str)=> ([...str].reverse().join('')),
// 	rPad       : (str, amt, char)=> ((new Array(amt - String(str).length + 1)).join(str || char) + str),
	rPad       : (str, amt, char)=> ((str.length < amt) ? `${str}${(new Array(amt - String(str).length + 1)).join(char)}` : str),
	trimSlash  : (str, leading=true, trailing=true)=> (str.replace(((leading && trailing) ? /^\/?(.+)\// : (leading && !trailing) ? /^\/(.+)$/ : (!leading && trailing) ? /^(.+)\/$/ : /^(.+)$/), '$1')),
	truncate   : (str, len, ellipsis='…')=> ((str.length > len) ? `${str.substring(0, len - 1).trim()}${ellipsis}` : str),
	uriSlug    : (str)=> (str.replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-').replace(/^-+/, '').replace(/-+$/, '').toLowerCase())
};


export const URLs = {
	lastComponent : (url)=> (Files.filename(url, '')),
	protocol      : (url)=> ((/^https?/.test(url.toLowerCase())) ? url.split(':').shift() : null)
};
