/**
 * Definition of main default rules for trip pricing
 **/
 
 var defaultRules = [
/**** Rule 1 (First for Passengers)****/
{
	"_ref": "",
	"language":"node-rules/javascript",
	"blob":{
		"name": "saldoNegativo",
		"condition": "function(R) {R.when(this.type == 'pasajero' && this.saldo < 0);}",
		"consequence": "function(R) {this.puedeViajar = false;this.reason = 'El saldo del pasajero es negativo';R.stop();}",
		"priority": 10
	},
	"active": true
},
/**** Rule 2 ****/
{
	"_ref": "",
	"language":"node-rules/javascript",
	"blob":{
		"name": "dominioLlevame",
		"condition": "function(R) {var eMailBonus = this.email.endsWith('@llevame.com');R.when(this.type == 'pasajero' &&  eMailBonus);}",
		"consequence": "function(R) {this.puedeViajar = true;this.costoTotal = 0;this.reason = 'El pasajero viaja gratis por tener un email con domino Llevame';R.stop();}",
		"priority": 9
	},
	"active": true
},
/**** Rule 3 ****/
{
	"_ref": "",
	"language":"node-rules/javascript",
	"blob":{
		"name": "15ARSporKm",
		"condition": "function(R) {R.when(this.type == 'pasajero' && this.kmRecorridos > 0);}",
		"consequence": "function(R) {this.costoTotal = this.costoTotal + (this.kmRecorridos * 15);this.costoPorKilometro = 15;this.reason = 'Se cobran 15ARS por km recorrido';R.next();}",
		"priority": 8
	},
	"active": true
},
/**** Rule 4 ****/
{
	"_ref": "",
	"language":"node-rules/javascript",
	"blob":{
		"name": "descuentoPorMiercoles",
		"condition": "function(R) {if (this.dia) {var arr = (this.hora).split(':');var hora = arr[0];var minutos = arr[1];var segundos = arr[2];var horaInt = parseInt(hora);console.log(arr);R.when(this.type == 'pasajero' && this.dia == 'miercoles' && horaInt <= 16 && horaInt >= 15);}}",
		"consequence": "function(R) {this.costoTotal = this.costoTotal - (this.costoTotal * 0.05);this.reason = 'Descuento del 5% por ser miercoles entre 15 a 16hs';console.log(this.costoTotal);R.next();}",
		"priority": 7
	},
	"active": true
},
/**** Rule 5 ****/
{
	"_ref": "",
	"language":"node-rules/javascript",
	"blob":{
		"name": "descuentoPorPrimerViaje",
		"condition": "function(R) {R.when(this.type == 'pasajero' && this.primerViaje);}",
		"consequence": "function(R) {this.costoTotal = this.costoTotal - 100;this.reason = 'Descuento de 100ARS por ser su primer viaje';console.log(this.costoTotal);R.next();}",
		"priority": 7
	},
	"active": true
},
/**** Rule 6 ****/
{
	"_ref": "",
	"language":"node-rules/javascript",
	"blob":{
		"name": "recargoDiaDeSemana",
		"condition": "function(R) {if (this.dia) {var dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];var arr = (this.hora).split(':');var hora = arr[0];var horaInt = parseInt(hora);R.when(this.type == 'pasajero' && dias.includes(this.dia) && horaInt <= 19 && horaInt >= 17);}}",
		"consequence": "function(R) {this.costoTotal = this.costoTotal + (this.costoTotal * 0.1);this.reason = 'Recargo del 10% por ser dia de semana entre 17 y 19hs';console.log(this.costoTotal);R.next();}",
		"priority": 7
	},
	"active": true
},
/**** Rule 7 ****/
{
	"_ref": "",
	"language":"node-rules/javascript",
	"blob":{
		"name": "descuentoViajeDiario",
		"condition": "function(R) {R.when(this.type == 'pasajero' && this.viajesHoy >= 5);}",
		"consequence": "function(R) {this.costoTotal = this.costoTotal - (this.costoTotal * 0.05);this.reason = 'Descuento del 5% a partir del quinto viaje del dia';console.log(this.costoTotal);R.next();}",
		"priority": 7
	},
	"active": true	
},
/**** Rule 8 (Last for Passengers) ****/
{
	"_ref": "",
	"language":"node-rules/javascript",
	"blob":{
		"name": "50ARSMinimo",
		"condition": "function(R) {R.when(this.type == 'pasajero' && this.costoTotal < 50);}",
		"consequence": "function(R) {this.puedeViajar = true;this.reason = 'El costo minimo es de 50ARS';this.costoTotal = 50;console.log('Minimum cost rule proccessing...');R.stop();}",
		"priority": 1
	},
	"active": true
},
/**** Rule 9 (First for Drivers) ****/
{
	"_ref": "",
	"language":"node-rules/javascript",
	"blob":{
		"name": "conductor10ARSporKm",
		"condition": "function(R) {R.when(this.type == 'conductor' && this.kmRecorridos > 0);}",
		"consequence": "function(R) {this.costoTotal = this.costoTotal + (this.kmRecorridos * 10);this.costoPorKilometro = 10;this.reason = 'Se pagan 10ARS por km recorrido';R.next();}",
		"priority": 8
	},
	"active": true
},
/**** Rule 10 (Last for Drivers) ****/
{
	"_ref": "",
	"language":"node-rules/javascript",
	"blob":{
		"name": "30ARSMinimoConductor",
		"condition": "function(R) {R.when(this.type == 'conductor' && this.costoTotal < 30);}",
		"consequence": "function(R) {this.puedeViajar = true;this.reason = 'El costo minimo es de 50ARS';this.costoTotal = 50;console.log('Paso por aca');R.stop();}",
		"priority": 1
	},
	"active": true
}
];
 
 module.exports.defaultRules = defaultRules;