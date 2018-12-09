

export function randomElement(array) {
	return ((array.length > 0) ? array[randomInt(0, array.length)] : null);
}

export function randomInt(lower, upper) {
	return (Math.floor(Math.random() * (upper - lower)) + lower);
}