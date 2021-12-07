

export enum Suit {
	HEARTS,
	SPADES,
	CLUBS,
	DIAMONDS
}

export interface Card {
	value: Card_Type;
	suit: Suit;
	id: number;
}

export enum Player_Type {
	AI,
	HUMAN
}

export interface Player {
	id: number; // formally -> 'num'
	hand: Card[];
	money: number;
	name: string;
	type: Player_Type;
	round_bet: number;
	hand_rank: Hand_Rank;
	final_hand_cards: Card[]; // all cards this player could use in their final hand, including community cards
	best_cards: Card[]; // the five cards used out of the seven
	highest_value_in_hand: number;
}

export interface Ranked_Hand {
	rank: Hand_Rank;
	player: Player;
	highest_value_in_hand: number;
	hand: Card[];
}

export enum Hand_Rank {
	HIGH_CARD,
	PAIR,
	TWO_PAIR,
	THREE_OF_KIND,
	STRAIGHT,
	FLUSH,
	FULL_HOUSE,
	FOUR_OF_KIND,
	STRAIGHT_FLUSH,
	ROYAL_FLUSH,
	UNRANKED
}

export enum Card_Type {
    TWO = 2,
    THREE,
    FOUR,
    FIVE,
    SIX,
    SEVEN,
    EIGHT,
    NINE,
    TEN,
    JACK,
    QUEEN,
    KING,
    ACE
}

export enum Hand_Phase {
	PREFLOP,
	FLOP,
	TURN,
	RIVER,
	SHOWDOWN
}


// export interface Phase {
// 	started: boolean;
// 	in_progress: boolean,
// 	betting_complete: false
// }

// export interface Hand_Status {
// 	on_phase: Hand_Phase,
// 	deal: Phase;
// 	preflop: Phase;
// 	flop: Phase,
// 	turn: Phase,
// 	river: Phase,
// 	showdown: Phase
// }

interface Blinds {
	small: number;
	big: number;
}

interface Current_Hand {
	pot: number;
	current_bet: number;
}

export interface Game {
	deck: Card[];
	players: Player[];
	human: Player | null;
	hand_phase: Hand_Phase;
	round_current_player_index: number;
	// round_start_player_index: number;
	active_player: Player | null;
	round_order: Player[];
	hand_winner: Player | null;
	dealer: number;
	blinds: Blinds;
	current_hand: Current_Hand;
}

export const game: Game = {
	deck: [],
	players: [],
	human: null,
	hand_phase: Hand_Phase.PREFLOP,
	round_current_player_index: 0,
	// round_start_player_index: 0,
	round_order: [],
	active_player: null,
	hand_winner: null,
	dealer: 0,
	blinds: {small: 5, big: 10},
	current_hand: {pot: 0, current_bet: 0}
};