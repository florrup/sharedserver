const RuleEngine = require('node-rules');

/*istanbul ignore next*/

var rules = [
/**** Rule 1 ****/
{
	"name": "saldoNegativo",
    "condition": function(R) {
        R.when(this.saldo < 0);
    },
    "consequence": function(R) {
        this.puedeViajar = false;
        this.reason = "El saldo del pasajero es negativo";
        R.stop(); //stop if matched. no need to process next rule.
    },
    "priority": 10
},
/**** Rule 2 ****/
{
	"name": "dominioLlevame",
    "condition": function(R) {
        R.when(this.email === "florencia@llevame.com"); // TODO parsear email
    },
    "consequence": function(R) {
        this.puedeViajar = true;
        this.reason = "El pasajero viaja gratis por tener un email con domino Llevame";
        R.stop();
    },
    "priority": 9
},
/**** Last Rule ****/
{
	"name": "50ARSMinimo",
    "condition": function(R) {
        R.when(this.costoTotal < 50);
    },
    "consequence": function(R) {
        this.puedeViajar = true;
        this.reason = "El costo minimo es de 50ARS";
        this.costoTotal = 50;
        R.stop();
    },
    "priority": 1
}];

/* Creating Rule Engine instance and registering rule */
var R = new RuleEngine();
R.register(rules);

var fact = {
    "saldo": 15,
    "email": "florencia@gmail.com",
    "kmRecorridos": 2,
    "costoTotal": 0
};

R.execute(fact, function(data) {
    if (data.puedeViajar) {
        console.log("Puede viajar con costo: " + data.costoTotal + "\n" + data.reason);
    } else {
        console.log("No puede viajar: " + data.reason);
    }
});

module.exports = R;
