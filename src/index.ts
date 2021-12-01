// import { test_func } from './Deck';

// test_func();

import { App, create_ui } from "./UI"
import { Suit, Card, Player, Game, Player_Type, Ranked_Hand, Hand_Rank, game, Card_Type } from "./Game"
import { SimulateHand } from "./Sim_Hand";




// let deck: Card[] = [];
let players: Player[] = [];

let roundOrder: Player[] = [];
let humanPlayer: Player;
let handStatus;
let communityCards: Card[] = [];
let roundBetAmount = 0;
let activePlayer;
let startingPlayerIndex = 0;
let suits = ["spades", "hearts", "clubs", "diamonds"];
let showPrivateCards = false; // whether the ai players cards should be displayed







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
		if (card_value > 14) {
			card_value = 2;
		}

		cards_in_suit++;
		if (cards_in_suit > 13) {
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
		round_bet: 0,
		hand_rank: null,
		final_hand_cards: null,
		highest_value_in_hand: null
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

// function setHumanPlayer() {
// 	// set the global humanPlayer var
// 	humanPlayer = players[0];
// }

function init() {
	console.log("init");
	// addEventListeners();
	// deck = create_deck();
	game.deck = create_deck();
	players = createPlayers();
	game.players = players;
	humanPlayer = players[0];
	game.human = humanPlayer;
	create_ui();
	newHand();
};

function addEventListeners() {
	// add any nessesary event listeners

	// content editable onChange listener for human player bet ammount
	let elem = document.querySelector('.bet_amount');
	elem.addEventListener('keypress', betInputHandler);
};

function newHand() {
	// start a new hand

	resetAllHandData();
	dealHand();
};

function resetAllHandData() {
	// reset all the hand related data at the start of a new hand

	setDefaultHandStatus();
	communityCards = [];
	updateCommunityCardElems();
	//onPhase = "preflop";
};

function dealHand() {

	// deal a new hand

	players.forEach((player) => {
		player.hand = <Card[]>[];
		player.final_hand_cards = <Card[]>[];
		dealCards(player, 2);
	});

	updatePlayerCardElems();
	startBettingRound();
};

function setDefaultHandStatus() {
	handStatus = {
		onPhase: "preflop",
		deal: {
			started: false,
			inProgress: false,
		},
		preflop: {
			started: false,
			inProgress: false,
			bettingComplete: false,
		},
		flop: {
			started: false,
			inProgress: false,
			bettingComplete: false,
		},
		turn: {
			started: false,
			inProgress: false,
			bettingComplete: false,
		},
		river: {
			started: false,
			inProgress: false,
			bettingComplete: false,
		},
		showdown: {
			started: false,
			inProgress: false,
			bettingComplete: false,
		}
	};
};

export function deal_card(deck: Card[]): Card {
	let cardPosInDeck = Math.floor(Math.random() * game.deck.length);
	let card = game.deck[cardPosInDeck];
	deck.splice(cardPosInDeck, 1);
	return card;
}

export function deal_specific_card(deck: Card[], suit: Suit, card_type: Card_Type): Card | false {
	for (let card of deck) {
		if (card.suit == suit && card.value == card_type) return card;
	}
	
	return false;
}

export function dealCards(player: Player, numCardsToDeal: number) {
	let cardsDelt = 0;
	while (cardsDelt < numCardsToDeal) {
		cardsDelt++;
		player.hand.push(deal_card(game.deck));
	}
};

function updatePlayerCardElems() {
	// after dealing update the DOM elems to show the players cards

	players.forEach((player) => {
		let playerElem = document.querySelector("." + player.name);
		let children = Array.from(playerElem.children);

		children.forEach((cardElem) => {
			//log(cardElem)
			if (cardElem.classList.contains("cards")) {
				let cards = Array.from(cardElem.children);
				//log(cards);
				cards.forEach((card) => {
					//log(card);

					// set card1
					if (card.classList.contains("card1")) {
						//cardElem.innerHTML = player.hand[0].cardValue + player.hand[0].suit;

						if (player.name == "player0") {
							getCardImage(card, player.hand[0].value, player.hand[0].suit, false);
						} else {
							// create the card image
							if (showPrivateCards) {
								getCardImage(card, player.hand[0].value, player.hand[0].suit, false);
							} else {
								getBackCard(card);
							}
						}
					}

					// set card2
					if (card.classList.contains("card2")) {
						//cardElem.innerHTML = player.hand[1].cardValue + player.hand[1].suit;

						if (player.name == "player0") {
							getCardImage(card, player.hand[1].value, player.hand[1].suit, false);
						} else {
							// create the card image
							if (showPrivateCards) {
								getCardImage(card, player.hand[1].value, player.hand[1].suit, false);
							} else {
								getBackCard(card);
							}
						}
					}
				});
			}
		});
	});
};

function getBackCard(card: Element) {
	let image = "<img class='card_image' src='./assets/deck/card_back.svg'>";
	card.innerHTML = image;
};

function getCardImage(elem: Element, cardValue: number | string, suit: Suit, isFinalCards: boolean) {

	switch (cardValue) {
		case 14:
			cardValue = "Ace";
			break;
		case 13:
			cardValue = "King";
			break;
		case 12:
			cardValue = "Queen";
			break;
		case 11:
			cardValue = "Jack";
			break;
		default:
			break;
	}

	let suit_str: string;
	switch (suit) {
		case Suit.CLUBS:
			suit_str = "Clubs";
			break;
		case Suit.HEARTS:
			suit_str = "Hearts";
			break;
		case Suit.DIAMONDS:
			suit_str = "Diamonds";
			break;
		case Suit.SPADES:
			suit_str = "Spades";
			break;
	}

	let imageName = cardValue + "_of_" + suit_str + ".svg";

	if (isFinalCards) {
		let image = "<img class='final_card_image' src='./assets/deck/" + imageName + "'>";
		return image;
	} else {
		let image = "<img class='card_image' src='./assets/deck/" + imageName + "'>";
		elem.innerHTML = image;
	}
};

function updateCommunityCards() {
	switch (handStatus.onPhase) {
		case "preflop":
			break;
		case "flop":
			dealCommunityCards(3);
			break;
		case "turn":
			dealCommunityCards(1);
			break;
		case "river":
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
		communityCards.push(card);
		game.deck.splice(cardPosInDeck, 1);
	}
};

function startBettingRound() {
	//log('starting the ' + handStatus.onPhase + " round");
	// starts the round of betting with whichever player is supposed to open the betting

	// player that starts the round of betting
	// this will change based off various things
	let onPlayerIndex = startingPlayerIndex;
	let lastPlayerIndex = onPlayerIndex - 1;
	if (lastPlayerIndex < 0) {
		lastPlayerIndex = players.length - 1;
	}

	let firstPlayerInRound = players[onPlayerIndex];
	let lastPlayerInRound = players[lastPlayerIndex];

	createRoundOrder(onPlayerIndex);

	//log(firstPlayerInRound.name);
	//log(lastPlayerInRound.name);

	// since this is the start of the round the active player is the firstPlayerInRound
	activePlayer = firstPlayerInRound;

	// check if we need to deal out any community cards to start the round
	updateCommunityCards();

	startNextPlayerTurn(activePlayer);

};

function updateCommunityCardElems() {
	// after dealing update the DOM elems to show the community cards

	let communityCardsElem = document.querySelector(".community_cards");
	let communityCardsArr = Array.from(communityCardsElem.children);

	if (communityCards.length == 0) {
		communityCardsArr.forEach((cardElem, index) => {
			cardElem.innerHTML = "";
		});
	} else {
		communityCardsArr.forEach((cardElem, index) => {
			communityCards.forEach((card, i) => {
				if (i == index) {
					// matched the correct elem index to the array of cards index
					//cardElem.innerHTML = card.cardValue + card.suit;
					getCardImage(cardElem, card.value, card.suit, false);
				}
			})
		});
	}
};

function aiTurn(player: Player) {
	// an ai players betting action
	//log('starting ai turn for player ' + player.name);

	// do ai turn logic here

	// what does the ai need to do
	// check if there is a bet, if so decide if ai should call, raise, fold
	// if no be then decide to bet, check/fold
	// we decide these things based of the rankin of the ai hand

	//rankHand(player);

	// attempt to simulate the hand
	let simHand = new SimulateHand(player.hand, communityCards, player, players);


	endTurn(player, false);
};

function humanTurn(player: Player) {
	// the human players betting action
	//log('starting human turn for player ' + player.name);
	toggleBetHumanOptions();
	betOrCall();

};

function betOrCall() {
	// set the player bet/call element to show bet or call depending on if the roundBet is > 0
	// also set the min bet ammount if it is call

	let betElem = document.querySelector(".bet");

	if (roundBetAmount > 0) {
		betElem.innerHTML = "Call";
		setBetAmountToMin();
	} else {
		betElem.innerHTML = "Bet";
	}

};

function setBetAmountToMin() {
	// if there is a round bet already when its the players turn
	// set the betAmount to the min possible to match call
	let betAmountElem = document.querySelector(".bet_amount");
	betAmountElem.innerHTML = roundBetAmount.toString();
};

export function endTurn(player: Player, newBetHasBeenPlaced: boolean) {
	// do end of turn logic here

	if (player.type == Player_Type.HUMAN) {
		toggleBetHumanOptions();
	}

	// if a new bet has been placed then reset the round order
	if (newBetHasBeenPlaced) {
		setNewRoundOrderAfterBet(player);
	} else { // if no new bet then continue the round as normal
		let roundComplete = checkIfRoundComplete(player);

		if (roundComplete) {
			endOfRound();
		} else {
			// if not the end of round then move on to the next player
			let nextPlayer = findNextPlayer(player);
			startNextPlayerTurn(nextPlayer);
		}
	}




};

function checkIfRoundComplete(player: Player): boolean {

	// check if this was the last player in the round

	if (player == roundOrder[roundOrder.length - 1]) {
		//log('last player in roundOrder has ended their turn')
		return true;
	}
	return false;

};

function findNextPlayer(player: Player): Player {
	// find the next player in the round
	let nextPlayer;
	roundOrder.forEach((thisPlayer, index) => {
		if (player == thisPlayer) {
			nextPlayer = roundOrder[index + 1];
		}
	});

	return nextPlayer;

};

function startNextPlayerTurn(player: Player) {
	// console.log("starting next players turn");
	if (player.type == Player_Type.AI) {
		aiTurn(player);
	} else {
		humanTurn(player);
	}
};

function endOfRound() {
	// the current betting round has ended, move on to the next betting round / determine winner

	showPrivateCards = false; // make sure not to show the ai players cards, unless it is end of hand

	switch (handStatus.onPhase) {
		case "preflop":
			//log('preflop phase has ended');
			handStatus.onPhase = "flop";
			startBettingRound();
			break;
		case "flop":
			//log('flop phase has ended');
			handStatus.onPhase = "turn";
			startBettingRound();
			break;
		case "turn":
			//log('turn phase has ended');
			handStatus.onPhase = "river";
			startBettingRound();
			break;
		case "river":
			//log('river phase has ended');
			handStatus.onPhase = "showdown";
			endOfRound(); // immediately move to end of showdown, rank hands 
			//startBettingRound();
			break;
		case "showdown":
			//log('showdown phase has ended and the hand has ended');

			// end of the hand
			showPrivateCards = true;
			updatePlayerCardElems(); // update to show ai cards
			findHandWinner(); // find the winner of the current hand
			toggleDealNewHandButton(); // show the deal new hand btn, allow the player to start the next round

			break;
	}
};

function compareRankedHands(highestRankedHand: Ranked_Hand, rankedHand: Ranked_Hand): boolean {

	// compare the current ranked hand to the highest ranked hand

	// let currentRank = rankedHand.rank;
	// let highestRank = highestRankedHand.rank;
	// let currentHighCard = rankedHand.highest_value_in_hand;
	// let highCard = highestRankedHand.highest_value_in_hand;

	if (!highestRankedHand) {
		return true;
	}

	if (rankedHand.rank > highestRankedHand.rank) {
		return true;
	}

	if (rankedHand.rank == highestRankedHand.rank) { // if we found a tied rank
		if (rankedHand.highest_value_in_hand > highestRankedHand.highest_value_in_hand) {
			return true;
		}

		// if (currentHighCard == highCard) {
		// 	// this only checks if the ranks and the highest card in the hand are tied
		// 	//
		// 	// TODO: THIS DOESNT CHECK FOR DEEP TIES
		// 	//
		// }
	}

	return false;
};

function findHandWinner() {
	let highestRankedHand: Ranked_Hand = {
		rank: null,
		player: null, 
		highest_value_in_hand: null,
		hand: null
	};
	
	// get the hand ranks for each player
	// then compare it to the highest ranked hand in the current hand
	// and see if it is higher and if so set them as new winning player
	players.forEach((player) => {
		let rankedHand = rankHand(player);
		player.hand_rank = rankedHand.rank;
		player.final_hand_cards = rankedHand.hand;
		console.log("Player " + player.id + ": " + Hand_Rank[rankedHand.rank]);

		let isBetterHand = compareRankedHands(highestRankedHand, rankedHand);

		if (isBetterHand) { // if we found a new highest hand, then set it
			highestRankedHand.rank = rankedHand.rank;
			highestRankedHand.player = player;
			highestRankedHand.highest_value_in_hand = rankedHand.highest_value_in_hand;
		}

		displayFinalHand(player);
	});

	

	// check if there is a tie
	//
	//

	let winnerElem = document.querySelector(".winner");
	winnerElem.innerHTML = highestRankedHand.player.name + "wins the hand!";
	console.log(highestRankedHand);

};

function clearFinalHand(player) {
	console.log('test')
	let playerElem = document.querySelector("." + player.name);
	let children = Array.from(playerElem.children);
	children.forEach((child) => {
		if (child.classList.contains("final_hand")) {
			let finalHandElem = child;
			console.log(finalHandElem)
			finalHandElem.innerHTML = "";
		}
	});

};

function displayFinalHand(player: Player) {

	// at then end of a hand update the dom with all active players
	// final hands and ranks

	let playerElem = document.querySelector("." + player.name);
	let children = Array.from(playerElem.children);
	children.forEach((child) => {
		if (child.classList.contains("final_hand")) {
			let finalHandElem = child;
			let finalHandElemChildren = Array.from(finalHandElem.children);

			finalHandElemChildren.forEach((elem, index) => {
				if (index == 0) {
					// set final hand player rank
					elem.innerHTML = "RANK: " + player.hand_rank;
				} else if (index == 1) {
					let finalHandCardsElem = elem;

					// set final player hand, including community cards
					player.final_hand_cards.forEach((card) => {
						let imageElem = getCardImage(elem, card.value, card.suit, true);
						finalHandCardsElem.innerHTML = finalHandCardsElem.innerHTML + imageElem;
					});
				}
			});
		}
	});

};

function toggleDealNewHandButton() {
	let betOptionsElem = document.querySelector(".deal_new_hand_button");
	betOptionsElem.classList.toggle("deal_new_hand_button_hidden");

	let endOfHandElem = document.querySelector(".end_of_hand");
	endOfHandElem.classList.toggle("end_of_hand_show");
};

function dealNewHand() {
	console.log('dealing new hand...');

	dealHand();
	players.forEach((player) => {
		clearFinalHand(player);
	});
	toggleDealNewHandButton();
};

function createRoundOrder(startingIndex) {
	// reorder the players array into the correct order for this betting round

	let start = players.slice(startingIndex);
	let end = players.slice(0, startingIndex);
	roundOrder = start.concat(end);
};

function toggleBetHumanOptions() {
	let betOptionsElem = document.querySelector(".bet_options");
	betOptionsElem.classList.toggle("bet_options_show");
};


function humanBet() {
	//log("human bet");

	// get the amount that was entered for the bet
	let betAmountElem = document.querySelector(".bet_amount");
	let betAmount = parseInt(betAmountElem.innerHTML);

	// only accept the click if the betAmount is > 0 >= roundbetAmount
	if (betAmount > 0 && betAmount >= roundBetAmount) {
		betPlaced(betAmount);
		endTurn(humanPlayer, true);
	} else {
		//log('player tried to bet zero, or less than the roundBetAmount')
	}

};

function humanFold() {
	//log("human fold");

	endTurn(humanPlayer, false);
};

function betInputHandler(e) {
	// handles input from the bet_amount elem

	//log(e);

	// make sure the most recent input is a number and is <= current players money
	if (e.keyCode >= 48 && e.keyCode <= 57) {
		// if entered a number

		// get temp bet amount
		let newInput = e.key;
		let oldBetAmount = e.target.innerHTML;
		let tempBetAmount = oldBetAmount + newInput;

		let validBet = checkValidBet(tempBetAmount);

		// if not a valid bet, adjust it to min or max
		if (!validBet) {
			//log('not a valid bet');

			if (tempBetAmount < roundBetAmount) {
				setBetAmountToMin();
				e.preventDefault(); // prevent newest input if less than minBet
			} else {
				// set to player max bet
				let maxBet = players[0].money;
				//log(maxBet)
				e.target.innerHTML = maxBet;
				e.preventDefault(); // prevent newest input if more than player money
			}
		}
	} else {
		e.preventDefault(); // prevent entering on newest input if not a number
	}

};

function checkValidBet(tempBetAmount) {
	// make sure the human player has entered a valid bet that is <= their money && >= minBet

	if (tempBetAmount <= players[0].money && tempBetAmount > roundBetAmount) {
		return true;
	} else {
		return false;
	}
};

function setToMaxBet() {
	// the amount entered in betAmount was too high, setting to the max possible bet
	//log('setting to max bet');

	let maxBet = players[0].money;
};

function betPlaced(betAmount) {
	//log("bet placed for " + betAmount);
	// a new valid (is this checked???) bet has been placed
	// update the roundBetAmount and restart the round order starting at the bet makers index + 1

	roundBetAmount = betAmount;

	//log("new roundBetAmount: " + roundBetAmount);

	// find the next player and start a new round of betting w/ them
	//let nextPlayer = findNextPlayer(activePlayer);

	// get their index and set it to the startingPlayerIndex
	// this is used for the next round to determine where the betting should start
	// we want betting to start on the last player to bet

	//let nextPlayerIndex = getPlayerRoundIndex(nextPlayer);
	//startingPlayerIndex = nextPlayerIndex;
	//activePlayer = nextPlayer;

	// create the new round order
	//createRoundOrder(startingPlayerIndex);  
	//startNextPlayerTurn(activePlayer);

};

function setNewRoundOrderAfterBet(player) {
	//restart the round order starting at the bet makers index + 1
	//find the next player and start a new round of betting w/ them

	let nextPlayer = findNextPlayer(player);

	// get their index and set it to the startingPlayerIndex
	// this is used for the next round to determine where the betting should start
	// we want betting to start on the last player to bet

	let nextPlayerIndex = getPlayerRoundIndex(nextPlayer);
	startingPlayerIndex = nextPlayerIndex;
	activePlayer = nextPlayer;

	// create the new round order
	createRoundOrder(startingPlayerIndex);

	// since the current player has already bet we need to remove them from the end of the round
	roundOrder = roundOrder.slice(0, roundOrder.length - 1);

	startNextPlayerTurn(activePlayer);
};

function getPlayerRoundIndex(player) {
	// find what round index a player has

	let roundIndex;
	roundOrder.forEach((thisPlayer, index) => {
		if (player == thisPlayer) {
			roundIndex = index;
		}
	});

	return roundIndex;

};

function rankHand(player: Player): Ranked_Hand  {

	let hand: Card[] = player.hand;
	hand = hand.concat(communityCards);

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

	if (isFlush(hand)) {
		handRank = Hand_Rank.FLUSH;
		// handRankText = "Flush";
	}

	if (isFullHouse(hand)) {
		handRank = Hand_Rank.FULL_HOUSE;
		// handRankText = "Full House";
	}

	if (isFourOfKind(hand)) {
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
	if (isStraight(hand) && isFlush(hand)) return true;
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
		const pairs: Card[] = findPairs(hand);
		if (pairs.length >= 2) return true;
	} 
	
	return false;
};

function isFlush(hand: Card[]): boolean {
	for (let i = 0; i < 4; i++) {
		let count = 0;
		for (let card of hand) {
			if (card.suit == i) {
				count++;
			}
		}
		if (count >= 5) return true;
	}

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
	//log('checking if hand is a TwoPair');
	let pairs = findPairs(hand);

	if (pairs.length == 2) {
		//log('player ' + player.name + " has two pairs.");
		return true;
	} else {
		return false;
	}
};

function isPair(hand: Card[]): boolean {
	//log('checking if hand is a Pair');

	// let pairs = findPairs(hand);

	// if (pairs.length >= 1) {
	// 	//log('player ' + player.name + " has one pair.");
	// 	return {
	// 		result: true,
	// 		pairs: pairs
	// 	};
	// } else {
	// 	return {
	// 		result: false,
	// 		pairs: pairs
	// 	};
	// }

	if (findPairs(hand).length > 0) return true;
	return false;
};

function findPairs(hand: Card[]): Card[] {
	let pairs: Card[] = [];

	hand.forEach((card, index) => {
		hand.forEach((otherCard, otherIndex) => {
			if (card.value == otherCard.value && index != otherIndex) {
				// make sure we haven't already found this match
				if (pairs.length == 0) {
					pairs.push(card);
				} else {
					let match = false;
					pairs.forEach((pairCard) => {
						if (card.value == pairCard.value) {
							match = true;
						}
					});
					if (!match) {
						pairs.push(card);
					}
				}
			}
		});
	});

	return pairs;
};

function isHighCard(hand) {
	//log('checking if hand is a HighCard');

	hand = sortCards(hand);
	//log(hand);

};

function sortCards(hand: Card[]): Card[] {
	return hand.sort(function (a, b) { return b.value - a.value }); // sort hand by card values, highest to lowest
};

function removeDuplicateValues(hand: Card[]): Card[] {
	// remove any duplicate cards with same values in hand

	let newHand: Card[] = [];
	hand.forEach((card) => {
		if (newHand.length == 0) {
			newHand.push(card);
		} else {
			let isDupe = false;
			newHand.forEach((newHandCard) => {
				if (card.value == newHandCard.value) {
					isDupe = true;
				}
			});

			if (!isDupe) {
				newHand.push(card);
			}
		}
	});

	return newHand;
};




//let SH = new SimulateHand();

function areWeTestingWithJest() {
    return process.env.JEST_WORKER_ID !== undefined;
}

if (areWeTestingWithJest) {
	console.log("jest")
} else {
	console.log("not jest")
	init(); // start
}
