(() => {
  // src/Game.ts
  var Suit = /* @__PURE__ */ ((Suit2) => {
    Suit2[Suit2["HEARTS"] = 0] = "HEARTS";
    Suit2[Suit2["SPADES"] = 1] = "SPADES";
    Suit2[Suit2["CLUBS"] = 2] = "CLUBS";
    Suit2[Suit2["DIAMONDS"] = 3] = "DIAMONDS";
    return Suit2;
  })(Suit || {});
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
  var game = {
    deck: [],
    community_cards: [],
    players: [],
    hand_phase: 0 /* PREFLOP */,
    round_current_player_index: 0,
    round_order: [],
    active_player: null,
    hand_winners: [],
    blinds: { small: 5, big: 10 },
    current_hand: { pot: 0, current_bet: 0, temp_player_bet: 0 },
    human_player: null,
    is_sim_game: false,
    dev_do_next_turn: false
  };

  // src/Sim_Hand.ts
  var Sim_Hand = class {
    constructor(game2, player) {
      this.run_count = 0;
      this.wins = 0;
      this.game = JSON.parse(JSON.stringify(game2));
      this.game.is_sim_game = true;
      this.base_game_copy = JSON.parse(JSON.stringify(this.game));
      this.player = JSON.parse(JSON.stringify(player));
      this.base_player_copy = JSON.parse(JSON.stringify(player));
      this.startSim();
      this.results = {
        wins: this.wins,
        run_count: this.run_count
      };
    }
    startSim() {
      for (let i = 0; i < 100; i++) {
        this.set_deck();
        this.deal_rest_of_com_cards();
        this.deal_other_players();
        this.get_winner();
        this.reset();
      }
    }
    reset() {
      this.game = JSON.parse(JSON.stringify(this.base_game_copy));
      this.player = JSON.parse(JSON.stringify(this.base_player_copy));
    }
    set_deck() {
      this.game.deck = create_deck();
      let usedCards = this.player.hand.concat(this.game.community_cards);
      let sortedDeck = [];
      for (let i = 0; i < this.game.deck.length; i++) {
        let card = this.game.deck[i];
        let matched = false;
        for (let j = 0; j < usedCards.length; j++) {
          let usedCard = usedCards[j];
          if (card.id == usedCard.id) {
            matched = true;
          }
        }
        if (!matched) {
          sortedDeck.push(card);
        }
      }
      this.game.deck = sortedDeck;
    }
    deal_rest_of_com_cards() {
      while (this.game.community_cards.length < 5) {
        let index = Math.floor(Math.random() * this.game.deck.length);
        let card = this.game.deck[index];
        this.game.community_cards.push(card);
        this.game.deck.splice(index, 1);
      }
    }
    deal_other_players() {
      this.game.players.forEach((player) => {
        if (player.id != this.player.id) {
          player.hand = [];
          while (player.hand.length < 2) {
            player.hand.push(this.deal_card());
          }
        }
      });
    }
    deal_card() {
      let index = Math.floor(Math.random() * this.game.deck.length);
      let card = this.game.deck[index];
      this.game.deck.splice(index, 1);
      return card;
    }
    get_winner() {
      const results = find_hand_winner(this.game);
      for (let _player of results.winners) {
        if (_player.id == this.player.id) {
          this.wins++;
        }
      }
      this.run_count++;
    }
  };

  // src/Log.ts
  var log_messages_elem = document.querySelector(".log_messages");
  function add_log_msg(message) {
  }

  // src/UI.tsx
  function el(query) {
    return document.querySelector(query);
  }
  function child_el(target, query) {
    return target.querySelector(query);
  }

  // src/index.ts
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
      hand_rank: 10 /* UNRANKED */,
      final_hand_cards: [],
      best_cards: [],
      highest_value_in_hand: 0,
      amount_bet_this_round: 0,
      has_folded: false
    };
    return player;
  }
  function createPlayers() {
    let num_players = 6;
    let players = [];
    for (let i = 0; i < num_players; i++) {
      let type = 0 /* AI */;
      if (i == 0)
        type = 1 /* HUMAN */;
      let player = create_player(i, type);
      players.push(player);
    }
    return players;
  }
  function init() {
    if (game.dev_do_next_turn) {
      const next_el = document.createElement("div");
      next_el.innerHTML = "DO NEXT TURN";
      next_el.className = "do_next_turn";
      next_el.addEventListener("click", () => {
        console.log("doing next turn");
        if (game.active_player.id == 0)
          return;
        start_turn(game.active_player, true);
      });
      const game_el = document.querySelector(".game");
      game_el.appendChild(next_el);
    }
    addEventListeners();
    game.deck = create_deck();
    game.players = createPlayers();
    game.human_player = game.players[0];
    deal_new_hand();
  }
  function addEventListeners() {
    el(".deal_new_hand_button").addEventListener("click", deal_new_hand);
    el(".check").addEventListener("click", () => {
      end_turn(game.human_player, false);
    });
    el(".fold").addEventListener("click", () => {
      fold(game.human_player);
    });
    const bet_range_el = el(".bet_range");
    bet_range_el.addEventListener("input", (e) => {
      el(".bet_amount").innerHTML = bet_range_el.value;
      if (parseInt(bet_range_el.value) == game.current_hand.current_bet) {
        el(".call").classList.remove("hide");
      } else {
        el(".call").classList.add("hide");
      }
    });
    el(".bet").addEventListener("click", () => {
      humanBet();
    });
    el(".call").addEventListener("click", () => {
      call_bet(game.human_player);
      end_turn(game.human_player, false);
    });
  }
  function deal_new_hand() {
    add_log_msg("Dealing new hand");
    game.deck = create_deck();
    game.hand_winners = [];
    game.community_cards = [];
    game.current_hand.pot = 0;
    game.hand_phase = 0 /* PREFLOP */;
    updateCommunityCardElems();
    createRoundOrder(0);
    const dealer = game.round_order[game.round_order.length - 3];
    const small_blind = game.round_order[game.round_order.length - 2];
    const big_blind = game.round_order[game.round_order.length - 1];
    const first_to_bet = game.round_order[0];
    add_log_msg("Dealer is " + dealer.name);
    add_log_msg(`Small blind is $${game.blinds.small} to ${small_blind.name}`);
    add_log_msg(`Big blind is $${game.blinds.big} to ${big_blind.name}`);
    game.players.forEach((player) => {
      player.hand = [];
      player.final_hand_cards = [];
      player.hand_rank = 10 /* UNRANKED */;
      player.amount_bet_this_round = 0;
      player.best_cards = [];
      player.highest_value_in_hand = 0;
      player.has_folded = false;
      dealCards(player, 2);
      clear_final_hand(player);
    });
    el(".end_of_hand").classList.add("end_of_hand_hide");
    blinds();
    update_player_ui();
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
  function update_player_ui() {
    document.querySelectorAll(".card").forEach((e) => e.innerHTML = "");
    for (let player of game.players) {
      let player_el = el(`.${player.name}`);
      let cards_el = child_el(player_el, ".cards");
      let money_el = child_el(player_el, ".player_money");
      let amount_bet_el = child_el(player_el, ".amount_bet");
      money_el.innerHTML = player.money.toString();
      amount_bet_el.innerHTML = player.amount_bet_this_round.toString();
      for (let card of Array.from(cards_el.children)) {
        if (game.hand_winners.length > 0 || player.id == 0) {
          if (player.has_folded)
            card.innerHTML = "";
          else if (card.classList.contains("card1"))
            card.innerHTML = getCardImage(player.hand[0].value, player.hand[0].suit, false);
          else if (card.classList.contains("card2"))
            card.innerHTML = getCardImage(player.hand[1].value, player.hand[1].suit, false);
        } else {
          if (player.has_folded)
            card.innerHTML = "";
          else if (card.classList.contains("card1"))
            card.innerHTML = card_back();
          else if (card.classList.contains("card2"))
            card.innerHTML = card_back();
        }
      }
    }
  }
  function card_back() {
    return "<img class='card_image' src='./assets/deck/card_back.svg'>";
  }
  function getCardImage(card_value, suit, is_final_cards) {
    let value = card_value > 10 ? Card_Type[card_value] : card_value;
    let imageName = value + "_of_" + Suit[suit] + ".svg";
    imageName = imageName.toLowerCase();
    if (is_final_cards) {
      let image = "<img class='final_card_image' src='./assets/deck/" + imageName + "'>";
      return image;
    } else {
      let image = "<img class='card_image' src='./assets/deck/" + imageName + "'>";
      return image;
    }
  }
  function updateCommunityCards() {
    switch (game.hand_phase) {
      case 0 /* PREFLOP */:
        break;
      case 1 /* FLOP */:
        dealCommunityCards(3);
        break;
      case 2 /* TURN */:
        dealCommunityCards(1);
        break;
      case 3 /* RIVER */:
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
      game.community_cards.push(card);
      game.deck.splice(cardPosInDeck, 1);
    }
  }
  function startBettingRound() {
    add_log_msg("Starting new betting round");
    game.round_current_player_index = 0;
    game.active_player = game.round_order[game.round_current_player_index];
    if (game.hand_phase != 0 /* PREFLOP */) {
      console.log("reseting current bet and player bets");
      game.current_hand.current_bet = 0;
      game.current_hand.temp_player_bet = 0;
      game.players.forEach((player) => {
        player.amount_bet_this_round = 0;
      });
    }
    updateCommunityCards();
    let current_rank_el = document.querySelector(".player0").querySelector(".current_rank");
    current_rank_el.innerHTML = Hand_Rank[rankHand(game.human_player, game.community_cards).rank];
    start_turn(game.active_player);
  }
  function updateCommunityCardElems() {
    const community_cards_el = el(".community_cards");
    community_cards_el.innerHTML = "";
    for (let card of game.community_cards) {
      community_cards_el.innerHTML += `<div class="community_card">${getCardImage(card.value, card.suit, false)}</div>`;
    }
  }
  function call_bet(player) {
    const amount = game.current_hand.current_bet - player.amount_bet_this_round;
    add_log_msg(`${player.name} calls with $${amount}`);
    add_money_to_pot(player, amount);
  }
  function place_bet(player, amount) {
    add_log_msg(`${player.name} places best of $${amount}`);
    add_money_to_pot(player, amount - player.amount_bet_this_round);
    const amount_to_increase = amount - game.current_hand.current_bet;
    game.current_hand.current_bet += amount_to_increase;
    setNewRoundOrderAfterBet(player);
  }
  function aiTurn(player) {
    add_log_msg("Starting ai_turn for " + player.name);
    setTimeout(() => {
      let sim_hand = new Sim_Hand(game, player);
      const win_percent = sim_hand.results.wins / sim_hand.results.run_count * 100;
      console.log("win %: " + win_percent);
      add_log_msg(`AI analysis: Win %: ${win_percent}`);
      const amount_owed = game.current_hand.current_bet - player.amount_bet_this_round;
      console.log("amount_owed: " + amount_owed);
      let percent_willing_to_bet = 0;
      if (win_percent > 80) {
        percent_willing_to_bet = 1;
      } else if (win_percent > 60) {
        percent_willing_to_bet = 0.5;
      } else if (win_percent > 50) {
        percent_willing_to_bet = 0.4;
      } else if (win_percent > 40) {
        percent_willing_to_bet = 0.3;
      } else if (win_percent > 30) {
        percent_willing_to_bet = 0.2;
      } else if (win_percent > 20) {
        percent_willing_to_bet = 0.1;
      } else if (win_percent > 10) {
        percent_willing_to_bet = 0.05;
      } else if (win_percent > 5) {
        percent_willing_to_bet = 0.02;
      }
      console.log("percent willing to bet: " + percent_willing_to_bet);
      const willing_to_bet = player.money * percent_willing_to_bet - player.amount_bet_this_round;
      console.log("willing_to_bet: " + willing_to_bet);
      let wants_to_place_bet = false;
      if (Math.floor(Math.random() * 100) > 50) {
        wants_to_place_bet = true;
      }
      if (willing_to_bet - amount_owed < 50) {
        wants_to_place_bet = false;
      }
      if (amount_owed <= willing_to_bet) {
        if (!wants_to_place_bet) {
          if (amount_owed > 0) {
            call_bet(player);
            end_turn(player, false);
          } else {
            end_turn(player, false);
          }
        } else {
          const amount_to_bet = Math.floor(Math.random() * willing_to_bet) + game.blinds.big;
          if (amount_to_bet <= amount_owed) {
            call_bet(player);
            end_turn(player, false);
          } else {
            place_bet(player, amount_to_bet);
            end_turn(player, false);
          }
        }
      } else if (amount_owed > 0 && amount_owed > willing_to_bet) {
        add_log_msg("AI is folding");
        fold(player);
      } else {
        console.assert(false);
      }
    }, 500);
  }
  function humanTurn(player) {
    add_log_msg("Starting human player turn");
    if (player.has_folded) {
      hide_bet_options();
      end_turn(player, false);
    } else {
      show_bet_options();
      render_bet_options();
    }
  }
  function show_bet_options() {
    el(".bet_options").classList.remove("bet_options_hide");
  }
  function hide_bet_options() {
    el(".bet_options").classList.add("bet_options_hide");
  }
  function render_bet_options() {
    const bet_options_el = el(".bet_options");
    if (game.current_hand.current_bet > 0) {
      el(".check").classList.add("bet_button_hide");
      el(".call").classList.remove("bet_button_hide");
    } else {
      el(".check").classList.remove("bet_button_hide");
      el(".call").classList.add("bet_button_hide");
    }
    const bet_amount = game.current_hand.current_bet - game.human_player.amount_bet_this_round;
    el(".bet_amount").innerHTML = bet_amount.toString();
    const bet_range_el = el(".bet_range");
    bet_range_el.min = game.current_hand.current_bet.toString();
    bet_range_el.max = game.human_player.money.toString();
    bet_range_el.value = game.current_hand.current_bet.toString();
    const call_btn_el = el(".call");
    if (game.current_hand.current_bet == parseInt(bet_range_el.value)) {
      call_btn_el.classList.remove("hide");
    } else {
      call_btn_el.classList.add("hide");
    }
  }
  function end_turn(player, newBetHasBeenPlaced) {
    if (player.has_folded) {
      add_log_msg(`Ending turn b/c player ${player.name} has folded`);
    } else {
      add_log_msg("Ending turn for player " + player.name);
    }
    if (player.type == 1 /* HUMAN */) {
      hide_bet_options();
    }
    if (newBetHasBeenPlaced) {
      setNewRoundOrderAfterBet(player);
      const next_player = findNextPlayer();
      start_turn(next_player);
    } else {
      if (check_if_round_complete(player)) {
        endOfRound();
      } else {
        const next_player = findNextPlayer();
        start_turn(next_player);
      }
    }
    const player_el = el(`.${player.name}`);
    player_el.classList.remove("active_player");
    update_player_ui();
  }
  function check_if_round_complete(player) {
    if (player.id == game.round_order[game.round_order.length - 1].id) {
      return true;
    }
    return false;
  }
  function findNextPlayer() {
    game.round_current_player_index++;
    const next_player = game.round_order[game.round_current_player_index];
    return next_player;
  }
  function start_turn(player, doing_next_turn = false) {
    game.active_player = player;
    if (game.dev_do_next_turn && !doing_next_turn && player.id != 0)
      return;
    console.log("starting turn for " + player.name);
    if (player.has_folded) {
      end_turn(player, false);
    } else {
      add_log_msg("Starting turn for player " + player.name);
      add_log_msg(`Current bet is $${game.current_hand.current_bet}`);
      add_log_msg(`${player.name} has put up $${player.amount_bet_this_round}`);
      add_log_msg(`${player.name} needs to call $${game.current_hand.current_bet - player.amount_bet_this_round}`);
      const player_el = el(`.${player.name}`);
      player_el.classList.add("active_player");
      game.active_player = player;
      if (player.type == 0 /* AI */) {
        aiTurn(player);
      } else {
        humanTurn(player);
      }
    }
  }
  function endOfRound() {
    add_log_msg("End of round");
    switch (game.hand_phase) {
      case 0 /* PREFLOP */: {
        add_log_msg("Ending game phase Preflop");
        game.hand_phase = 1 /* FLOP */;
        startBettingRound();
        break;
      }
      case 1 /* FLOP */:
        add_log_msg("Ending game phase Flop");
        game.hand_phase = 2 /* TURN */;
        startBettingRound();
        break;
      case 2 /* TURN */:
        add_log_msg("Ending game phase Turn");
        game.hand_phase = 3 /* RIVER */;
        startBettingRound();
        break;
      case 3 /* RIVER */:
        add_log_msg("Ending game phase River");
        game.hand_phase = 4 /* SHOWDOWN */;
        endOfRound();
        break;
      case 4 /* SHOWDOWN */:
        add_log_msg("Ending game phase Showdown");
        end_of_hand();
        break;
    }
  }
  function end_of_hand() {
    add_log_msg("End of hand");
    find_hand_winner(game);
    update_player_ui();
    toggle_end_of_hand_el();
    game.active_player = null;
  }
  var Compare_Result = /* @__PURE__ */ ((Compare_Result2) => {
    Compare_Result2[Compare_Result2["WIN"] = 0] = "WIN";
    Compare_Result2[Compare_Result2["LOSE"] = 1] = "LOSE";
    Compare_Result2[Compare_Result2["TIE"] = 2] = "TIE";
    return Compare_Result2;
  })(Compare_Result || {});
  function compare_hands(ranked_hand_one, ranked_hand_two) {
    find_five_best_cards(ranked_hand_one);
    find_five_best_cards(ranked_hand_two);
    const hand_one_cards = ranked_hand_one.hand;
    const hand_two_cards = ranked_hand_two.hand;
    if (ranked_hand_one.rank > ranked_hand_two.rank)
      return 0 /* WIN */;
    if (ranked_hand_one.rank < ranked_hand_two.rank)
      return 1 /* LOSE */;
    const hand_one_pairs = get_pairs_exact(ranked_hand_one.hand);
    const hand_two_pairs = get_pairs_exact(ranked_hand_two.hand);
    const hand_one_trips = get_trips(hand_one_cards);
    const hand_two_trips = get_trips(hand_two_cards);
    switch (ranked_hand_one.rank) {
      case 0 /* HIGH_CARD */: {
        for (let i = 0; i < 1; i++) {
          if (hand_one_cards[i].value > hand_two_cards[i].value)
            return 0 /* WIN */;
          if (hand_one_cards[i].value < hand_two_cards[i].value)
            return 1 /* LOSE */;
        }
        return 2 /* TIE */;
      }
      case 1 /* PAIR */: {
        if (hand_one_pairs[0] > hand_two_pairs[0])
          return 0 /* WIN */;
        if (hand_one_pairs[0] < hand_two_pairs[0])
          return 1 /* LOSE */;
        if (hand_one_cards[4].value > hand_two_cards[4].value)
          return 0 /* WIN */;
        if (hand_one_cards[4].value < hand_two_cards[4].value)
          return 1 /* LOSE */;
        return 2 /* TIE */;
      }
      case 2 /* TWO_PAIR */: {
        if (hand_one_pairs[0] > hand_two_pairs[0])
          return 0 /* WIN */;
        if (hand_one_pairs[0] < hand_two_pairs[0])
          return 1 /* LOSE */;
        if (hand_one_pairs[1] > hand_two_pairs[1])
          return 0 /* WIN */;
        if (hand_one_pairs[1] < hand_two_pairs[1])
          return 1 /* LOSE */;
        const hand_one_singles = get_singles(hand_one_cards);
        const hand_two_singles = get_singles(hand_two_cards);
        if (hand_one_singles[0].value > hand_two_singles[0].value)
          return 0 /* WIN */;
        if (hand_one_singles[0].value < hand_two_singles[0].value)
          return 1 /* LOSE */;
        return 0 /* WIN */;
      }
      case 3 /* THREE_OF_KIND */: {
        if (hand_one_trips[0] > hand_two_trips[0])
          return 0 /* WIN */;
        if (hand_one_trips[0] < hand_two_trips[0])
          return 1 /* LOSE */;
        const hand_one_singles = get_singles(hand_one_cards);
        const hand_two_singles = get_singles(hand_two_cards);
        if (hand_one_singles[0].value > hand_two_singles[0].value)
          return 0 /* WIN */;
        if (hand_one_singles[0].value < hand_two_singles[0].value)
          return 1 /* LOSE */;
        if (hand_one_singles[1].value > hand_two_singles[1].value)
          return 0 /* WIN */;
        if (hand_one_singles[1].value < hand_two_singles[1].value)
          return 1 /* LOSE */;
        return 2 /* TIE */;
      }
      case 4 /* STRAIGHT */: {
        if (hand_one_cards[0].value > hand_two_cards[0].value)
          return 0 /* WIN */;
        if (hand_one_cards[0].value < hand_two_cards[0].value)
          return 1 /* LOSE */;
        return 2 /* TIE */;
      }
      case 5 /* FLUSH */: {
        if (hand_one_cards[0].value > hand_two_cards[0].value)
          return 0 /* WIN */;
        if (hand_one_cards[0].value < hand_two_cards[0].value)
          return 1 /* LOSE */;
        return 2 /* TIE */;
      }
      case 6 /* FULL_HOUSE */: {
        if (hand_one_trips[0] > hand_two_trips[0])
          return 0 /* WIN */;
        if (hand_one_trips[0] < hand_two_trips[0])
          return 1 /* LOSE */;
        else {
          if (hand_one_pairs[0] > hand_two_pairs[0])
            return 0 /* WIN */;
          if (hand_one_pairs[0] < hand_two_pairs[0])
            return 1 /* LOSE */;
        }
        return 2 /* TIE */;
      }
      case 7 /* FOUR_OF_KIND */: {
        if (hand_one_cards[0].value > hand_two_cards[0].value)
          return 0 /* WIN */;
        if (hand_one_cards[0].value < hand_two_cards[0].value)
          return 1 /* LOSE */;
        if (hand_one_cards[4].value > hand_two_cards[4].value)
          return 0 /* WIN */;
        if (hand_one_cards[4].value < hand_two_cards[4].value)
          return 1 /* LOSE */;
        return 2 /* TIE */;
      }
      case 8 /* STRAIGHT_FLUSH */: {
        if (hand_one_cards[0].value > hand_two_cards[0].value)
          return 0 /* WIN */;
        if (hand_one_cards[0].value < hand_two_cards[0].value)
          return 1 /* LOSE */;
        return 2 /* TIE */;
      }
      case 9 /* ROYAL_FLUSH */: {
        if (hand_one_cards[0].value > hand_two_cards[0].value)
          return 0 /* WIN */;
        else if (hand_one_cards[0].value < hand_two_cards[0].value)
          return 1 /* LOSE */;
        return 2 /* TIE */;
      }
    }
    return 2 /* TIE */;
  }
  function get_trips(hand) {
    const trips = [];
    hand.forEach((card) => {
      const count = hand.filter((other_card) => other_card.value === card.value).length;
      if (count == 3) {
        const already_found = trips.filter((value) => value === card.value).length == 0 ? false : true;
        if (!already_found)
          trips.push(card.value);
      }
    });
    return trips;
  }
  function get_pairs_exact(hand) {
    const pairs = [];
    hand.forEach((card) => {
      const count = hand.filter((other_card) => other_card.value === card.value).length;
      if (count == 2) {
        const already_found = pairs.filter((value) => value === card.value).length == 0 ? false : true;
        if (!already_found)
          pairs.push(card.value);
      }
    });
    return pairs;
  }
  function find_hand_winner(_game) {
    let best_hands = [];
    const hand_result = {
      winners: []
    };
    _game.players.forEach((player) => {
      const current_ranked_hand = rankHand(player, _game.community_cards);
      player.hand_rank = current_ranked_hand.rank;
      player.final_hand_cards = current_ranked_hand.hand;
      if (player.has_folded) {
      } else {
        if (best_hands.length == 0) {
          best_hands.push(current_ranked_hand);
        } else {
          const result = compare_hands(current_ranked_hand, best_hands[0]);
          if (result == 0 /* WIN */) {
            best_hands = [];
            best_hands.push(current_ranked_hand);
          } else if (result == 2 /* TIE */) {
            best_hands.push(current_ranked_hand);
          }
        }
      }
      if (!_game.is_sim_game) {
        displayFinalHand(player);
      }
    });
    if (best_hands.length > 1) {
      for (let hand of best_hands) {
        _game.hand_winners.push(hand.player);
        hand_result.winners.push(hand.player);
      }
      if (!_game.is_sim_game) {
        let winners_str = "";
        for (let player of _game.hand_winners) {
          winners_str += ` ${player.name}`;
        }
        add_log_msg("Tie Between" + winners_str);
        let winnerElem = document.querySelector(".winner");
        if (winnerElem) {
          winnerElem.innerHTML = "Tie Between" + winners_str;
          let winnings_per_player = _game.current_hand.pot / _game.hand_winners.length;
          for (let player of _game.hand_winners) {
            player.money += winnings_per_player;
          }
        }
      }
    } else {
      _game.hand_winners.push(best_hands[0].player);
      hand_result.winners.push(best_hands[0].player);
      if (!_game.is_sim_game) {
        add_log_msg("Hand winner is " + _game.hand_winners[0].name);
        let winnerElem = document.querySelector(".winner");
        if (winnerElem) {
          winnerElem.innerHTML = best_hands[0].player.name + "wins the hand!";
          _game.hand_winners[0].money += _game.current_hand.pot;
        }
      }
    }
    return hand_result;
  }
  function clear_final_hand(player) {
    const player_elem = el(`.${player.name}`);
    const final_hand_elem = player_elem.querySelector(":scope > .final_hand");
    const final_hand_children = final_hand_elem.querySelectorAll(":scope > div");
    final_hand_children.forEach((child) => {
      child.innerHTML = "";
    });
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
  function toggle_end_of_hand_el() {
    el(".end_of_hand").classList.toggle("end_of_hand_hide");
  }
  function blinds() {
    console.log("doing blinds");
    const bb_player = game.round_order[game.round_order.length - 1];
    const sb_player = game.round_order[game.round_order.length - 2];
    const dealer_player = game.round_order[game.round_order.length - 3];
    child_el(el(`.${dealer_player.name}`), ".player_name").innerHTML = dealer_player.name + " -- DEALER";
    child_el(el(`.${bb_player.name}`), ".player_name").innerHTML = bb_player.name + " -- BB";
    child_el(el(`.${sb_player.name}`), ".player_name").innerHTML = sb_player.name + " -- SB";
    add_money_to_pot(sb_player, game.blinds.small);
    add_money_to_pot(bb_player, game.blinds.big);
    game.current_hand.current_bet = game.blinds.big;
    update_player_ui();
  }
  function createRoundOrder(dealer_index) {
    let first_player = dealer_index + 3;
    if (first_player > game.players.length - 1) {
      first_player -= game.players.length;
    }
    let start = game.players.slice(first_player);
    let end = game.players.slice(0, first_player);
    game.round_order = start.concat(end);
    game.round_current_player_index = 0;
    game.active_player = game.players[first_player];
  }
  function add_money_to_pot(player, value) {
    player.money -= value;
    game.current_hand.pot += value;
    player.amount_bet_this_round += value;
    el(".pot").innerHTML = `Pot: ${game.current_hand.pot}`;
  }
  function humanBet() {
    const bet_elem = el(".bet_amount");
    let bet_amount = parseInt(bet_elem.innerHTML);
    bet_amount -= game.current_hand.current_bet;
    if (bet_amount > 0) {
      place_bet(game.human_player, bet_amount);
      end_turn(game.human_player, true);
    } else {
    }
  }
  function fold(player) {
    player.has_folded = true;
    end_turn(player, false);
  }
  function setNewRoundOrderAfterBet(player) {
    let first_player_id = player.id;
    let start = game.players.slice(first_player_id);
    let end = game.players.slice(0, first_player_id);
    game.round_order = start.concat(end);
    game.round_current_player_index = 0;
    game.active_player = game.round_order[game.round_current_player_index];
    add_log_msg("Changed round order after bet. Start of round is " + game.round_order[game.round_current_player_index].name + ". End of round is" + game.round_order[game.round_order.length - 1].name);
  }
  function rankHand(player, community_cards) {
    let hand = player.hand;
    hand = hand.concat(community_cards);
    let highestValueInHand = 0;
    let handRank = 0 /* HIGH_CARD */;
    if (isPair(hand)) {
      handRank = 1 /* PAIR */;
    }
    if (isTwoPair(hand)) {
      handRank = 2 /* TWO_PAIR */;
    }
    if (isThreeOfKind(hand)) {
      handRank = 3 /* THREE_OF_KIND */;
    }
    if (isStraight(hand)) {
      handRank = 4 /* STRAIGHT */;
    }
    if (get_flush_cards(hand)) {
      handRank = 5 /* FLUSH */;
    }
    if (isFullHouse(hand)) {
      handRank = 6 /* FULL_HOUSE */;
    }
    if (get_four_of_kind_cards(hand)) {
      handRank = 7 /* FOUR_OF_KIND */;
    }
    if (isStraighFlush(hand)) {
      handRank = 8 /* STRAIGHT_FLUSH */;
    }
    if (isRoyalFlush(hand)) {
      handRank = 9 /* ROYAL_FLUSH */;
    }
    return {
      rank: handRank,
      player,
      highest_value_in_hand: highestValueInHand,
      hand
    };
  }
  function isRoyalFlush(hand) {
    hand = sort_cards(hand);
    hand = removeDuplicateValues(hand);
    let hasRoyalFlush = false;
    const suit = hand[0].suit;
    if (hand.length >= 5) {
      if (hand[0].value == 14) {
        if (hand[4].value == 10) {
          return true;
        }
      }
      for (let card of hand) {
        if (card.suit != suit)
          return false;
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
    hand = sort_cards(hand);
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
            pairs.push(card.value);
          } else {
            let match = false;
            pairs.forEach((pairCard) => {
              if (card.value == pairCard) {
                match = true;
              }
            });
            if (!match) {
              pairs.push(card.value);
            }
          }
        }
      });
    });
    return pairs;
  }
  function sort_cards(hand) {
    return hand.sort(function(a, b) {
      return b.value - a.value;
    });
  }
  function removeDuplicateValues(hand) {
    const new_hand = [];
    for (let card of hand) {
      if (new_hand.length == 0)
        new_hand.push(card);
      else {
        let is_dupe = false;
        for (let other_card of hand) {
          if (card.value == other_card.value && card.id != other_card.id)
            is_dupe = true;
        }
        if (!is_dupe)
          new_hand.push(card);
      }
    }
    return new_hand;
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
    hand = sort_cards(hand);
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
      if (card.suit == 0 /* HEARTS */)
        cards.hearts.push(card);
      if (card.suit == 1 /* SPADES */)
        cards.spades.push(card);
      if (card.suit == 2 /* CLUBS */)
        cards.clubs.push(card);
      if (card.suit == 3 /* DIAMONDS */)
        cards.diamonds.push(card);
    }
    return cards;
  }
  function get_straight_flush_cards(hand) {
    const cards = get_cards_by_suit(hand);
    for (const [key, value] of Object.entries(cards)) {
      if (value.length >= 5)
        return get_straight_cards(sort_cards(value));
    }
    return false;
  }
  function get_royal_flush_cards(hand) {
    const straight_cards = get_straight_cards(hand);
    if (straight_cards && straight_cards[0].value == 14 /* ACE */) {
      return straight_cards;
    }
    return false;
  }
  function find_five_best_cards(ranked_hand) {
    console.assert(ranked_hand.hand.length >= 5, "Hand size is less than 5");
    const hand = ranked_hand.hand;
    let best_cards = [];
    switch (ranked_hand.rank) {
      case 0 /* HIGH_CARD */: {
        best_cards = hand.slice(0, 5);
        break;
      }
      case 1 /* PAIR */: {
        const pairs = findPairs(hand);
        const cards_with_value = get_cards_with_value(hand, pairs[0]);
        best_cards.push(...cards_with_value);
        const hightest_non_matching = get_highest_non_matching_cards(hand, [pairs[0]]);
        best_cards.push(...hightest_non_matching.slice(0, 3));
        break;
      }
      case 2 /* TWO_PAIR */: {
        const pairs = findPairs(hand);
        const first_pair_cards = get_cards_with_value(hand, pairs[0]);
        best_cards.push(...first_pair_cards);
        const second_pair_cards = get_cards_with_value(hand, pairs[1]);
        best_cards.push(...second_pair_cards);
        const hightest_non_matching = get_highest_non_matching_cards(hand, [pairs[0], pairs[1]]);
        best_cards.push(...hightest_non_matching.slice(0, 1));
        break;
      }
      case 3 /* THREE_OF_KIND */: {
        const three_of_kind_cards = get_three_of_kind_cards(hand);
        if (three_of_kind_cards) {
          best_cards.push(...three_of_kind_cards);
          const hightest_non_matching = get_highest_non_matching_cards(hand, [three_of_kind_cards[0].value]);
          best_cards.push(...hightest_non_matching.slice(0, 2));
        }
        break;
      }
      case 4 /* STRAIGHT */: {
        const straight_cards = get_straight_cards(hand);
        if (straight_cards)
          best_cards.push(...straight_cards);
        break;
      }
      case 5 /* FLUSH */: {
        const flush_cards = get_flush_cards(hand);
        if (flush_cards)
          best_cards.push(...flush_cards);
        break;
      }
      case 6 /* FULL_HOUSE */: {
        const trips = get_trips(hand);
        const pair = get_pairs_exact(hand);
        for (let card of hand) {
          if (card.value == trips[0])
            best_cards.push(card);
        }
        if (trips.length == 2) {
          for (let card of hand) {
            if (card.value == trips[1] && best_cards.length < 5)
              best_cards.push(card);
          }
        } else {
          for (let card of hand) {
            if (card.value == pair[0])
              best_cards.push(card);
          }
        }
        break;
      }
      case 7 /* FOUR_OF_KIND */: {
        const four_of_kind_cards = get_four_of_kind_cards(hand);
        if (four_of_kind_cards)
          best_cards.push(...four_of_kind_cards);
        const hightest_non_matching = get_highest_non_matching_cards(hand, [four_of_kind_cards[0].value]);
        best_cards.push(...hightest_non_matching.slice(0, 1));
        break;
      }
      case 8 /* STRAIGHT_FLUSH */: {
        const straight_flush_cards = get_straight_flush_cards(hand);
        if (straight_flush_cards)
          best_cards.push(...straight_flush_cards);
        break;
      }
      case 9 /* ROYAL_FLUSH */: {
        const royal_flush_cards = get_royal_flush_cards(hand);
        if (royal_flush_cards)
          best_cards.push(...royal_flush_cards);
        break;
      }
    }
    ranked_hand.player.best_cards = best_cards;
    return best_cards;
  }
  if (typeof jest !== "undefined") {
    console.log("jest");
  } else {
    window.addEventListener("load", function() {
      console.log("not jest");
      init();
    });
  }
  function get_singles(cards) {
    const singles = [];
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
})();
//# sourceMappingURL=bundle.js.map
