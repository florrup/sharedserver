//! @file rules.js
//! Describes endpoints for rules

var express = require('express');
var router = express.Router();

const Sequelize = require('sequelize');

var api = require('./api.js');

var models = require('../models/db'); // loads db.js
var Rule = models.rule; 
var RuleChange = models.rulechange;
var BusinessUser = models.businessuser;

var Verify = require('./verify');
var RulesEngine = require('./rulesEngine');

// CREATE TABLE rules(id SERIAL PRIMARY KEY, _ref VARCHAR(20), name VARCHAR(255), language VARCHAR(40), blobCondition VARCHAR(255), blobConsequence VARCHAR(255), blobPriority VARCHAR(255), active BOOLEAN);

// CREATE TABLE rulechanges(id SERIAL PRIMARY KEY, _ref VARCHAR(20), name VARCHAR(255), blobCondition VARCHAR(255), blobConsequence VARCHAR(255), blobPriority VARCHAR(255), reason VARCHAR(255), time DATE, active BOOLEAN, businessuser VARCHAR(255), userinfo VARCHAR(255));

/**
 *  Método para eliminar todas las reglas y commits asociados
 */ 
router.get('/dropRuleTable', function(request, response) {
  // Test code: dummy register and table initialization:
  // force: true will drop the table if it already exists
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    Rule.sync({force: true}).then(() => {
    	RuleChange.sync({force: true}).then(() => {
	    	return response.status(200).json({});
	    }).catch(function (error) {
	      /* istanbul ignore next  */
	      return response.status(500).json({code: 0, message: "Unexpected error"});
	    });
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
			    language: item.language,	// TODO falta agregar información del usuario que hizo el last commit
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

	Rule.create({
		_ref: '', //request.body._ref,
		name: request.body.blob.name,
		language: request.body.language, 
		blobCondition: request.body.blob.condition,
		blobConsequence: request.body.blob.consequence,
		blobPriority: request.body.blob.priority,
		active: request.body.active
	}).then(rule => {
		/* istanbul ignore if  */
		if (!rule) {
		  return response.status(500).json({code: 0, message: "Unexpected error"});
		}
		
		BusinessUser.find({
			where: {
				username: request.decoded.username // username of the businessuser that's trying to post the rule
			}
		}).then(businessuser => {
			if (!businessuser) {
			  return response.status(500).json({code: 0, message: "Unexpected error. Couldn't find a businessuser"});
			}

			var lastCommitJSON = {
				author: {
					id: businessuser.id,
					_ref: businessuser._ref,
					username: businessuser.username,
					password: businessuser.password,
					name: businessuser.name,
					roles: businessuser.roles
				}
			};

			RuleChange.create({
				_ref: '',
				name: request.body.blob.name,
				blobcondition: request.body.blob.condition,
				blobconsequence: request.body.blob.consequence,
				blobpriority: request.body.blob.priority,
				active: request.body.active,
				reason: 'Creación de rule',
				time: new Date(),
				businessuser: businessuser.id,
				userinfo: JSON.stringify(lastCommitJSON)
			}).then(ruleChange => {	
				if (!ruleChange) {
				  return response.status(500).json({code: 0, message: "Unexpected error. Couldn't create the commit"});
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
					active: rule.active,
					lastCommit: ruleChange.userinfo
				  }
				};

				return response.status(201).json(jsonInResponse);
			});
		});
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
    console.log(request.body);
	if (api.isEmpty(request.body.facts)) {
		return response.status(400).json({code: 0, message: "Incumplimiento de precondiciones (parámetros faltantes)"});
	} 

	var fact = request.body.facts.blob;

	Rule.findAll({
		where: {
		  active: true
		}
	}).then(rules => {
		if (!rules) {
			/* istanbul ignore next  */
			return response.status(500).json({code: 0, message: "No rule was found"});
		}

		var rulesToEngine = [];
		for (var i = 0, len = rules.length; i < len; i++) {
		  	var singleRule = {
				name: rules[i].name,
				condition: rules[i].blobCondition,
				consequence: rules[i].blobConsequence,
				priority: rules[i].blobPriority
			};
			rulesToEngine.push(singleRule);
		}

		RulesEngine.runEngine(rulesToEngine, fact);

		var jsonInResponse = {
		  metadata: {
			version: api.apiVersion 
		  },
		  facts: {
			language: request.body.facts.language, 
			blob: fact			// TODO este debería ser el fact devuelto por el runEngine
		  }
		};
		return response.status(200).json(jsonInResponse);
	}).catch(function (error) {
		/* istanbul ignore next  */
		console.log(error);
		return response.status(500).json({code: 0, message: "Unexpected error"});
	});
});

/**
 *  Elimina una regla
 */
router.delete('/:ruleId', Verify.verifyToken, Verify.verifyManagerRole, function(request, response) {
	console.log("RULE ID ES" + request.params.ruleId + "\n\n\n\n\n");
	Rule.destroy({
    where: {
		name: request.params.ruleId
		}
	})
	.then(affectedRow => {
		if (affectedRow == 0) {
		  return response.status(404).json({code: 0, message: "No existe el recurso solicitado"});
		}
		BusinessUser.find({
			where: {
				username: request.decoded.username // username of the businessuser that's trying to delete the rule
			}
		}).then(businessuser => {
			if (businessuser == 0) {
			  return response.status(404).json({code: 0, message: "No existe el recurso solicitado"});
			}

			var lastCommitJSON = {
				author: {
					id: businessuser.id,
					_ref: businessuser._ref,
					username: businessuser.username,
					password: businessuser.password,
					name: businessuser.name,
					roles: businessuser.roles
				}
			};

			// Crea commit de eliminación de la regla 
			RuleChange.create({
				_ref: '',
				name: affectedRow.name,
				blobcondition: affectedRow.blobCondition,
				blobconsequence: affectedRow.blobConsequence,
				blobpriority: affectedRow.blobPriority,
				active: affectedRow.active,
				reason: 'Borrado de rule',
				time: new Date(),
				businessuser: businessuser.id, 
				userinfo: JSON.stringify(lastCommitJSON)
			}).then(ruleChange => {
				return response.status(204).json({});
			}).catch(function (error) {
			/* istanbul ignore next  */
			return response.status(500).json({code: 0, message: "Unexpected error. Couldn't delete the commit"});
			});
		});
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
		  name: request.params.ruleId
		}
	}).then(rule => {
		if (!rule) {
			/* istanbul ignore next */
		  return response.status(404).json({code: 0, message: "Rule inexistente"});
		}
		console.log("LLEGA ACA\n\n\n");
		RuleChange.findAll({
			limit: 1,
			where: {
				name: request.params.ruleId
			},
  			order: [ [ 'id', 'DESC' ]] // por ser el id autoincremental, me quedo con el mayor
		}).then(ruleChanges => {
			if (ruleChanges == 0) { // there are no commits that correspond to that rule
				var lastCommitJSON = {
					author: {
						id: '',
						_ref: '',
						username: '',
						password: '',
						name: '',
						roles: ''
					}
				};
				var responseBlob = {
					name: rule.name,
					condition: rule.blobCondition,
					consequence: rule.blobConsequence,
					priority: rule.blobPriority
				};
				var jsonInResponse = {
					metadata: {
						version: api.apiVersion // falta completar
					},
					rule: {
						id: rule.ruleId,
						language: rule.language,
						blob: responseBlob,
						active: rule.active,
						lastCommit: JSON.stringify(lastCommitJSON)
					}
				};
				return response.status(200).json(jsonInResponse);
			} else { // there is a commit that corresponds to that rule
				BusinessUser.find({
					where: {
						id: (ruleChanges[ruleChanges.length-1].businessuser).toString() // gets the id of the businessuser that made the last commit
					}
				}).then(businessuser => {

					var lastCommitJSON = {
						author: {
							id: businessuser.id,
							_ref: businessuser._ref,
							username: businessuser.username,
							password: businessuser.password,
							name: businessuser.name,
							roles: businessuser.roles
						}
					};
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
							id: rule.ruleId,
							language: rule.language,
							blob: responseBlob,
							active: rule.active,
							lastCommit: JSON.stringify(lastCommitJSON)
						}
					};
					return response.status(200).json(jsonInResponse);
				});
			}
		});
	}).catch(function (error) {
		/* istanbul ignore next  */
		console.log(error);
		return response.status(500).json({code: 0, message: "Unexpected error"});
	});
});

/**
 *  Modificar una regla
 */
router.put('/:ruleId', Verify.verifyToken, Verify.verifyManagerRole, function(request, response) {	
	if (api.isEmpty(request.body.blob)) {
		return response.status(400).json({code: 0, message: "Incumplimiento de precondiciones (parámetros faltantes)"});
	}
	Rule.find({
		where: {
		  name: request.params.ruleId
		}
	}).then(rule => {
		if (!rule) {
		  return response.status(404).json({code: 0, message: "Rule inexistente"});
		}
		BusinessUser.find({
			where: {
				username: request.decoded.username // username of the businessuser that's trying to modify the rule
			}
		}).then(businessuser => {
			var blobJSON = {
				name: request.body.blob.name,
				condition: request.body.blob.condition, 
				consequence: request.body.blob.consequence, 
				priority: request.body.blob.priority
			};
			var blobJSONStringified = JSON.stringify(blobJSON);

			rule.updateAttributes({
				name: request.body.blob.name,
				blobCondition: request.body.blob.condition,
				blobConsequence: request.body.blob.consequence,
				blobPriority: request.body.blob.priority,
				active: request.body.active
		  	}).then(updatedRule => {
				var lastCommitJSON = {
					author: {
						id: businessuser.id,
						_ref: businessuser._ref,
						username: businessuser.username,
						password: businessuser.password,
						name: businessuser.name,
						roles: businessuser.roles
					}
				};
			  	RuleChange.create({
					_ref: '',
					name: updatedRule.name,
					blobcondition: updatedRule.condition,
					blobconsequence: updatedRule.consequence,
					blobpriority: updatedRule.priority,
					active: updatedRule.active,
					reason: 'Modificación de rule',
					time: new Date(),
					businessuser: businessuser.id,
					userinfo: JSON.stringify(lastCommitJSON)
				}).then(ruleChange => {	
					var responseBlob = {
						name: updatedRule.name,
						condition: updatedRule.blobCondition,
						consequence: updatedRule.blobConsequence,
						priority: updatedRule.blobPriority
					};
					var jsonInResponse = {
					  metadata: {
						version: api.apiVersion 
					  },
					  rule: {
						id: updatedRule.id,
						_ref: updatedRule._ref,
						language: updatedRule.language, 
						blob: responseBlob,
						active: updatedRule.active,
						lastCommit: ruleChange.userinfo
					  }
					};
					return response.status(200).json(jsonInResponse);
				});
		  	});
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
	var fact = request.body.blob;
	console.log(fact);

	Rule.find({
		where: {
		  name: request.params.ruleId
		}
	}).then(rule => {
		if (!rule) {
			/* istanbul ignore next  */
			return response.status(500).json({code: 0, message: "No rule was found"});
		}
		var rulesToEngine = [];
		var singleRule = {
			name: rule.name,
			condition: rule.blobCondition,
			consequence: rule.blobConsequence,
			priority: rule.blobPriority
		};
		rulesToEngine.push(singleRule);
		RulesEngine.runEngine(rulesToEngine, fact);

		var jsonInResponse = {
		  metadata: {
			version: api.apiVersion 
		  },
		  facts: {
			language: request.body.language, 
			blob: request.body.blob			
		  }
		};
		return response.status(200).json(jsonInResponse);
	}).catch(function (error) {
		/* istanbul ignore next  */
		console.log(error);
		return response.status(500).json({code: 0, message: "Unexpected error"});
	});
});

/**
 *  Obtener el historial de commits realizados sobre una regla particular
 */
router.get('/:ruleId/commits', Verify.verifyToken, Verify.verifyManagerRole, function(request, response) {
	RuleChange.findAll({})
	.then(rulechanges => {
		/* istanbul ignore if  */
	    if (!rulechanges) {
	      return response.status(500).json({code: 0, message: "Unexpected error"});
	    }

		var changesArray = [];
		rulechanges.forEach(function(item) {
			var parsed = JSON.parse(item.userinfo);
		    changesArray.push(parsed);
		});

	    var jsonInResponse = {
			metadata: {
				version: api.apiVersion // falta completar
			},
			commits: changesArray
		};
		return response.status(200).json(jsonInResponse);
	});
});

/**
 *  Obtener la regla en el estado del commit especificado
 *	Si se pasa el valor lastCommit se el estado actual de la regla en el motor
 */
router.get('/:ruleId/commits/:commitId', Verify.verifyToken, Verify.verifyManagerRole, function(request, response) {
	
});

module.exports = router;
