// import { test_func } from './Deck';

// test_func();

// import { App, init_ui, render_ui } from "./UI"
import { Suit, Card, Player, Game, Player_Type, Ranked_Hand, Hand_Rank, game, Card_Type, Hand_Phase, Hand_Results } from "./Game"
import { Sim_Hand } from "./Sim_Hand";
import { log, add_log_msg } from './Log';
import { el, child_el} from './UI';

interface Card_Info {
	suit: Suit;
	type: Card_Type;
}

interface Cards_By_Suit {
	hearts: Card[];
	spades: Card[];
	clubs: Card[];
	diamonds: Card[];
}





export function create_deck(): Card[] {
	let new_deck: Card[] = [];
	let card_value: number = 2; // the value of the card. from 2-14
	let current_suit: number = 0;
	let cards_in_suit: number = 0;

	for (let i = 0; i < 52; i++) {
		let card: Card = {
			value: card_value,
			suit: <Suit>current_suit,
			id: i,
		}
		new_deck.push(card);

		card_value++;
		if (card_value == 15) {
			card_value = 2;
		}

		cards_in_suit++;
		if (cards_in_suit == 13) {
			current_suit++;
			cards_in_suit = 0;
		}
	}

	return new_deck;
};

export function create_player(id: number, type: Player_Type): Player {
	let player: Player = {
		id: id,
		hand: [],
		money: 1000,
		name: "player" + id,
		type: type,
		// round_bet: 0,
		hand_rank: Hand_Rank.UNRANKED,
		final_hand_cards: [],
		best_cards: [],
		highest_value_in_hand: 0,
		amount_bet_this_round: 0,
		has_folded: false
	}

	return player;
}

function createPlayers(): Player[] {
	let num_players: number = 6;
	let players: Player[] = [];
	for (let i = 0; i < num_players; i++) {
		let type = Player_Type.AI;

		// set the first player created to be the human
		if (i == 0) {
			type = Player_Type.HUMAN;
		}

		let player: Player = create_player(i, type);
		players.push(player);
	}

	return players;
};

function init() {
	addEventListeners();
	game.deck = create_deck();
	game.players = createPlayers();
	game.human_player = game.players[0];

	el(".deal_new_hand_button").addEventListener("click", deal_new_hand);

	deal_new_hand();
};

// function increase_bet_handler(e: Event) {
// 	console.log("increase bet handler");
	
// }

// function decrease_bet_handler(e: Event) {
// 	console.log("decrease bet handler");
// }

function addEventListeners() {
	el(".check").addEventListener("click", () => {
		end_turn(game.human_player, false);
	});

	// el(".bet_amount").addEventListener("keydown", bet_amount_keypress_handler);
	// el(".bet_amount").addEventListener("input", );

	// el(".increase_bet_button").addEventListener("click", increase_bet_handler);
	// el(".decrease_bet_button").addEventListener("click", decrease_bet_handler);

	// content editable onChange listener for human player bet ammount
	// let elem: Element | null = document.querySelector('.bet_amount');
	// if (elem) {
	// 	elem.addEventListener('keypress', betInputHandler);
	// }

	const bet_amount = el(".bet_amount");
	const bet_range_el: HTMLInputElement = el(".bet_range") as HTMLInputElement;
	bet_range_el.addEventListener("input", e => {
		// console.log(e.value)
		// bet_range_el.value = e.;
		bet_amount.innerHTML = bet_range_el.value;
		const call_btn_el = el(".call");
		console.log(parseInt(bet_range_el.value));
		console.log(game.current_hand.current_bet);
		if (parseInt(bet_range_el.value) == game.current_hand.current_bet) {
			console.log("fuck")
			call_btn_el.classList.remove("hide");
		} else {
			call_btn_el.classList.add("hide");
		}
	});

	el(".bet").addEventListener("click", () => {
		console.log('bet');
		humanBet();
		
	});

	el(".call").addEventListener("click", () => {
		console.log('call');
		call_bet(game.human_player);
		end_turn(game.human_player, false);
	});
};

function deal_new_hand() {
	add_log_msg("Dealing new hand");
	
	game.hand_winner = null;
	game.community_cards = [];
	game.current_hand.pot = 0;
	game.hand_phase = Hand_Phase.PREFLOP;
	
	updateCommunityCardElems();

	createRoundOrder(0);

	const dealer = game.round_order[game.round_order.length - 3];
	const small_blind = game.round_order[game.round_order.length - 2];
	const big_blind = game.round_order[game.round_order.length - 1];
	const first_to_bet = game.round_order[0];

	add_log_msg("Dealer is " + dealer.name);
	add_log_msg(`Small blind is $${game.blinds.small} to ${small_blind.name}`);
	add_log_msg(`Big blind is $${game.blinds.big} to ${big_blind.name}`);
	// add_log_msg("Start the betting round with " + first_to_bet.name);

	console.log("reseting players")
	// reset each player
	game.players.forEach(player => {
		player.hand = <Card[]>[];
		player.final_hand_cards = <Card[]>[];
		player.hand_rank = Hand_Rank.UNRANKED;
		player.amount_bet_this_round = 0;
		player.best_cards = [];
		player.highest_value_in_hand = 0;
		player.has_folded = false;
		dealCards(player, 2);

		clear_final_hand(player);
	});
	

	el(".end_of_hand").classList.add("end_of_hand_hide");

	// update_player_ui();

	console.log(game.players)
	

	// let player: Player = {
	// 	id: id,
	// 	hand: [],
	// 	money: 1000,
	// 	name: "player" + id,
	// 	type: type,
	// 	round_bet: 0,
	// 	hand_rank: Hand_Rank.UNRANKED,
	// 	final_hand_cards: [],
	// 	best_cards: [],
	// 	highest_value_in_hand: 0,
	// 	amount_bet_this_round: 0,
	// 	has_folded: false
	// }

	blinds();

	update_player_ui();
	startBettingRound();
};

// DEV -- deal a specific hand for a player
	// if (player.type == Player_Type.HUMAN) {
	// 	player.hand.push(...dev_deal_cards(game.deck, [
	// 		{suit: Suit.HEARTS, type: Card_Type.TWO},
	// 		{suit: Suit.HEARTS, type: Card_Type.THREE},
	// 		{suit: Suit.HEARTS, type: Card_Type.FOUR},
	// 		{suit: Suit.HEARTS, type: Card_Type.FIVE},
	// 		{suit: Suit.HEARTS, type: Card_Type.SIX}
	// 	]));

export function deal_card(deck: Card[]): Card {
	let cardPosInDeck = Math.floor(Math.random() * game.deck.length);
	let card = game.deck[cardPosInDeck];
	deck.splice(cardPosInDeck, 1);
	return card;
}

export function dev_deal_cards(deck: Card[], cards_to_deal: Card_Info[]): Card[] {
	const cards: Card[] = [];
	for (let card_info of cards_to_deal) {
		for (let card of deck) {
			if (card.suit == card_info.suit && card.value == card_info.type) {
				cards.push(card);
			}
		}
	}

	return cards;
}

export function dealCards(player: Player, numCardsToDeal: number) {
	let cardsDelt = 0;
	while (cardsDelt < numCardsToDeal) {
		cardsDelt++;
		player.hand.push(deal_card(game.deck));
	}
};

function update_player_ui() {
	document.querySelectorAll(".card").forEach(e => e.innerHTML = "");
	for (let player of game.players) {
		let player_el = el(`.${player.name}`);
		let cards_el = child_el(player_el, ".cards");
		let money_el = child_el(player_el, ".player_money");
		let amount_bet_el = child_el(player_el, ".amount_bet");

		money_el.innerHTML = player.money.toString();
		amount_bet_el.innerHTML = player.amount_bet_this_round.toString();

		for (let card of Array.from(cards_el.children)) {
			if (game.hand_winner != null || player.id == 0) {
				if (player.has_folded) card.innerHTML = "";
				else if (card.classList.contains("card1")) card.innerHTML = getCardImage(player.hand[0].value, player.hand[0].suit, false);
				else if (card.classList.contains("card2")) card.innerHTML = getCardImage(player.hand[1].value, player.hand[1].suit, false);
			} else {
				if (player.has_folded) card.innerHTML = "";
				else if (card.classList.contains("card1")) card.innerHTML = card_back();
				else if (card.classList.contains("card2")) card.innerHTML = card_back();
			}
		}
	}
};

function card_back() {
	return "<img class='card_image' src='./assets/deck/card_back.svg'>";
};

export function getCardImage(card_value: number | string, suit: Suit, is_final_cards: boolean) {
	let value = card_value > 10 ? Card_Type[card_value] : card_value; 
	let imageName = value + "_of_" + Suit[suit] + ".svg";

	if (is_final_cards) {
		let image = "<img class='final_card_image' src='./assets/deck/" + imageName + "'>";
		return image;
	} else {
		let image = "<img class='card_image' src='./assets/deck/" + imageName + "'>";
		return image;
		// elem.innerHTML = image;
	}
};

function updateCommunityCards() {
	switch (game.hand_phase) {
		case Hand_Phase.PREFLOP:
			break;
		case Hand_Phase.FLOP:
			dealCommunityCards(3);
			break;
		case Hand_Phase.TURN:
			dealCommunityCards(1);
			break;
		case Hand_Phase.RIVER:
			dealCommunityCards(1);
			break;
	}

	updateCommunityCardElems();
};

function dealCommunityCards(numToDeal: number) {
	let cardsDelt = 0;
	while (cardsDelt < numToDeal) {
		cardsDelt++;
		let cardPosInDeck = Math.floor(Math.random() * game.deck.length);
		let card = game.deck[cardPosInDeck];
		game.community_cards.push(card);
		game.deck.splice(cardPosInDeck, 1);
	}
};

function startBettingRound() {
	// createRoundOrder(0);
	add_log_msg("Starting new betting round");
	
	// createRoundOrder(game.active_player.id)
	game.round_current_player_index = 0;
	game.active_player = game.round_order[game.round_current_player_index];
	
	if (game.hand_phase != Hand_Phase.PREFLOP) {
		// reset current hand if not first round (blinds)
		console.log("reseting current bet and player bets")
		game.current_hand.current_bet = 0;
		game.current_hand.temp_player_bet = 0;
		game.players.forEach(player => {
			player.amount_bet_this_round = 0;
		});
	}

	

	// add_log_msg("Active player is " + game.active_player.name);
	updateCommunityCards(); // check if we need to deal out any community cards to start the round
	start_turn(game.active_player);
};

function updateCommunityCardElems() {
	// after dealing update the DOM elems to show the community cards
	const community_cards_el = el(".community_cards");
	community_cards_el.innerHTML = "";

	for (let card of game.community_cards) {
		community_cards_el.innerHTML += `<div class="community_card">${getCardImage(card.value, card.suit, false)}</div>`
	}
};

function call_bet(player: Player): void {
	const amount = game.current_hand.current_bet - player.amount_bet_this_round;
	add_log_msg(`${player.name} calls with $${amount}`);
	add_money_to_pot(player, amount);
}

function place_bet(player: Player, amount: number) {
	add_log_msg(`${player.name} places best of $${amount}`);
	add_money_to_pot(player, amount);
	game.current_hand.current_bet += amount;
}

function aiTurn(player: Player) {
	add_log_msg("Starting ai_turn for " + player.name);
	setTimeout(() => {
		let sim_hand: Sim_Hand = new Sim_Hand(game, player);
		// console.log(sim_hand.results);
		const win_percent = (sim_hand.results.wins / sim_hand.results.run_count * 100).toFixed();
		add_log_msg(`AI analysis: Win %: ${win_percent}`);

		const amount_owed = game.current_hand.current_bet - player.amount_bet_this_round;


		let should_raise_or_bet: boolean = false;

		// figure out if the ai should either place a new bet or raise the current bet
		// do this based on the ai hand strength and how much money they have?

		// if win percent is heigh enough then place/raise bet
		// how much to bet? determine risk

		
		// if a bet is below 3% of players money then just call even with bad hand
		const cheap_bet_amount = player.money * .03;

		if (amount_owed < cheap_bet_amount) {
			call_bet(player);
			end_turn(player, false);
		} else {
			if (sim_hand.results.wins > 15) {
				// add_log_msg(`${player.name} is calling`);
				call_bet(player);
				end_turn(player, false);
			} else {
				add_log_msg("AI is folding");
				fold(player);
			}
		}

		
	}, 500);
};

function humanTurn(player: Player) {
	add_log_msg("Starting human player turn");
	toggle_bet_options_el();
	render_bet_options();
};

function render_bet_options() {
	// set the player bet/call element to show bet or call depending on if the roundBet is > 0
	// also set the min bet ammount if it is call

	const bet_options_el = el(".bet_options");
	if (game.current_hand.current_bet > 0) {
		el(".check").classList.add("bet_button_hide");
		el(".call").classList.remove("bet_button_hide");

		el(".bet_amount").innerHTML = game.current_hand.current_bet.toString();
	} else {
		el(".check").classList.remove("bet_button_hide");
		el(".call").classList.add("bet_button_hide");
	}

	const bet_range_el = el(".bet_range") as HTMLInputElement;
	bet_range_el.min = game.current_hand.current_bet.toString();
	bet_range_el.max = game.human_player.money.toString();
	bet_range_el.value = game.current_hand.current_bet.toString();

	const call_btn_el = el(".call");
	// console.log(game.current_hand.current_bet, bet_range_el.value)
	if (game.current_hand.current_bet == parseInt(bet_range_el.value)) {
		call_btn_el.classList.remove("hide");
	} else {
		call_btn_el.classList.add("hide");
	}

};

export function end_turn(player: Player, newBetHasBeenPlaced: boolean) {
	
	if (player.has_folded) {
		add_log_msg(`Ending turn b/c player ${player.name} has folded`);
	} else {
		add_log_msg("Ending turn for player " + player.name);
	}

	if (player.type == Player_Type.HUMAN) {
		toggle_bet_options_el();
	}

	// if a new bet has been placed then reset the round order
	if (newBetHasBeenPlaced) {
		setNewRoundOrderAfterBet(player);
		const next_player = findNextPlayer();
		start_turn(next_player);
	} else { // if no new bet then continue the round as normal
		if (check_if_round_complete(player)) {
			endOfRound();
		} else {
			// if not the end of round then move on to the next player
			const next_player = findNextPlayer();
			start_turn(next_player);
		}
	}

	const player_el: Element = el(`.${player.name}`);
	player_el.classList.remove("active_player");

	update_player_ui();
};

function check_if_round_complete(player: Player): boolean {
	if (player.id == game.round_order[game.round_order.length - 1].id) {
		//log('last player in roundOrder has ended their turn')
		return true;
	}
	return false;
};

function findNextPlayer(): Player {
	game.round_current_player_index++;
	const next_player: Player = game.round_order[game.round_current_player_index];
	return next_player;
};

function start_turn(player: Player) {
	if (player.has_folded) {
		end_turn(player, false);
	} else {
		add_log_msg("Starting turn for player " + player.name);
		add_log_msg(`Current bet is $${game.current_hand.current_bet}`);
		add_log_msg(`${player.name} has put up $${player.amount_bet_this_round}`);
		add_log_msg(`${player.name} needs to call $${game.current_hand.current_bet - player.amount_bet_this_round}`);
		const player_el: Element = el(`.${player.name}`);
		player_el.classList.add("active_player");

		game.active_player = player;

		if (player.type == Player_Type.AI) {
			aiTurn(player);
		} else {
			humanTurn(player);
		}

		
	}
};

function endOfRound() {
	add_log_msg("End of round");
	// the current betting round has ended, move on to the next betting round / determine winner
	// console.log("end of round: " + game.hand_phase);
	// showPrivateCards = false; // make sure not to show the ai players cards, unless it is end of hand
	
	switch (game.hand_phase) {
		case Hand_Phase.PREFLOP: {
			add_log_msg("Ending game phase Preflop");
			game.hand_phase = Hand_Phase.FLOP;
			startBettingRound();
			break;
		}
		case Hand_Phase.FLOP:
			add_log_msg("Ending game phase Flop");
			game.hand_phase = Hand_Phase.TURN;
			startBettingRound();
			break;
		case Hand_Phase.TURN:
			add_log_msg("Ending game phase Turn");
			game.hand_phase = Hand_Phase.RIVER;
			startBettingRound();
			break;
		case Hand_Phase.RIVER:
			add_log_msg("Ending game phase River");
			game.hand_phase = Hand_Phase.SHOWDOWN;
			endOfRound(); // immediately move to end of showdown, rank hands 
			//startBettingRound();
			break;
		case Hand_Phase.SHOWDOWN:
			add_log_msg("Ending game phase Showdown");

			// end of the hand
			end_of_hand();

			break;
	}
};

function end_of_hand() {
	// showPrivateCards = true;
	add_log_msg("End of hand");
	
	find_hand_winner(game); // find the winner of the current hand
	update_player_ui(); // update to show ai cards
	toggle_end_of_hand_el(); // show the deal new hand btn, allow the player to start the next round
	game.active_player = null; // to turn off betting options ui elem
}

// returns true if the new hand is better than the highest ranked hand;
export enum Compare_Result {
	WIN,
	LOSE,
	TIE
};

// WIN = hand_one won
// LOSE = hand_two won
export function compare_hands(ranked_hand_one: Ranked_Hand, ranked_hand_two: Ranked_Hand): Compare_Result {
	find_five_best_cards(ranked_hand_one);
	find_five_best_cards(ranked_hand_two);

	const hand_one_cards = ranked_hand_one.hand;
	const hand_two_cards = ranked_hand_two.hand;

	if (ranked_hand_one.rank > ranked_hand_two.rank) return Compare_Result.WIN;
	if (ranked_hand_one.rank < ranked_hand_two.rank) return Compare_Result.LOSE;

	const hand_one_pairs: number[] = get_pairs_exact(ranked_hand_one.hand); 
	const hand_two_pairs: number[] = get_pairs_exact(ranked_hand_two.hand);

	const hand_one_trips: number[] = get_trips(hand_one_cards);
	const hand_two_trips: number[] = get_trips(hand_two_cards);


	switch (ranked_hand_one.rank) {
		case Hand_Rank.HIGH_CARD: {

			for (let i = 0; i < 1; i++) {
				if (hand_one_cards[i].value > hand_two_cards[i].value) return Compare_Result.WIN; 
				if (hand_one_cards[i].value < hand_two_cards[i].value) return Compare_Result.LOSE;
			}
			
			return Compare_Result.TIE;
		}
		case Hand_Rank.PAIR: {
			if (hand_one_pairs[0] > hand_two_pairs[0]) return Compare_Result.WIN;
			if (hand_one_pairs[0] < hand_two_pairs[0]) return Compare_Result.LOSE;

			if (hand_one_cards[4].value > hand_two_cards[4].value) return Compare_Result.WIN;
			if (hand_one_cards[4].value < hand_two_cards[4].value) return Compare_Result.LOSE;

			return Compare_Result.TIE;
		}
		case Hand_Rank.TWO_PAIR: {
			// console.log(hand_one_cards, hand_two_cards)
			// console.log(hand_one_pairs, hand_two_pairs)
			if (hand_one_pairs[0] > hand_two_pairs[0]) return Compare_Result.WIN;
			if (hand_one_pairs[0] < hand_two_pairs[0]) return Compare_Result.LOSE;
			if (hand_one_pairs[1] > hand_two_pairs[1]) return Compare_Result.WIN;
			if (hand_one_pairs[1] < hand_two_pairs[1]) return Compare_Result.LOSE;

			// this doesn't work??
			if (hand_one_cards[4].value > hand_two_cards[4].value) return Compare_Result.WIN;
			if (hand_one_cards[4].value < hand_two_cards[4].value) return Compare_Result.LOSE;

			return Compare_Result.TIE;
		}
		case Hand_Rank.THREE_OF_KIND: {
			// console.log(hand_one_cards, hand_two_cards)
			// console.log(hand_one_pairs, hand_two_pairs)
			if (hand_one_trips[0] > hand_two_trips[0]) return Compare_Result.WIN;
			if (hand_one_trips[0] < hand_two_trips[0]) return Compare_Result.LOSE;

			// this doesn't work??
			if (hand_one_cards[3].value > hand_two_cards[3].value) return Compare_Result.WIN;
			if (hand_one_cards[3].value < hand_two_cards[3].value) return Compare_Result.LOSE;

			return Compare_Result.TIE;
		}
		case Hand_Rank.STRAIGHT: {
			if (hand_one_cards[0].value > hand_two_cards[0].value) return Compare_Result.WIN;
			if (hand_one_cards[0].value < hand_two_cards[0].value) return Compare_Result.LOSE;
			
			return Compare_Result.TIE;
		}
		case Hand_Rank.FLUSH: {
			if (hand_one_cards[0].value > hand_two_cards[0].value) return Compare_Result.WIN;
			if (hand_one_cards[0].value < hand_two_cards[0].value) return Compare_Result.LOSE;
			
			return Compare_Result.TIE;
		}
		case Hand_Rank.FULL_HOUSE: {
			if (hand_one_trips[0] > hand_two_trips[0]) return Compare_Result.WIN;
			if (hand_one_trips[0] < hand_two_trips[0]) return Compare_Result.LOSE;
			else {
				if (hand_one_pairs[0] > hand_two_pairs[0]) return Compare_Result.WIN;
				if (hand_one_pairs[0] < hand_two_pairs[0]) return Compare_Result.LOSE;
			}

			return Compare_Result.TIE;
		}
		case Hand_Rank.FOUR_OF_KIND: {
			if (hand_one_cards[0].value > hand_two_cards[0].value) return Compare_Result.WIN;
			if (hand_one_cards[0].value < hand_two_cards[0].value) return Compare_Result.LOSE;
			
			if (hand_one_cards[4].value > hand_two_cards[4].value) return Compare_Result.WIN;
			if (hand_one_cards[4].value < hand_two_cards[4].value) return Compare_Result.LOSE;
			
			return Compare_Result.TIE;
		}
		case Hand_Rank.STRAIGHT_FLUSH: {
			if (hand_one_cards[0].value > hand_two_cards[0].value) return Compare_Result.WIN;
			if (hand_one_cards[0].value < hand_two_cards[0].value) return Compare_Result.LOSE;
			
			return Compare_Result.TIE;
		}
		case Hand_Rank.ROYAL_FLUSH: {
			if (hand_one_cards[0].value > hand_two_cards[0].value) return Compare_Result.WIN;
			else if (hand_one_cards[0].value < hand_two_cards[0].value) return Compare_Result.LOSE;
			
			return Compare_Result.TIE;
		}
	}

	return Compare_Result.TIE;
	
	// 	case Hand_Rank.THREE_OF_KIND: {
	// 		if (highest_ranked_pairs[0] > current_hand_pairs[0]) result = Compare_Result.LOSE;
	// 		else if (highest_ranked_pairs[0] < current_hand_pairs[0]) result = Compare_Result.WIN;
	// 		else {
	// 			if (highest_ranked_best_cards[3].value > current_hand_best_cards[3].value) result = Compare_Result.LOSE;
	// 			else if (highest_ranked_best_cards[3].value < current_hand_best_cards[3].value) result = Compare_Result.WIN;
	// 			else {
	// 				if (highest_ranked_best_cards[4].value > current_hand_best_cards[4].value) result = Compare_Result.LOSE;
	// 				else if (highest_ranked_best_cards[4].value < current_hand_best_cards[4].value) result = Compare_Result.WIN;
	// 				else result = Compare_Result.TIE;
	// 			}
	// 		}
	// 		break;
	// 	}
	// 	case Hand_Rank.STRAIGHT: {
	// 		if (highest_ranked_best_cards[0].value > current_hand_best_cards[0].value) result = Compare_Result.LOSE;
	// 		else if (highest_ranked_best_cards[0].value < current_hand_best_cards[0].value) result = Compare_Result.WIN;
	// 		else Compare_Result.TIE;
	// 		break;
	// 	}
	// 	case Hand_Rank.FLUSH: {
	// 		if (highest_ranked_best_cards[0].value > current_hand_best_cards[0].value) result = Compare_Result.LOSE;
	// 		else if (highest_ranked_best_cards[0].value < current_hand_best_cards[0].value) result = Compare_Result.WIN;
	// 		else Compare_Result.TIE;
	// 		break;
	// 	}
	// 	case Hand_Rank.FULL_HOUSE: {
	// 		if (highest_ranked_best_cards[0].value > current_hand_best_cards[0].value) {
	// 			return Compare_Result.LOSE;
	// 		} else if (highest_ranked_best_cards[0].value < current_hand_best_cards[0].value) {
	// 			return Compare_Result.WIN;
	// 		} else {
	// 			if (highest_ranked_best_cards[3].value > current_hand_best_cards[0].value) {
	// 				return Compare_Result.LOSE;
	// 			} else if (highest_ranked_best_cards[3].value < current_hand_best_cards[3].value) {
	// 				return Compare_Result.WIN;
	// 			} 
	// 		}
	// 		// if (highest_ranked_pairs[0] > current_hand_pairs[0]) result = Compare_Result.LOSE;
	// 		// else if (highest_ranked_pairs[0] < current_hand_pairs[0]) result = Compare_Result.WIN;
	// 		// else {
	// 		// 	if (highest_ranked_pairs[1] > current_hand_pairs[1]) result = Compare_Result.LOSE;
	// 		// 	else if (current_hand_pairs[1] < current_hand_pairs[1]) result = Compare_Result.WIN;
	// 		// 	else result = Compare_Result.TIE;
	// 		// }
	// 		break;
	// 	}
	// 	case Hand_Rank.FOUR_OF_KIND: {
	// 		if (highest_ranked_best_cards[0].value > current_hand_best_cards[0].value) result = Compare_Result.LOSE;
	// 		else if (highest_ranked_best_cards[0].value < current_hand_best_cards[0].value) result = Compare_Result.WIN;
	// 		else {
	// 			if (highest_ranked_best_cards[4].value > current_hand_best_cards[4].value) result = Compare_Result.LOSE;
	// 			else if (highest_ranked_best_cards[4].value < current_hand_best_cards[4].value) result = Compare_Result.WIN;
	// 			else result = Compare_Result.TIE;
	// 		}
	// 		break;
	// 	}
	// 	case Hand_Rank.STRAIGHT_FLUSH: {
	// 		if (highest_ranked_best_cards[0].value > current_hand_best_cards[0].value) result = Compare_Result.LOSE;
	// 		else if (highest_ranked_best_cards[0].value < current_hand_best_cards[0].value) result = Compare_Result.WIN;
	// 		else Compare_Result.TIE;
	// 		break;
	// 	}
	// 	case Hand_Rank.ROYAL_FLUSH: {
	// 		if (highest_ranked_best_cards[0].value > current_hand_best_cards[0].value) result = Compare_Result.LOSE;
	// 		else if (highest_ranked_best_cards[0].value < current_hand_best_cards[0].value) result = Compare_Result.WIN;
	// 		else Compare_Result.TIE;
	// 		break;
	// 	}
	// }
	// }
}

function get_trips(hand: Card[]): number[] {
	const trips: number[] = [];
	hand.forEach((card: Card) => {
		const count = hand.filter((other_card: Card) => other_card.value === card.value).length;
		if (count == 3) {
			const already_found = trips.filter(value => value === card.value).length == 0 ? false : true;
			if (!already_found) trips.push(card.value);
		}
	})
	return trips;
}

function get_pairs_exact(hand: Card[]): number[] {
	const pairs: number[] = [];
	hand.forEach((card: Card) => {
		const count = hand.filter(other_card => other_card.value === card.value).length;
		if (count == 2) {
			const already_found = pairs.filter(value => value === card.value).length == 0 ? false : true;
			if (!already_found) pairs.push(card.value);
		}
	})
	return pairs;
}

// function compare_hand_to_highest_ranked(highestRankedHand: Ranked_Hand, rankedHand: Ranked_Hand): Compare_Result {
// 	let result: Compare_Result = Compare_Result.LOSE;
	
// 	find_five_best_cards(highestRankedHand)
// 	find_five_best_cards(rankedHand);

// 	if (rankedHand.rank > highestRankedHand.rank) {
// 		result = Compare_Result.WIN;
// 		return result;
// 	}

// 	const highest_ranked_best_cards = highestRankedHand.player.best_cards;
// 	const current_hand_best_cards = rankedHand.player.best_cards;
// 	const highest_ranked_pairs = findPairs(highestRankedHand.hand);
// 	const current_hand_pairs = findPairs(rankedHand.hand);

// 	if (rankedHand.rank == highestRankedHand.rank) { // if we found a tied rank
// 		switch (rankedHand.rank) {
// 			case Hand_Rank.HIGH_CARD: {
// 				// let done = false;
// 				for (let i = 0; i < highest_ranked_best_cards.length; i++) {
// 					// if (done) continue;
// 					if (highest_ranked_best_cards[i].value > current_hand_best_cards[i].value) {
// 						result = Compare_Result.LOSE;
// 						return result;
// 						// done = true;
// 					} else if (highest_ranked_best_cards[i].value < current_hand_best_cards[i].value) {
// 						result = Compare_Result.WIN;
// 						return result;
// 						// done = true;
// 					}
// 				}
// 				break;
// 			}
// 			case Hand_Rank.TWO_PAIR: {
// 				if (highest_ranked_pairs[0] > current_hand_pairs[0]) result = Compare_Result.LOSE;
// 				else if (highest_ranked_pairs[0] < current_hand_pairs[0]) result = Compare_Result.WIN;
// 				else {
// 					if (highest_ranked_pairs[1] > current_hand_pairs[1]) result = Compare_Result.LOSE;
// 					else if (current_hand_pairs[1] < current_hand_pairs[1]) result = Compare_Result.WIN;
// 					else {
// 						// handle kicker
// 						if (highest_ranked_best_cards[4].value > current_hand_best_cards[4].value) result = Compare_Result.LOSE;
// 						else if (highest_ranked_best_cards[4].value < current_hand_best_cards[4].value) result = Compare_Result.WIN;
// 						else result = Compare_Result.TIE;
// 					}
// 				}
// 				break;
// 			}
// 			case Hand_Rank.THREE_OF_KIND: {
// 				if (highest_ranked_pairs[0] > current_hand_pairs[0]) result = Compare_Result.LOSE;
// 				else if (highest_ranked_pairs[0] < current_hand_pairs[0]) result = Compare_Result.WIN;
// 				else {
// 					if (highest_ranked_best_cards[3].value > current_hand_best_cards[3].value) result = Compare_Result.LOSE;
// 					else if (highest_ranked_best_cards[3].value < current_hand_best_cards[3].value) result = Compare_Result.WIN;
// 					else {
// 						if (highest_ranked_best_cards[4].value > current_hand_best_cards[4].value) result = Compare_Result.LOSE;
// 						else if (highest_ranked_best_cards[4].value < current_hand_best_cards[4].value) result = Compare_Result.WIN;
// 						else result = Compare_Result.TIE;
// 					}
// 				}
// 				break;
// 			}
// 			case Hand_Rank.STRAIGHT: {
// 				if (highest_ranked_best_cards[0].value > current_hand_best_cards[0].value) result = Compare_Result.LOSE;
// 				else if (highest_ranked_best_cards[0].value < current_hand_best_cards[0].value) result = Compare_Result.WIN;
// 				else Compare_Result.TIE;
// 				break;
// 			}
// 			case Hand_Rank.FLUSH: {
// 				if (highest_ranked_best_cards[0].value > current_hand_best_cards[0].value) result = Compare_Result.LOSE;
// 				else if (highest_ranked_best_cards[0].value < current_hand_best_cards[0].value) result = Compare_Result.WIN;
// 				else Compare_Result.TIE;
// 				break;
// 			}
// 			case Hand_Rank.FULL_HOUSE: {
// 				if (highest_ranked_best_cards[0].value > current_hand_best_cards[0].value) {
// 					return Compare_Result.LOSE;
// 				} else if (highest_ranked_best_cards[0].value < current_hand_best_cards[0].value) {
// 					return Compare_Result.WIN;
// 				} else {
// 					if (highest_ranked_best_cards[3].value > current_hand_best_cards[0].value) {
// 						return Compare_Result.LOSE;
// 					} else if (highest_ranked_best_cards[3].value < current_hand_best_cards[3].value) {
// 						return Compare_Result.WIN;
// 					} 
// 				}
// 				// if (highest_ranked_pairs[0] > current_hand_pairs[0]) result = Compare_Result.LOSE;
// 				// else if (highest_ranked_pairs[0] < current_hand_pairs[0]) result = Compare_Result.WIN;
// 				// else {
// 				// 	if (highest_ranked_pairs[1] > current_hand_pairs[1]) result = Compare_Result.LOSE;
// 				// 	else if (current_hand_pairs[1] < current_hand_pairs[1]) result = Compare_Result.WIN;
// 				// 	else result = Compare_Result.TIE;
// 				// }
// 				break;
// 			}
// 			case Hand_Rank.FOUR_OF_KIND: {
// 				if (highest_ranked_best_cards[0].value > current_hand_best_cards[0].value) result = Compare_Result.LOSE;
// 				else if (highest_ranked_best_cards[0].value < current_hand_best_cards[0].value) result = Compare_Result.WIN;
// 				else {
// 					if (highest_ranked_best_cards[4].value > current_hand_best_cards[4].value) result = Compare_Result.LOSE;
// 					else if (highest_ranked_best_cards[4].value < current_hand_best_cards[4].value) result = Compare_Result.WIN;
// 					else result = Compare_Result.TIE;
// 				}
// 				break;
// 			}
// 			case Hand_Rank.STRAIGHT_FLUSH: {
// 				if (highest_ranked_best_cards[0].value > current_hand_best_cards[0].value) result = Compare_Result.LOSE;
// 				else if (highest_ranked_best_cards[0].value < current_hand_best_cards[0].value) result = Compare_Result.WIN;
// 				else Compare_Result.TIE;
// 				break;
// 			}
// 			case Hand_Rank.ROYAL_FLUSH: {
// 				if (highest_ranked_best_cards[0].value > current_hand_best_cards[0].value) result = Compare_Result.LOSE;
// 				else if (highest_ranked_best_cards[0].value < current_hand_best_cards[0].value) result = Compare_Result.WIN;
// 				else Compare_Result.TIE;
// 				break;
// 			}
// 		}
// 	}

// 	return result;
// };

export function find_hand_winner(_game: Game): Hand_Results {
	let best_hand: Ranked_Hand = rankHand(_game.players[0], _game.community_cards); // do this to avoid unassigned var error, FIX??

	const hand_result: Hand_Results = {
		// hand_ranks: [],
		winner: null
	};

	// get the hand ranks for each player
	// then compare it to the highest ranked hand in the current hand
	// and see if it is higher and if so set them as new winning player
	_game.players.forEach(player => {
		const current_ranked_hand = rankHand(player, _game.community_cards);
		player.hand_rank = current_ranked_hand.rank;
		player.final_hand_cards = current_ranked_hand.hand;
		
		// const compare_result: Compare_Result = compare_hand_to_highest_ranked(best_hand, current_ranked_hand);
		// if (compare_result == Compare_Result.WIN) best_hand = current_ranked_hand;
		const result: Compare_Result = compare_hands(current_ranked_hand, best_hand);
		
		// if the current hand wins
		if (result == Compare_Result.WIN) {
			best_hand = current_ranked_hand;
		}

		// find_five_used_cards(player);
		
		if (!_game.is_sim_game) {
			displayFinalHand(player);
		}
	});

	_game.hand_winner = best_hand.player;
	hand_result.winner = best_hand.player;

	if (!_game.is_sim_game) {
		add_log_msg("Hand winner is " + _game.hand_winner.name);
		let winnerElem: Element | null = document.querySelector(".winner");
		if (winnerElem) {
			winnerElem.innerHTML = best_hand.player.name + "wins the hand!";
			// console.log(highestRankedHand);
			_game.hand_winner.money += _game.current_hand.pot;
		}
	}

	return hand_result;
};

function clear_final_hand(player: Player) {
	const player_elem = el(`.${player.name}`);
	const final_hand_elem = player_elem.querySelector(':scope > .final_hand');
	const final_hand_children = final_hand_elem.querySelectorAll(':scope > div');
	
	final_hand_children.forEach(child => {
		child.innerHTML = "";
	})
};



function displayFinalHand(player: Player) {

	// at then end of a hand update the dom with all active players
	// final hands and ranks

	const player_el = el(`.${player.name}`)

	const hand_rank_el = child_el(player_el, ".hand_rank");
	hand_rank_el.innerHTML = "Rank: " + Hand_Rank[player.hand_rank];

	const final_cards_el = child_el(player_el, ".final_hand_cards");
	for (let card of player.final_hand_cards) {
		let imageElem = getCardImage(card.value, card.suit, true);
		final_cards_el.innerHTML += imageElem;	
	}

	const best_cards_el = child_el(player_el, ".best_cards");

	for (let card of player.best_cards) {
		let imageElem = getCardImage(card.value, card.suit, true);
		best_cards_el.innerHTML += imageElem;	
	}

	// let playerElem = document.querySelector("." + player.name);
	// if (playerElem) {
	// 	let children = Array.from(playerElem.children);
	// 	children.forEach((child) => {
	// 		if (child.classList.contains("final_hand")) {
	// 			let finalHandElem = child;
	// 			let finalHandElemChildren = Array.from(finalHandElem.children);

	// 			finalHandElemChildren.forEach((elem, index) => {
	// 				if (index == 0) {
	// 					// set final hand player rank
	// 					elem.innerHTML = "RANK: " + player.hand_rank;
	// 				} else if (index == 1) {
	// 					let finalHandCardsElem = elem;

	// 					// set final player hand, including community cards
	// 					player.final_hand_cards.forEach((card) => {
	// 						let imageElem = getCardImage(elem, card.value, card.suit, true);
	// 						finalHandCardsElem.innerHTML = finalHandCardsElem.innerHTML + imageElem;
	// 					});
	// 				}
	// 			});
	// 		}
	// 	});
	// }
};

function toggle_end_of_hand_el() {
	el(".end_of_hand").classList.toggle("end_of_hand_hide");
};

function blinds() {
	console.log("doing blinds")
	const bb_player = game.round_order[game.round_order.length - 1];
	const sb_player = game.round_order[game.round_order.length - 2];
	const dealer_player = game.round_order[game.round_order.length - 3];

	child_el(el(`.${dealer_player.name}`), ".player_name").innerHTML = dealer_player.name + " -- DEALER";
	child_el(el(`.${bb_player.name}`), ".player_name").innerHTML = bb_player.name + " -- BB";
	child_el(el(`.${sb_player.name}`), ".player_name").innerHTML = sb_player.name + " -- SB";

	add_money_to_pot(sb_player, game.blinds.small);
	add_money_to_pot(bb_player, game.blinds.big);

	game.current_hand.current_bet = game.blinds.big;

	update_player_ui();
}




// round_order[0] = dealer
// round_order[1] = bb
// round_order[2] = sm
// round_order[3] = first to play

// start w/ dealer_index
// then add 3 to it to get first player in round to bet
function createRoundOrder(dealer_index: number): void {
	let first_player = dealer_index + 3;
	if (first_player > game.players.length - 1) {
		first_player -= game.players.length;
	}
	// console.log(`first_player_id: ${first_player}`);

	let start = game.players.slice(first_player);
	let end = game.players.slice(0, first_player);
	game.round_order = start.concat(end);

	game.round_current_player_index = 0;
	game.active_player = game.players[first_player];

	// console.log(game.active_player)
};

function toggle_bet_options_el(): void {
	el(".bet_options").classList.toggle("bet_options_hide");
};

function add_money_to_pot(player: Player, value: number) {
	player.money -= value;
	game.current_hand.pot += value;

	

	player.amount_bet_this_round += value;

	el(".pot").innerHTML = `Pot: ${game.current_hand.pot}`; 
}


function humanBet() {
	const bet_elem = el(".bet_amount");
	
	let bet_amount = parseInt(bet_elem.innerHTML);

	bet_amount -= game.current_hand.current_bet;

	// only accept the click if the betAmount is > 0 >= roundbetAmount
	if (bet_amount > 0 ) {
		place_bet(game.human_player, bet_amount);
		end_turn(game.human_player, true);
	} else {
		//log('player tried to bet zero, or less than the roundBetAmount')
	}
};

function fold(player: Player) {
	player.has_folded = true;
	// game.players.splice(player.id);
	end_turn(player, false);
};

function checkValidBet(tempBetAmount: number) {
	// make sure the human player has entered a valid bet that is <= their money && >= minBet

	if (tempBetAmount <= game.players[0].money && tempBetAmount > game.current_hand.current_bet) {
		return true;
	} else {
		return false;
	}
};

function setToMaxBet() {
	// the amount entered in betAmount was too high, setting to the max possible bet
	//log('setting to max bet');

	let maxBet = game.players[0].money;
};

function setNewRoundOrderAfterBet(player: Player) {
	// //restart the round order starting at the bet makers index + 1
	// //find the next player and start a new round of betting w/ them

	// let nextPlayer = findNextPlayer();
	// // console.log("next_player: " + nextPlayer.id)
	// // get their index and set it to the startingPlayerIndex
	// // this is used for the next round to determine where the betting should start
	// // we want betting to start on the last player to bet

	// let nextPlayerIndex = getPlayerRoundIndex(nextPlayer);
	// // game.round_start_player_index = nextPlayerIndex;
	// // game.active_player = nextPlayer;

	// // create the new round order
	// // createRoundOrder(nextPlayerIndex);
	// // game.active_player = game.round_order[0];

	// // since the current player has already bet we need to remove them from the end of the round
	// game.round_order = game.round_order.slice(0, game.round_order.length - 1);

	// start_turn(nextPlayer);

	// console.log(`round current player index: ${game.round_current_player_index}`)
	// debugger;
	let first_player_id = player.id;
	// console.log(`first_player_id: ${first_player}`);

	let start = game.players.slice(first_player_id);
	let end = game.players.slice(0, first_player_id);
	game.round_order = start.concat(end);

	game.round_current_player_index = 0;
	game.active_player = game.round_order[game.round_current_player_index];
};

function getPlayerRoundIndex(player: Player): number {
	// find what round index a player has
	let index = 0;
	for (let i = 0; i < game.round_order.length; i++) {
		if (game.round_order[i].id == player.id) return i;
	}

	return index;
};

export function rankHand(player: Player, community_cards: Card[]): Ranked_Hand  {
	let hand: Card[] = player.hand;
	hand = hand.concat(community_cards);

	let highestValueInHand: number = 0;
	let handRank: Hand_Rank = Hand_Rank.HIGH_CARD;
	// let handRankText: string;

	// hands will be ranked as
	// highcard = 0, pair = 1, two pair = 2, three of kind = 3, straight = 4, flush = 5, fullhouse = 6,
	// four of kind = 7, straight flush = 8, royal flush = 9

	//isHighCard(hand); // is this needed???


	if (isPair(hand)) {
		handRank = Hand_Rank.PAIR;
		// handRankText = "Pair";
	}

	if (isTwoPair(hand)) {
		handRank = Hand_Rank.TWO_PAIR;
		// handRankText = "Two Pair";
	}

	if (isThreeOfKind(hand)) {
		handRank = Hand_Rank.THREE_OF_KIND;
		// handRankText = "Three of a kind";
	}

	if (isStraight(hand)) {
		handRank = Hand_Rank.STRAIGHT;
		// handRankText = "Straight";
	}

	if (get_flush_cards(hand)) {
		handRank = Hand_Rank.FLUSH;
		// handRankText = "Flush";
	}

	if (isFullHouse(hand)) {
		handRank = Hand_Rank.FULL_HOUSE;
		// handRankText = "Full House";
	}

	if (get_four_of_kind_cards(hand)) {
		handRank = Hand_Rank.FOUR_OF_KIND;
		// handRankText = "Four of a kind";
	}

	if (isStraighFlush(hand)) {
		handRank = Hand_Rank.STRAIGHT_FLUSH;
		// handRankText = "Straight Flush";
	}

	if (isRoyalFlush(hand)) {
		handRank = Hand_Rank.ROYAL_FLUSH;
		// handRankText = "Royal Flush";
	}

	return {
		rank: handRank,
		player: player,
		highest_value_in_hand: highestValueInHand,
		hand: hand
	};
};

function isRoyalFlush(hand: Card[]): boolean {
	hand = sortCards(hand);
	hand = removeDuplicateValues(hand);

	let hasRoyalFlush = false;
	// check if hand has at least 5 cards
	if (hand.length >= 5) {
		// check if highest card is an ace
		if (hand[0].value == 14) {
			if (hand[4].value == 10) {
				return true;
			}
		}
	}
	return false;
};

function isStraighFlush(hand: Card[]): boolean {
	if (get_straight_cards(hand) && get_flush_cards(hand)) return true;
	return false;
};

function isFourOfKind(hand: Card[]): boolean {
	hand.forEach((card, index) => {
		// for each card check how many other cards their are of this cardValue
		let cardValue = card.value;
		let numOfValue = 0;

		// check against every card in hand
		hand.forEach((otherCard, otherIndex) => {
			if (index != otherIndex) { // ignore counting the same card when we loop over it
				if (cardValue == otherCard.value) {
					numOfValue++;
				}
			}
		});

		if (numOfValue >= 4) return true;
	});

	return false;
};

function isFullHouse(hand: Card[]): boolean {
	if (isPair(hand) && isThreeOfKind(hand)) {

		// check to make sure we have at least two seperate pairs
		// otherwise the three of a kind could just be the same cards as the pair + the 3rd card
		const pairs = findPairs(hand);
		if (pairs.length >= 2) return true;
	} 
	
	return false;
};

function isFlush(hand: Card[]): boolean {
	let count: number = 0;
	let suit: Suit | null = null;
	for (let card of hand) {
		if (card.suit == suit) count++;
		else {
			suit = card.suit;
			count = 1;
		}
	}

	if (count >= 5) return true;
	return false;
};

function isStraight(hand: Card[]): boolean {
	hand = sortCards(hand);
	hand = removeDuplicateValues(hand);

	if (hand.length < 5) return false;

	let numMatches = 0;
	for (let i = 1; i < hand.length; i++) {
		let card = hand[i];
		let prevCard = hand[i - 1];

		if (card.value != prevCard.value - 1) {
			numMatches = 0; // reset to restart the count for a straight
		} 
		else numMatches++;

		if (numMatches == 4) {
			return true;
		}
	}

	return false;
};

function isThreeOfKind(hand: Card[]): boolean {
	for (let card of hand) {
		let count = 1;

		for (let other_card of hand) {
			if (card.id != other_card.id && card.value == other_card.value) count++;
		}

		if (count == 3) return true;
	}

	return false;
};

function isTwoPair(hand: Card[]) {
	let pairs = findPairs(hand);

	if (pairs.length == 2) {
		return true;
	} else {
		return false;
	}
};

function isPair(hand: Card[]): boolean {
	if (findPairs(hand).length > 0) return true;
	return false;
};


function findPairs(hand: Card[]): number[] {
	let pairs: number[] = [];

	hand.forEach((card, index) => {
		hand.forEach((otherCard, otherIndex) => {
			if (card.value == otherCard.value && index != otherIndex) {
				// make sure we haven't already found this match
				if (pairs.length == 0) {
					pairs.push(card.value);
				} else {
					let match = false;
					pairs.forEach((pairCard) => {
						if (card.value == pairCard) {
							match = true;
						}
					});
					if (!match) {
						pairs.push(card.value);
					}
				}
			}
		});
	});

	return pairs;
};


function sortCards(hand: Card[]): Card[] {
	return hand.sort(function (a, b) { return b.value - a.value }); // sort hand by card values, highest to lowest
};

function removeDuplicateValues(hand: Card[]): Card[] {
	// remove any duplicate cards with same values in hand
	const new_hand: Card[] = [];
	for (let card of hand) {
		if (new_hand.length == 0) new_hand.push(card);
		else {
			let is_dupe = false;
			for (let other_card of hand) {
				if (card.value == other_card.value && card.id != other_card.id) is_dupe = true;
			}

			if (!is_dupe) new_hand.push(card);
		}
	}

	return new_hand;
};

function get_cards_with_value(hand: Card[], value: Card_Type): Card[] {
	const cards: Card[] = [];
	for (let card of hand) {
		if (card.value == value) cards.push(card);
	}

	return cards;
}

function get_highest_non_matching_cards(hand: Card[], values: Card_Type[]): Card[] {
	const cards: Card[] = [];
	for (let card of hand) {
		let match: boolean = false;
		for (let value of values) {
			if (card.value == value) match = true;
		}
		if (!match) cards.push(card);
	}
	
	return cards;
}

function get_three_of_kind_cards(hand: Card[]): Card[] | false {
	for (let card of hand) {
		const temp_cards: Card[] = [];

		for (let other_card of hand) {
			if (card.value == other_card.value) temp_cards.push(other_card);
		}

		if (temp_cards.length == 3) {
			return temp_cards;
		}
	}

	return false;
}

function get_straight_cards(hand: Card[]): Card[] | false {
	hand = sortCards(hand);
	hand = removeDuplicateValues(hand);

	if (hand.length < 5) return false;

	let temp_cards: Card[] = [];

	for (let card of hand) {
		if (temp_cards.length == 0) temp_cards.push(card);

		if (card.value == temp_cards[temp_cards.length - 1].value - 1) {
			temp_cards.push(card);
			if (temp_cards.length == 5) return temp_cards;
		}
		else {
			temp_cards = [];
			temp_cards.push(card);
		}
	}

	return false;
}

function get_flush_cards(hand: Card[]): Card[] | false {	
	for (let card of hand) {
		let temp_cards: Card[] = [];
		let suit: Suit = card.suit;

		for (let other_card of hand) {
			if (suit == other_card.suit) {
				temp_cards.push(other_card);
				if (temp_cards.length == 5) return temp_cards;
			}
		}
	}

	return false;
}

function get_full_house_cards(hand: Card[]): Card[] | false {
	let three_of_kind: Card[] = [];
	let pair: Card[] = [];

	
	for (let card of hand) {
		const temp_cards: Card[] = [];
		for (let other_card of hand) {
			if (other_card.value == card.value) temp_cards.push(other_card);
		}
	
		if (temp_cards.length == 3) {
			// check to to see if there are two sets of 3 (this is still a 7 card hand)
			// if so then check to see which on to use as the pair
			if (three_of_kind.length == 0) {
				three_of_kind = temp_cards;
			} else {
				if (temp_cards[0].value > three_of_kind[0].value) {

					pair = three_of_kind.slice(0, 2);
					three_of_kind = temp_cards;
				} else {
					pair = temp_cards.slice(0, 2);
				}
			}
		} else if (temp_cards.length == 2) {
			pair = temp_cards;
		}

		// if (temp_cards.length == 3) three_of_kind = temp_cards;
		// else if (temp_cards.length == 2) pair = temp_cards;
	}

	
	
	console.assert(three_of_kind.length == 3);
	console.assert(pair.length == 2);

	// if (three_of_kind.length != 3) {
	// 	console.log("three of kind is not == to 3");
	// 	console.log(three_of_kind)
	// }
	// if (pair.length != 2) {
	// 	console.log("pair is not == to 2");
	// 	console.log(pair)
	// }

	if (three_of_kind.length == 3 && pair.length == 2) return three_of_kind.concat(pair);

	return false;
}

function get_four_of_kind_cards(hand: Card[]): Card[] | false {
	for (let card of hand) {
		let temp_cards: Card[] = [];

		for (let other_card of hand) {
			if (card.value == other_card.value) temp_cards.push(other_card);
			
			if (temp_cards.length == 4) return temp_cards;
		}
	}

	return false;
}

function get_cards_by_suit(hand: Card[]): Cards_By_Suit {
	const cards: Cards_By_Suit = {
		hearts: [],
		spades: [],
		clubs: [],
		diamonds: []
	}

	for (let card of hand) {
		if (card.suit == Suit.HEARTS) cards.hearts.push(card);
		if (card.suit == Suit.SPADES) cards.spades.push(card);
		if (card.suit == Suit.CLUBS) cards.clubs.push(card);
		if (card.suit == Suit.DIAMONDS) cards.diamonds.push(card);
	}

	return cards;
}

function get_straight_flush_cards(hand: Card[]): Card[] | false {
	const cards: Cards_By_Suit = get_cards_by_suit(hand);

	for (const [key, value] of Object.entries(cards)) {
		if (value.length >= 5) return get_straight_cards(sortCards(value));
	}

	return false;
}

function get_royal_flush_cards(hand: Card[]): Card[] | false {
	const straight_cards = get_straight_cards(hand);
	if (straight_cards && straight_cards[0].value == Card_Type.ACE) {
		return straight_cards;
	}
	return false;
}

// find the best five cards for each hand rank
// each hand can start w/ five to seven cards
// sort the cards by if their being used
export function find_five_best_cards(ranked_hand: Ranked_Hand) {
	console.assert(ranked_hand.hand.length >= 5, "Hand size is less than 5");
	// console.log("starting find_five_used_cards");
	// console.log("hand: ", player.hand);
	// console.log("final_cards: ", player.final_hand_cards);
	
	// let final_cards = player.final_hand_cards;

	/* if we are testing the final cards array is empty, fix??
		so just set it to their hand
	 */
	// if (final_cards.length == 0) {
	// 	final_cards = player.hand;
	// }

	// console.assert(final_cards.length > 0, "Final Cards arr is empty");

	// player.best_cards = [];
	const hand = ranked_hand.hand;
	let best_cards: Card[] = [];

	switch(ranked_hand.rank) {
		case Hand_Rank.HIGH_CARD: {
			best_cards = hand.slice(0, 5);
			break;
		}
		case Hand_Rank.PAIR: {
			const pairs = findPairs(hand);
			const cards_with_value = get_cards_with_value(hand, pairs[0]);
			best_cards.push(...cards_with_value);

			// get remaining 3 best cards in hand
			const hightest_non_matching = get_highest_non_matching_cards(hand, [pairs[0]]);
			best_cards.push(...hightest_non_matching.slice(0, 3));

			break;
		}
		case Hand_Rank.TWO_PAIR: {
			const pairs = findPairs(hand);
			const first_pair_cards: Card[] = get_cards_with_value(hand, pairs[0]);
			best_cards.push(...first_pair_cards);
			const second_pair_cards: Card[] = get_cards_with_value(hand, pairs[1]);
			best_cards.push(...second_pair_cards);

			// add last card
			const hightest_non_matching = get_highest_non_matching_cards(hand, [pairs[0], pairs[1]]);
			best_cards.push(...hightest_non_matching.slice(0, 1));

			break;
		}
		case Hand_Rank.THREE_OF_KIND: {
			const three_of_kind_cards: Card[] | false = get_three_of_kind_cards(hand);
			if (three_of_kind_cards) {
				best_cards.push(...three_of_kind_cards);
				const hightest_non_matching = get_highest_non_matching_cards(hand, [three_of_kind_cards[0].value]);
				best_cards.push(...hightest_non_matching.slice(0, 2));
			}

			break;
		}
		case Hand_Rank.STRAIGHT: {
			const straight_cards: Card[] | false = get_straight_cards(hand);
			if (straight_cards) best_cards.push(...straight_cards);
			break;
		}
		case Hand_Rank.FLUSH: {
			const flush_cards: Card[] | false = get_flush_cards(hand);
			if (flush_cards) best_cards.push(...flush_cards);
			break;
		}
		case Hand_Rank.FULL_HOUSE: {
			const full_house_cards: Card[] | false = get_full_house_cards(hand);
			if (full_house_cards) best_cards.push(...full_house_cards);
			break;
		}
		case Hand_Rank.FOUR_OF_KIND: {
			const four_of_kind_cards: Card[] | false = get_four_of_kind_cards(hand);
			if (four_of_kind_cards) best_cards.push(...four_of_kind_cards);
			const hightest_non_matching = get_highest_non_matching_cards(hand, [four_of_kind_cards[0].value]);
			best_cards.push(...hightest_non_matching.slice(0, 1));
			break;
		}
		case Hand_Rank.STRAIGHT_FLUSH: {
			const straight_flush_cards: Card[] | false = get_straight_flush_cards(hand);
			if (straight_flush_cards) best_cards.push(...straight_flush_cards);
			break;
		}
		case Hand_Rank.ROYAL_FLUSH: {
			const royal_flush_cards: Card[] | false = get_royal_flush_cards(hand);
			if (royal_flush_cards) best_cards.push(...royal_flush_cards);			
			break;
		}
	}

	// console.log("best_cards: ", best_cards)
	ranked_hand.player.best_cards = best_cards;
}

function areWeTestingWithJest() {
    return process.env.JEST_WORKER_ID !== undefined;
}

if (typeof jest !== 'undefined') {
	console.log("jest")
} else {
	window.addEventListener("load", function () {
		console.log("not jest")
		init(); // start
	});
}
