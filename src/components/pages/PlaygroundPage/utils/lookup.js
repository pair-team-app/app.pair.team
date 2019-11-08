
export const commentByID = (comments, commentID)=> {
	return (comments.find(({ id })=> (id === (commentID << 0))));
};

export const componentFromComment = (components, comment)=> {
	return (components.find(({ comments })=> (comments.find(({ id })=> (id === comment.id)))));
};

export const componentByID = (components, componentID)=> {
	return (components.find(({ id })=> (id === (componentID << 0))));
};

export const componentTypeGroup = (typeGroups, component)=> {
	return (typeGroups.find(({ id })=> (component.typeID)));
};

export const playgroundByID = (playgrounds, playgroundID)=> {
	return (playgrounds.find(({ id })=> (id === (playgroundID << 0))));
};
