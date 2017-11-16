//! @file rules.js
//! Describes endpoints for rules

var express = require('express');
var router = express.Router();

const Sequelize = require('sequelize');

var api = require('./api.js');

var models = require('../models/db'); // loads db.js
var Rule = models.rule; 
var RuleChange = models.rulechange;

var Verify = require('./verify');
var RulesEngine = require('./rulesEngine');

// CREATE TABLE rules(id SERIAL PRIMARY KEY, _ref VARCHAR(20), name VARCHAR(255), language VARCHAR(40), blobCondition VARCHAR(255), blobConsequence VARCHAR(255), blobPriority VARCHAR(255), active BOOLEAN);

// CREATE TABLE rulechanges(id SERIAL PRIMARY KEY, _ref VARCHAR(20), name VARCHAR(255), blobCondition VARCHAR(255), blobConsequence VARCHAR(255), blobPriority VARCHAR(255), reason VARCHAR(255), time DATE, active BOOLEAN, businessuser INTEGER);

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
router.get('/', Verify.verifyToken, Verify.verifyUserRole, function(request, response) {
	Rule.findAll({
		attributes: ['id', '_ref','name', 'language', 'blobCondition', 'blobConsequence', 'blobPriority', 'active']
	}).then(rulesFound => {
		/* istanbul ignore if  */
	    if (!rulesFound) {
	      return response.status(500).json({code: 0, message: "Unexpected error"});
	    }

		var ruleArray = [];
		rulesFound.forEach(function(item) {
			
			var jsonRuleBlob = {
				name: item.name,
				condition: item.blobCondition,
				consequence: item.blobConsequence,
				priority: item.blobPriority
			};
			var jsonRule = {
				id: item.id,
			    _ref: item._ref,
			    language: item.language,
			    blob: jsonRuleBlob,
			    active: item.active
			}
		    ruleArray.push(jsonRule);
		});

	    var jsonInResponse = {
			metadata: {
				version: api.apiVersion // TODO falta completar
			},
			rules: ruleArray
		};
		
		return response.status(200).json(jsonInResponse);
	});
});

/**
 *  Da de alta una regla
 */
router.post('/', Verify.verifyToken, Verify.verifyManagerRole, function(request, response) {
	// si hay algún parámetro faltante
	if (api.isEmpty(request.body.language) || api.isEmpty(request.body.blob) || api.isEmpty(request.body.active)) {
		return response.status(400).json({code: 0, message: "Incumplimiento de precondiciones (parámetros faltantes)"});
	}
	var blobJSON = {
		name: request.body.blob.name,
		condition: request.body.blob.condition, // JSON.stringify(request.body.blob.condition),
		consequence: request.body.blob.consequence, // JSON.stringify(request.body.blob.consequence),
		priority: request.body.blob.priority
	};
	var blobJSONStringified = JSON.stringify(blobJSON);
	/*
	var ruleJSON = {
		name: request.body.blob.name,
		language: request.body.language,
		blobCondition: request.body.blob.condition,
		blobConsequence: request.body.blob.consequence,
		blobPriority: request.body.blob.priority,
		active: request.body.active
	};
	*/
	console.log('LOG BLOB:');
	console.log(blobJSON);

	Rule.create({
		_ref: '', //request.body._ref,
		name: request.body.blob.name,
		language: request.body.language, // request.body.language, 
		// blob: blobJSONStringified, // JSON.parse(request.body.rule.blob), // request.body.blob,
		blobCondition: request.body.blob.condition,
		blobConsequence: request.body.blob.consequence,
		blobPriority: request.body.blob.priority,
		active: request.body.active
	}).then(rule => {
		/* istanbul ignore if  */
		if (!rule) {
		  return response.status(500).json({code: 0, message: "Unexpected error"});
		}
		
		RuleChange.create({
			_ref: '',
			name: request.body.blob.name,
			blobcondition: request.body.blob.condition,
			blobconsequence: request.body.blob.consequence,
			blobpriority: request.body.blob.priority,
			active: request.body.active,
			reason: 'Creación de rule',
			time: new Date(),
			businessuser: 1 // TODO obtener id del businessuser que está haciendo el cambio
		}).then(ruleChange => {	
			if (!ruleChange) {
			  return response.status(500).json({code: 0, message: "Unexpected error. Couldn't make the commit"});
			}
			var responseBlob = {
				name: rule.name,
				condition: rule.blobCondition,
				consequence: rule.blobConsequence,
				priority: rule.blobPriority
			};
			var jsonInResponse = {
			  metadata: {
				version: api.apiVersion 
			  },
			  rule: {
				id: rule.id,
				_ref: rule._ref,
				language: rule.language,
				blob: responseBlob,
				active: rule.active
			  }
			};

			return response.status(201).json(jsonInResponse);
		})

	  }).catch(function (error) {
		/* istanbul ignore next  */
		console.log(error);
		return response.status(500).json({code: 0, message: "Unexpected error"});
	});
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
		id: request.params.ruleId
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
		  id: request.params.ruleId
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
		  id: request.params.ruleId
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
