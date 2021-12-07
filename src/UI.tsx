import { elem } from "./jsx"
import { endTurn } from "./index"
import { game } from "./Game";

interface UI_State {
	test: string;
}

let ui_state: UI_State = {
	test: "blah"
}

function check_handler() {
	console.log("user checked");

	endTurn(game.human, false);
};

function Bet_Area() {
    return (
        <div class={bet_area}>
            <div class={bet_button} onclick={() => check_handler()}>check</div>
            <div class={bet_button}>bet</div>
            <div class={bet_button}>fold</div>
        </div>
    )
}

function End_Of_Hand() {
	return (
		<div>
			<div>end of hand</div>
			{/* {["foo", "bar"].map(function (i) {
				return <span>{i}</span>;
			})} */}
			{game.hand_winner != null ? <div>{game.hand_winner.name}</div>: null}
		</div>
	)
}

// function renderElement(){
// 	if(game)
// 	   return <Bet_Area />;
// 	return null;
//  }

export function App(props) {
	console.log("APP");
	console.log(game.hand_winner)
	return (
		<div class={UI}>
			{game.hand_winner != null ? <End_Of_Hand /> : null}
            {(() => {
				if (game) { return <Bet_Area /> } else { return null;}
			})()}
			{}
        </div>
	)
}

// export function set(state_var, new_value) {
// 	state_var = new_value;
// 	render_ui();	
// }

interface Style {
	name: string;
	rules: string;
}

let styles: Style[] = [];

function Style(class_name: string, rules: string) {
	// const class_name: string = "style_" + hash(rules.toString());
	console.log(class_name)
	const style: Style = {
		name: class_name,
		rules: rules
	};

	styles.push(style);

	// console.log(style_sheet)
	// console.log(document.styleSheets.length)
	
	// style_sheet.insertRule(`${class_name} { ${style} }`);
	
	return class_name;
}

// function getStyleSheet(unique_title) {
// 	for (let sheet of document.styleSheets) {
// 	  if (sheet.title === unique_title) {
// 		return sheet;
// 	  }
// 	}
//   }

function hash(str: string): string {
	let h = 0;
	for(let i = 0; i < str.length; i++) {
		h = Math.imul(31, h) + str.charCodeAt(i) | 0;
	}
    return h.toString();            
}

const UI = Style("ui", `
	height: 100%;
	width: 100%;
	z-index: 1;
	position: relative;
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
`);

const bet_area = Style("bet_area", `
display: flex;
justify-content: center;
background: #111111;
padding: 5px;
`);


const bet_button = Style("bet_button", `
	background: #222222;
	padding: 5px;
`);




// style_sheet.title = "test";

let style_sheet: CSSStyleSheet;

export function init_ui() {
	let style_sheet_el: HTMLStyleElement = document.createElement("style")
	style_sheet_el.type = "text/css"
	style_sheet_el.innerText = '';
	style_sheet_el.title = "test";
	document.head.appendChild(style_sheet_el);

	style_sheet = style_sheet_el.sheet;

	for (let style of styles) {
		// console.log(style.name, style.rules[0].toString())
		style_sheet.insertRule(`.${style.name} {${style.rules.toString()}}`)
		// style_sheet.insertRule(".test { color: red; }", 0)
	}

	console.log(style_sheet)

	

	ui_state = new Proxy(ui_state, {
		set: function(target, property, value) {
			// do something
			console.log("value changed from" + target[property] + " to " + value);
			target[property] = value;
			
			return true; // ts reasons?
		}
	});

	ui_state.test = "hello"
	ui_state.test = "world";

	render_ui();
}

export function render_ui() {

	
	// style.innerHTML = "div {border: 2px solid black; background-color: blue;}";
	// let test: StyleSheet = style_sheet as StyleSheet;

	const start_time = performance.now();

	const root_el = document.getElementById("root");
	const old_app_el = root_el.childNodes[0];
	const app_node = <App name="foo" />;
	if (root_el.children.length == 0) {
		console.log("mounting");
		root_el.appendChild(app_node);
	} else {
		console.log("rendering");
		root_el.innerHTML = "";
		root_el.appendChild(app_node);
	}

	const end_time = performance.now();

	console.log("render_time: " + (end_time - start_time))

	// document.body.appendChild(style_sheet);
}