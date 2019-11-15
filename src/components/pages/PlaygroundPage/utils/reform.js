
import { decryptObject, decryptText } from './crypto';
import moment from "moment/moment";


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

	const { title, html, styles, type_id, event_type_id, tag_name, root_styles, children, comments, meta } = component;
	delete (component['type_id']);
	delete (component['event_type_id']);
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
		typeID      : type_id,
		eventTypeID : event_type_id,
		title       : (title.length === 0) ? tag_name : title,
		tagName     : tag_name,
		html        : (html.length < 65535) ? decryptText(html) : '',
		styles      : decryptObject(styles),
		rootStyles  : { ...decryptObject(root_styles),
// 			'height'     : (meta.bounds.height > 0) ? `${meta.bounds.height}px` : 'fit-content',
// 			'max-height' : (meta.bounds.height > 0) ? `${meta.bounds.height}px` : 'fit-content',
			'max-width'  : (meta.bounds.width > 0) ? `${meta.bounds.width}px` : 'fit-content',
			'min-height' : (meta.bounds.height > 0) ? `${meta.bounds.height}px` : 'fit-content',
			'min-width'  : (meta.bounds.width > 0) ? `${meta.bounds.width}px` : 'fit-content',
			'width'      : (meta.bounds.width > 0) ? `${meta.bounds.width}px` : 'fit-content'
		},
		selected    : false,
		children    : children.map((child)=> (reformChildElement(child))),
		comments    : comments.map((comment)=> (reformComment(comment))).sort((i, j)=> ((i.epoch > j.epoch) ? -1 : (i.epoch < j.epoch) ? 1 : 0)),
		...overwrite
	})
};
