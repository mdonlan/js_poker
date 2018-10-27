
let deck = [];
let players = [];
let roundOrder = [];
let humanPlayer;
let handStatus;
let communityCards = [];

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
      type: type,
      roundBet: 0 // the ammount this player has bet so far this round
    }
    players.push(player);
  }

  setHumanPlayer();
};

function setHumanPlayer() {
  // set the global humanPlayer var
  humanPlayer = players[0];
}

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
  addEventListeners();
  createDeck();
  createPlayers();
  //createPlayerDOMElems();
  startGame();
  //console.log(deck, players);
};

function addEventListeners() {
  // add any nessesary event listeners

  // content editable onChange listener
  let elem = document.querySelector('.bet_amount');
  elem.addEventListener('keypress', betAmountHandler);
};

function createPlayerDOMElems() {
  let playerContainerElem = document.querySelector(".player_container");

  // create each player elems
  players.forEach((player) => {

    // create player elem
    let playerElem = document.createElement("div");
    playerElem.classList += 'player ' + player.name;
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
  setDefaultHandStatus();
  players.forEach((player) => {
    dealCards(player, 2);
  });

  updatePlayerCardElems();
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

function updatePlayerCardElems() {
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

function updateCommunityCards() {
  switch(handStatus.onPhase) {
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

function dealCommunityCards(numToDeal) {
  let cardsDelt = 0;
  while(cardsDelt < numToDeal) {
    cardsDelt++;
    let cardPosInDeck = Math.floor(Math.random() * deck.length);
    let card = deck[cardPosInDeck];
    communityCards.push(card);
    deck.splice(cardPosInDeck, 1);
  }
};

function startBettingRound() {
  console.log('starting the ' + handStatus.onPhase + " round");
  // starts the round of betting with whichever player is supposed to open the betting

  // player that starts the round of betting
  // this will change based off various things
  let onPlayerIndex = 0;
  let lastPlayerIndex = onPlayerIndex - 1;
  if(lastPlayerIndex < 0) {
    lastPlayerIndex = players.length - 1;
  }

  let firstPlayerInRound = players[onPlayerIndex];
  let lastPlayerInRound = players[lastPlayerIndex];

  createRoundOrder(onPlayerIndex);

  //console.log(firstPlayerInRound.name);
  //console.log(lastPlayerInRound.name);

  // since this is the start of the round the active player is the firstPlayerInRound
  let activePlayer = firstPlayerInRound;

  // check if we need to deal out any community cards to start the round
  updateCommunityCards();
  
  startNextPlayerTurn(activePlayer);

};

function updateCommunityCardElems() {
  // after dealing update the DOM elems to show the community cards

  let communityCardsElem = document.querySelector(".community_cards");
  communityCardsArr = Array.from(communityCardsElem.children);

  communityCardsArr.forEach((cardElem, index) => {
    communityCards.forEach((card, i) => {
      if(i == index) {
        // matched the correct elem index to the array of cards index
        cardElem.innerHTML = card.value + card.suit;
      }
    })
  });
};

function aiTurn(player) {
  // an ai players betting action
  console.log('starting ai turn for player ' + player.name)

  endTurn(player);
};

function humanTurn(player) {
  // the human players betting action
  console.log('starting human turn for player ' + player.name)
  toggleBetHumanOptions();
  //endTurn(player);
};

function endTurn(player) {
  // do end of turn logic here

  if(player.type == "human") {
    toggleBetHumanOptions();
  }

  let roundComplete = checkIfRoundComplete(player);
  
  if(roundComplete) {
    endOfRound();
  } else {
    findNextPlayer(player);
  }
};

function checkIfRoundComplete(player) {

  // check if this was the last player in the round
  
  if(player == roundOrder[roundOrder.length - 1]) {
    console.log('last player in roundOrder has ended their turn')
    return true;
  } 
  return false;

};

function findNextPlayer(player) {
  // find the next player in the round
  let nextPlayer;
  roundOrder.forEach((thisPlayer, index) => {
    if(player == thisPlayer) {
      nextPlayer = roundOrder[index + 1];
    }
  });

  startNextPlayerTurn(nextPlayer);

};

function startNextPlayerTurn(player) {
  if(player.type == 'ai') {
    aiTurn(player);
  } else {
    humanTurn(player);
  }
};

function endOfRound() {
  // the current betting round has ended, move on to the next betting round / determine winner
  
  switch(handStatus.onPhase) {
    case "preflop":
      console.log('preflop phase has ended');
      handStatus.onPhase = "flop";
      startBettingRound();
      break;
    case "flop":
      console.log('flop phase has ended');
      handStatus.onPhase = "turn";
      startBettingRound();
      break; 
    case "turn":
      console.log('turn phase has ended');
      handStatus.onPhase = "river";
      startBettingRound();
      break;   
    case "river":
      console.log('river phase has ended');
      handStatus.onPhase = "showdown";
      //startBettingRound();
      break; 
    case "showdown":
      console.log('showdown phase has ended and the hand has ended');
      
      break;  
  }
};

function createRoundOrder(startingIndex) {
  // reorder the players array into the correct order for this betting round
  
  let start = players.slice(startingIndex);
  let end = players.slice(0,startingIndex);
  roundOrder = start.concat(end);
};

function toggleBetHumanOptions() {
  let betOptionsElem = document.querySelector(".bet_options");
  betOptionsElem.classList.toggle("bet_options_show");
};

function humanCheck() {
  console.log("human checked");

  endTurn(humanPlayer);
};

function humanBet() {
  console.log("human bet");

  endTurn(humanPlayer);
};

function humanFold() {
  console.log("human fold");

  endTurn(humanPlayer);
};

function betAmountHandler(e) {
  // handles input from the bet_amount elem

  console.log(e);

  // make sure the most recent input is a number and is <= current players money
  if(e.keyCode >= 48 && e.keyCode <= 57){
    // if entered a number

    // get temp bet amount
    let newInput = e.key;
    let oldBetAmount = e.target.innerHTML;
    let tempBetAmount = oldBetAmount + newInput;

    let validBet = checkValidBet(tempBetAmount);
    // if the bet is too high, set to players max money
    if(!validBet) {
      console.log('not a valid bet')
      e.preventDefault();

      // set to player max bet
      let maxBet = players[0].money;
      console.log(maxBet)
      e.target.innerHTML = maxBet;
    }
  } else {
    e.preventDefault();
  }

};

function checkValidBet(tempBetAmount) {
  // make sure the human player has entered a valid bet that is <= their money

  if(tempBetAmount <= players[0].money) {
    return true;
  } else {
    return false;
  }
};

function setToMaxBet() {
  // the amount entered in betAmount was too high, setting to the max possible bet
  console.log('setting to max bet');

  let maxBet = players[0].money;
};

init();
