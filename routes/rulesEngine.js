const RuleEngine = require('node-rules');

/*istanbul ignore next*/

var rules = [
/**** Rule 1 ****/
{
	"name": "saldoNegativo",
    "condition": function(R) {
        R.when(this.type == "pasajero" && this.saldo < 0);
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
        R.when(this.type == "pasajero" && this.email === "florencia@llevame.com"); // TODO parsear email
    },
    "consequence": function(R) {
        this.puedeViajar = true;
        this.reason = "El pasajero viaja gratis por tener un email con domino Llevame";
        R.stop();
    },
    "priority": 9
},
/**** Rule 3 ****/
{
	"name": "15ARSporKm",
    "condition": function(R) {
        R.when(this.type == "pasajero" && this.kmRecorridos > 0);
    },
    "consequence": function(R) {
        this.costoTotal = this.costoTotal + (this.kmRecorridos * 15);
        this.reason = "Se cobran 15ARS por km recorrido";
        console.log("Llega aca");
        console.log(this.costoTotal);
        R.next();
    },
    "priority": 8
},
/**** Rule 4 ****/
{
	"name": "descuentoPorMiercoles",
    "condition": function(R) {
        R.when(this.type == "pasajero" && this.dia == "miercoles");
    },
    "consequence": function(R) {
        this.costoTotal = this.costoTotal - (this.costoTotal * 0.05);
        this.reason = "Descuento del 5% por ser miercoles";
        console.log(this.costoTotal);
        R.next();
    },
    "priority": 7
},
/**** Last Rule ****/
{
	"name": "50ARSMinimo",
    "condition": function(R) {
        R.when(this.type == "pasajero" && this.costoTotal < 50);
    },
    "consequence": function(R) {
        this.puedeViajar = true;
        this.reason = "El costo minimo es de 50ARS";
        this.costoTotal = 50;
        console.log("Paso por aca");
        R.stop();
    },
    "priority": 1
}];

/* Creating Rule Engine instance and registering rule */
var R = new RuleEngine(rules, {ignoreFactChanges: true}); // so as not to run the rules in a loop
//R.register(rules, {ignoreFactChanges: true});

var fact = {
	"type": "pasajero",
    "saldo": 15,
    "email": "florencia@gmail.com",
    "kmRecorridos": 2,
    "costoTotal": 0,
    "dia": "miercoles" // TODO cambiar esto por fecha actual
};

R.execute(fact, function(data) {
    if (data.puedeViajar) {
        console.log("Puede viajar con costo: " + data.costoTotal + "\n" + data.reason);
    } else {
        console.log("No puede viajar: " + data.reason);
    }
});

module.exports = R;
