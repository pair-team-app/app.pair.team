
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

export const componentProcessed = (component)=> {
	const { html, styles, rootStyles } = component;
  return (html && styles && rootStyles);
};

export const componentsFromTypeGroup = (components, typeGroup)=> {
  return ([...components].filter(({ typeID })=> (typeID === typeGroup.id)));
};

export const firstComponentViewType = (components)=> {
	return (componentsFromTypeGroup(components, { id : 187 }).sort((i, ii)=> ((i.id < ii.id) ? -1 : (i.id > ii.id) ? 1 : 0)).shift());
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


export const typeGroupComponentsProcessed = (typeGroup, components)=> {
  return (componentsFromTypeGroup(components, typeGroup).every(({ html, styles, rootStyles })=> (html && styles && rootStyles)));
};
