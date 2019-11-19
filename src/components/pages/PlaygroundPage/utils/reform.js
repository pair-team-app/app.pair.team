
import { Images } from 'lang-js-utils';
import moment from 'moment';

import { decryptObject, decryptText } from './crypto';


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
	position  : (comment.position || { x : 0, y : 0 }),
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

export const reformComponent = (component, overwrite={})=> {
// 	console.log('reformComponent()', component.id);

	const { type_id, event_type_id, node_id, title, tag_name, image, html, styles, accessibility, root_styles, meta, children, comments } = component;
	const { width, height } = meta.bounds;
	delete (component['type_id']);
	delete (component['event_type_id']);
	delete (component['node_id']);
	delete (component['tag_name']);
	delete (component['root_styles']);

// 	console.log(component.id, 'STYLES:', decryptText(styles));
// 	console.log(component.id, 'STYLES:', decryptObject(styles));
// 	console.log('META: [%s]', JSON.stringify(meta, null, 2));
// 	console.log('META:', meta);
// 	console.log('ROOT STYLES:', decryptObject(root_styles));
// 	console.log('META:', meta.bounds.height, meta.bounds.width);
// 	console.log('PATH: [%s]', JSON.stringify(path, null, 2));

	return ({ ...component,
		typeID        : type_id,
		eventTypeID   : event_type_id,
		nodeID        : node_id,
		title         : (title.length === 0) ? tag_name : title,
		tagName       : tag_name,
		html          : (html.length < 65535) ? decryptText(html) : '',
		styles        : decryptObject(styles),
		rootStyles    : { ...decryptObject(root_styles),
// 			'height'     : (height > 0) ? `${height}px` : 'fit-content',
// 			'max-height' : (height > 0) ? `${height}px` : 'fit-content',
			'max-width'  : (width > 0) ? `${width}px` : 'fit-content',
			'min-height' : (height > 0) ? `$height}px` : 'fit-content',
			'min-width'  : (width > 0) ? `${width}px` : 'fit-content',
			'width'      : (width > 0) ? `${width}px` : 'fit-content'
		},
		image         : (image.length > 0) ? image : Images.genPlaceholder({ width, height }),
// 		image         : Images.genPlaceholder({ width, height }),
		accessibility : decryptObject(accessibility),
		selected      : false,
		children      : children.map((child)=> (reformChildElement(child))),
		comments      : comments.map((comment)=> (reformComment(comment))).sort((i, j)=> ((i.epoch > j.epoch) ? -1 : (i.epoch < j.epoch) ? 1 : 0)),
		...overwrite
	})
};
