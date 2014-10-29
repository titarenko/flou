# flou

Simple construction of complex flows.

[![Build Status](https://secure.travis-ci.org/titarenko/flou.png?branch=master)](https://travis-ci.org/titarenko/flou) [![Coverage Status](https://coveralls.io/repos/titarenko/flou/badge.png?branch=master)](https://coveralls.io/r/titarenko/flou?branch=master)

[![NPM](https://nodei.co/npm/flou.png?downloads=true&stars=true)](https://nodei.co/npm/flou/)

## Installation

```bash
npm install flou --save
```

## Example 

```js
	var saveOrderPromise = new Flow({ order: someOrder })

		.having('order')
		.run(findCountry, findRegionAndTimezone, findOperator, findOffer)
		
		.having('country', 'regionAndTimezone')
		.run(createClientRecord)

		.having('clientRecord', 'offer')
		.run(createOrderRecord)

		.having('country')
		.run(findShipmentMethod)

		.having('country', 'shipmentMethod', 'orderRecord')
		.run(createOrderShipmentRecord)

		.having('operator', 'orderRecord')
		.run(createOrderCallRecord)

		.having('orderShipmentRecord', 'orderCallRecord')
		.run(updateOrderRecord)
		.returning('updatedOrderRecord')

		.having('updatedOrderRecord')
		.finish();

	saveOrderPromise.done(function (context) {
		console.log('Hooray! I have passed all steps of the specified flow! Id of order is', context.order.id);
	}, function (error) {
		console.error('Oh no! Flow was interrupted due to', error && error.stack || error);
	});
```

## API

### Flow(initialValues)

Creates flow object initialized with named values passed as hash.

### having(name1, name2, name3, ...)

Starts flow step building by accepting names of flow variables which must be resolved (in terms of promises) before step can start.

### run(fn1, fn2, fn3, ...)

Schedules execution of given functions once preconditions are met (see `having`).

Each function should (but not must!) accept one argument which is hash of named flow variables and should (but not must!) return any value.

Each function result will be saved as flow variable named after function or using value provided via `returning` (see next section for details). "Named after function" here means equals to function name without leading verb (for example, result of `saveOrderRecord` will be named `orderRecord`).

### returning(name1, name2, name3, ...)

Explicitly specifies names for function execution results.

### finish()

Finalizes flow and returns final promise.

## License

BSD
