//! @file rules.js
//! Describes endpoints for rules

var express = require('express');
var router = express.Router();

const Sequelize = require('sequelize');

var api = require('./api.js');

var models = require('../models/db'); // loads db.js
var Rule = models.rule; 

var Verify = require('./verify');
var RulesEngine = require('./rulesEngine');

// CREATE TABLE rules(id SERIAL PRIMARY KEY, _ref VARCHAR(20), language VARCHAR(40), blob VARCHAR(40), active BOOLEAN);


/**
 *  Método para eliminar todas las reglas y commits asociados
 */ 
router.get('/dropRuleTable', function(request, response) {
  // Test code: dummy register and table initialization:
  // force: true will drop the table if it already exists
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    Rule.sync({force: true}).then(() => {
      return response.status(200).json({});
    }).catch(function (error) {
      /* istanbul ignore next  */
      return response.status(500).json({code: 0, message: "Unexpected error"});
    });
  }
});

/**
 *  Devuelve toda la información acerca de todas las reglas indicadas.
 */ 
router.get('/', /*Verify.verifyToken, Verify.verifyUserRole,*/ function(request, response) {
	Rule.findAll({
		attributes: ['id', '_ref', 'language', 'blob', 'active']
	}).then(rulesFound => {
		/* istanbul ignore if  */
	    if (!rulesFound) {
	      return response.status(500).json({code: 0, message: "Unexpected error"});
	    }

		var ruleArray = [];
		rulesFound.forEach(function(item) {
			var jsonRule = {
				id: item.id,
			    _ref: item._ref,
			    language: item.language,
			    blob: item.blob,
			    active: item.active
			}
		    ruleArray.push(jsonRule);
		});

	    var jsonInResponse = {
			metadata: {
				version: api.apiVersion // falta completar
			},
			rules: ruleArray
		};
		
		/*
		let facts = {
		  costoMinimo: 51
		}

		// Run the engine to evaluate
		RulesEngine
		  .run(facts)
		  .then(events => { // run() returns events with truthy conditions
		    events.map(event => console.log(event.params.message))
		});
		*/
		return response.status(200).json(jsonInResponse);
	});
});

/**
 *  Da de alta una regla
 */
router.post('/', Verify.verifyToken, Verify.verifyManagerRole, function(request, response) {
  // si hay algún parámetro faltante
  
  if (api.isEmpty(request.body.languaje) || api.isEmpty(request.body.blob) || api.isEmpty(request.body.active)) {
    return response.status(400).json({code: 0, message: "Incumplimiento de precondiciones (parámetros faltantes)"});
  }

  // body contiene: languaje, blob y active.
  
  ///\TODO agregar regla nueva y commit del autor. Si la regla ya existe tirar error (para actualizar debe usar put)
});

/**
 *  Ejecuta un set de reglas
 */
router.post('/run', Verify.verifyToken, Verify.verifyManagerRole, function(request, response) {
  // si hay algún parámetro faltante
  
  if (api.isEmpty(request.body.rules) || api.isEmpty(request.body.facts)) {
    return response.status(400).json({code: 0, message: "Incumplimiento de precondiciones (parámetros faltantes)"});
  }

  // body contiene: rules and facts
  
  // NOTE the api asks for "facts" in the response, after running the rules we have 'events':
  // rules + facts -----> events (in compliance with rules and facts)
  
  var jsonInResponse = {
			metadata: {
				version: api.apiVersion // falta completar
			},
			events: '' // api specification mentions 'facts' here
		};
		
  return response.status(200).json(jsonInResponse);
});

/**
 *  Elimina una regla
 */
router.delete('/:ruleId', Verify.verifyToken, Verify.verifyManagerRole, function(request, response) {
	
	Rule.destroy({
    where: {
		id: request.params.userId
		}
	})
	.then(affectedRows => {
			if (affectedRows == 0) {
			  return response.status(404).json({code: 0, message: "No existe el recurso solicitado"});
			}
			
			/// \TODO eliminar commits de la regla en tabla de commits?
			
			return response.status(204).json({});
	})
	.catch(function (error) {
		/* istanbul ignore next  */
		return response.status(500).json({code: 0, message: "Unexpected error"});
	});
});

/**
 *  Obtener información de una regla
 */
router.get('/:ruleId', Verify.verifyToken, Verify.verifyManagerRole, function(request, response) {
	Rule.find({
		where: {
		  id: request.params.userId
		}
	}).then(rule => {
		if (!rule) {
		  return response.status(404).json({code: 0, message: "Rule inexistente"});
		}

		///\TODO get last commit and insert in response JSON
		
		var jsonInResponse = {
				metadata: {
					version: api.apiVersion // falta completar
				},
				rule: '' // api specification mentions 'facts' here
			};
			
		return response.status(200).json(jsonInResponse);
	}).catch(function (error) {
		/* istanbul ignore next  */
		return response.status(500).json({code: 0, message: "Unexpected error"});
	});
});

/**
 *  Modificar una regla
 */
router.put('/:ruleId', Verify.verifyToken, Verify.verifyManagerRole, function(request, response) {	
	if (api.isEmpty(request.body.rule)) {
		return response.status(400).json({code: 0, message: "Incumplimiento de precondiciones (parámetros faltantes)"});
	}

	Rule.find({
		where: {
		  id: request.params.userId
		}
	}).then(rule => {
		if (!rule) {
		  return response.status(404).json({code: 0, message: "Rule inexistente"});
		}

		///\TODO get last commit and insert in response JSON
		rule.updateAttributes({
			language: '',
			blob: '',
			active: ''
		  }).then(updatedUser => {
			  ///\TODO insert commit in history (similar to cars)
			return response.status(200).json(updatedUser);
		  });
		
		
		
	}).catch(function (error) {
		/* istanbul ignore next  */
		return response.status(500).json({code: 0, message: "Unexpected error"});
	});
});


/**
 *  Ejecutar una regla particular
 */
router.post('/:ruleId/run', Verify.verifyToken, Verify.verifyManagerRole, function(request, response) {
});

/**
 *  Obtener el historial de commits realizados sobre una regla particular
 */
router.get('/:ruleId/commits', Verify.verifyToken, Verify.verifyManagerRole, function(request, response) {
});

/**
 *  Obtener la regla en el estado del commit especificado
 *	Si se pasa el valor lastCommit se el estado actual de la regla en el motor
 */
router.get('/:ruleId/commits/:commitId', Verify.verifyToken, Verify.verifyManagerRole, function(request, response) {
	
});

module.exports = router;
