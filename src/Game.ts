import { Card, Player, Hand_Phase, Player_Type, Hand_Rank } from "./types";

export interface Game {
	deck: Card[];
	community_cards: Card[];
	players: Player[];
	human_player: Player | null;
	hand_phase: Hand_Phase;
	round_current_player_index: number;
	active_player: Player | null;
	round_order: Player[];
	hand_winners: Player[];
	blinds: Blinds;
	current_hand: Current_Hand;
	is_sim_game: boolean;
	dev_do_next_turn: boolean;
}

export const game: Game = {
	deck: [],
	community_cards: [],
	players: [],
	hand_phase: Hand_Phase.PREFLOP,
	round_current_player_index: 0,
	// round_start_player_index: 0,
	round_order: [],
	active_player: null,
	hand_winners: [],
	// dealer_index: 0,
	blinds: {small: 5, big: 10},
	current_hand: {pot: 0, current_bet: 0, temp_player_bet: 0},
	human_player: null,
	is_sim_game: false,
	dev_do_next_turn: false
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

export function create_players(): Player[] {
	let num_players: number = 6;
	let players: Player[] = [];
	for (let i = 0; i < num_players; i++) {
		let type = Player_Type.AI;

		if (i == 0) type = Player_Type.HUMAN;

		let player: Player = create_player(i, type);
		players.push(player);
	}

	return players;
};