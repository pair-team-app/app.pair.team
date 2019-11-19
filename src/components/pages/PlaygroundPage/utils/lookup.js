
export const commentByID = (comments, commentID)=> {
	return (comments.find(({ id })=> (id === (commentID << 0))));
};

export const componentFromComment = (components, comment)=> {
	return (components.find(({ comments })=> (comments.find(({ id })=> (id === comment.id)))));
};

export const componentByID = (components, componentID)=> {
	return (components.find(({ id })=> (id === (componentID << 0))));
};

export const componentByNodeID = (components, nodeID)=> {
	return (components.find((component)=> (component.nodeID === nodeID)));
};

export const playgroundByID = (playgrounds, playgroundID)=> {
	return (playgrounds.find(({ id })=> (id === (playgroundID << 0))));
};

export const typeGroupByComponent = (typeGroups, component)=> {
	return (typeGroups.find(({ id })=> (id === component.typeID)));
};

export const typeGroupByID = (typeGroups, typeGroupID)=> {
	return (typeGroups.find(({ id })=> (id === (typeGroupID << 0))));
};

export const typeGroupByKey = (typeGroups, typeGroupKey)=> {
	return (typeGroups.find(({ key })=> (key === typeGroupKey)));
};