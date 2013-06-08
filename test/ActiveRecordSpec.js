describe("ActiveRecord", function() {
	"use strict";

	beforeEach(angular.mock.module("ActiveRecord"));

	var $httpBackend, ActiveRecord;

	beforeEach(inject(function($injector) {
		$httpBackend = $injector.get('$httpBackend');
		ActiveRecord = $injector.get('ActiveRecord');
	}));

	afterEach(function() {
		$httpBackend.verifyNoOutstandingExpectation();
		$httpBackend.verifyNoOutstandingRequest();
	});

	it("initialize", function() {
		var Model = ActiveRecord.extend({
			$initialize: function() {
				this.one = 1;
			}
		});
		var model = new Model();
		expect(model.one).toBe(1);
	});

	it("initialize with attributes and options", function() {
		var Model = ActiveRecord.extend({
			$initialize: function(attributes, options) {
				this.one = options.one;
			}
		});
		var model = new Model({}, {one: 1});
		expect(model.one).toBe(1);
	});

	it("initialize with parsed attributes", function() {
		var Model = ActiveRecord.extend({
			$parse: function(attrs) {
				attrs.value += 1;
				return attrs;
			}
		});
		var model = new Model({value: 1}, {parse: true});
		expect(model.value).toBe(2);
	});

	it("initialize with defaults", function() {
		var Model = ActiveRecord.extend({
			defaults: {
				first_name: 'Unknown',
				last_name: 'Unknown'
			}
		});
		var model = new Model({first_name: 'John'});
		expect(model.first_name, 'John');
		expect(model.last_name, 'Unknown');
	});

	it('fetchOne', function () {
		var Model = ActiveRecord.extend({
	 		$urlRoot: '/resources/'
		});
		$httpBackend.expectGET('/resources/1').respond( {id: 1, name: 'Test1'});
		Model.fetchOne(1).then(function (model) {
			expect(model.id).toBe(1);
			expect(model.name).toBe('Test1');
		});
		$httpBackend.flush();
	 });
});