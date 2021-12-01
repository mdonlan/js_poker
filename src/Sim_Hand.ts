// this class handles simulating a hand
// each time an ai tries to decide if it should stay in the hand
// or fold they will call a new SimulateHand and pass in their cards, and any avaliable community cards
// then they will sim the hand x times too see the outcomes

import { Card, Player } from "./Game";
import { create_deck } from ".";

export class SimulateHand { 
	public hand;
	public comCards;
	public players;
	public player;
	public deck;


	constructor(hand: Card[], comCards: Card[], player: Player, players: Player[]) {
		this.hand = hand;
		this.comCards = [...comCards];
		this.players = JSON.parse(JSON.stringify(players));
		this.player = JSON.parse(JSON.stringify(player));

		this.startSim();
	}

	startSim() {
		// start a new simulation of a hand
		this.setDeck();
		this.dealRestOfCommunityCards();
		this.dealOtherPlayers();
		this.dealRestOfHand();
		this.rankHands();
	}

	setDeck() {
		// set the deck to have all cards, except for the cards the current ai has and the comCards
		this.deck = create_deck();
		let usedCards = this.hand.concat(this.comCards);
		let used = this.hand;

		let sortedDeck = [];
		for (let i = 0; i < this.deck.length; i++) {
			let card = this.deck[i];
			let matched = false;
			for (let j = 0; j < used.length; j++) {
				let usedCard = used[j];

				if (card.id == usedCard.id) {
					matched = true;
				}
			}
			if (!matched) {
				sortedDeck.push(card);
			}
		}
		this.deck = sortedDeck;
	};

	dealRestOfCommunityCards() {
		// deal out the rest of the community cards 

		while (this.comCards.length < 5) {
			//log("dealing new com card");
			let index = Math.floor(Math.random() * this.deck.length);
			let card = this.deck[index];
			this.comCards.push(card);
			this.deck.splice(index, 1);
		}
	};

	dealOtherPlayers() {
		// deal all the other players random cards
		// first reset their hands

		this.players.forEach((player) => {
			player.hand = [];

			while (player.hand.length < 2) {
				player.hand.push(this.dealSingleCard());
			}
		});
	};

	dealSingleCard() {
		// returns a single card from the deck
		// card is also removed from the deck
		let index = Math.floor(Math.random() * this.deck.length);
		let card = this.deck[index];
		this.deck.splice(index, 1);
		return card;

	};

	dealRestOfHand() {
		// once everything else is setup deal out the rest of the community cards
		while (this.comCards.length < 5) {
			this.comCards.push(this.dealSingleCard());
		}
	};

	rankHands() {
		// rank all the players and find who has the best hand
		// eval winner
	};
};