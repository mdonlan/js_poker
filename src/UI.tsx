import { elem } from "./jsx"
import { endTurn } from "./index"
import { game } from "./Game";

function check_handler() {
	console.log("user checked");

	endTurn(game.human, false);
};

function Bet_Area() {
    return (
        <div class="bet_options">
            <div class="check bet_button" onclick={() => check_handler()}>check</div>
            <div class="bet bet_button">bet</div>
            <div class="fold bet_button">fold</div>
        </div>
    )
}

function End_Of_Hand() {
	return (
		<div class="end_of_hand">
			<div>end of hand</div>
			{/* {["foo", "bar"].map(function (i) {
				return <span>{i}</span>;
			})} */}
			{game.hand_winner != null ? <div>{game.hand_winner.name}</div>: null}
		</div>
	)
}

export function App(props) {
	console.log("APP");
	console.log(game.hand_winner)
	return (
		<div class="ui">
			{game.hand_winner != null ? <End_Of_Hand /> : null}
            <Bet_Area />
        </div>
	)
}

export function set(state_var, new_value) {
	state_var = new_value;
	render_ui();	
}

export function render_ui() {
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
}