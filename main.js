
let deck = [];
let players = [];
let roundOrder = [];
let humanPlayer;
let handStatus;
let communityCards = [];
let roundBetAmount = 0;
let activePlayer;
let startingPlayerIndex = 0;

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
  elem.addEventListener('keypress', betInputHandler);
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
  //console.log('starting the ' + handStatus.onPhase + " round");
  // starts the round of betting with whichever player is supposed to open the betting

  // player that starts the round of betting
  // this will change based off various things
  let onPlayerIndex = startingPlayerIndex;
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
  activePlayer = firstPlayerInRound;

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
  //console.log('starting ai turn for player ' + player.name);

  // do ai turn logic here

  // what does the ai need to do
  // check if there is a bet, if so decide if ai should call, raise, fold
  // if no be then decide to bet, check/fold
  // we decide these things based of the rankin of the ai hand

  rankAiHand(player);

  endTurn(player, false);
};

function humanTurn(player) {
  // the human players betting action
  //console.log('starting human turn for player ' + player.name);
  toggleBetHumanOptions();
  betOrCall();

};

function betOrCall() {
  // set the player bet/call element to show bet or call depending on if the roundBet is > 0
  // also set the min bet ammount if it is call

  let betElem = document.querySelector(".bet");

  if(roundBetAmount > 0) {
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
  betAmountElem.innerHTML = roundBetAmount;
};

function endTurn(player, newBetHasBeenPlaced) {
  // do end of turn logic here

  if(player.type == "human") {
    toggleBetHumanOptions();
  }

  // if a new bet has been placed then reset the round order
  if(newBetHasBeenPlaced) {
    setNewRoundOrderAfterBet(player);
  } else { // if no new bet then continue the round as normal
    let roundComplete = checkIfRoundComplete(player);

    if(roundComplete) {
      endOfRound();
    } else {
      // if not the end of round then move on to the next player
      let nextPlayer = findNextPlayer(player);
      startNextPlayerTurn(nextPlayer);
    }
  }

  
  
  
};

function checkIfRoundComplete(player) {

  // check if this was the last player in the round
  
  if(player == roundOrder[roundOrder.length - 1]) {
    //console.log('last player in roundOrder has ended their turn')
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

  return nextPlayer;

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
      //console.log('preflop phase has ended');
      handStatus.onPhase = "flop";
      startBettingRound();
      break;
    case "flop":
      //console.log('flop phase has ended');
      handStatus.onPhase = "turn";
      startBettingRound();
      break; 
    case "turn":
      //console.log('turn phase has ended');
      handStatus.onPhase = "river";
      startBettingRound();
      break;   
    case "river":
      //console.log('river phase has ended');
      handStatus.onPhase = "showdown";
      //startBettingRound();
      break; 
    case "showdown":
      //console.log('showdown phase has ended and the hand has ended');
      
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
  //console.log("human checked");

  endTurn(humanPlayer, false);
};

function humanBet() {
  //console.log("human bet");

  // get the amount that was entered for the bet
  let betAmountElem = document.querySelector(".bet_amount");
  let betAmount = betAmountElem.innerHTML;
  
  // only accept the click if the betAmount is > 0 >= roundbetAmount
  if(betAmount > 0 && betAmount >= roundBetAmount) {
    betPlaced(betAmount);
    endTurn(humanPlayer, true);  
  } else {
    //console.log('player tried to bet zero, or less than the roundBetAmount')
  }

};

function humanFold() {
  //console.log("human fold");

  endTurn(humanPlayer, false);
};

function betInputHandler(e) {
  // handles input from the bet_amount elem

  //console.log(e);

  // make sure the most recent input is a number and is <= current players money
  if(e.keyCode >= 48 && e.keyCode <= 57){
    // if entered a number

    // get temp bet amount
    let newInput = e.key;
    let oldBetAmount = e.target.innerHTML;
    let tempBetAmount = oldBetAmount + newInput;

    let validBet = checkValidBet(tempBetAmount);

    // if not a valid bet, adjust it to min or max
    if(!validBet) {
      //console.log('not a valid bet');

      if(tempBetAmount < roundBetAmount) {
        setBetAmountToMin();
        e.preventDefault(); // prevent newest input if less than minBet
      } else {
        // set to player max bet
        let maxBet = players[0].money;
        //console.log(maxBet)
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

  if(tempBetAmount <= players[0].money && tempBetAmount > roundBetAmount) {
    return true;
  } else {
    return false;
  }
};

function setToMaxBet() {
  // the amount entered in betAmount was too high, setting to the max possible bet
  //console.log('setting to max bet');

  let maxBet = players[0].money;
};

function betPlaced(betAmount) {
  //console.log("bet placed for " + betAmount);
  // a new valid (is this checked???) bet has been placed
  // update the roundBetAmount and restart the round order starting at the bet makers index + 1

  roundBetAmount = betAmount;

  //console.log("new roundBetAmount: " + roundBetAmount);

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
  roundOrder = roundOrder.slice(0, roundOrder.length-1);

  startNextPlayerTurn(activePlayer);
};

function getPlayerRoundIndex(player) {
  // find what round index a player has

  let roundIndex;
  roundOrder.forEach((thisPlayer, index) => {
    if(player == thisPlayer) {
      roundIndex = index;
    }
  });
  
  return roundIndex;

};

function rankAiHand(player) {
  let hand = player.hand;
  hand = hand.concat(communityCards);

  //sRoyalFlush(hand);
  //isStraighFlush(hand);
  //isFourOfKind(hand);
  //isFullHouse(hand)
  //isFlush(hand);
  //isStraight(hand);
  //isThreeOfKind(hand);
  //isTwoPair(hand);
  isPair(hand);
  //isHighCard(hand);

};

function isRoyalFlush(hand) {
  hand = sortCards(hand);
  hand = removeDuplicateValues(hand);
  console.log(hand);

  // check if hand has at least 5 cards
  if(hand.length >= 5) {

    // check if highest card is an ace
    if(hand[0].value == 14) {
      console.log('highest card in hand is an ace');
      console.log(hand);

      // if there is an ace then loop through all cards and see it b.value == a.value - 1
      // check if card is one less than prevCard
      let hasRank = true;
      for(let i = 1; i < hand.length; i++) {
        let card = hand[i];
        let prevCard = hand[i - 1];
        
        if(card.value != prevCard.value - 1) {
          hasRank = false;
        }
      }

      if(hasRank) {
        console.log('------------------------');
        console.log('has this hand rank');
        console.log('------------------------');
      }

    }

  }
  console.log('checking if hand is a royalFlush');
};

function isStraighFlush(hand) {
  console.log('checking if hand is a StraighFlush');

  // difference between straigh flush and royal flush
};

function isFourOfKind(hand) {
  console.log('checking if hand is a FourOfKind');
};

function isFullHouse(hand) {
  console.log('checking if hand is a FullHouse');
};

function isFlush(hand) {
  console.log('checking if hand is a Flush');
};

function isStraight(hand) {
  console.log('checking if hand is a Straight');
};

function isThreeOfKind(hand) {
  console.log('checking if hand is a ThreeOfKind');
};

function isTwoPair(hand) {
  console.log('checking if hand is a TwoPair');
};

function isPair(hand) {
  console.log('checking if hand is a Pair');

  // for finding a pair we only need to compare the numbers so create
  // an array of only the hand values

  let values = [];
  hand.forEach((card) => {
    values.push(card.value);
  });

  let pair = values.find((value, index) => (values.indexOf(value) != index));
  
  if(pair) {
    console.log("pair: " + pair);
  }

};

function isHighCard(hand) {
  console.log('checking if hand is a HighCard');

  hand = sortCards(hand);
  console.log(hand);

};

function sortCards(hand) {
  // sort a hand of cards from highest to lowest;
  hand = hand.sort(function(a, b){return b.value - a.value}); // sort hand by card values, highest to lowest
  return hand;
};

function removeDuplicateValues(hand) {
  // remove and duplicate cards with same values in hand

  let newHand = [];
  hand.forEach((card) => {
    if(newHand.length == 0) {
      newHand.push(card);
    } else {
      let isDupe = false;
      newHand.forEach((newHandCard) => {
        if(card.value == newHandCard.value) {
          isDupe = true;
        }
      });
      
      if(!isDupe) {
        newHand.push(card);
      }
    }
  });

  return newHand;
};

init();
