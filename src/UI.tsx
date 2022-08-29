export function el(query: string) {
	return document.querySelector(query);
}

export function child_el(target: Element, query: string) {
	return target.querySelector(query);
}