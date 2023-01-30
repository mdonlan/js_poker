import { Sim_Hand } from './Sim_Hand';
import { Player } from "./types";
import { add_log_msg } from "./Log";
import { Game, game } from './Game';
import { call_bet, end_turn, place_bet, fold } from '.';

export function do_ai_turn(player: Player) {
	add_log_msg("Starting ai_turn for " + player.name);
	setTimeout(() => {
		let sim_hand: Sim_Hand = new Sim_Hand(game, player);
		// console.log(sim_hand.results);
		const win_percent: number = (sim_hand.results.wins / sim_hand.results.run_count * 100);
		console.log("win %: " + win_percent);
		add_log_msg(`AI analysis: Win %: ${win_percent}`);

		const amount_owed = game.current_hand.current_bet - player.amount_bet_this_round;
		console.log('amount_owed: ' + amount_owed)

		let percent_willing_to_bet = 0; // how much of their $ are they willing to bet

		// if (win_percent < 5) {
		// 	percent_willing_to_bet = .01;
		// } else if (win_percent < 10) {
		// 	percent_willing_to_bet = .03;
		// } else if (win_percent < 20) {
		// 	percent_willing_to_bet = .5;
		// } else if (win_percent < 40) {
		// 	percent_willing_to_bet = .10;
		// }  else if (win_percent < 60) {
		// 	percent_willing_to_bet = .3;
		// } else {
		// 	percent_willing_to_bet = 1;
		// }

		if (win_percent > 80) {
			percent_willing_to_bet = 1;
		} else if (win_percent > 60) {
			percent_willing_to_bet = 0.5
		} else if (win_percent > 50) {
			percent_willing_to_bet = 0.4;
		} else if (win_percent > 40) {
			percent_willing_to_bet = 0.3
		} else if (win_percent > 30) {
			percent_willing_to_bet = 0.2
		} else if (win_percent > 20) {
			percent_willing_to_bet = 0.1
		} else if (win_percent > 10) {
			percent_willing_to_bet = 0.05
		} else if (win_percent > 5) {
			percent_willing_to_bet = 0.02
		}
		
		console.log("percent willing to bet: " + percent_willing_to_bet);
		

		// let should_raise_or_bet: boolean = false;

		// figure out if the ai should either place a new bet or raise the current bet
		// do this based on the ai hand strength and how much money they have?

		// if win percent is heigh enough then place/raise bet
		// how much to bet? determine risk

		
		// if a bet is below 3% of players money then just call even with bad hand
		// const cheap_bet_amount = player.money * .03;

		// if (amount_owed < cheap_bet_amount) {
		// 	call_bet(player);
		// 	end_turn(player, false);
		// }
		

		const willing_to_bet = (player.money * percent_willing_to_bet) - player.amount_bet_this_round;
		console.log('willing_to_bet: ' + willing_to_bet)

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
					// check
					end_turn(player, false);
				}
			} else {
				const amount_to_bet = Math.floor(Math.random() * willing_to_bet) + game.blinds.big;
				if (amount_to_bet <= amount_owed) {
					// if the ai is trying to bet but the amount is less than what they owe, just call instead
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
			
			// if (sim_hand.results.wins > 15) {
			// 	call_bet(player);
			// 	end_turn(player, false);
			// } else {
			// 	add_log_msg("AI is folding");
			// 	fold(player);
			// }
		}

		
	}, 500);
};