var Q = require('q');
var _ = require('lodash');
var should = require('should');
var Flow = require('../');

describe('Flow', function () {
	it('should work as expected on main example', function (done) {
		function findCountry (context) {
			return Q.delay({
				id: context.order.country_id,
				default_shipment_method_id: 10
			}, 15);
		}

		function findRegionAndTimezone (context) {
			return Q.delay({
				region: 'Kyiv',
				timezone: 3
			}, 22);
		}

		function findOperator (context) {
			return Q.delay({
				id: 19
			}, 4);
		}

		function findOffer (context) {
			return Q.delay({
				id: 187
			}, 1);
		}

		function createClientRecord (context) {
			return Q.delay({
				id: 21
			}, 54);
		}

		function createOrderRecord (context) {
			return Q.delay({
				id: 89,
				client_id: context.clientRecord.id
			}, 13);
		}

		function findShipmentMethod (context) {
			return Q.delay({
				id: context.country.default_shipment_method_id
			}, 87);
		}

		function createOrderCallRecord (context) {
			return Q.delay({
				id: 53
			}, 36);
		}

		function createOrderShipmentRecord (context) {
			return Q.delay({
				id: 990,
				method_id: context.shipmentMethod.id
			}, 11);
		}

		function updateOrderRecord (context) {
			return Q.delay(_.extend(context.orderRecord, {
				shipment_id: context.orderShipmentRecord.id,
				call_id: context.orderCallRecord.id
			}), 27);
		}

		var someOrder = {
			country_id: 123
		};

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
			context.updatedOrderRecord.shipment_id.should.eql(990);
			context.updatedOrderRecord.call_id.should.eql(53);
			context.orderShipmentRecord.method_id.should.eql(10);
			done();
		}, function (error) {
			done(error);
		});
	});
});
