
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

export function randomInt(lower, upper) {
	return (Math.floor(Math.random() * (upper - lower)) + lower);
}

export function urlSlugTitle(text) {
	return (text.replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-').replace(/^-+/, '').replace(/-+$/, '').toLowerCase());
}