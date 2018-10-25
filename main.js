let deck = [];
let players = [];

function createDeck() {
  let suits = ["spades", "hearts", "clubs", "diamonds"];
  let value = 2;
  let onSuit = 0;
  let cardsInSuit = 0;

  for(let i = 0; i < 52; i++) {
    
    // create next card
    let card = {
      value: value,
      suit: suits[onSuit]
    }
    deck.push(card);
    
    value++;
    // check if card is past ace value
    if(value > 14) {
      value = 2;
    }

    cardsInSuit++;
    // check if all cards in suit created
    if(cardsInSuit > 13) {
      onSuit++;
      cardsInSuit = 0;
    }
  }
};

function createPlayers() {
  let numPlayers = 6;
  
  for(let i = 0; i < numPlayers; i++) {
    let type = "ai";

    // set the first player created to be the human
    if(i == 0) {
      type = "human";
    }

    let player = {
      num: i,
      hand: [],
      money: 1000,
      name: "player" + i,
      type: type
    }
    players.push(player);
  }
};

function startGame() {
  // after running the initial setup start the game

  //
  //  loop
  //

  // deal hand
  dealHand();
  startBettingRound();
  // bet
    // round 1
    // round 2
    // round 3
  // determine winner
  // deal next hand

  // end game when only one player has money left
};

function init() {
  createDeck();
  createPlayers();
  createPlayerDOMElems();
  startGame();
  console.log(deck, players);
};

function createPlayerDOMElems() {
  let playerContainerElem = document.querySelector(".player_container");

  // create each player elems
  players.forEach((player) => {

    // create player elem
    let playerElem = document.createElement("div");
    playerElem.className = player.name;
    playerContainerElem.appendChild(playerElem);

    // create player name elem
    let playerNameElem = document.createElement("div");
    playerNameElem.innerHTML = player.name;
    playerElem.appendChild(playerNameElem);

    // create player card elems
    for(let i = 0; i < 2; i ++) {
      let cardElem = document.createElement("div");
      cardElem.className = "card" + (i + 1);
      playerElem.appendChild(cardElem);
    }
  });
};

function dealHand() {
  players.forEach((player) => {
    dealCards(player, 2);
  });

  updatePlayerCards();
};

function dealCards(player, numCardsToDeal) {
  let cardsDelt = 0;
  while(cardsDelt < numCardsToDeal) {
    cardsDelt++;
    let cardPosInDeck = Math.floor(Math.random() * deck.length);
    let card = deck[cardPosInDeck];
    player.hand.push(card);
    deck.splice(cardPosInDeck, 1);
  }
};

function updatePlayerCards() {
  // after dealing update the DOM elems to show the players cards

  players.forEach((player) => {
    let playerElem = document.querySelector("." + player.name);

    playerElem.childNodes.forEach((cardElem) => {

      // set card1
      if(cardElem.className == "card1") {
        cardElem.innerHTML = player.hand[0].value + player.hand[0].suit;
      }

      // set card2
      if(cardElem.className == "card2") {
        cardElem.innerHTML = player.hand[1].value + player.hand[1].suit;
      }
    });
  });
};

function startBettingRound() {
  // starts the round of betting with whichever player is supposed to open the betting

  // player that starts the round of betting
  // this will change based off various things
  let startingPlayerIndex = 0;
  let startingPlayer = players[startingPlayerIndex];
  
  if(startingPlayer.type == 'ai') {
    aiBet(startingPlayer);
  } else {
    humanBet();
  }

};

function aiBet(player) {
  // an ai players betting action

};

function humanBet(player) {
  // the human players betting action

};

init();
