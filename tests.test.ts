/**
 * @jest-environment jsdom
 */

import { create_deck, create_player, dev_deal_cards, Compare_Result, rankHand, compare_hands, find_five_best_cards } from "./src";
import { game, Player, Player_Type, Card, Suit, Card_Type, Hand_Rank, Ranked_Hand } from "./src/Game"
import 'jest-extended';
// import * as matchers from 'jest-extended'
// import { toBeOneOf } from 'jest-extended'
// expect.extend(matchers);

import "jest-extended/all";

// expect(1).toBeOneOf([1, 2]);

describe("Deck", () => {
    const deck = create_deck();
    test("Deck Length", () => {
        expect(deck.length).toBe(52);
    });
    test("Spades", () => {
        const spades = deck.filter(e => e.suit == Suit.SPADES);
        expect(spades.length).toBe(13);
    });
    test("Hearts", () => {
        const hearts = deck.filter(e => e.suit == Suit.HEARTS);
        expect(hearts.length).toBe(13);
        
    });
    test("Clubs", () => {
        const clubs = deck.filter(e => e.suit == Suit.CLUBS);
        expect(clubs.length).toBe(13);
    });
    test("Diamonds", () => {
        const diamonds = deck.filter(e => e.suit == Suit.DIAMONDS);
        expect(diamonds.length).toBe(13);
    });
    
})

describe("Test Hands", () => {
    const deck = create_deck();
    const player: Player = create_player(0, Player_Type.AI);
    
    test("High Card", () => {
        let hand: Card[] = dev_deal_cards(deck, [
            {suit: Suit.SPADES, type: Card_Type.TWO},
            {suit: Suit.SPADES, type: Card_Type.THREE},
            {suit: Suit.SPADES, type: Card_Type.FOUR},
            {suit: Suit.HEARTS, type: Card_Type.FIVE},
            {suit: Suit.SPADES, type: Card_Type.SEVEN}
        ]);
        player.hand = hand;
        const ranked_hand: Ranked_Hand = rankHand(player, []); 
        // console.log(ranked_hand.hand);
        expect(rankHand(player, []).rank).toBe(Hand_Rank.HIGH_CARD);
    })


    test("Pair", () => {
        let hand: Card[] = dev_deal_cards(deck, [
            {suit: Suit.SPADES, type: Card_Type.TWO},
            {suit: Suit.SPADES, type: Card_Type.THREE},
            {suit: Suit.SPADES, type: Card_Type.FOUR},
            {suit: Suit.HEARTS, type: Card_Type.TWO},
            {suit: Suit.SPADES, type: Card_Type.SEVEN}
        ]);
        player.hand = hand;
        expect(rankHand(player, []).rank).toBe(Hand_Rank.PAIR);
    })

    test("Two Pair", () => {
        let hand: Card[] = dev_deal_cards(deck, [
            {suit: Suit.SPADES, type: Card_Type.TWO},
            {suit: Suit.SPADES, type: Card_Type.THREE},
            {suit: Suit.SPADES, type: Card_Type.FOUR},
            {suit: Suit.HEARTS, type: Card_Type.TWO},
            {suit: Suit.CLUBS, type: Card_Type.THREE}
        ]);
        player.hand = hand;
        expect(rankHand(player, []).rank).toBe(Hand_Rank.TWO_PAIR);
    })

    test("Three of Kind", () => {
        let hand: Card[] = dev_deal_cards(deck, [
            {suit: Suit.SPADES, type: Card_Type.TWO},
            {suit: Suit.SPADES, type: Card_Type.THREE},
            {suit: Suit.SPADES, type: Card_Type.FOUR},
            {suit: Suit.HEARTS, type: Card_Type.TWO},
            {suit: Suit.DIAMONDS, type: Card_Type.TWO}
        ]);
        player.hand = hand;
        expect(rankHand(player, []).rank).toBe(Hand_Rank.THREE_OF_KIND);
    })

    test("Three of Kind", () => {
        let hand: Card[] = dev_deal_cards(deck, [
            {suit: Suit.SPADES, type: Card_Type.TWO},
            {suit: Suit.SPADES, type: Card_Type.THREE},
            {suit: Suit.SPADES, type: Card_Type.FOUR},
            {suit: Suit.HEARTS, type: Card_Type.TWO},
            {suit: Suit.DIAMONDS, type: Card_Type.TWO}
        ]);
        player.hand = hand;
        expect(rankHand(player, []).rank).toBe(Hand_Rank.THREE_OF_KIND);
    })

    test("Straight", () => {
        let hand: Card[] = dev_deal_cards(deck, [
            {suit: Suit.SPADES, type: Card_Type.TWO},
            {suit: Suit.SPADES, type: Card_Type.THREE},
            {suit: Suit.SPADES, type: Card_Type.FOUR},
            {suit: Suit.HEARTS, type: Card_Type.FIVE},
            {suit: Suit.DIAMONDS, type: Card_Type.SIX}
        ]);
        player.hand = hand;
        const ranked_hand: Ranked_Hand = rankHand(player, []);
        // console.log(ranked_hand.hand);
        expect(rankHand(player, []).rank).toBe(Hand_Rank.STRAIGHT);
    })

    test("Full House", () => {
        let hand: Card[] = dev_deal_cards(deck, [
            {suit: Suit.SPADES, type: Card_Type.TWO},
            {suit: Suit.SPADES, type: Card_Type.THREE},
            {suit: Suit.DIAMONDS, type: Card_Type.THREE},
            {suit: Suit.HEARTS, type: Card_Type.TWO},
            {suit: Suit.DIAMONDS, type: Card_Type.TWO}
        ]);
        player.hand = hand;
        expect(rankHand(player, []).rank).toBe(Hand_Rank.FULL_HOUSE);
    })

    test("Four Of Kind", () => {
        let hand: Card[] = dev_deal_cards(deck, [
            {suit: Suit.SPADES, type: Card_Type.TWO},
            {suit: Suit.DIAMONDS, type: Card_Type.TWO},
            {suit: Suit.SPADES, type: Card_Type.FOUR},
            {suit: Suit.HEARTS, type: Card_Type.TWO},
            {suit: Suit.DIAMONDS, type: Card_Type.TWO}
        ]);
        player.hand = hand;
        expect(rankHand(player, []).rank).toBe(Hand_Rank.FOUR_OF_KIND);
    })

    test("Straight Flush", () => {
        let hand: Card[] = dev_deal_cards(deck, [
            {suit: Suit.SPADES, type: Card_Type.TWO},
            {suit: Suit.SPADES, type: Card_Type.THREE},
            {suit: Suit.SPADES, type: Card_Type.FOUR},
            {suit: Suit.SPADES, type: Card_Type.FIVE},
            {suit: Suit.SPADES, type: Card_Type.SIX}
        ]);
        player.hand = hand;
        expect(rankHand(player, []).rank).toBe(Hand_Rank.STRAIGHT_FLUSH);
    })

    test("Royal Flush", () => {
        let hand: Card[] = dev_deal_cards(deck, [
            {suit: Suit.SPADES, type: Card_Type.ACE},
            {suit: Suit.SPADES, type: Card_Type.KING},
            {suit: Suit.SPADES, type: Card_Type.QUEEN},
            {suit: Suit.SPADES, type: Card_Type.JACK},
            {suit: Suit.SPADES, type: Card_Type.TEN}
        ]);
        player.hand = hand;
        const ranked_hand: Ranked_Hand = rankHand(player, []);
        // console.log(ranked_hand)
        expect(ranked_hand.rank).toBe(Hand_Rank.ROYAL_FLUSH);
    })  
})

describe("Compare Ranked Hands", () => {
    const deck = create_deck();
    const player_one: Player = create_player(0, Player_Type.AI);
    const player_two: Player = create_player(1, Player_Type.AI);
    
    test("High Card v High Card", () => {
        player_one.hand = dev_deal_cards(deck, [
            {suit: Suit.SPADES, type: Card_Type.TWO},
            {suit: Suit.SPADES, type: Card_Type.THREE},
            {suit: Suit.SPADES, type: Card_Type.FOUR},
            {suit: Suit.HEARTS, type: Card_Type.FIVE},
            {suit: Suit.SPADES, type: Card_Type.NINE}
        ]);

        player_two.hand = dev_deal_cards(deck, [
            {suit: Suit.SPADES, type: Card_Type.TWO},
            {suit: Suit.SPADES, type: Card_Type.THREE},
            {suit: Suit.SPADES, type: Card_Type.FOUR},
            {suit: Suit.HEARTS, type: Card_Type.FIVE},
            {suit: Suit.SPADES, type: Card_Type.JACK}
        ]);

        const ranked_hand_one = rankHand(player_one, []);
        const ranked_hand_two = rankHand(player_two, []);
        // console.log(ranked_hand_one.hand, ranked_hand_two.hand)
        const result: Compare_Result = compare_hands(ranked_hand_one, ranked_hand_two);

        expect(result).toBe(Compare_Result.LOSE);
    })

    test("High Card v Pair", () => {
        player_one.hand = dev_deal_cards(deck, [
            {suit: Suit.SPADES, type: Card_Type.TWO},
            {suit: Suit.SPADES, type: Card_Type.THREE},
            {suit: Suit.SPADES, type: Card_Type.FOUR},
            {suit: Suit.HEARTS, type: Card_Type.FIVE},
            {suit: Suit.SPADES, type: Card_Type.NINE}
        ]);

        player_two.hand = dev_deal_cards(deck, [
            {suit: Suit.SPADES, type: Card_Type.TWO},
            {suit: Suit.CLUBS, type: Card_Type.JACK},
            {suit: Suit.SPADES, type: Card_Type.FOUR},
            {suit: Suit.HEARTS, type: Card_Type.FIVE},
            {suit: Suit.SPADES, type: Card_Type.JACK}
        ]);
        

        const result: Compare_Result = compare_hands(rankHand(player_one, []), rankHand(player_two, []));
        expect(result).toBe(Compare_Result.LOSE);
    })

    test("Pair v Pair", () => {
        player_one.hand = dev_deal_cards(deck, [
            {suit: Suit.SPADES, type: Card_Type.TWO},
            {suit: Suit.SPADES, type: Card_Type.THREE},
            {suit: Suit.SPADES, type: Card_Type.FOUR},
            {suit: Suit.HEARTS, type: Card_Type.NINE},
            {suit: Suit.SPADES, type: Card_Type.NINE}
        ]);

        player_two.hand = dev_deal_cards(deck, [
            {suit: Suit.SPADES, type: Card_Type.TWO},
            {suit: Suit.CLUBS, type: Card_Type.THREE},
            {suit: Suit.SPADES, type: Card_Type.FOUR},
            {suit: Suit.HEARTS, type: Card_Type.FIVE},
            {suit: Suit.SPADES, type: Card_Type.THREE}
        ]);
        
        const ranked_hand_one = rankHand(player_one, []);
        const ranked_hand_two = rankHand(player_two, []);
        const result: Compare_Result = compare_hands(ranked_hand_one, ranked_hand_two);
        // console.log(result)
        
        expect(result).toBe(Compare_Result.WIN);
    })

    test("Two Pair v Two Pair", () => {
        player_one.hand = dev_deal_cards(deck, [
            {suit: Suit.CLUBS, type: Card_Type.THREE},
            {suit: Suit.SPADES, type: Card_Type.THREE},
            {suit: Suit.SPADES, type: Card_Type.FOUR},
            {suit: Suit.HEARTS, type: Card_Type.NINE},
            {suit: Suit.SPADES, type: Card_Type.NINE}
        ]);

        player_two.hand = dev_deal_cards(deck, [
            {suit: Suit.CLUBS, type: Card_Type.FOUR},
            {suit: Suit.CLUBS, type: Card_Type.THREE},
            {suit: Suit.SPADES, type: Card_Type.FOUR},
            {suit: Suit.HEARTS, type: Card_Type.FIVE},
            {suit: Suit.SPADES, type: Card_Type.THREE}
        ]);
        
        const ranked_hand_one = rankHand(player_one, []);
        const ranked_hand_two = rankHand(player_two, []);
        const result: Compare_Result = compare_hands(ranked_hand_one, ranked_hand_two);
        // console.log(result)
        
        expect(result).toBe(Compare_Result.WIN);
    })

    test("Full House v Full House", () => {
        player_one.hand = dev_deal_cards(deck, [
            {suit: Suit.HEARTS, type: Card_Type.NINE},
            {suit: Suit.SPADES, type: Card_Type.TWO},
            {suit: Suit.CLUBS, type: Card_Type.TWO},
            {suit: Suit.HEARTS, type: Card_Type.TWO},
            {suit: Suit.SPADES, type: Card_Type.NINE}
        ]);

        player_two.hand = dev_deal_cards(deck, [
            {suit: Suit.SPADES, type: Card_Type.THREE},
            {suit: Suit.HEARTS, type: Card_Type.FIVE},
            {suit: Suit.CLUBS, type: Card_Type.THREE},
            {suit: Suit.HEARTS, type: Card_Type.THREE},
            {suit: Suit.SPADES, type: Card_Type.FIVE}
        ]);
        
        const ranked_hand_one = rankHand(player_one, []);
        const ranked_hand_two = rankHand(player_two, []);
        // console.log(ranked_hand_one.hand, ranked_hand_two.hand);
        const result: Compare_Result = compare_hands(ranked_hand_one, ranked_hand_two);
        
        // console.log(result)
        
        expect(result).toBe(Compare_Result.LOSE);
    })
})

describe("Find Best Cards", () => {
    const deck = create_deck();
    const player_one: Player = create_player(0, Player_Type.AI);
    
    test("High Card", () => {
        player_one.hand = dev_deal_cards(deck, [
            {suit: Suit.HEARTS, type: Card_Type.NINE},
            {suit: Suit.SPADES, type: Card_Type.ACE},
            {suit: Suit.CLUBS, type: Card_Type.TWO},
            {suit: Suit.HEARTS, type: Card_Type.FIVE},
            {suit: Suit.SPADES, type: Card_Type.EIGHT},
            {suit: Suit.DIAMONDS, type: Card_Type.JACK},
            {suit: Suit.DIAMONDS, type: Card_Type.QUEEN}
        ]);

        const ranked_hand = rankHand(player_one, []);

        const best_cards = find_five_best_cards(ranked_hand);

        expect(best_cards[0].id).toBe(player_one.hand[1].id);
        expect(best_cards[1].id).toBe(player_one.hand[6].id);
        expect(best_cards[2].id).toBe(player_one.hand[5].id);
        expect(best_cards[3].id).toBe(player_one.hand[0].id);
        expect(best_cards[4].id).toBe(player_one.hand[4].id);
    })

    test("Pair", () => {
        player_one.hand = dev_deal_cards(deck, [
            {suit: Suit.HEARTS, type: Card_Type.NINE},
            {suit: Suit.SPADES, type: Card_Type.ACE},
            {suit: Suit.CLUBS, type: Card_Type.TWO},
            {suit: Suit.HEARTS, type: Card_Type.FIVE},
            {suit: Suit.SPADES, type: Card_Type.TWO},
            {suit: Suit.DIAMONDS, type: Card_Type.JACK},
            {suit: Suit.DIAMONDS, type: Card_Type.QUEEN}
        ]);

        const ranked_hand = rankHand(player_one, []);

        const best_cards = find_five_best_cards(ranked_hand);
        console.log("best_cards: ", best_cards)

        expect(best_cards[0].value).toBe(Card_Type.TWO);
        expect(best_cards[1].value).toBe(Card_Type.TWO);
        expect(best_cards[2].value).toBe(Card_Type.ACE);
        expect(best_cards[3].value).toBe(Card_Type.QUEEN);
        expect(best_cards[4].value).toBe(Card_Type.JACK);
    })

    test("Two Pair", () => {
        player_one.hand = dev_deal_cards(deck, [
            {suit: Suit.HEARTS, type: Card_Type.NINE},
            {suit: Suit.SPADES, type: Card_Type.ACE},
            {suit: Suit.CLUBS, type: Card_Type.TWO},
            {suit: Suit.HEARTS, type: Card_Type.FIVE},
            {suit: Suit.SPADES, type: Card_Type.TWO},
            {suit: Suit.DIAMONDS, type: Card_Type.FIVE},
            {suit: Suit.DIAMONDS, type: Card_Type.QUEEN}
        ]);

        const ranked_hand = rankHand(player_one, []);

        const best_cards = find_five_best_cards(ranked_hand);
        console.log("best_cards: ", best_cards)

        expect(best_cards[0].value).toBeOneOf([Card_Type.TWO, Card_Type.FIVE]);
        expect(best_cards[1].value).toBeOneOf([Card_Type.TWO, Card_Type.FIVE]);
        expect(best_cards[2].value).toBeOneOf([Card_Type.TWO, Card_Type.FIVE]);
        expect(best_cards[3].value).toBeOneOf([Card_Type.TWO, Card_Type.FIVE]);
        expect(best_cards[4].value).toBe(Card_Type.ACE);
        // expect(best_cards[1].value).toBe(Card_Type.TWO);
        // expect(best_cards[2].value).toBe(Card_Type.FIVE);
        // expect(best_cards[3].value).toBe(Card_Type.FIVE);
        // expect(best_cards[4].value).toBe(Card_Type.ACE);
    })
})




// test('hand rank high card', () => {
    
    
    
//     expect(hand.length).toBe(5);
//     player.hand = hand;
//     expect(rankHand(player).rank).toBe(Hand_Rank.FLUSH);

//     hand = dev_deal_cards(deck, [
//         {suit: Suit.SPADES, type: Card_Type.TWO},
//         {suit: Suit.SPADES, type: Card_Type.THREE},
//         {suit: Suit.HEARTS, type: Card_Type.FOUR},
//         {suit: Suit.SPADES, type: Card_Type.FIVE},
//         {suit: Suit.SPADES, type: Card_Type.SEVEN}
//     ]);
//     expect(hand.length).toBe(5);
//     player.hand = hand;
//     expect(rankHand(player).rank).toBe(Hand_Rank.HIGH_CARD);
// });