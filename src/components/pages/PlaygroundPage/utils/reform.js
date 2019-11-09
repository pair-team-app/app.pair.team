
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
	position  : (comment.position) ? (typeof comment.position === 'string') ? (JSON.parse(comment.position) || { x : 0, y : 0 }) : comment.position : { x : 0, y : 0 },
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
	const { type_id, event_type_id, tag_name } = component;
	delete (component['type_id']);
	delete (component['event_type_id']);
	delete (component['tag_name']);

	return ({ ...component,
		typeID      : type_id,
		eventTypeID : event_type_id,
		title       : (component.title.length === 0) ? tag_name : component.title,
		tagName     : tag_name,
		html        : decryptText(component.html),
		styles      : decryptObject(component.styles),
		path        : component.path.split(' ').filter((i)=> (i.length > 0)),
// 		meta        : JSON.parse(component.meta.replace(/"/g, '\'')),
		selected    : false,
		children    : component.children.map((child)=> (reformChildElement(child))),
		comments    : component.comments.map((comment)=> (reformComment(comment))).sort((i, j)=> ((i.epoch > j.epoch) ? -1 : (i.epoch < j.epoch) ? 1 : 0)),
		...overwrite
	})
};
