import { Ranked_Hand, Card, Hand_Rank, Card_Type, Cards_By_Suit, Suit } from "./types";
import { sort_cards, find_pairs, get_cards_with_value, removeDuplicateValues, get_flush_cards, get_four_of_kind_cards } from ".";

// returns true if the new hand is better than the highest ranked hand;
export enum Compare_Result {
	WIN,
	LOSE,
	TIE
};

// WIN = hand_one won
// LOSE = hand_two won


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

function get_singles(cards: Card[]): Card[] {
	const singles: Card[] = [];

	for (const card of cards) {
		let matches = 0;
		for (const other_card of cards) {
			if (card.value == other_card.value && card.id != other_card.id) {
				matches++;
			}
		}
		if (matches == 0) {
			singles.push(card);
		}
	}
	
	sort_cards(singles);

	return singles;
}

export function get_trips(hand: Card[]): number[] {
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

export function get_pairs_exact(hand: Card[]): number[] {
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

export function get_straight_cards(hand: Card[]): Card[] | false {
	hand = sort_cards(hand);
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
		if (value.length >= 5) return get_straight_cards(sort_cards(value));
	}

	return false;
}


// find the best five cards for each hand rank
// each hand can start w/ five to seven cards
// sort the cards by if their being used
export function find_five_best_cards(ranked_hand: Ranked_Hand): Card[] {
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
			const pairs = find_pairs(hand);
			const cards_with_value = get_cards_with_value(hand, pairs[0]);
			best_cards.push(...cards_with_value);

			// get remaining 3 best cards in hand
			const hightest_non_matching = get_highest_non_matching_cards(hand, [pairs[0]]);
			best_cards.push(...hightest_non_matching.slice(0, 3));

			break;
		}
		case Hand_Rank.TWO_PAIR: {
			const pairs = find_pairs(hand);
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
			const trips = get_trips(hand);
			const pair = get_pairs_exact(hand);
			
			for (let card of hand) {
				if (card.value == trips[0]) best_cards.push(card);
			}

			// sometimes in a full house hand there are two trips instead of a trip and a pair
			if (trips.length == 2) {
				for (let card of hand) {
					if (card.value == trips[1] && best_cards.length < 5) best_cards.push(card);
				}
			} else {
				for (let card of hand) {
					if (card.value == pair[0]) best_cards.push(card);
				}
			}

			

			// const full_house_cards: Card[] | false = get_full_house_cards(hand);
			// if (full_house_cards) best_cards.push(...full_house_cards);
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

	return best_cards;
}

function get_royal_flush_cards(hand: Card[]): Card[] | false {
	const straight_cards = get_straight_cards(hand);
	if (straight_cards && straight_cards[0].value == Card_Type.ACE) {
		return straight_cards;
	}
	return false;
}

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

			// console.log("debug two pair v two pair", hand_one_cards, hand_two_cards)

			const hand_one_singles = get_singles(hand_one_cards);
			const hand_two_singles = get_singles(hand_two_cards);

			// console.log("hand one singles: ", hand_one_singles);
			// console.log("hand two singles: ", hand_two_singles);

			if (hand_one_singles[0].value > hand_two_singles[0].value) return Compare_Result.WIN;
			if (hand_one_singles[0].value < hand_two_singles[0].value) return Compare_Result.LOSE;
			
			return Compare_Result.WIN;
			
			// // this doesn't work??
			// if (hand_one_cards[4].value > hand_two_cards[4].value) return Compare_Result.WIN;
			// if (hand_one_cards[4].value < hand_two_cards[4].value) return Compare_Result.LOSE;

			// return Compare_Result.TIE;
		}
		case Hand_Rank.THREE_OF_KIND: {
			// console.log(hand_one_cards, hand_two_cards)
			// console.log(hand_one_pairs, hand_two_pairs)
			if (hand_one_trips[0] > hand_two_trips[0]) return Compare_Result.WIN;
			if (hand_one_trips[0] < hand_two_trips[0]) return Compare_Result.LOSE;

			const hand_one_singles = get_singles(hand_one_cards);
			const hand_two_singles = get_singles(hand_two_cards);

			if (hand_one_singles[0].value > hand_two_singles[0].value) return Compare_Result.WIN;
			if (hand_one_singles[0].value < hand_two_singles[0].value) return Compare_Result.LOSE;
			if (hand_one_singles[1].value > hand_two_singles[1].value) return Compare_Result.WIN;
			if (hand_one_singles[1].value < hand_two_singles[1].value) return Compare_Result.LOSE;

			return Compare_Result.TIE;

			// // this doesn't work??
			// if (hand_one_cards[3].value > hand_two_cards[3].value) return Compare_Result.WIN;
			// if (hand_one_cards[3].value < hand_two_cards[3].value) return Compare_Result.LOSE;

			// return Compare_Result.TIE;
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