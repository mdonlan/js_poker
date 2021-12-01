/**
 * @jest-environment jsdom
 */

import { create_deck, deal_specific_card } from "./src";
import { game, Player, Player_Type, Card, Suit, Card_Type } from "./src/Game"

test('adds 1 + 2 to equal 3', () => {
    expect(1 + 2).toBe(3);
});

test('hand rank high card', () => {
    const deck = create_deck();
    const hand: Card[] = [];
    const card: Card | false = deal_specific_card(deck, Suit.SPADES, Card_Type.TWO);
    if (card) {
        hand.push(card);
    } else console.log("failed to find card in deck");
    expect(hand.length).toBe(1);
});