import { Card, Suit } from "./types";
import { game } from "./Game";
import { add_log_msg } from "./Log";
import { Hand_Phase, Hand_Rank, } from "./types";
import { updateCommunityCardElems, create_round_order, deal_cards, clear_final_hand, blinds, update_player_ui, start_betting_round} from ".";
import { el } from "./UI";

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

export function deal_new_hand() {
	add_log_msg("Dealing new hand");
	
	game.deck = create_deck();
	game.hand_winners = [];
	game.community_cards = [];
	game.current_hand.pot = 0;
	game.hand_phase = Hand_Phase.PREFLOP;
	
	updateCommunityCardElems();

	create_round_order(0);

	const dealer = game.round_order[game.round_order.length - 3];
	const small_blind = game.round_order[game.round_order.length - 2];
	const big_blind = game.round_order[game.round_order.length - 1];
	const first_to_bet = game.round_order[0];

	add_log_msg("Dealer is " + dealer.name);
	add_log_msg(`Small blind is $${game.blinds.small} to ${small_blind.name}`);
	add_log_msg(`Big blind is $${game.blinds.big} to ${big_blind.name}`);

	// reset each player
	game.players.forEach(player => {
		player.hand = <Card[]>[];
		player.final_hand_cards = <Card[]>[];
		player.hand_rank = Hand_Rank.UNRANKED;
		player.amount_bet_this_round = 0;
		player.best_cards = [];
		player.highest_value_in_hand = 0;
		player.has_folded = false;
		deal_cards(player, 2);

		clear_final_hand(player);
	});
	
	el(".end_of_hand").classList.add("end_of_hand_hide");

	blinds();

	update_player_ui();
	start_betting_round();
};