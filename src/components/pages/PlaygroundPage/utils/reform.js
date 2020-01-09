
import dataUriToBuffer from 'data-uri-to-buffer';
import ImageJS from 'imagejs';
import { Images } from 'lang-js-utils';
import Jimp from 'jimp';
import moment from 'moment';

import { COMOPONENT_THUMB_SCALE } from '../../../../consts/formats';
import { unzipSync } from '../../../../utils/funcs';
import { decryptObject, decryptText } from './crypto';
import { convertStyles } from './css';


export const reformChildElement = (element, overwrite={})=> {
	const { tag_name } = element;
	delete (element['tag_name']);

	return ({ ...element,
		title   : (element.title.length === 0) ? tag_name : element.title,
		tagName : tag_name,
		html    : decryptText(element.html),
		styles  : decryptObject(element.styles),
		path    : element.path.split(' ').filter((i)=> (i.length > 0)),
// 		meta    : JSON.parse(element.meta.replace(/"/g, '\'')),
		...overwrite
	});
};

export const reformComment = (comment, overwrite={})=> ({ ...comment,
	position  : (((typeof comment.position === 'string' && comment.position.charAt(0) === '{') ? JSON.parse(comment.position) : comment.position) || { x : 0, y : 0 }),
	author    : {
		id       : comment.author.id,
		username : comment.author.username,
		email    : comment.author.email,
		avatar   : comment.author.avatar
	},
	epoch     : (comment.added) ? (moment.utc(comment.added).valueOf() * 0.001) << 0 : 0,
	timestamp : (comment.added) ? moment(comment.added).add((moment().utcOffset() << 0), 'minute') : moment.utc(),
	...overwrite
});

export const reformComponent = async(component, overwrite={})=> {
//	console.log('reformComponent()', component.id);

	const PLACEHOLDER_FILL = {
		r : 128,
		g : 128,
		b : 128,
		a : 0.0
	};

	let { type_id, event_type_id, node_id, title, tag_name, image, html, styles, accessibility, root_styles, meta, comments } = component;
	const { width, height } = meta.bounds;
	delete (component['type_id']);
	delete (component['event_type_id']);
	delete (component['node_id']);
	delete (component['tag_name']);
	delete (component['root_styles']);

	image = (image && image.length > 1) ? `data:image/png;base64,${btoa(await unzipSync(image))}` : Images.genColor(PLACEHOLDER_FILL, { width, height });
	html = (html) ? decryptText(await unzipSync(html)) : null;
	styles = (styles) ? decryptObject(await unzipSync(styles)) : null;
	accessibility = (accessibility) ? decryptObject(await unzipSync(accessibility)) : null;
	const rootStyles = (root_styles) ? convertStyles(decryptObject(await unzipSync(root_styles))) : null;

// 	console.log('::|::', { image, html, styles, accessibility, rootStyles });
//	console.log(component.id, 'STYLES:', decryptText(styles));
// 	console.log(component.id, 'STYLES:', decryptObject(styles));
//	console.log(component.id, 'ACCESSIBILITY:', decryptText(accessibility));
// 	console.log(component.id, 'ACCESSIBILITY:', decryptObject(accessibility));
// 	console.log('META: [%s]', JSON.stringify(meta, null, 2));
//	console.log('ROOT STYLES:', decryptObject(root_styles));
// 	console.log('META.BOUNDS:', meta.bounds.height, meta.bounds.width);


//   console.log('::|::', { image 	});
//   console.log('::|::', { id : component.id, title, image }, '::|::');
	const thumbImage = (component.image) ? await (new Promise((resolve, reject)=> {
    Jimp.read(dataUriToBuffer(image)).then((image)=> {
      resolve(image.scale(COMOPONENT_THUMB_SCALE).getBase64Async(Jimp.MIME_PNG));
    }).catch((e)=> {
      reject(e);
    });
  })) : Images.genColor(PLACEHOLDER_FILL, { width : width * COMOPONENT_THUMB_SCALE, height : height * COMOPONENT_THUMB_SCALE });

//   console.log('::|::', { thumbImage }, '::|::');

	const reformed = { ...component, html, styles, image, thumbImage, accessibility,
    typeID        : type_id,
    eventTypeID   : event_type_id,
    nodeID        : node_id,
    title         : (title.length === 0) ? tag_name : title,
    tagName       : tag_name,
    rootStyles    : (rootStyles) ? { ...rootStyles,
      'maxWidth'  : (width > 0) ? `${width}px` : 'fit-content',
      'minHeight' : (height > 0) ? `${height}px` : 'fit-content',
      'minWidth'  : (width > 0) ? `${width}px` : 'fit-content',
      'width'      : (width > 0) ? `${width}px` : 'fit-content'
    } : null,
    comments      : comments.map((comment)=> (reformComment(comment))).sort((i, j)=> ((i.epoch > j.epoch) ? -1 : (i.epoch < j.epoch) ? 1 : 0)),
    selected      : false,
		processed     : ((html && styles && rootStyles) !== null),
    ...overwrite
  };


  console.log('REFORMED + DECRYPTED: [%s]', component.id, reformed);
	return (reformed);
};
