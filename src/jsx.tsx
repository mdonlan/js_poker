export const elem = (tag, props, ...children) => {
	// console.log(`tag: ${tag}`)
	// console.log(`tag_type: ${typeof tag}`)


	if (typeof tag === "function") return tag(props, ...children);
	
	
	const element = document.createElement(tag);

	Object.entries(props || {}).forEach(([name, value]) => {
		if (name.startsWith("on") && name.toLowerCase() in window)
			element.addEventListener(name.toLowerCase().substr(2), value);
		else element.setAttribute(name, value.toString());
	});

	children.forEach(child => {
		if (child) appendChild(element, child); // check for if child, because sometimes we want to return null in jsx
	});

	return element;
};

export const appendChild = (parent, child) => {
	if (Array.isArray(child))
		child.forEach(nestedChild => appendChild(parent, nestedChild));
	else
		parent.appendChild(child.nodeType ? child : document.createTextNode(child));
};

export const createFragment = (props, ...children) => {
	return children;
};
