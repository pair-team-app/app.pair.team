
export const replaceComment = (component, comment)=> ({ ...component,
	comments : component.comments.map((item)=> ((item.id === comment.id) ? comment : item))
});

export const replaceComponent = (playground, component)=> ({ ...playground,
	components : playground.components.map((item)=> ((item.id === component.id) ? component : item))
});

export const replacePlayground = (playgrounds, playground)=> (playgrounds.map((item)=> (item.id === playground.id) ? playground : item));
