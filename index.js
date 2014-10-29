var Q = require('q');
var _ = require('lodash');

function copyArray (array) {
	return Array.prototype.slice.call(array);
}

function getFunctionResultName (fn) {
	return fn.name && fn.name.replace(/[a-z]+?[A-Z]/, function replaceMatch (match) { 
		return match.slice(-1).toLowerCase();
	});
}

function getPreconditions () {
	return _(this.namedPromises).pick(this.argumentNames).values().valueOf();
}

function executeFunction (preconditions, fn) {
	var context = this;

	var name = context.functionToResultNames[fn];
	context.namedPromises[name] = Q.all(preconditions).then(function executeWhenPreconditionsAreMet () {

		var result = fn(context.values);
		var promise = Q(result);
		
		promise.then(function setValue (value) {
			context.values[name] = value;
		});
		
		return promise;
	});
}

function execute () {
	var resultNames = this.resultNames || this.functions.map(getFunctionResultName);
	_.extend(this.functionToResultNames, _.zipObject(this.functions, resultNames));

	var preconditions = getPreconditions.call(this);
	var executor = executeFunction.bind(this, preconditions);

	this.functions.forEach(executor);
}

function initializeStep () {
	this.argumentNames = null;
	this.functions = null;
	this.resultNames = null;
	this.isStepInProgress = true;
}

function finalizeStep () {
	if (this.isStepInProgress) {
		execute.call(this);
		this.isStepInProgress = false;
	}
}

function having () {
	finalizeStep.call(this);
	initializeStep.call(this);
	this.argumentNames = copyArray(arguments);
	return this;
}

function run () {
	this.functions = copyArray(arguments);
	return this;
}

function returning () {
	this.resultNames = copyArray(arguments);
	return this;
}

function finish () {
	var context = this;
	var preconditions = getPreconditions.call(context);
	return Q.all(preconditions).then(function returnValues () {
		return context.values;
	});
}

function Flow (values) {
	this.values = values || {};
	this.functionToResultNames = {};
	this.namedPromises = _.transform(this.values, function valueToPromise (result, value, name) {
		result[name] = Q(value);
	});
}

Flow.prototype.having = having;
Flow.prototype.run = run;
Flow.prototype.returning = returning;
Flow.prototype.finish = finish;

module.exports = Flow;
