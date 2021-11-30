
export enum Suit {
	HEARTS,
	SPADES,
	CLUBS,
	DIAMONDS
}

export interface Card {
	value: number;
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
	hand_rank: number;
	final_hand_cards: Card[]; // all cards this player could use in their final hand, including community cards
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
	ROYAL_FLUSH
}

export interface Game {
	deck: Card[];
	players: Player[];
	human: Player;
}


export const game: Game = {
	deck: [],
	players: [],
	human: null
};