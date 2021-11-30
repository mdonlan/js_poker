// import { test_func } from './Deck';

// test_func();

import { App, create_ui } from "./UI"
import { Suit, Card, Player, Game, Player_Type, Ranked_Hand, Hand_Rank, game } from "./Game"

export { } // for ts reasons...




let deck: Card[] = [];
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



create_ui();



function create_deck(): Card[] {
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

function createPlayers(): Player[] {
	let num_players: number = 6;
	let players: Player[] = [];
	for (let i = 0; i < num_players; i++) {
		let type = Player_Type.AI;

		// set the first player created to be the human
		if (i == 0) {
			type = Player_Type.HUMAN;
		}

		let player: Player = {
			id: i,
			hand: [],
			money: 1000,
			name: "player" + i,
			type: type,
			round_bet: 0,
			hand_rank: null,
			final_hand_cards: null,
			highest_value_in_hand: null
		}
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
	deck = create_deck();
	game.deck = deck;
	players = createPlayers();
	game.players = players;
	humanPlayer = players[0];
	game.human = humanPlayer;
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

function dealCards(player: Player, numCardsToDeal: number) {
	let cardsDelt = 0;
	while (cardsDelt < numCardsToDeal) {
		cardsDelt++;
		let cardPosInDeck = Math.floor(Math.random() * deck.length);
		let card = deck[cardPosInDeck];
		player.hand.push(card);
		deck.splice(cardPosInDeck, 1);
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
		let cardPosInDeck = Math.floor(Math.random() * deck.length);
		let card = deck[cardPosInDeck];
		communityCards.push(card);
		deck.splice(cardPosInDeck, 1);
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
	let simHand = new SimulateHand(player.hand, communityCards, player);


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
	console.log("starting next players turn");
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

function findHandWinner() {
	// at the end of the round rank all the hands and find the player with the 
	// highest ranked hand

	

	let highestRankedHand: Ranked_Hand;
	
	// get the hand ranks for each player
	// then compare it to the highest ranked hand in the current hand
	// and see if it is higher and if so set them as new winning player
	players.forEach((player) => {
		console.log(player)
		let rankedHand = rankHand(player);
		player.hand_rank = rankedHand.rank;
		player.final_hand_cards = rankedHand.hand;

		let isBetterHand = compareRankedHands(highestRankedHand, rankedHand);

		if (isBetterHand) { // if we found a new highest hand, then set it
			highestRankedHand.rank = rankedHand.rank;
			highestRankedHand.player = player;
			highestRankedHand.highest_value_in_hand = rankedHand.highest_value_in_hand;
		}

		displayFinalHand(player);
	});

	function compareRankedHands(highestRankedHand, rankedHand) {

		// compare the current ranked hand to the highest ranked hand

		let currentRank = rankedHand.rank;
		let highestRank = highestRankedHand.rank;
		let currentHighCard = rankedHand.highestValueInHand;
		let highCard = highestRankedHand.highestValueInHand;

		if (!highestRank) {
			return true;
		}

		if (currentRank > highestRank) {
			return true;
		}

		if (currentRank == highestRank) { // if we found a tied rank
			if (currentHighCard > highCard) {
				return true;
			}

			if (currentHighCard == highCard) {
				// this only checks if the ranks and the highest card in the hand are tied
				//
				// TODO: THIS DOESNT CHECK FOR DEEP TIES
				//
			}
		}

		return false;

		// if(!highestRankedHand.rank || rankedHand.rank >= highestRankedHand.rank) { 

		//   if(highestRankedHand.rank == rankedHand.rank) { // if same rank check higest cardValue in each hand
		//     if(rankedHand.highestValueInHand > highestRankedHand.highestValueInHand) { // if higher than current highest
		//       highestRankedHand.rank = rankedHand.rank;
		//       highestRankedHand.player = player;
		//     }
		//   } else {
		//     highestRankedHand.rank = rankedHand.rank;
		//     highestRankedHand.player = player;
		//   }
		// }
	};

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

	let highestValueInHand: number = hand[0].value;
	let handRank: Hand_Rank;
	let handRankText: string;

	// hands will be ranked as
	// highcard = 0, pair = 1, two pair = 2, three of kind = 3, straight = 4, flush = 5, fullhouse = 6,
	// four of kind = 7, straight flush = 8, royal flush = 9

	//isHighCard(hand); // is this needed???


	if (isPair(hand)) {
		//log("Player " + player.name + " has a pair.");
		handRank = Hand_Rank.PAIR;
		handRankText = "Pair";
	}

	if (isTwoPair(hand, player)) {
		//log("Player " + player.name + " has a two pair.");
		handRank = Hand_Rank.TWO_PAIR;
		handRankText = "Two Pair";
	}

	if (isThreeOfKind(hand).hasRank) {
		//log("Player " + player.name + " has a three of kind.");
		handRank = Hand_Rank.THREE_OF_KIND;
		handRankText = "Three of a kind";
	}

	if (isStraight(hand)) {
		//log("Player " + player.name + " has a straight.");
		handRank = Hand_Rank.STRAIGHT;
		handRankText = "Straight";
	}

	if (isFlush(hand)) {
		//log("Player " + player.name + " has a flush.");
		handRank = Hand_Rank.FLUSH;
		handRankText = "Flush";
	}

	if (isFullHouse(hand)) {
		//log("Player " + player.name + " has a fullhouse.");
		handRank = Hand_Rank.FULL_HOUSE;
		handRankText = "Full House";
	}

	if (isFourOfKind(hand)) {
		//log("Player " + player.name + " has a four of a kind.");
		//log(hand)
		handRank = Hand_Rank.FOUR_OF_KIND;
		handRankText = "Four of a kind";
	}

	if (isStraighFlush(hand)) {
		//log("Player " + player.name + " has a straight flush.");
		handRank = Hand_Rank.STRAIGHT_FLUSH;
		handRankText = "Straight Flush";
	}

	if (isRoyalFlush(hand)) {
		//log("Player " + player.name + " has a royal straight flush.");
		handRank = Hand_Rank.ROYAL_FLUSH;
		handRankText = "Royal Flush";
	}

	console.log("Player " + player.name + " has a " + handRankText);

	return {
		rank: handRank,
		player: player,
		highest_value_in_hand: highestValueInHand,
		hand: hand
	};
};

function isRoyalFlush(hand) {

	hand = sortCards(hand);
	hand = removeDuplicateValues(hand);
	//log(hand);

	let hasRoyalFlush = false;
	// check if hand has at least 5 cards
	if (hand.length >= 5) {
		// check if highest card is an ace
		if (hand[0].cardValue == 14) {
			if (hand[4].cardValue == 10) {
				hasRoyalFlush = true;
			}
		}

		if (hasRoyalFlush) {
			//log('------------------------');
			//log('has this hand rank');
			//log('------------------------');
			return true;
		} else {
			return false;
		}

	}
};

function isStraighFlush(hand) {
	//log('checking if hand is a StraighFlush');

	//log(isStraight(hand))

	if (isStraight(hand) && isFlush(hand)) {
		return true;
	} else {
		return false;
	}
};

function isFourOfKind(hand) {
	//log('checking if hand is a FourOfKind');

	/*
	let matches;
	hand.forEach((card, index) => {
	  matches = [];
	  hand.forEach((otherCard, otherIndex) => {
		if(card.cardValue == otherCard.cardValue && index != otherIndex) {
		  let matched = true;
		  matches.forEach((matchCard) => {
			//log(card, matchCard);
			if(card == matchCard) {
			  matched = true;
			}
		  });
  
		  if(!matched) {
			matches.push(card);
		  }
		}
	  });
	  });
	*/

	let hasFourOfAKind = false;
	hand.forEach((card, index) => {
		// for each card check how many other cards their are of this cardValue
		let cardValue = card.cardValue;
		let numOfValue = 0;

		// check against every card in hand
		hand.forEach((otherCard, otherIndex) => {
			if (index != otherIndex) { // ignore counting the same card when we loop over it
				if (cardValue == otherCard.cardValue) {
					numOfValue++;
				}
			}
		});

		if (numOfValue >= 4) {
			hasFourOfAKind = true;
		}

	});

	if (hasFourOfAKind) {
		return true;
	} else {
		return false;
	}




	//log(matches.length)

	/*
	if(matches.length >= 4) {
	  return true;
	} else {
	  return false;
	}
	*/
};

function isFullHouse(hand) {
	//log('checking if hand is a FullHouse');
	//log(hand);
	let pair = isPair(hand);
	if (pair && isThreeOfKind(hand).hasRank) {

		let sameCards = 0;
		pair.pairs.forEach((value) => {
			if (value == isThreeOfKind(hand).value) {
				sameCards++;
			}
		});

		if (sameCards >= pair.pairs.length) {
			console.log('using all the same cards')
		}

		return true;
	} else {
		return false;
	}
};

function isFlush(hand) {
	//log('checking if hand is a Flush');

	let foundFlush = false;
	suits.forEach((suit) => {
		let numOfSuit = 0;
		hand.forEach((card) => {
			if (card.suit == suit) {
				//log('found one of current suit')
				numOfSuit++;
			}
		});

		//log(numOfSuit)
		if (numOfSuit >= 5) {
			foundFlush = true;
		}

	});

	if (foundFlush) {
		return true;
	} else {
		return false;
	}
};

function isStraight(hand) {
	//log('checking if hand is a Straight');

	hand = sortCards(hand);
	hand = removeDuplicateValues(hand);

	// check if hand has at least 5 cards
	if (hand.length >= 5) {

		let foundStraight = false;
		let foundStraightMatch = true;
		let numMatches = 0;
		for (let i = 1; i < hand.length; i++) {
			let card = hand[i];
			let prevCard = hand[i - 1];
			//log(hand.length)
			//log(i)
			//log(card.cardValue, prevCard.cardValue)
			if (card.cardValue != prevCard.cardValue - 1) {
				foundStraightMatch = false;
				numMatches = 0; // reset to restart the count for a straight
			} else {
				// if is a straightMatch then
				numMatches++;
			}

			//log(numMatches)
			//log(hand)
			if (numMatches >= 4) {
				foundStraight = true;
			}
		}

		if (foundStraight) {
			return true;
		} else {
			return false;
		}
	}
};

function isThreeOfKind(hand) {
	//log('checking if hand is a ThreeOfKind');

	let hasThreeOfAKind = false;
	let cardValue
	hand.forEach((card, index) => {
		// for each card check how many other cards their are of this cardValue
		cardValue = card.cardValue;
		let numOfValue = 1;

		// check against every card in hand
		hand.forEach((otherCard, otherIndex) => {
			if (index != otherIndex) { // ignore counting the same card when we loop over it
				if (cardValue == otherCard.cardValue) {
					numOfValue++;
				}
			}
		});

		if (numOfValue >= 3) {
			hasThreeOfAKind = true;
		}

	});

	if (hasThreeOfAKind) {
		return {
			hasRank: true,
			value: cardValue
		};
	} else {
		return {
			hasRank: false,
			value: cardValue
		}
	}
};

function isTwoPair(hand, player) {
	//log('checking if hand is a TwoPair');
	let pairs = findPairs(hand);

	if (pairs.length == 2) {
		//log('player ' + player.name + " has two pairs.");
		return true;
	} else {
		return false;
	}
};

function isPair(hand) {
	//log('checking if hand is a Pair');

	let pairs = findPairs(hand);

	if (pairs.length >= 1) {
		//log('player ' + player.name + " has one pair.");
		return {
			result: true,
			pairs: pairs
		};
	} else {
		return {
			result: false,
			pairs: pairs
		};
	}
};

function findPairs(hand) {
	let pairs = [];

	hand.forEach((card, index) => {
		hand.forEach((otherCard, otherIndex) => {
			if (card.cardValue == otherCard.cardValue && index != otherIndex) {
				// make sure we haven't already found this match
				if (pairs.length == 0) {
					pairs.push(card);
				} else {
					let match = false;
					pairs.forEach((pairCard) => {
						if (card.cardValue == pairCard.cardValue) {
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


	if (pairs.length > 0) {
		//log("Player " + player.name + " has a pair(s).");
		pairs.forEach((pair) => {
			//log(pair);
		});
		//log("Player " + player.name + " 's hand:", hand);
	}

	return pairs;
};

function isHighCard(hand) {
	//log('checking if hand is a HighCard');

	hand = sortCards(hand);
	//log(hand);

};

function sortCards(hand) {
	// sort a hand of cards from highest to lowest;
	hand = hand.sort(function (a, b) { return b.cardValue - a.cardValue }); // sort hand by card values, highest to lowest
	return hand;
};

function removeDuplicateValues(hand) {
	// remove any duplicate cards with same values in hand

	let newHand = [];
	hand.forEach((card) => {
		if (newHand.length == 0) {
			newHand.push(card);
		} else {
			let isDupe = false;
			newHand.forEach((newHandCard) => {
				if (card.cardValue == newHandCard.cardValue) {
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


// this class handles simulating a hand
// each time an ai tries to decide if it should stay in the hand
// or fold they will call a new SimulateHand and pass in their cards, and any avaliable community cards
// then they will sim the hand x times too see the outcomes
class SimulateHand {

	public hand;
	public comCards;
	public players;
	public player;
	public deck;


	constructor(hand, comCards, player) {
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

//let SH = new SimulateHand();

init(); // start