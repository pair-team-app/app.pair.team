
export function capitalizeText(text, toLower) {
	toLower = (toLower || false);
	return ((toLower) ? text.toLowerCase().replace(/(\b\w)/gi, function(c) { return (c.toUpperCase()); }) : text.replace(/(\b\w)/gi, function(c) { return (c.toUpperCase()); }));
}

export function hasBit(val, bit) {
	return ((val & bit) === bit);
}

export function hiddenText(text, char='*') {
	return (Array(text.length + 1).join(char));
}

export function isValidEmail(email) {
	const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return (re.test(String(email).toLowerCase()));
}

export function randomElement(array) {
	return ((array.length > 0) ? array[randomInt(0, array.length)] : null);
}

export function randomFloat(lower, upper) {
	return ((Math.random() * (upper - lower)) + lower);
}

export function randomInt(lower, upper) {
	return (Math.floor(randomFloat(lower, upper)));
}

export function urlSlugTitle(text) {
	return (text.replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-').replace(/^-+/, '').replace(/-+$/, '').toLowerCase());
}