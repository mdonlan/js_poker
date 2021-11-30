import { elem } from "./jsx"
import { endTurn } from "./index"
import { game } from "./Game";

function check_handler() {
	console.log("user checked");

	endTurn(game.human, false);
};

function Bet_Area() {
    return (
        <div>
            <div class="check bet_button" onclick={() => check_handler()}>check</div>
            <div>bet</div>
            <div>fold</div>
        </div>
    )
}

export function App(props) {
	return (
		<div>
            <div>{props.name}</div>
            <Bet_Area />
        </div>
	)
}

export function create_ui() {

	const bet_options_elem = document.querySelector(".bet_options");
	
	const check_button = document.createElement("div");
	// check_button.onclick = humanCheck;
	check_button.innerHTML = "CHECK";
	check_button.className = "check bet_button";
	bet_options_elem.appendChild(check_button);

	const bet_button = document.createElement("div");
	// bet_button.onclick = humanBet;
	bet_button.innerHTML = "BET";
	bet_button.className = "bet bet_button";
	bet_options_elem.appendChild(bet_button);

	const fold_button = document.createElement("div");
	// fold_button.onclick = humanFold;
	fold_button.innerHTML = "FOLD";
	fold_button.className = "fold bet_button";
	bet_options_elem.appendChild(fold_button);

	const bet_amount_button = document.createElement("input");
	bet_amount_button.contentEditable = 'true';
	bet_amount_button.placeholder = "Bet Amount";
	bet_amount_button.className = "bet_amount";
	bet_options_elem.appendChild(bet_amount_button);
	
    document.getElementById("root").appendChild(<App name="foo" />);
}
