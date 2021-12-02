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
    Hand_Rank2[Hand_Rank2["UNRANKED"] = 10] = "UNRANKED";
    return Hand_Rank2;
  })(Hand_Rank || {});
  var Card_Type = /* @__PURE__ */ ((Card_Type2) => {
    Card_Type2[Card_Type2["TWO"] = 2] = "TWO";
    Card_Type2[Card_Type2["THREE"] = 3] = "THREE";
    Card_Type2[Card_Type2["FOUR"] = 4] = "FOUR";
    Card_Type2[Card_Type2["FIVE"] = 5] = "FIVE";
    Card_Type2[Card_Type2["SIX"] = 6] = "SIX";
    Card_Type2[Card_Type2["SEVEN"] = 7] = "SEVEN";
    Card_Type2[Card_Type2["EIGHT"] = 8] = "EIGHT";
    Card_Type2[Card_Type2["NINE"] = 9] = "NINE";
    Card_Type2[Card_Type2["TEN"] = 10] = "TEN";
    Card_Type2[Card_Type2["JACK"] = 11] = "JACK";
    Card_Type2[Card_Type2["QUEEN"] = 12] = "QUEEN";
    Card_Type2[Card_Type2["KING"] = 13] = "KING";
    Card_Type2[Card_Type2["ACE"] = 14] = "ACE";
    return Card_Type2;
  })(Card_Type || {});
  var Hand_Phase = /* @__PURE__ */ ((Hand_Phase2) => {
    Hand_Phase2[Hand_Phase2["PREFLOP"] = 0] = "PREFLOP";
    Hand_Phase2[Hand_Phase2["FLOP"] = 1] = "FLOP";
    Hand_Phase2[Hand_Phase2["TURN"] = 2] = "TURN";
    Hand_Phase2[Hand_Phase2["RIVER"] = 3] = "RIVER";
    Hand_Phase2[Hand_Phase2["SHOWDOWN"] = 4] = "SHOWDOWN";
    return Hand_Phase2;
  })(Hand_Phase || {});
  var game = {
    deck: [],
    players: [],
    human: null,
    hand_phase: 0,
    round_current_player_index: 0,
    round_order: [],
    active_player: null
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
    constructor(hand, comCards, player, players) {
      this.hand = hand;
      this.comCards = [...comCards];
      this.players = JSON.parse(JSON.stringify(players));
      this.player = JSON.parse(JSON.stringify(player));
      this.deck = [];
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
  var humanPlayer;
  var communityCards = [];
  var roundBetAmount = 0;
  var showPrivateCards = false;
  function el(query) {
    return document.querySelector(query);
  }
  function child_el(target, query) {
    return target.querySelector(query);
  }
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
      if (card_value == 15) {
        card_value = 2;
      }
      cards_in_suit++;
      if (cards_in_suit == 13) {
        current_suit++;
        cards_in_suit = 0;
      }
    }
    return new_deck;
  }
  function create_player(id, type) {
    let player = {
      id,
      hand: [],
      money: 1e3,
      name: "player" + id,
      type,
      round_bet: 0,
      hand_rank: Hand_Rank.UNRANKED,
      final_hand_cards: [],
      best_cards: [],
      highest_value_in_hand: 0
    };
    return player;
  }
  function createPlayers() {
    let num_players = 6;
    let players = [];
    for (let i = 0; i < num_players; i++) {
      let type = Player_Type.AI;
      if (i == 0) {
        type = Player_Type.HUMAN;
      }
      let player = create_player(i, type);
      players.push(player);
    }
    return players;
  }
  function init() {
    game.deck = create_deck();
    game.players = createPlayers();
    humanPlayer = game.players[0];
    game.human = humanPlayer;
    create_ui();
    newHand();
  }
  function newHand() {
    resetAllHandData();
    dealHand();
  }
  function resetAllHandData() {
    communityCards = [];
    updateCommunityCardElems();
  }
  function dealHand() {
    game.players.forEach((player) => {
      player.hand = [];
      player.final_hand_cards = [];
      if (player.type == Player_Type.HUMAN) {
        player.hand.push(...dev_deal_cards(game.deck, [
          { suit: Suit.HEARTS, type: Card_Type.TWO },
          { suit: Suit.HEARTS, type: Card_Type.THREE },
          { suit: Suit.HEARTS, type: Card_Type.FOUR },
          { suit: Suit.HEARTS, type: Card_Type.FIVE },
          { suit: Suit.HEARTS, type: Card_Type.SIX }
        ]));
      } else {
        dealCards(player, 2);
      }
    });
    updatePlayerCardElems();
    startBettingRound();
  }
  function deal_card(deck) {
    let cardPosInDeck = Math.floor(Math.random() * game.deck.length);
    let card = game.deck[cardPosInDeck];
    deck.splice(cardPosInDeck, 1);
    return card;
  }
  function dev_deal_cards(deck, cards_to_deal) {
    const cards = [];
    for (let card_info of cards_to_deal) {
      for (let card of deck) {
        if (card.suit == card_info.suit && card.value == card_info.type) {
          cards.push(card);
        }
      }
    }
    return cards;
  }
  function dealCards(player, numCardsToDeal) {
    let cardsDelt = 0;
    while (cardsDelt < numCardsToDeal) {
      cardsDelt++;
      player.hand.push(deal_card(game.deck));
    }
  }
  function updatePlayerCardElems() {
    game.players.forEach((player) => {
      let playerElem = document.querySelector("." + player.name);
      let children = [];
      if (playerElem) {
        children = Array.from(playerElem.children);
      }
      children.forEach((cardElem) => {
        if (cardElem.classList.contains("cards")) {
          let cards = Array.from(cardElem.children);
          cards.forEach((card) => {
            if (card.classList.contains("card1")) {
              if (player.name == "player0") {
                card.innerHTML = getCardImage(player.hand[0].value, player.hand[0].suit, false);
              } else {
                if (showPrivateCards) {
                  card.innerHTML = getCardImage(player.hand[0].value, player.hand[0].suit, false);
                } else {
                  getBackCard(card);
                }
              }
            }
            if (card.classList.contains("card2")) {
              if (player.name == "player0") {
                card.innerHTML = getCardImage(player.hand[1].value, player.hand[1].suit, false);
              } else {
                if (showPrivateCards) {
                  card.innerHTML = getCardImage(player.hand[1].value, player.hand[1].suit, false);
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
  function getCardImage(cardValue, suit, isFinalCards) {
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
      return image;
    }
  }
  function updateCommunityCards() {
    switch (game.hand_phase) {
      case Hand_Phase.PREFLOP:
        break;
      case Hand_Phase.FLOP:
        dealCommunityCards(3);
        break;
      case Hand_Phase.TURN:
        dealCommunityCards(1);
        break;
      case Hand_Phase.RIVER:
        dealCommunityCards(1);
        break;
    }
    updateCommunityCardElems();
  }
  function dealCommunityCards(numToDeal) {
    let cardsDelt = 0;
    while (cardsDelt < numToDeal) {
      cardsDelt++;
      let cardPosInDeck = Math.floor(Math.random() * game.deck.length);
      let card = game.deck[cardPosInDeck];
      communityCards.push(card);
      game.deck.splice(cardPosInDeck, 1);
    }
  }
  function startBettingRound() {
    createRoundOrder(0);
    updateCommunityCards();
    startNextPlayerTurn(game.active_player);
  }
  function updateCommunityCardElems() {
    let communityCardsElem = document.querySelector(".community_cards");
    let communityCardsArr = [];
    if (communityCardsElem) {
      communityCardsArr = Array.from(communityCardsElem.children);
    }
    if (communityCards.length == 0) {
      communityCardsArr.forEach((cardElem, index) => {
        cardElem.innerHTML = "";
      });
    } else {
      communityCardsArr.forEach((cardElem, index) => {
        communityCards.forEach((card, i) => {
          if (i == index) {
            cardElem.innerHTML = getCardImage(card.value, card.suit, false);
          }
        });
      });
    }
  }
  function aiTurn(player) {
    let simHand = new SimulateHand(player.hand, communityCards, player, game.players);
    endTurn(player, false);
  }
  function humanTurn(player) {
    toggleBetHumanOptions();
    betOrCall();
  }
  function betOrCall() {
    let betElem = document.querySelector(".bet");
    if (betElem) {
      if (roundBetAmount > 0) {
        betElem.innerHTML = "Call";
        setBetAmountToMin();
      } else {
        betElem.innerHTML = "Bet";
      }
    }
  }
  function setBetAmountToMin() {
    let betAmountElem = document.querySelector(".bet_amount");
    if (betAmountElem) {
      betAmountElem.innerHTML = roundBetAmount.toString();
    }
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
        const next_player = findNextPlayer();
        startNextPlayerTurn(next_player);
      }
    }
  }
  function checkIfRoundComplete(player) {
    if (player == game.round_order[game.round_order.length - 1]) {
      return true;
    }
    return false;
  }
  function findNextPlayer() {
    game.round_current_player_index++;
    const next_player = game.round_order[game.round_current_player_index];
    return next_player;
  }
  function startNextPlayerTurn(player) {
    if (player.type == Player_Type.AI) {
      aiTurn(player);
    } else {
      humanTurn(player);
    }
  }
  function endOfRound() {
    showPrivateCards = false;
    switch (game.hand_phase) {
      case Hand_Phase.PREFLOP:
        game.hand_phase = Hand_Phase.FLOP;
        startBettingRound();
        break;
      case Hand_Phase.FLOP:
        game.hand_phase = Hand_Phase.TURN;
        startBettingRound();
        break;
      case Hand_Phase.TURN:
        game.hand_phase = Hand_Phase.RIVER;
        startBettingRound();
        break;
      case Hand_Phase.RIVER:
        game.hand_phase = Hand_Phase.SHOWDOWN;
        endOfRound();
        break;
      case Hand_Phase.SHOWDOWN:
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
    let highestRankedHand = rankHand(game.players[0]);
    game.players.forEach((player) => {
      let rankedHand = rankHand(player);
      player.hand_rank = rankedHand.rank;
      player.final_hand_cards = rankedHand.hand;
      if (highestRankedHand == void 0)
        highestRankedHand = rankedHand;
      else {
        let isBetterHand = compareRankedHands(highestRankedHand, rankedHand);
        if (isBetterHand)
          highestRankedHand = rankedHand;
      }
      find_five_used_cards(player);
      displayFinalHand(player);
    });
    let winnerElem = document.querySelector(".winner");
    if (winnerElem) {
      winnerElem.innerHTML = highestRankedHand.player.name + "wins the hand!";
    }
  }
  function displayFinalHand(player) {
    const player_el = el(`.${player.name}`);
    const hand_rank_el = child_el(player_el, ".hand_rank");
    hand_rank_el.innerHTML = "Rank: " + Hand_Rank[player.hand_rank];
    const final_cards_el = child_el(player_el, ".final_hand_cards");
    for (let card of player.final_hand_cards) {
      let imageElem = getCardImage(card.value, card.suit, true);
      final_cards_el.innerHTML += imageElem;
    }
    const best_cards_el = child_el(player_el, ".best_cards");
    for (let card of player.best_cards) {
      let imageElem = getCardImage(card.value, card.suit, true);
      best_cards_el.innerHTML += imageElem;
    }
  }
  function toggleDealNewHandButton() {
    let betOptionsElem = document.querySelector(".deal_new_hand_button");
    if (betOptionsElem) {
      betOptionsElem.classList.toggle("deal_new_hand_button_hidden");
    }
    let endOfHandElem = document.querySelector(".end_of_hand");
    if (endOfHandElem) {
      endOfHandElem.classList.toggle("end_of_hand_show");
    }
  }
  function createRoundOrder(startingIndex) {
    let start = game.players.slice(startingIndex);
    let end = game.players.slice(0, startingIndex);
    game.round_order = start.concat(end);
    game.round_current_player_index = 0;
    game.active_player = game.round_order[0];
  }
  function toggleBetHumanOptions() {
    let betOptionsElem = document.querySelector(".bet_options");
    if (betOptionsElem) {
      betOptionsElem.classList.toggle("bet_options_show");
    }
  }
  function setNewRoundOrderAfterBet(player) {
    let nextPlayer = findNextPlayer();
    let nextPlayerIndex = getPlayerRoundIndex(nextPlayer);
    createRoundOrder(nextPlayerIndex);
    game.round_order = game.round_order.slice(0, game.round_order.length - 1);
    startNextPlayerTurn(game.active_player);
  }
  function getPlayerRoundIndex(player) {
    let index = 0;
    for (let i = 0; i < game.round_order.length; i++) {
      if (game.round_order[i].id == player.id)
        return i;
    }
    return index;
  }
  function rankHand(player) {
    let hand = player.hand;
    hand = hand.concat(communityCards);
    let highestValueInHand = 0;
    let handRank = Hand_Rank.HIGH_CARD;
    if (isPair(hand)) {
      handRank = Hand_Rank.PAIR;
    }
    if (isTwoPair(hand)) {
      handRank = Hand_Rank.TWO_PAIR;
    }
    if (isThreeOfKind(hand)) {
      handRank = Hand_Rank.THREE_OF_KIND;
    }
    if (isStraight(hand)) {
      handRank = Hand_Rank.STRAIGHT;
    }
    if (get_flush_cards(hand)) {
      handRank = Hand_Rank.FLUSH;
    }
    if (isFullHouse(hand)) {
      handRank = Hand_Rank.FULL_HOUSE;
    }
    if (get_four_of_kind_cards(hand)) {
      handRank = Hand_Rank.FOUR_OF_KIND;
    }
    if (isStraighFlush(hand)) {
      handRank = Hand_Rank.STRAIGHT_FLUSH;
    }
    if (isRoyalFlush(hand)) {
      handRank = Hand_Rank.ROYAL_FLUSH;
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
          return true;
        }
      }
    }
    return false;
  }
  function isStraighFlush(hand) {
    if (get_straight_cards(hand) && get_flush_cards(hand))
      return true;
    return false;
  }
  function isFullHouse(hand) {
    if (isPair(hand) && isThreeOfKind(hand)) {
      const pairs = findPairs(hand);
      if (pairs.length >= 2)
        return true;
    }
    return false;
  }
  function isStraight(hand) {
    hand = sortCards(hand);
    hand = removeDuplicateValues(hand);
    if (hand.length < 5)
      return false;
    let numMatches = 0;
    for (let i = 1; i < hand.length; i++) {
      let card = hand[i];
      let prevCard = hand[i - 1];
      if (card.value != prevCard.value - 1) {
        numMatches = 0;
      } else
        numMatches++;
      if (numMatches == 4) {
        return true;
      }
    }
    return false;
  }
  function isThreeOfKind(hand) {
    for (let card of hand) {
      let count = 1;
      for (let other_card of hand) {
        if (card.id != other_card.id && card.value == other_card.value)
          count++;
      }
      if (count == 3)
        return true;
    }
    return false;
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
    if (findPairs(hand).length > 0)
      return true;
    return false;
  }
  function findPairs(hand) {
    let pairs = [];
    hand.forEach((card, index) => {
      hand.forEach((otherCard, otherIndex) => {
        if (card.value == otherCard.value && index != otherIndex) {
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
  function get_cards_with_value(hand, value) {
    const cards = [];
    for (let card of hand) {
      if (card.value == value)
        cards.push(card);
    }
    return cards;
  }
  function get_highest_non_matching_cards(hand, values) {
    const cards = [];
    for (let card of hand) {
      let match = false;
      for (let value of values) {
        if (card.value == value)
          match = true;
      }
      if (!match)
        cards.push(card);
    }
    return cards;
  }
  function get_three_of_kind_cards(hand) {
    for (let card of hand) {
      const temp_cards = [];
      for (let other_card of hand) {
        if (card.value == other_card.value)
          temp_cards.push(other_card);
      }
      if (temp_cards.length == 3) {
        return temp_cards;
      }
    }
    return false;
  }
  function get_straight_cards(hand) {
    hand = sortCards(hand);
    hand = removeDuplicateValues(hand);
    if (hand.length < 5)
      return false;
    let temp_cards = [];
    for (let card of hand) {
      if (temp_cards.length == 0)
        temp_cards.push(card);
      if (card.value == temp_cards[temp_cards.length - 1].value - 1) {
        temp_cards.push(card);
        if (temp_cards.length == 5)
          return temp_cards;
      } else {
        temp_cards = [];
        temp_cards.push(card);
      }
    }
    return false;
  }
  function get_flush_cards(hand) {
    for (let card of hand) {
      let temp_cards = [];
      let suit = card.suit;
      for (let other_card of hand) {
        if (suit == other_card.suit) {
          temp_cards.push(other_card);
          if (temp_cards.length == 5)
            return temp_cards;
        }
      }
    }
    return false;
  }
  function get_full_house_cards(hand) {
    let three_of_kind = [];
    let pair = [];
    for (let card of hand) {
      const temp_cards = [];
      for (let other_card of hand) {
        if (other_card.value == card.value)
          temp_cards.push(other_card);
      }
      if (temp_cards.length == 3)
        three_of_kind = temp_cards;
      else if (temp_cards.length == 2)
        pair = temp_cards;
    }
    if (three_of_kind.length == 3 && pair.length == 2)
      return three_of_kind.concat(pair);
    return false;
  }
  function get_four_of_kind_cards(hand) {
    for (let card of hand) {
      let temp_cards = [];
      for (let other_card of hand) {
        if (card.value == other_card.value)
          temp_cards.push(other_card);
        if (temp_cards.length == 4)
          return temp_cards;
      }
    }
    return false;
  }
  function get_cards_by_suit(hand) {
    const cards = {
      hearts: [],
      spades: [],
      clubs: [],
      diamonds: []
    };
    for (let card of hand) {
      if (card.suit == Suit.HEARTS)
        cards.hearts.push(card);
      if (card.suit == Suit.SPADES)
        cards.spades.push(card);
      if (card.suit == Suit.CLUBS)
        cards.clubs.push(card);
      if (card.suit == Suit.DIAMONDS)
        cards.diamonds.push(card);
    }
    return cards;
  }
  function get_straight_flush_cards(hand) {
    const cards = get_cards_by_suit(hand);
    for (const [key, value] of Object.entries(cards)) {
      if (value.length >= 5)
        return get_straight_cards(sortCards(value));
    }
    return false;
  }
  function find_five_used_cards(player) {
    let final_cards = player.final_hand_cards;
    switch (player.hand_rank) {
      case Hand_Rank.HIGH_CARD: {
        player.best_cards = final_cards.slice(0, 5);
        break;
      }
      case Hand_Rank.PAIR: {
        const pairs = findPairs(final_cards);
        const cards_with_value = get_cards_with_value(final_cards, pairs[0].value);
        player.best_cards.push(...cards_with_value);
        const hightest_non_matching = get_highest_non_matching_cards(final_cards, [pairs[0].value]);
        player.best_cards.push(...hightest_non_matching.slice(0, 3));
        break;
      }
      case Hand_Rank.TWO_PAIR: {
        const pairs = findPairs(final_cards);
        const first_pair_cards = get_cards_with_value(final_cards, pairs[0].value);
        player.best_cards.push(...first_pair_cards);
        const second_pair_cards = get_cards_with_value(final_cards, pairs[1].value);
        player.best_cards.push(...second_pair_cards);
        const hightest_non_matching = get_highest_non_matching_cards(final_cards, [pairs[0].value, pairs[1].value]);
        player.best_cards.push(...hightest_non_matching.slice(0, 1));
        break;
      }
      case Hand_Rank.THREE_OF_KIND: {
        const three_of_kind_cards = get_three_of_kind_cards(final_cards);
        if (three_of_kind_cards) {
          player.best_cards.push(...three_of_kind_cards);
          const hightest_non_matching = get_highest_non_matching_cards(final_cards, [three_of_kind_cards[0].value]);
          player.best_cards.push(...hightest_non_matching.slice(0, 2));
        }
        break;
      }
      case Hand_Rank.STRAIGHT: {
        const straight_cards = get_straight_cards(final_cards);
        if (straight_cards) {
          player.best_cards.push(...straight_cards);
        }
        break;
      }
      case Hand_Rank.FLUSH: {
        const flush_cards = get_flush_cards(final_cards);
        if (flush_cards) {
          player.best_cards.push(...flush_cards);
        }
        break;
      }
      case Hand_Rank.FULL_HOUSE: {
        const full_house_cards = get_full_house_cards(final_cards);
        if (full_house_cards) {
          player.best_cards.push(...full_house_cards);
        }
        break;
      }
      case Hand_Rank.FOUR_OF_KIND: {
        const four_of_kind_cards = get_four_of_kind_cards(final_cards);
        if (four_of_kind_cards) {
          player.best_cards.push(...four_of_kind_cards);
        }
        break;
      }
      case Hand_Rank.STRAIGHT_FLUSH: {
        const straight_flush_cards = get_straight_flush_cards(final_cards);
        if (straight_flush_cards) {
          player.best_cards.push(...straight_flush_cards);
        }
        break;
      }
    }
  }
  if (typeof jest !== "undefined") {
    console.log("jest");
  } else {
    console.log("not jest");
    init();
  }
})();
