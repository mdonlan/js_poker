import { elem } from "./jsx"
// import { endTurn, dealNewHand, getCardImage } from "./index"
// import { Card_Type, game, Hand_Rank, Player_Type, Suit } from "./Game";

// interface UI_State {
// 	test: string;
// }

// let ui_state: UI_State = {
// 	test: "blah"
// }

// function check_handler() {
// 	console.log("user checked");

// 	endTurn(game.human, false);
// };

// function Bet_Options() {
//     return (
//         <div class="bet_options">
//             <div class="bet_button" onclick={() => check_handler()}>check</div>
//             <div class="bet_button">bet</div>
//             <div class="bet_button">fold</div>
//         </div>
//     )
// }

// function End_Of_Hand() {
// 	return (
// 		<div class="end_of_hand">
// 			{/* <div>end of hand</div>
// 			{/* {["foo", "bar"].map(function (i) {
// 				return <span>{i}</span>;
// 			})} */}
// 			{game.hand_winner != null ? <div>Player {game.hand_winner.name} won the hand with a {Hand_Rank[game.hand_winner.hand_rank]}</div>: null}
// 			<div onclick={() => dealNewHand()}>Deal Next Hand</div>
// 		</div>
// 	)
// }

// function Players() {
// 	return (
// 		<div class="player_container">
// 			{game.players.map(player => {
// 				// console.log(player)
// 				return (
// 					<div class={`player player${player.id}`}>
// 						<div class="player_name">{player.name}</div>

// 						<div class="cards">
// 							{player.hand.map((card, i) => {
// 								return (
// 									<div class={`card${i} card`}>
// 										<img class="card_image" src={`./assets/deck/${card.value > 10 ? Card_Type[card.value] : card.value}_of_${Suit[card.suit]}.svg`}></img>
// 									</div>
// 								)
// 							})}
// 						</div>
// 						<div class="final_hand">
// 							<div class="hand_rank"></div>
// 							<div class="final_hand_cards"></div>
// 							<div class="best_cards"></div>
// 						</div>
// 					</div>
// 				)
// 			})}
// 		</div>
// 	)
// }


// export function App(props) {
// 	// console.log("APP");
// 	// console.log(game)
// 	return (
// 		<div class="ui">
// 			<Players />
// 			{game.hand_winner != null ? <End_Of_Hand /> : null}
//             {(() => {
// 				if (game.active_player && game.active_player.type == Player_Type.HUMAN) { return <Bet_Options /> } else { return null;}
// 			})()}
// 			{}
//         </div>
// 	)
// }

// // interface Style {
// // 	name: string;
// // 	rules: string;
// // }

// // let styles: Style[] = [];

// // function Style(class_name: string, rules: string) {
// // 	// const class_name: string = "style_" + hash(rules.toString());
// // 	console.log(class_name)
// // 	const style: Style = {
// // 		name: class_name,
// // 		rules: rules
// // 	};

// // 	styles.push(style);

// // 	// console.log(style_sheet)
// // 	// console.log(document.styleSheets.length)
	
// // 	// style_sheet.insertRule(`${class_name} { ${style} }`);
	
// // 	return class_name;
// // }

// // // function getStyleSheet(unique_title) {
// // // 	for (let sheet of document.styleSheets) {
// // // 	  if (sheet.title === unique_title) {
// // // 		return sheet;
// // // 	  }
// // // 	}
// // //   }

// // function hash(str: string): string {
// // 	let h = 0;
// // 	for(let i = 0; i < str.length; i++) {
// // 		h = Math.imul(31, h) + str.charCodeAt(i) | 0;
// // 	}
// //     return h.toString();            
// // }

// // const UI = Style("ui", `
// // 	height: 100%;
// // 	width: 100%;
// // 	z-index: 1;
// // 	position: relative;
// // 	display: flex;
// // 	flex-direction: column;
// // 	justify-content: flex-end;
// // `);

// // const bet_area = Style("bet_area", `
// // display: flex;
// // justify-content: center;
// // background: #111111;
// // padding: 5px;
// // `);


// // const bet_button = Style("bet_button", `
// // 	background: #222222;
// // 	padding: 5px;
// // `);




// // // style_sheet.title = "test";

// // let style_sheet: CSSStyleSheet;

// export function init_ui() {
// 	// let style_sheet_el: HTMLStyleElement = document.createElement("style")
// 	// style_sheet_el.type = "text/css"
// 	// style_sheet_el.innerText = '';
// 	// style_sheet_el.title = "test";
// 	// document.head.appendChild(style_sheet_el);

// 	// style_sheet = style_sheet_el.sheet;

// 	// for (let style of styles) {
// 	// 	// console.log(style.name, style.rules[0].toString())
// 	// 	style_sheet.insertRule(`.${style.name} {${style.rules.toString()}}`)
// 	// 	// style_sheet.insertRule(".test { color: red; }", 0)
// 	// }

// 	// console.log(style_sheet)

	

// 	// ui_state = new Proxy(ui_state, {
// 	// 	set: function(target, property, value) {
// 	// 		// do something
// 	// 		console.log("value changed from" + target[property] + " to " + value);
// 	// 		target[property] = value;
			
// 	// 		return true; // ts reasons?
// 	// 	}
// 	// });

// 	// ui_state.test = "hello"
// 	// ui_state.test = "world";

// 	render_ui();
// }

// export function render_ui() {
// 	const start_time = performance.now();

// 	const root_el = document.getElementById("root");
// 	const old_app_el = root_el.childNodes[0];

// 	const app_node = <App name="foo" />;

// 	if (root_el.children.length == 0) {
// 		console.log("mounting");
// 		root_el.appendChild(app_node);
// 	} else {
// 		console.log("rendering");
// 		root_el.innerHTML = "";
// 		root_el.appendChild(app_node);
// 	}

// 	const end_time = performance.now();

// 	console.log("render_time: " + (end_time - start_time));
// }