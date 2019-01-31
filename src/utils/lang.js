

Array.prototype.randomElement = ()=> {
	return (this[this.randomIndex()]);
};

Array.prototype.randomIndex = ()=> {
	return (Math.randomInt(0, this.length - 1));
};


Math.randomFloat = (lower, upper)=> {
	return ((this.random() * (upper - lower)) + lower);
};

Math.randomInt = (lower, upper)=> {
	return (this.randomFloat(lower, upper) << 0);
};


Number.prototype.clamp = (lower, upper)=> {
	return (Math.min(Math.max(this, lower), upper));
};

Number.prototype.commaFormat = ()=> {
	return (this.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
};

Number.prototype.padLeft = function (length, str) {
	return ((new Array(length - String(this).length + 1)).join(str || "0") + this);
};


Object.prototype.isEmpty = ()=> {
	return (Object.keys(this).length === 0);
};


String.prototype.countOf = (substr)=> {
	return ((this.match(new RegExp(substr.toString(), 'g')) || []).length);
};

String.prototype.replaceAll = (needle, replacement)=> {
	return (this.replace(new RegExp(needle.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replacement));
	//return (this.split(needle).join(replacement));
};

String.prototype.reverse = ()=> {
	return (Array.prototype.reverse.apply(this.split("")).join(""));
};

String.prototype.truncate = (len, ellipsis='…')=> {
	return ((this.length > len) ? this.substring(0, len - 1) + ellipsis : this);
};
