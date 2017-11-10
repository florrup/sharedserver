const Engine = require('json-rules-engine');
// Set up a new engine
const ruleEngine = new Engine.Engine();
/*istanbul ignore next*/

ruleEngine.addRule({
	conditions: {
		any: [{
			all: [{
				fact: 'precioPorKmARS',
				operator: 'equal',
				value: 15
			},{
				fact: 'costoMinimo',
				operator: 'greaterThanInclusive',
				value: 50
			}]
		}]
	},
	event: {  // define the event to fire when the conditions evaluate truthy
		type: 'costoMinimoSuperado',
		params: {
			message: 'El costo supera el mínimo de 50ARS',
			value: true // Se debe cobrar $COSTO MINIMO porque el saldo es inferior
		}
	}
});

module.exports = ruleEngine;

/**
 * Define facts the engine will use to evaluate the conditions above.
 * Facts may also be loaded asynchronously at runtime; see the advanced example below
 */
 /*
let facts = {
  personalFoulCount: 6,
  gameDuration: 40
}

// Run the engine to evaluate
RulesEngine
  .run(facts)
  .then(events => { // run() returns events with truthy conditions
    events.map(event => console.log(event.params.message))
});
*/
/*
 * Output:
 *
 * Player has fouled out!
 */