(() => {
  // src/index.js
  var deck = [];
  var players = [];
  var roundOrder = [];
  var humanPlayer;
  var handStatus;
  var communityCards = [];
  var roundBetAmount = 0;
  var activePlayer;
  var startingPlayerIndex = 0;
  var suits = ["spades", "hearts", "clubs", "diamonds"];
  var showPrivateCards = false;
  var log = console.log;
  function createDeck() {
    let deck2 = [];
    let cardValue2 = 2;
    let onSuit = 0;
    let cardsInSuit = 0;
    for (let i = 0; i < 52; i++) {
      let card = {
        cardValue: cardValue2,
        suit: suits[onSuit],
        id: i
      };
      deck2.push(card);
      cardValue2++;
      if (cardValue2 > 14) {
        cardValue2 = 2;
      }
      cardsInSuit++;
      if (cardsInSuit > 13) {
        onSuit++;
        cardsInSuit = 0;
      }
    }
    return deck2;
  }
  function createPlayers() {
    let numPlayers = 6;
    for (let i = 0; i < numPlayers; i++) {
      let type = "ai";
      if (i == 0) {
        type = "human";
      }
      let player = {
        num: i,
        hand: [],
        money: 1e3,
        name: "player" + i,
        type,
        roundBet: 0,
        rank: null,
        finalHand: null,
        highestValueInHand: null
      };
      players.push(player);
    }
    setHumanPlayer();
  }
  function setHumanPlayer() {
    humanPlayer = players[0];
  }
  function init() {
    addEventListeners();
    deck = createDeck();
    createPlayers();
    newHand();
  }
  function addEventListeners() {
    let elem = document.querySelector(".bet_amount");
    elem.addEventListener("keypress", betInputHandler);
  }
  function newHand() {
    resetAllHandData();
    dealHand();
  }
  function resetAllHandData() {
    setDefaultHandStatus();
    communityCards = [];
    updateCommunityCardElems();
  }
  function dealHand() {
    players.forEach((player) => {
      player.hand = [];
      player.finalHand = [];
      dealCards(player, 2);
    });
    updatePlayerCardElems();
    startBettingRound();
  }
  function setDefaultHandStatus() {
    handStatus = {
      onPhase: "preflop",
      deal: {
        started: false,
        inProgress: false
      },
      preflop: {
        started: false,
        inProgress: false,
        bettingComplete: false
      },
      flop: {
        started: false,
        inProgress: false,
        bettingComplete: false
      },
      turn: {
        started: false,
        inProgress: false,
        bettingComplete: false
      },
      river: {
        started: false,
        inProgress: false,
        bettingComplete: false
      },
      showdown: {
        started: false,
        inProgress: false,
        bettingComplete: false
      }
    };
  }
  function dealCards(player, numCardsToDeal) {
    let cardsDelt = 0;
    while (cardsDelt < numCardsToDeal) {
      cardsDelt++;
      let cardPosInDeck = Math.floor(Math.random() * deck.length);
      let card = deck[cardPosInDeck];
      player.hand.push(card);
      deck.splice(cardPosInDeck, 1);
    }
  }
  function updatePlayerCardElems() {
    players.forEach((player) => {
      let playerElem = document.querySelector("." + player.name);
      let children = Array.from(playerElem.children);
      children.forEach((cardElem) => {
        if (cardElem.classList.contains("cards")) {
          let cards = Array.from(cardElem.children);
          cards.forEach((card) => {
            if (card.classList.contains("card1")) {
              if (player.name == "player0") {
                getCardImage(card, player.hand[0].cardValue, player.hand[0].suit);
              } else {
                if (showPrivateCards) {
                  getCardImage(card, player.hand[0].cardValue, player.hand[0].suit);
                } else {
                  getBackCard(card);
                }
              }
            }
            if (card.classList.contains("card2")) {
              if (player.name == "player0") {
                getCardImage(card, player.hand[1].cardValue, player.hand[1].suit);
              } else {
                if (showPrivateCards) {
                  getCardImage(card, player.hand[1].cardValue, player.hand[1].suit);
                } else {
                  getBackCard(card);
                }
              }
            }
          });
        }
      });
    });
  }
  function getBackCard(card) {
    let image = "<img class='card_image' src='./assets/deck/card_back.svg'>";
    card.innerHTML = image;
  }
  function getCardImage(elem, cardValue2, suit, isFinalCards) {
    switch (cardValue2) {
      case 14:
        cardValue2 = "Ace";
        break;
      case 13:
        cardValue2 = "King";
        break;
      case 12:
        cardValue2 = "Queen";
        break;
      case 11:
        cardValue2 = "Jack";
        break;
      default:
        break;
    }
    let imageName = cardValue2 + "_of_" + suit + ".svg";
    if (isFinalCards) {
      let image = "<img class='final_card_image' src='./assets/deck/" + imageName + "'>";
      return image;
    } else {
      let image = "<img class='card_image' src='./assets/deck/" + imageName + "'>";
      elem.innerHTML = image;
    }
  }
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
  }
  function dealCommunityCards(numToDeal) {
    let cardsDelt = 0;
    while (cardsDelt < numToDeal) {
      cardsDelt++;
      let cardPosInDeck = Math.floor(Math.random() * deck.length);
      let card = deck[cardPosInDeck];
      communityCards.push(card);
      deck.splice(cardPosInDeck, 1);
    }
  }
  function startBettingRound() {
    let onPlayerIndex = startingPlayerIndex;
    let lastPlayerIndex = onPlayerIndex - 1;
    if (lastPlayerIndex < 0) {
      lastPlayerIndex = players.length - 1;
    }
    let firstPlayerInRound = players[onPlayerIndex];
    let lastPlayerInRound = players[lastPlayerIndex];
    createRoundOrder(onPlayerIndex);
    activePlayer = firstPlayerInRound;
    updateCommunityCards();
    startNextPlayerTurn(activePlayer);
  }
  function updateCommunityCardElems() {
    let communityCardsElem = document.querySelector(".community_cards");
    communityCardsArr = Array.from(communityCardsElem.children);
    if (communityCards.length == 0) {
      communityCardsArr.forEach((cardElem, index) => {
        cardElem.innerHTML = "";
      });
    } else {
      communityCardsArr.forEach((cardElem, index) => {
        communityCards.forEach((card, i) => {
          if (i == index) {
            getCardImage(cardElem, card.cardValue, card.suit);
          }
        });
      });
    }
  }
  function aiTurn(player) {
    let simHand = new SimulateHand(player.hand, communityCards, player);
    endTurn(player, false);
  }
  function humanTurn(player) {
    toggleBetHumanOptions();
    betOrCall();
  }
  function betOrCall() {
    let betElem = document.querySelector(".bet");
    if (roundBetAmount > 0) {
      betElem.innerHTML = "Call";
      setBetAmountToMin();
    } else {
      betElem.innerHTML = "Bet";
    }
  }
  function setBetAmountToMin() {
    let betAmountElem = document.querySelector(".bet_amount");
    betAmountElem.innerHTML = roundBetAmount;
  }
  function endTurn(player, newBetHasBeenPlaced) {
    if (player.type == "human") {
      toggleBetHumanOptions();
    }
    if (newBetHasBeenPlaced) {
      setNewRoundOrderAfterBet(player);
    } else {
      let roundComplete = checkIfRoundComplete(player);
      if (roundComplete) {
        endOfRound();
      } else {
        let nextPlayer = findNextPlayer(player);
        startNextPlayerTurn(nextPlayer);
      }
    }
  }
  function checkIfRoundComplete(player) {
    if (player == roundOrder[roundOrder.length - 1]) {
      return true;
    }
    return false;
  }
  function findNextPlayer(player) {
    let nextPlayer;
    roundOrder.forEach((thisPlayer, index) => {
      if (player == thisPlayer) {
        nextPlayer = roundOrder[index + 1];
      }
    });
    return nextPlayer;
  }
  function startNextPlayerTurn(player) {
    if (player.type == "ai") {
      aiTurn(player);
    } else {
      humanTurn(player);
    }
  }
  function endOfRound() {
    showPrivateCards = false;
    switch (handStatus.onPhase) {
      case "preflop":
        handStatus.onPhase = "flop";
        startBettingRound();
        break;
      case "flop":
        handStatus.onPhase = "turn";
        startBettingRound();
        break;
      case "turn":
        handStatus.onPhase = "river";
        startBettingRound();
        break;
      case "river":
        handStatus.onPhase = "showdown";
        endOfRound();
        break;
      case "showdown":
        showPrivateCards = true;
        updatePlayerCardElems();
        findHandWinner();
        toggleDealNewHandButton();
        break;
    }
  }
  function findHandWinner() {
    let highestRankedHand = {
      rank: null,
      player: null,
      highestValueInHand: null
    };
    players.forEach((player) => {
      let rankedHand = rankHand(player);
      player.rank = rankedHand.rank;
      player.finalHand = rankedHand.hand;
      let isBetterHand = compareRankedHands(highestRankedHand, rankedHand);
      if (isBetterHand) {
        highestRankedHand.rank = rankedHand.rank;
        highestRankedHand.player = player;
        highestRankedHand.highestValueInHand = rankedHand.highestValueInHand;
      }
      displayFinalHand(player);
    });
    function compareRankedHands(highestRankedHand2, rankedHand) {
      let currentRank = rankedHand.rank;
      let highestRank = highestRankedHand2.rank;
      let currentHighCard = rankedHand.highestValueInHand;
      let highCard = highestRankedHand2.highestValueInHand;
      if (!highestRank) {
        return true;
      }
      if (currentRank > highestRank) {
        return true;
      }
      if (currentRank == highestRank) {
        if (currentHighCard > highCard) {
          return true;
        }
        if (currentHighCard == highCard) {
        }
      }
      return false;
    }
    ;
    let winnerElem = document.querySelector(".winner");
    winnerElem.innerHTML = highestRankedHand.player.name + "wins the hand!";
    log(highestRankedHand);
  }
  function displayFinalHand(player) {
    let playerElem = document.querySelector("." + player.name);
    let children = Array.from(playerElem.children);
    children.forEach((child) => {
      if (child.classList.contains("final_hand")) {
        let finalHandElem = child;
        finalHandElemChildren = Array.from(finalHandElem.children);
        finalHandElemChildren.forEach((elem, index) => {
          if (index == 0) {
            elem.innerHTML = "RANK: " + player.rank;
          } else if (index == 1) {
            let finalHandCardsElem = elem;
            player.finalHand.forEach((card) => {
              let imageElem = getCardImage(card, card.cardValue, card.suit, true);
              finalHandCardsElem.innerHTML = finalHandCardsElem.innerHTML + imageElem;
            });
          }
        });
      }
    });
  }
  function toggleDealNewHandButton() {
    let betOptionsElem = document.querySelector(".deal_new_hand_button");
    betOptionsElem.classList.toggle("deal_new_hand_button_hidden");
    let endOfHandElem = document.querySelector(".end_of_hand");
    endOfHandElem.classList.toggle("end_of_hand_show");
  }
  function createRoundOrder(startingIndex) {
    let start = players.slice(startingIndex);
    let end = players.slice(0, startingIndex);
    roundOrder = start.concat(end);
  }
  function toggleBetHumanOptions() {
    let betOptionsElem = document.querySelector(".bet_options");
    betOptionsElem.classList.toggle("bet_options_show");
  }
  function betInputHandler(e) {
    if (e.keyCode >= 48 && e.keyCode <= 57) {
      let newInput = e.key;
      let oldBetAmount = e.target.innerHTML;
      let tempBetAmount = oldBetAmount + newInput;
      let validBet = checkValidBet(tempBetAmount);
      if (!validBet) {
        if (tempBetAmount < roundBetAmount) {
          setBetAmountToMin();
          e.preventDefault();
        } else {
          let maxBet = players[0].money;
          e.target.innerHTML = maxBet;
          e.preventDefault();
        }
      }
    } else {
      e.preventDefault();
    }
  }
  function checkValidBet(tempBetAmount) {
    if (tempBetAmount <= players[0].money && tempBetAmount > roundBetAmount) {
      return true;
    } else {
      return false;
    }
  }
  function setNewRoundOrderAfterBet(player) {
    let nextPlayer = findNextPlayer(player);
    let nextPlayerIndex = getPlayerRoundIndex(nextPlayer);
    startingPlayerIndex = nextPlayerIndex;
    activePlayer = nextPlayer;
    createRoundOrder(startingPlayerIndex);
    roundOrder = roundOrder.slice(0, roundOrder.length - 1);
    startNextPlayerTurn(activePlayer);
  }
  function getPlayerRoundIndex(player) {
    let roundIndex;
    roundOrder.forEach((thisPlayer, index) => {
      if (player == thisPlayer) {
        roundIndex = index;
      }
    });
    return roundIndex;
  }
  function rankHand(player) {
    let hand = player.hand;
    hand = hand.concat(communityCards);
    let highestValueInHand = hand[0].cardValue;
    let handRank = 0;
    let handRankText = "High Card";
    if (isPair(hand, player)) {
      handRank = 1;
      handRankText = "Pair";
    }
    if (isTwoPair(hand, player)) {
      handRank = 2;
      handRankText = "Two Pair";
    }
    if (isThreeOfKind(hand).hasRank) {
      handRank = 3;
      handRankText = "Three of a kind";
    }
    if (isStraight(hand)) {
      handRank = 4;
      handRankText = "Straight";
    }
    if (isFlush(hand)) {
      handRank = 5;
      handRankText = "Flush";
    }
    if (isFullHouse(hand)) {
      handRank = 6;
      handRankText = "Full House";
    }
    if (isFourOfKind(hand)) {
      handRank = 7;
      handRankText = "Four of a kind";
    }
    if (isStraighFlush(hand)) {
      handRank = 8;
      handRankText = "Straight Flush";
    }
    if (isRoyalFlush(hand)) {
      handRank = 9;
      handRankText = "Royal Flush";
    }
    log("Player " + player.name + " has a " + handRankText);
    return {
      rank: handRank,
      hand,
      highestValueInHand
    };
  }
  function isRoyalFlush(hand) {
    hand = sortCards(hand);
    hand = removeDuplicateValues(hand);
    let hasRoyalFlush = false;
    if (hand.length >= 5) {
      if (hand[0].cardValue == 14) {
        if (hand[4].cardValue == 10) {
          hasRoyalFlush = true;
        }
      }
      if (hasRoyalFlush) {
        return true;
      } else {
        return false;
      }
    }
  }
  function isStraighFlush(hand) {
    if (isStraight(hand) && isFlush(hand)) {
      return true;
    } else {
      return false;
    }
  }
  function isFourOfKind(hand) {
    let hasFourOfAKind = false;
    hand.forEach((card, index) => {
      let cardValue2 = card.cardValue;
      let numOfValue = 0;
      hand.forEach((otherCard, otherIndex) => {
        if (index != otherIndex) {
          if (cardValue2 == otherCard.cardValue) {
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
  }
  function isFullHouse(hand) {
    let pair = isPair(hand);
    if (pair && isThreeOfKind(hand).hasRank) {
      let sameCards = 0;
      pair.forEach((value) => {
        if (value == isThreeOfKind().value) {
          sameCards++;
        }
      });
      if (sameCards >= pairs.length) {
        console.log("using all the same cards");
      }
      return true;
    } else {
      return false;
    }
  }
  function isFlush(hand) {
    let foundFlush = false;
    suits.forEach((suit) => {
      let numOfSuit = 0;
      hand.forEach((card) => {
        if (card.suit == suit) {
          numOfSuit++;
        }
      });
      if (numOfSuit >= 5) {
        foundFlush = true;
      }
    });
    if (foundFlush) {
      return true;
    } else {
      return false;
    }
  }
  function isStraight(hand) {
    hand = sortCards(hand);
    hand = removeDuplicateValues(hand);
    if (hand.length >= 5) {
      let foundStraight = false;
      let foundStraightMatch = true;
      let numMatches = 0;
      for (let i = 1; i < hand.length; i++) {
        let card = hand[i];
        let prevCard = hand[i - 1];
        if (card.cardValue != prevCard.cardValue - 1) {
          foundStraightMatch = false;
          numMatches = 0;
        } else {
          numMatches++;
        }
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
  }
  function isThreeOfKind(hand) {
    let hasThreeOfAKind = false;
    hand.forEach((card, index) => {
      let cardValue2 = card.cardValue;
      let numOfValue = 1;
      hand.forEach((otherCard, otherIndex) => {
        if (index != otherIndex) {
          if (cardValue2 == otherCard.cardValue) {
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
      return false;
    }
  }
  function isTwoPair(hand, player) {
    let pairs2 = findPairs(hand, player);
    if (pairs2.length == 2) {
      return true;
    } else {
      return false;
    }
  }
  function isPair(hand, player) {
    let pairs2 = findPairs(hand, player);
    if (pairs2.length >= 1) {
      return {
        result: true,
        pairs: pairs2
      };
    } else {
      return false;
    }
  }
  function findPairs(hand, player) {
    let pairs2 = [];
    hand.forEach((card, index) => {
      hand.forEach((otherCard, otherIndex) => {
        if (card.cardValue == otherCard.cardValue && index != otherIndex) {
          if (pairs2.length == 0) {
            pairs2.push(card);
          } else {
            let match = false;
            pairs2.forEach((pairCard) => {
              if (card.cardValue == pairCard.cardValue) {
                match = true;
              }
            });
            if (!match) {
              pairs2.push(card);
            }
          }
        }
      });
    });
    if (pairs2.length > 0) {
      pairs2.forEach((pair) => {
      });
    }
    return pairs2;
  }
  function sortCards(hand) {
    hand = hand.sort(function(a, b) {
      return b.cardValue - a.cardValue;
    });
    return hand;
  }
  function removeDuplicateValues(hand) {
    let newHand2 = [];
    hand.forEach((card) => {
      if (newHand2.length == 0) {
        newHand2.push(card);
      } else {
        let isDupe = false;
        newHand2.forEach((newHandCard) => {
          if (card.cardValue == newHandCard.cardValue) {
            isDupe = true;
          }
        });
        if (!isDupe) {
          newHand2.push(card);
        }
      }
    });
    return newHand2;
  }
  var SimulateHand = class {
    constructor(hand, comCards, player) {
      this.hand = hand;
      this.comCards = [...comCards];
      this.players = JSON.parse(JSON.stringify(players));
      this.player = JSON.parse(JSON.stringify(player));
      this.startSim();
    }
    startSim() {
      this.setDeck();
      this.dealRestOfCommunityCards();
      this.dealOtherPlayers();
      this.dealRestOfHand();
      this.rankHands();
    }
    setDeck() {
      this.deck = createDeck();
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
    }
    dealRestOfCommunityCards() {
      while (this.comCards.length < 5) {
        let index = Math.floor(Math.random() * this.deck.length);
        let card = this.deck[index];
        this.comCards.push(card);
        this.deck.splice(index, 1);
      }
    }
    dealOtherPlayers() {
      this.players.forEach((player) => {
        player.hand = [];
        while (player.hand.length < 2) {
          player.hand.push(this.dealSingleCard());
        }
      });
    }
    dealSingleCard() {
      let index = Math.floor(Math.random() * this.deck.length);
      let card = this.deck[index];
      this.deck.splice(index, 1);
      return card;
    }
    dealRestOfHand() {
      while (this.comCards.length < 5) {
        this.comCards.push(this.dealSingleCard());
      }
    }
    rankHands() {
    }
  };
  init();
})();
