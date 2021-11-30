(() => {
  // src/jsx.tsx
  var elem = (tag, props, ...children) => {
    if (typeof tag === "function")
      return tag(props, ...children);
    const element = document.createElement(tag);
    Object.entries(props || {}).forEach(([name, value]) => {
      if (name.startsWith("on") && name.toLowerCase() in window)
        element.addEventListener(name.toLowerCase().substr(2), value);
      else
        element.setAttribute(name, value.toString());
    });
    children.forEach((child) => {
      appendChild(element, child);
    });
    return element;
  };
  var appendChild = (parent, child) => {
    if (Array.isArray(child))
      child.forEach((nestedChild) => appendChild(parent, nestedChild));
    else
      parent.appendChild(child.nodeType ? child : document.createTextNode(child));
  };

  // src/Game.ts
  var Suit = /* @__PURE__ */ ((Suit2) => {
    Suit2[Suit2["HEARTS"] = 0] = "HEARTS";
    Suit2[Suit2["SPADES"] = 1] = "SPADES";
    Suit2[Suit2["CLUBS"] = 2] = "CLUBS";
    Suit2[Suit2["DIAMONDS"] = 3] = "DIAMONDS";
    return Suit2;
  })(Suit || {});
  var Player_Type = /* @__PURE__ */ ((Player_Type2) => {
    Player_Type2[Player_Type2["AI"] = 0] = "AI";
    Player_Type2[Player_Type2["HUMAN"] = 1] = "HUMAN";
    return Player_Type2;
  })(Player_Type || {});
  var Hand_Rank = /* @__PURE__ */ ((Hand_Rank2) => {
    Hand_Rank2[Hand_Rank2["HIGH_CARD"] = 0] = "HIGH_CARD";
    Hand_Rank2[Hand_Rank2["PAIR"] = 1] = "PAIR";
    Hand_Rank2[Hand_Rank2["TWO_PAIR"] = 2] = "TWO_PAIR";
    Hand_Rank2[Hand_Rank2["THREE_OF_KIND"] = 3] = "THREE_OF_KIND";
    Hand_Rank2[Hand_Rank2["STRAIGHT"] = 4] = "STRAIGHT";
    Hand_Rank2[Hand_Rank2["FLUSH"] = 5] = "FLUSH";
    Hand_Rank2[Hand_Rank2["FULL_HOUSE"] = 6] = "FULL_HOUSE";
    Hand_Rank2[Hand_Rank2["FOUR_OF_KIND"] = 7] = "FOUR_OF_KIND";
    Hand_Rank2[Hand_Rank2["STRAIGHT_FLUSH"] = 8] = "STRAIGHT_FLUSH";
    Hand_Rank2[Hand_Rank2["ROYAL_FLUSH"] = 9] = "ROYAL_FLUSH";
    return Hand_Rank2;
  })(Hand_Rank || {});
  var game = {
    deck: [],
    players: [],
    human: null
  };

  // src/UI.tsx
  function check_handler() {
    console.log("user checked");
    endTurn(game.human, false);
  }
  function Bet_Area() {
    return /* @__PURE__ */ elem("div", {
      class: "bet_options"
    }, /* @__PURE__ */ elem("div", {
      class: "check bet_button",
      onclick: () => check_handler()
    }, "check"), /* @__PURE__ */ elem("div", {
      class: "bet bet_button"
    }, "bet"), /* @__PURE__ */ elem("div", {
      class: "fold bet_button"
    }, "fold"));
  }
  function App(props) {
    return /* @__PURE__ */ elem("div", null, /* @__PURE__ */ elem(Bet_Area, null));
  }
  function create_ui() {
    document.getElementById("root").appendChild(/* @__PURE__ */ elem(App, {
      name: "foo"
    }));
  }

  // src/Sim_Hand.ts
  var SimulateHand = class {
    constructor(hand, comCards, player, players2) {
      this.hand = hand;
      this.comCards = [...comCards];
      this.players = JSON.parse(JSON.stringify(players2));
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

  // src/index.ts
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
  create_ui();
  function create_deck() {
    let new_deck = [];
    let card_value = 2;
    let current_suit = 0;
    let cards_in_suit = 0;
    for (let i = 0; i < 52; i++) {
      let card = {
        value: card_value,
        suit: current_suit,
        id: i
      };
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
  }
  function createPlayers() {
    let num_players = 6;
    let players2 = [];
    for (let i = 0; i < num_players; i++) {
      let type = Player_Type.AI;
      if (i == 0) {
        type = Player_Type.HUMAN;
      }
      let player = {
        id: i,
        hand: [],
        money: 1e3,
        name: "player" + i,
        type,
        round_bet: 0,
        hand_rank: null,
        final_hand_cards: null,
        highest_value_in_hand: null
      };
      players2.push(player);
    }
    return players2;
  }
  function init() {
    console.log("init");
    deck = create_deck();
    game.deck = deck;
    players = createPlayers();
    game.players = players;
    humanPlayer = players[0];
    game.human = humanPlayer;
    newHand();
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
      player.final_hand_cards = [];
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
                getCardImage(card, player.hand[0].value, player.hand[0].suit, false);
              } else {
                if (showPrivateCards) {
                  getCardImage(card, player.hand[0].value, player.hand[0].suit, false);
                } else {
                  getBackCard(card);
                }
              }
            }
            if (card.classList.contains("card2")) {
              if (player.name == "player0") {
                getCardImage(card, player.hand[1].value, player.hand[1].suit, false);
              } else {
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
  }
  function getBackCard(card) {
    let image = "<img class='card_image' src='./assets/deck/card_back.svg'>";
    card.innerHTML = image;
  }
  function getCardImage(elem2, cardValue, suit, isFinalCards) {
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
    let suit_str;
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
      elem2.innerHTML = image;
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
    let communityCardsArr = Array.from(communityCardsElem.children);
    if (communityCards.length == 0) {
      communityCardsArr.forEach((cardElem, index) => {
        cardElem.innerHTML = "";
      });
    } else {
      communityCardsArr.forEach((cardElem, index) => {
        communityCards.forEach((card, i) => {
          if (i == index) {
            getCardImage(cardElem, card.value, card.suit, false);
          }
        });
      });
    }
  }
  function aiTurn(player) {
    let simHand = new SimulateHand(player.hand, communityCards, player, players);
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
    betAmountElem.innerHTML = roundBetAmount.toString();
  }
  function endTurn(player, newBetHasBeenPlaced) {
    if (player.type == Player_Type.HUMAN) {
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
    console.log("starting next players turn");
    if (player.type == Player_Type.AI) {
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
  function compareRankedHands(highestRankedHand, rankedHand) {
    if (!highestRankedHand) {
      return true;
    }
    if (rankedHand.rank > highestRankedHand.rank) {
      return true;
    }
    if (rankedHand.rank == highestRankedHand.rank) {
      if (rankedHand.highest_value_in_hand > highestRankedHand.highest_value_in_hand) {
        return true;
      }
    }
    return false;
  }
  function findHandWinner() {
    let highestRankedHand = {
      rank: null,
      player: null,
      highest_value_in_hand: null,
      hand: null
    };
    players.forEach((player) => {
      let rankedHand = rankHand(player);
      player.hand_rank = rankedHand.rank;
      player.final_hand_cards = rankedHand.hand;
      let isBetterHand = compareRankedHands(highestRankedHand, rankedHand);
      if (isBetterHand) {
        highestRankedHand.rank = rankedHand.rank;
        highestRankedHand.player = player;
        highestRankedHand.highest_value_in_hand = rankedHand.highest_value_in_hand;
      }
      displayFinalHand(player);
    });
    let winnerElem = document.querySelector(".winner");
    winnerElem.innerHTML = highestRankedHand.player.name + "wins the hand!";
    console.log(highestRankedHand);
  }
  function displayFinalHand(player) {
    let playerElem = document.querySelector("." + player.name);
    let children = Array.from(playerElem.children);
    children.forEach((child) => {
      if (child.classList.contains("final_hand")) {
        let finalHandElem = child;
        let finalHandElemChildren = Array.from(finalHandElem.children);
        finalHandElemChildren.forEach((elem2, index) => {
          if (index == 0) {
            elem2.innerHTML = "RANK: " + player.hand_rank;
          } else if (index == 1) {
            let finalHandCardsElem = elem2;
            player.final_hand_cards.forEach((card) => {
              let imageElem = getCardImage(elem2, card.value, card.suit, true);
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
    let highestValueInHand = hand[0].value;
    let handRank;
    let handRankText;
    if (isPair(hand)) {
      handRank = Hand_Rank.PAIR;
      handRankText = "Pair";
    }
    if (isTwoPair(hand)) {
      handRank = Hand_Rank.TWO_PAIR;
      handRankText = "Two Pair";
    }
    if (isThreeOfKind(hand)) {
      handRank = Hand_Rank.THREE_OF_KIND;
      handRankText = "Three of a kind";
    }
    if (isStraight(hand)) {
      handRank = Hand_Rank.STRAIGHT;
      handRankText = "Straight";
    }
    if (isFlush(hand)) {
      handRank = Hand_Rank.FLUSH;
      handRankText = "Flush";
    }
    if (isFullHouse(hand)) {
      handRank = Hand_Rank.FULL_HOUSE;
      handRankText = "Full House";
    }
    if (isFourOfKind(hand)) {
      handRank = Hand_Rank.FOUR_OF_KIND;
      handRankText = "Four of a kind";
    }
    if (isStraighFlush(hand)) {
      handRank = Hand_Rank.STRAIGHT_FLUSH;
      handRankText = "Straight Flush";
    }
    if (isRoyalFlush(hand)) {
      handRank = Hand_Rank.ROYAL_FLUSH;
      handRankText = "Royal Flush";
    }
    return {
      rank: handRank,
      player,
      highest_value_in_hand: highestValueInHand,
      hand
    };
  }
  function isRoyalFlush(hand) {
    hand = sortCards(hand);
    hand = removeDuplicateValues(hand);
    let hasRoyalFlush = false;
    if (hand.length >= 5) {
      if (hand[0].value == 14) {
        if (hand[4].value == 10) {
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
      let cardValue = card.cardValue;
      let numOfValue = 0;
      hand.forEach((otherCard, otherIndex) => {
        if (index != otherIndex) {
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
  }
  function isFullHouse(hand) {
    let pair = isPair(hand);
    if (pair && isThreeOfKind(hand).hasRank) {
      let sameCards = 0;
      pair.pairs.forEach((value) => {
        if (value == isThreeOfKind(hand).value) {
          sameCards++;
        }
      });
      if (sameCards >= pair.pairs.length) {
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
    let cardValue;
    hand.forEach((card, index) => {
      cardValue = card.cardValue;
      let numOfValue = 1;
      hand.forEach((otherCard, otherIndex) => {
        if (index != otherIndex) {
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
      };
    }
  }
  function isTwoPair(hand) {
    let pairs = findPairs(hand);
    if (pairs.length == 2) {
      return true;
    } else {
      return false;
    }
  }
  function isPair(hand) {
    let pairs = findPairs(hand);
    if (pairs.length >= 1) {
      return {
        result: true,
        pairs
      };
    } else {
      return {
        result: false,
        pairs
      };
    }
  }
  function findPairs(hand) {
    let pairs = [];
    hand.forEach((card, index) => {
      hand.forEach((otherCard, otherIndex) => {
        if (card.cardValue == otherCard.cardValue && index != otherIndex) {
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
      pairs.forEach((pair) => {
      });
    }
    return pairs;
  }
  function sortCards(hand) {
    return hand.sort(function(a, b) {
      return b.value - a.value;
    });
  }
  function removeDuplicateValues(hand) {
    let newHand2 = [];
    hand.forEach((card) => {
      if (newHand2.length == 0) {
        newHand2.push(card);
      } else {
        let isDupe = false;
        newHand2.forEach((newHandCard) => {
          if (card.value == newHandCard.value) {
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
  init();
})();
