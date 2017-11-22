const RuleEngine = require('node-rules');

/*istanbul ignore next*/

var exampleRules = [
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
		this.costoPorKilometro = 15;
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
        if (this.dia) {
    		var arr = (this.hora).split(":");
    		var hora = arr[0];
    		var minutos = arr[1];
    		var segundos = arr[2];
    		console.log(arr);
            R.when(this.type == "pasajero" && this.dia == "miercoles"); // TODO falta chequear horario
        }
    },
    "consequence": function(R) {
        this.costoTotal = this.costoTotal - (this.costoTotal * 0.05);
        this.reason = "Descuento del 5% por ser miercoles entre 15 a 16hs";
        console.log(this.costoTotal);
        R.next();
    },
    "priority": 7 // descuentos tienen misma prioridad
},
/**** Rule 5 ****/
{
	"name": "descuentoPorPrimerViaje",
    "condition": function(R) {
        R.when(this.type == "pasajero" && this.primerViaje);
    },
    "consequence": function(R) {
        this.costoTotal = this.costoTotal - 100;
        this.reason = "Descuento de 100ARS por ser su primer viaje";
        console.log(this.costoTotal);
        R.next();
    },
    "priority": 7 // descuentos tienen misma prioridad
},
/**** Rule 6 ****/
{
	"name": "recargoDiaDeSemana",
    "condition": function(R) {
        if (this.dia) {
    	   var dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
    	   var arr = (this.hora).split(":");
		   var hora = arr[0];
           R.when(this.type == "pasajero" && dias.includes(this.dia)); // TODO falta chequear horario
       }
    },
    "consequence": function(R) {
        this.costoTotal = this.costoTotal + (this.costoTotal * 0.1);
        this.reason = "Recargo del 10% por ser dia de semana entre 17 y 19hs";
        console.log(this.costoTotal);
        R.next();
    },
    "priority": 7 // descuentos tienen misma prioridad
},
/**** Rule 7 ****/
{
	"name": "descuentoViajeDiario",
    "condition": function(R) {
        R.when(this.type == "pasajero" && this.viajesHoy >= 5); 
    },
    "consequence": function(R) {
        this.costoTotal = this.costoTotal - (this.costoTotal * 0.05);
        this.reason = "Descuento del 5% a partir del quinto viaje del dia";
        console.log(this.costoTotal);
        R.next();
    },
    "priority": 7 // descuentos tienen misma prioridad
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
var R = new RuleEngine(exampleRules, {ignoreFactChanges: true}); // so as not to run the rules in a loop

// Ejemplo de cómo tienen que pasarnos las rules para poder meterlas al engine
// Se convierten las rules que corren dentro del engine en JSON
var store = R.toJSON();
// Se tienen que poner quotes en las functions. 
var testStringRule = {  "name": "Prueba",
                    "condition": "function(R) { R.when(this.type == 'pasajero'); }",
                    "consequence": "function(R) { this.puedeViajar = true; this.reason = 'Probando prueba string'; R.stop(); }",
                    "priority": 2 };
// Agrego la nueva rule al store de rules
store.push(testStringRule);
// Cargo las rules nuevamente al engine
R.fromJSON(store);

var fact = {
	"type": "pasajero",
    "saldo": 15,
    "email": "florencia@gmail.com",
    "kmRecorridos": 2,
    "costoTotal": 0,
    "dia": "miercoles", // TODO cambiar esto por fecha actual
    "hora": "15:20:58",
    "viajesHoy": 5,
    "primerViaje": true,
};

var getSampleFacts = function(){
	var fact = {
		"type": "pasajero",
		"saldo": 15,
		"email": "florencia@gmail.com",
		"kmRecorridos": 2,
		"costoTotal": 0,
		"dia": "miercoles", // TODO cambiar esto por fecha actual
		"hora": "15:20:58",
		"viajesHoy": 5,
		"primerViaje": true,
	}; // example fact to use in trip estimate
	return fact;
};

module.exports.getSampleFacts = getSampleFacts;

R.execute(fact, function(data) {
    if (data.puedeViajar) {
        console.log("Puede viajar con costo: " + data.costoTotal + "\n" + data.reason);
    } else {
        console.log("No puede viajar: " + data.reason);
    }
});

// module.exports = R; // esta línea pisaba los exports que haya habido antes
module.exports.R = R; // ok

module.exports.exampleRules = exampleRules;

// Función para correr las exampleRules
function runExampleEngine(rules, fact) {
    var R1 = new RuleEngine(rules, {ignoreFactChanges: true});

    R1.execute(fact, function(data) {
        if (data.puedeViajar) {
            console.log("Puede viajar con costo: " + data.costoTotal + "\n" + data.reason);
        } else {
            console.log("No puede viajar: " + data.reason);
        }
    });
}

module.exports.runExampleEngine = runExampleEngine;

// Función para correr cualquier set de rules sacadas de la bd
function runEngine(rules, fact) {
    /* Creating Rule Engine instance and registering rule */

    var R2 = new RuleEngine(exampleRules, {ignoreFactChanges: true}); // so as not to run the rules in a loop
    // Remueve todos los exampleRules
    R2.init();

    // Ejemplo de cómo tienen que pasarnos las rules para poder meterlas al engine
    // Se convierten las rules que corren dentro del engine en JSON
    var store = R2.toJSON();

	console.log('RUNNING RULES ENGINE!  Listing Rules: ---------------------------------');
    // for (var rule in rules) { // this line didn't work as intended
	rules.forEach(function(rule){
		console.log(rule);
        store.push(rule);
    });
	console.log('---------------------------------');

	console.log('Fact listing fatcs: -----------------------');
	console.log(fact);
	console.log('-----------------------');
    R2.fromJSON(store);

	return new Promise((resolve, reject) => {
        try {
            R2.execute(fact, resolve);
        } catch (error) {
            reject(error);
        }
    });
	/*
    R2.execute(fact, function(data) {
        if (data.puedeViajar) {
            console.log("Puede viajar con costo: " + data.costoTotal + "\n" + data.reason);
        } else {
            console.log("No puede viajar: " + data.reason);
        }
    });
	*/
}

module.exports.runEngine = runEngine;