/**
 * @jest-environment jsdom
 */

import { create_deck, create_player, dev_deal_cards, Compare_Result, rankHand, compare_hands } from "./src";
import { game, Player, Player_Type, Card, Suit, Card_Type, Hand_Rank, Ranked_Hand } from "./src/Game"

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
        console.log(ranked_hand.hand);
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
        console.log(ranked_hand.hand);
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
        console.log(ranked_hand)
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
        

        const result: Compare_Result = compare_hands(rankHand(player_one, []), rankHand(player_two, []));
        // expect(result).toBe(Compare_Result.LOSE);
        // console.log(ranked_hand.hand);
        // expect(rankHand(game, player).rank).toBe(Hand_Rank.HIGH_CARD);
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