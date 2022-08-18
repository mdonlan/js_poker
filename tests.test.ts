/**
 * @jest-environment jsdom
 */

import { create_deck, create_player, dev_deal_cards, rankHand } from "./src";
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
        expect(rankHand(game, player).rank).toBe(Hand_Rank.HIGH_CARD);
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
        expect(rankHand(game, player).rank).toBe(Hand_Rank.PAIR);
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