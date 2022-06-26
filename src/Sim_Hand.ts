// this class handles simulating a hand
// each time an ai tries to decide if it should stay in the hand
// or fold they will call a new SimulateHand and pass in their cards, and any avaliable community cards
// then they will sim the hand x times too see the outcomes

import { Card, Game, Player, Sim_Result } from "./Game";
import { create_deck, find_hand_winner } from ".";

export class Sim_Hand { 
	// public hand: Card[];
	// public comCards: Card[];
	// public players: Player[];
	// public player: Player;
	// public deck: Card[];
	public game: Game;
	public base_game_copy: Game; // don't change the data in here, we use to reset the sim
	public player: Player;
	public base_player_copy: Player;

	public run_count: number = 0; 
	public wins: number = 0;

	public results: Sim_Result;

	constructor(game: Game, player: Player) {
		// this.hand = hand;
		// this.comCards = [...comCards];
		// this.players = JSON.parse(JSON.stringify(players));
		// this.player = JSON.parse(JSON.stringify(player));
		// this.deck = [];
		this.game = JSON.parse(JSON.stringify(game));
		this.game.is_sim_game = true;

		this.base_game_copy = JSON.parse(JSON.stringify(this.game));

		this.player = JSON.parse(JSON.stringify(player));
		this.base_player_copy = JSON.parse(JSON.stringify(player));

		

		this.startSim();

		this.results = {
			wins: this.wins,
			run_count: this.run_count
		}
	}

	startSim() {
		// start a new simulation of a hand
		for (let i = 0; i < 10; i++) {
			this.set_deck();
			this.deal_rest_of_com_cards();
			this.deal_other_players();
			this.deal_rest_of_hand();
			this.get_winner();
			this.reset();
		}
	}

	reset() {
		this.game = JSON.parse(JSON.stringify(this.base_game_copy));
		this.player = JSON.parse(JSON.stringify(this.base_player_copy));
	}

	set_deck() {
		// set the deck to have all cards, except for the cards the current ai has and the comCards
		this.game.deck = create_deck();
		let usedCards = this.player.hand.concat(this.game.community_cards);
		let used = this.player.hand;

		let sortedDeck = [];
		for (let i = 0; i < this.game.deck.length; i++) {
			let card = this.game.deck[i];
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
		this.game.deck = sortedDeck;
	};

	deal_rest_of_com_cards() {
		// deal out the rest of the community cards 

		while (this.game.community_cards.length < 5) {
			//log("dealing new com card");
			let index = Math.floor(Math.random() * this.game.deck.length);
			let card = this.game.deck[index];
			this.game.community_cards.push(card);
			this.game.deck.splice(index, 1);
		}
	};

	deal_other_players() {
		// deal all the other players random cards
		// first reset their hands

		this.game.players.forEach((player) => {
			player.hand = [];

			while (player.hand.length < 2) {
				player.hand.push(this.deal_card());
			}
		});
	};

	deal_card() {
		let index = Math.floor(Math.random() * this.game.deck.length);
		let card = this.game.deck[index];
		this.game.deck.splice(index, 1);
		return card;
	};

	deal_rest_of_hand() {
		// once everything else is setup deal out the rest of the community cards
		while (this.game.community_cards.length < 5) {
			this.game.community_cards.push(this.deal_card());
		}
	};

	get_winner() {
		// rank all the players and find who has the best hand
		// eval winner
		const results = find_hand_winner(this.game);
		if (results.winner.id == this.player.id) {
			this.wins++;
		}
		this.run_count++;
	};
};