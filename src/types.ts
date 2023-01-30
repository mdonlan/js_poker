
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

export interface Card_Info {
	suit: Suit;
	type: Card_Type;
}

export interface Cards_By_Suit {
	hearts: Card[];
	spades: Card[];
	clubs: Card[];
	diamonds: Card[];
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
	// round_bet: number;
	hand_rank: Hand_Rank;
	final_hand_cards: Card[]; // all cards this player could use in their final hand, including community cards
	best_cards: Card[]; // the five cards used out of the seven
	highest_value_in_hand: number;
	amount_bet_this_round: number;
	has_folded: boolean;
}

export interface Ranked_Hand {
	rank: Hand_Rank;
	player: Player;
	highest_value_in_hand: number;
	hand: Card[];
}

export interface Hand_Results {
	winners: Player[];
}

export interface Sim_Result {
	wins: number;
	run_count: number;
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

export interface Blinds {
	small: number;
	big: number;
}

export interface Current_Hand {
	pot: number;
	current_bet: number;
	temp_player_bet: number;
}